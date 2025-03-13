package engine

import (
	"context"
	"fmt"
	"time"

	"github.com/HUAHUAI23/simple-waf/coraza-spoa/pkg/server"
	mongodb "github.com/HUAHUAI23/simple-waf/pkg/database/mongo"
	"github.com/HUAHUAI23/simple-waf/pkg/model"
	"github.com/HUAHUAI23/simple-waf/server/config"
	"github.com/rs/zerolog"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type EngineService interface {
	Start() error
	Restart() error
	Stop() error
}

// NewEngineService 创建一个新的引擎服务实例
func NewEngineService(
	logger zerolog.Logger,
	mongoURI string,
) (EngineService, error) {
	// 连接数据库
	client, err := mongodb.Connect(mongoURI)
	if err != nil {
		return nil, fmt.Errorf("连接数据库失败: %w", err)
	}

	var cfg model.Config
	// 获取配置集合
	db := client.Database(config.Global.DBConfig.Database)
	collection := db.Collection(cfg.GetCollectionName())

	// 创建带超时的上下文
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel() // 确保资源被释放

	// 查询最新配置
	var engineConfig model.Config
	err = collection.FindOne(
		ctx,
		bson.D{},
		options.FindOne().SetSort(bson.D{{Key: "updatedAt", Value: -1}}),
	).Decode(&engineConfig)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, fmt.Errorf("未找到配置记录")
		}
		return nil, fmt.Errorf("获取配置失败: %w", err)
	}

	// 创建并返回引擎服务
	return server.NewAgentServer(
		logger,
		mongoURI,
		engineConfig.Engine.Bind,
		engineConfig,
	), nil
}
