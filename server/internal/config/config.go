package config

import (
	"fmt"
	"os"
)

// Global 全局配置实例
var Global Config

// Logger 全局日志实例
// var Logger zerolog.Logger

// Config 保存应用程序配置
type Config struct {
	Bind         string
	IsProduction bool
	Log          LogConfig
	Database     DBConfig
}

// DBConfig 数据库配置
type DBConfig struct {
	URI      string
	Database string
}

// InitConfig 从环境变量初始化配置
func InitConfig() error {
	// 设置默认值
	Global = Config{
		Bind:         "0.0.0.0:2342",
		IsProduction: false,
		Log: LogConfig{
			Level:  "info",
			File:   "/dev/stdout",
			Format: "console",
		},
		Database: DBConfig{
			URI:      "mongodb://localhost:27017",
			Database: "simplewaf",
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
		Global.Database.URI = env
	}
	if env := os.Getenv("DB_NAME"); env != "" {
		Global.Database.Database = env
	}

	// 初始化logger
	var err error
	Logger, err = Global.Log.newLogger()
	if err != nil {
		return fmt.Errorf("failed to initialize logger: %w", err)
	}

	Logger.Info().Msg("✨ Application configured successfully")
	return nil
}
