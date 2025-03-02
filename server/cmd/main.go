package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"github.com/HUAHUAI23/simple-waf/server/internal/config"
	"github.com/HUAHUAI23/simple-waf/server/internal/router"
)

func main() {
	// Load configuration
	err := config.InitConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// TODO 开启新的 go 程 启动 haproxy 和 engine 服务

	// Set Gin mode based on configuration
	if config.Global.IsProduction {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize the Gin engine
	engine := gin.New()

	// Setup the router
	router.Setup(engine)

	// Start the server
	config.Logger.Info().Msgf("Starting server on %s", config.Global.Bind)
	if err := engine.Run(config.Global.Bind); err != nil {
		config.Logger.Error().Msgf("Failed to start server: %v", err)
	}

	// serviceRunner := service.NewServiceRunner()
	// serviceRunner.StartServices()
	// c := make(chan os.Signal, 1)
	// signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	// go func() {
	// 	<-c
	// 	config.Logger.Info().Msg("Shutting down services...")
	// 	serviceRunner.StopServices()
	// 	os.Exit(0)
	// }()
}
