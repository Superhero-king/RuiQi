package config

import (
	"context"
	"fmt"
	"os"
	"time"

	mongodb "github.com/HUAHUAI23/simple-waf/pkg/database/mongo"
	"github.com/HUAHUAI23/simple-waf/pkg/model"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// Global 全局配置实例
var Global Config

// Config 保存应用程序配置
type Config struct {
	Bind         string
	IsProduction bool
	Log          LogConfig
	DBConfig     DBConfig
}

// DBConfig 数据库配置
type DBConfig struct {
	URI      string
	Database string
}

// InitConfig 从环境变量初始化配置
func InitConfig() error {
	// 加载.env文件
	err := godotenv.Load()
	if err != nil {
		// 如果.env文件不存在，只记录一个信息，不返回错误
		GlobalLogger.Info().Msg(".env file not found, using default environment variables")
	}

	// 设置默认值
	Global = Config{
		Bind:         "0.0.0.0:2333",
		IsProduction: false,
		Log: LogConfig{
			Level:  "info",
			File:   "/dev/stdout",
			Format: "console",
		},
		DBConfig: DBConfig{
			URI:      "",
			Database: "waf",
		},
	}

	// 从环境变量加载配置
	if env := os.Getenv("BIND"); env != "" {
		Global.Bind = env
	}

	if env := os.Getenv("IS_PRODUCTION"); env != "" {
		Global.IsProduction = env == "true"
	}

	// 日志配置
	if env := os.Getenv("LOG_LEVEL"); env != "" {
		Global.Log.Level = env
	}
	if env := os.Getenv("LOG_FILE"); env != "" {
		Global.Log.File = env
	}
	if env := os.Getenv("LOG_FORMAT"); env != "" {
		Global.Log.Format = env
	}

	// 数据库配置
	if env := os.Getenv("DB_URI"); env != "" {
		Global.DBConfig.URI = env
	}
	if env := os.Getenv("DB_NAME"); env != "" {
		Global.DBConfig.Database = env
	}

	// 初始化logger
	Logger, err = Global.Log.newLogger()
	if err != nil {
		return fmt.Errorf("failed to initialize logger: %w", err)
	}

	Logger.Info().Msg("✨ Application configure loaded successfully")
	return nil
}

func InitDB() error {
	// 连接数据库
	client, err := mongodb.Connect(Global.DBConfig.URI)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 获取数据库
	db := client.Database(Global.DBConfig.Database)

	// 检查配置集合是否存在
	var cfg model.Config
	configCollection := db.Collection(cfg.GetCollectionName())

	// 检查是否有配置记录 - 使用 v2 语法
	filter := bson.D{}
	count, err := configCollection.CountDocuments(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to count documents: %w", err)
	}

	// 只有在没有配置记录时才创建默认配置
	if count == 0 {
		defaultConfig := createDefaultConfig()
		_, err = configCollection.InsertOne(ctx, defaultConfig)
		if err != nil {
			return fmt.Errorf("failed to insert default config: %w", err)
		}
		Logger.Info().Msg("Created default configuration")
	} else {
		Logger.Info().Int64("count", count).Msg("Found existing configuration documents")
	}

	Logger.Info().Str("detail", "The first run of the application, created default configuration").Msg("Database initialized successfully")
	return nil
}

// 创建默认配置
func createDefaultConfig() model.Config {
	now := time.Now()
	return model.Config{
		Name: "default config",
		Engine: model.EngineConfig{
			Bind:            "127.0.0.1:2342",
			UseBuiltinRules: true,
			AppConfig: []model.AppConfig{
				{
					Name:           "coraza",
					Directives:     "SecRuleEngine On",
					TransactionTTL: 60 * time.Second,
					LogLevel:       "info",
					LogFile:        "/dev/stdout",
					LogFormat:      "console",
				},
			},
		},
		Haproxy: model.HaproxyConfig{
			ConfigBaseDir: "/simple-waf",
			HaproxyBin:    "haproxy",
			BackupsNumber: 5,
			SpoeAgentAddr: "127.0.0.1",
			SpoeAgentPort: 2342,
		},
		CreatedAt:       now,
		UpdatedAt:       now,
		IsResponseCheck: false,
	}
}
