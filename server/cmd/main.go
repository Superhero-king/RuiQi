package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"

	"github.com/HUAHUAI23/simple-waf/server/internal/config"
	"github.com/HUAHUAI23/simple-waf/server/internal/router"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon"
)

func main() {
	// Load configuration
	err := config.InitConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Create service runner and start background services
	serviceRunner := daemon.NewServiceRunner()
	serviceRunner.StartServices()

	// Set up graceful shutdown
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		config.Logger.Info().Msg("Received shutdown signal, shutting down services...")
		serviceRunner.StopServices()
		config.Logger.Info().Msg("Background services have been shut down, exiting...")
		os.Exit(0)
	}()

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
		// Ensure stopping background services
		serviceRunner.StopServices()
	}
}
