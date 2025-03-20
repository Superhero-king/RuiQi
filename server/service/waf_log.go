package service

import (
	"context"
	"fmt"
	"math"

	"github.com/HUAHUAI23/simple-waf/server/dto"
	"github.com/HUAHUAI23/simple-waf/server/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type WAFLogService interface {
	GetAttackEvents(ctx context.Context, req dto.AttackEventRequset, page, pageSize int) (*dto.AttackEventResponse, error)
	GetAttackLogs(ctx context.Context, req dto.AttackLogRequest, page, pageSize int) (*dto.AttackLogResponse, error)
}

type WAFLogServiceImpl struct {
	wafLogRepository repository.WAFLogRepository
}

// NewWAFLogService creates a new WAFLogService instance
func NewWAFLogService(wafLogRepository repository.WAFLogRepository) WAFLogService {
	return &WAFLogServiceImpl{
		wafLogRepository: wafLogRepository,
	}
}

// GetAttackEvents retrieves aggregated attack events
func (s *WAFLogServiceImpl) GetAttackEvents(
	ctx context.Context,
	req dto.AttackEventRequset,
	page, pageSize int,
) (*dto.AttackEventResponse, error) {
	// Build filter based on request parameters
	filter := s.buildAttackEventFilter(req)

	// Match stage for filtering
	matchStage := bson.D{{Key: "$match", Value: filter}}

	// Group stage for aggregation
	groupStage := bson.D{
		{Key: "$group", Value: bson.D{
			{Key: "_id", Value: bson.D{
				{Key: "clientIpAddress", Value: "$clientIpAddress"},
				{Key: "domain", Value: "$domain"},
			}},
			{Key: "count", Value: bson.D{{Key: "$sum", Value: 1}}},
			{Key: "firstAttackTime", Value: bson.D{{Key: "$min", Value: "$createdAt"}}},
			{Key: "lastAttackTime", Value: bson.D{{Key: "$max", Value: "$createdAt"}}},
			{Key: "allTimes", Value: bson.D{{Key: "$push", Value: "$createdAt"}}},
		}},
	}

	// Project stage to format the output
	projectStage := bson.D{
		{Key: "$project", Value: bson.D{
			{Key: "clientIpAddress", Value: "$_id.clientIpAddress"},
			{Key: "domain", Value: "$_id.domain"},
			{Key: "count", Value: 1},
			{Key: "firstAttackTime", Value: 1},
			{Key: "lastAttackTime", Value: 1},
			{Key: "allTimes", Value: 1},
			{Key: "_id", Value: 0},
		}},
	}

	// Sort by lastAttackTime (most recent first)
	sortStage := bson.D{
		{Key: "$sort", Value: bson.D{
			{Key: "lastAttackTime", Value: -1},
		}},
	}

	// Build count pipeline
	countPipeline := mongo.Pipeline{matchStage, groupStage, projectStage}

	// Get total count
	totalCount, err := s.wafLogRepository.CountAggregateAttackEvents(ctx, countPipeline)
	if err != nil {
		return nil, fmt.Errorf("error getting total count: %w", err)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Add pagination stages
	skipStage := bson.D{
		{Key: "$skip", Value: (page - 1) * pageSize},
	}
	limitStage := bson.D{
		{Key: "$limit", Value: pageSize},
	}

	// Build data pipeline
	dataPipeline := mongo.Pipeline{matchStage, groupStage, projectStage, sortStage, skipStage, limitStage}

	// Get results
	results, err := s.wafLogRepository.AggregateAttackEvents(ctx, dataPipeline)
	if err != nil {
		return nil, fmt.Errorf("error getting aggregated events: %w", err)
	}

	// Create response
	response := &dto.AttackEventResponse{
		Results:     results,
		TotalCount:  totalCount,
		PageSize:    pageSize,
		CurrentPage: page,
		TotalPages:  totalPages,
	}

	return response, nil
}

// GetAttackLogs retrieves individual attack logs
func (s *WAFLogServiceImpl) GetAttackLogs(
	ctx context.Context,
	req dto.AttackLogRequest,
	page, pageSize int,
) (*dto.AttackLogResponse, error) {
	// Build filter
	filter := s.buildAttackLogFilter(req)

	// Get total count
	totalCount, err := s.wafLogRepository.CountAttackLogs(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("error getting total count: %w", err)
	}

	// Calculate total pages
	totalPages := int(math.Ceil(float64(totalCount) / float64(pageSize)))

	// Calculate pagination parameters
	skip := int64((page - 1) * pageSize)
	limit := int64(pageSize)

	// Get results directly passing skip and limit parameters
	results, err := s.wafLogRepository.FindAttackLogs(ctx, filter, skip, limit)
	if err != nil {
		return nil, fmt.Errorf("error finding attack logs: %w", err)
	}

	// Create response
	response := &dto.AttackLogResponse{
		Results:     results,
		TotalCount:  totalCount,
		PageSize:    pageSize,
		CurrentPage: page,
		TotalPages:  totalPages,
	}

	return response, nil
}

// buildAttackEventFilter builds the filter for attack event queries
func (s *WAFLogServiceImpl) buildAttackEventFilter(req dto.AttackEventRequset) bson.D {
	filter := bson.D{}

	if req.ClientIPAddress != "" {
		filter = append(filter, bson.E{Key: "clientIpAddress", Value: req.ClientIPAddress})
	}
	if req.Domain != "" {
		filter = append(filter, bson.E{Key: "domain", Value: req.Domain})
	}
	if req.Port > 0 {
		filter = append(filter, bson.E{Key: "port", Value: req.Port})
	}

	// Add time range filter if provided
	timeFilter := bson.D{}
	if !req.StartTime.IsZero() {
		timeFilter = append(timeFilter, bson.E{Key: "$gte", Value: req.StartTime})
	}
	if !req.EndTime.IsZero() {
		timeFilter = append(timeFilter, bson.E{Key: "$lte", Value: req.EndTime})
	}
	if len(timeFilter) > 0 {
		filter = append(filter, bson.E{Key: "createdAt", Value: timeFilter})
	}

	return filter
}

// buildAttackLogFilter builds the filter for attack log queries
func (s *WAFLogServiceImpl) buildAttackLogFilter(req dto.AttackLogRequest) bson.D {
	filter := bson.D{}

	if req.ClientIPAddress != "" {
		filter = append(filter, bson.E{Key: "clientIpAddress", Value: req.ClientIPAddress})
	}
	if req.Domain != "" {
		filter = append(filter, bson.E{Key: "domain", Value: req.Domain})
	}
	if req.Port > 0 {
		filter = append(filter, bson.E{Key: "port", Value: req.Port})
	}
	if req.RuleID > 0 {
		filter = append(filter, bson.E{Key: "ruleId", Value: req.RuleID})
	}

	// Add time range filter if provided
	timeFilter := bson.D{}
	if !req.StartTime.IsZero() {
		timeFilter = append(timeFilter, bson.E{Key: "$gte", Value: req.StartTime})
	}
	if !req.EndTime.IsZero() {
		timeFilter = append(timeFilter, bson.E{Key: "$lte", Value: req.EndTime})
	}
	if len(timeFilter) > 0 {
		filter = append(filter, bson.E{Key: "createdAt", Value: timeFilter})
	}

	return filter
}
