package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/HUAHUAI23/simple-waf/server/internal/config"
	"github.com/HUAHUAI23/simple-waf/server/internal/router"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon"
)

func main() {
	// Load configuration
	err := config.InitConfig()
	if err != nil {
		config.GlobalLogger.Error().Err(err).Msg("Failed to load configuration")
		return
	}

	err = config.InitDB()
	if err != nil {
		config.Logger.Error().Err(err).Msg("Failed to initialize database")
	}

	// Create service runner and start background services
	serviceRunner := daemon.NewServiceRunner()
	serviceRunner.StartServices()

	// Set Gin mode based on configuration
	if config.Global.IsProduction {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize the Gin route
	route := gin.New()

	// Setup the router
	router.Setup(route)

	// 创建HTTP服务器
	srv := &http.Server{
		Addr:    config.Global.Bind,
		Handler: route,
	}

	// 创建一个错误通道
	serverError := make(chan error, 1)

	// 在goroutine中启动服务器
	go func() {
		config.Logger.Info().Msgf("Starting server on %s", config.Global.Bind)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			config.Logger.Error().Err(err).Msg("Server error")
			serverError <- err
		}
	}()

	// 等待中断信号或服务器错误
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// 使用select等待任一通道有消息
	select {
	case <-quit:
		config.Logger.Info().Msg("Received shutdown signal, shutting down services...")
	case err := <-serverError:
		config.Logger.Error().Err(err).Msg("Server failed, initiating shutdown...")
	}

	// 设置关闭超时时间
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 尝试优雅关闭服务器
	if err := srv.Shutdown(ctx); err != nil {
		config.Logger.Error().Err(err).Msg("Server forced to shutdown")
	} else {
		config.Logger.Info().Msg("Server shutdown gracefully")
	}

	// 停止后台服务
	serviceRunner.StopServices()
	config.Logger.Info().Msg("Background services have been shut down, exiting...")

	// 如果是因为服务器错误而退出，使用非零状态码
	if len(serverError) > 0 {
		os.Exit(1)
	}
}
