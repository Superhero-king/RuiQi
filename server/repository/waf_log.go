package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/HUAHUAI23/simple-waf/pkg/model"
	"github.com/HUAHUAI23/simple-waf/server/config"
	"github.com/HUAHUAI23/simple-waf/server/dto"
	"github.com/rs/zerolog"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type WAFLogRepository interface {
	AggregateAttackEvents(ctx context.Context, pipeline mongo.Pipeline) ([]dto.AttackEventAggregateResult, error)
	CountAggregateAttackEvents(ctx context.Context, pipeline mongo.Pipeline) (int64, error)
	FindAttackLogs(ctx context.Context, filter bson.D, skip int64, limit int64) ([]model.WAFLog, error)
	CountAttackLogs(ctx context.Context, filter bson.D) (int64, error)
}

type MongoWAFLogRepository struct {
	collection *mongo.Collection
	logger     zerolog.Logger
}

// NewWAFLogRepository creates a new WAFLogRepository instance
func NewWAFLogRepository(db *mongo.Database) WAFLogRepository {
	var wafLog model.WAFLog
	collection := db.Collection(wafLog.GetCollectionName())
	logger := config.GetRepositoryLogger("waf_log")

	return &MongoWAFLogRepository{
		collection: collection,
		logger:     logger,
	}
}

// AggregateAttackEvents executes the aggregation pipeline for attack events
func (r *MongoWAFLogRepository) AggregateAttackEvents(
	ctx context.Context,
	pipeline mongo.Pipeline,
) ([]dto.AttackEventAggregateResult, error) {
	// Execute data aggregation
	dataCursor, err := r.collection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, fmt.Errorf("error executing data aggregation: %w", err)
	}
	defer dataCursor.Close(ctx)

	// Process results
	currentTime := time.Now()
	var results []dto.AttackEventAggregateResult

	for dataCursor.Next(ctx) {
		var result struct {
			ClientIPAddress string      `bson:"clientIpAddress"`
			Domain          string      `bson:"domain"`
			Count           int         `bson:"count"`
			FirstAttackTime time.Time   `bson:"firstAttackTime"`
			LastAttackTime  time.Time   `bson:"lastAttackTime"`
			AllTimes        []time.Time `bson:"allTimes"`
		}

		if err := dataCursor.Decode(&result); err != nil {
			return nil, fmt.Errorf("error decoding data result: %w", err)
		}

		// Create result object
		aggregateResult := dto.AttackEventAggregateResult{
			ClientIPAddress: result.ClientIPAddress,
			Domain:          result.Domain,
			Count:           result.Count,
			FirstAttackTime: result.FirstAttackTime,
			LastAttackTime:  result.LastAttackTime,
		}

		// Check if attack is ongoing (within last 3 minutes)
		timeSinceLastAttack := currentTime.Sub(result.LastAttackTime).Minutes()
		if timeSinceLastAttack < 3 {
			aggregateResult.IsOngoing = true
			// Calculate duration of continuous attack
			aggregateResult.DurationInMinutes = r.calculateAttackDuration(result.AllTimes)
		} else {
			aggregateResult.IsOngoing = false
		}

		results = append(results, aggregateResult)
	}

	if err := dataCursor.Err(); err != nil {
		return nil, fmt.Errorf("cursor error: %w", err)
	}

	return results, nil
}

// CountAggregateAttackEvents counts the total number of attack events after aggregation
func (r *MongoWAFLogRepository) CountAggregateAttackEvents(
	ctx context.Context,
	pipeline mongo.Pipeline,
) (int64, error) {
	// Add count stage to pipeline
	countStage := bson.D{{Key: "$count", Value: "total"}}
	countPipeline := append(pipeline, countStage)

	// Execute count aggregation
	countCursor, err := r.collection.Aggregate(ctx, countPipeline)
	if err != nil {
		return 0, fmt.Errorf("error executing count aggregation: %w", err)
	}
	defer countCursor.Close(ctx)

	// Get total count
	var totalCount int64 = 0
	var countResult struct {
		Total int64 `bson:"total"`
	}

	if countCursor.Next(ctx) {
		if err := countCursor.Decode(&countResult); err != nil {
			return 0, fmt.Errorf("error decoding count result: %w", err)
		}
		totalCount = countResult.Total
	}

	return totalCount, nil
}

// FindAttackLogs finds attack logs with the given filter and options
func (r *MongoWAFLogRepository) FindAttackLogs(
	ctx context.Context,
	filter bson.D,
	skip int64,
	limit int64,
) ([]model.WAFLog, error) {
	// 使用 options.Find() 创建选项
	findOptions := options.Find().
		SetSkip(skip).
		SetLimit(limit).
		SetSort(bson.D{{Key: "createdAt", Value: -1}}) // 最近的优先

	cursor, err := r.collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("error executing find query: %w", err)
	}
	defer cursor.Close(ctx)

	var results []model.WAFLog
	if err := cursor.All(ctx, &results); err != nil {
		return nil, fmt.Errorf("error decoding query results: %w", err)
	}

	return results, nil
}

// CountAttackLogs counts the total number of attack logs matching the filter
func (r *MongoWAFLogRepository) CountAttackLogs(ctx context.Context, filter bson.D) (int64, error) {
	total, err := r.collection.CountDocuments(ctx, filter)
	if err != nil {
		return 0, fmt.Errorf("error counting documents: %w", err)
	}
	return total, nil
}

// calculateAttackDuration calculates the duration of a continuous attack
// by finding the longest sequence of attacks with gaps no larger than 5 minutes
func (r *MongoWAFLogRepository) calculateAttackDuration(attackTimes []time.Time) float64 {
	if len(attackTimes) == 0 {
		return 0
	}

	// Sort attack times in descending order (newest first)
	sortedTimes := make([]time.Time, len(attackTimes))
	copy(sortedTimes, attackTimes)

	// Sort in reverse chronological order
	for i := 0; i < len(sortedTimes)-1; i++ {
		for j := i + 1; j < len(sortedTimes); j++ {
			if sortedTimes[i].Before(sortedTimes[j]) {
				sortedTimes[i], sortedTimes[j] = sortedTimes[j], sortedTimes[i]
			}
		}
	}

	// Start from the most recent attack time
	lastContinuousAttackTime := sortedTimes[0]

	// Find the earliest attack that is still part of the continuous sequence
	var earliestContinuousAttackTime time.Time

	for i := 1; i < len(sortedTimes); i++ {
		// If the gap between attacks is more than 5 minutes, break the sequence
		if lastContinuousAttackTime.Sub(sortedTimes[i]).Minutes() > 5 {
			break
		}
		earliestContinuousAttackTime = sortedTimes[i]
	}

	// If we didn't find any break in the sequence, use the oldest attack time
	if earliestContinuousAttackTime.IsZero() {
		earliestContinuousAttackTime = sortedTimes[len(sortedTimes)-1]
	}

	// Return the duration in minutes
	return lastContinuousAttackTime.Sub(earliestContinuousAttackTime).Minutes()
}
