package main

import (
	"log"

	"github.com/gin-gonic/gin"

	"server/config"
	"server/router"
)

func main() {
	// Load configuration
	err := config.InitConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

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
}
