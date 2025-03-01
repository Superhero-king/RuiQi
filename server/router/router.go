package router

import (
	"github.com/gin-gonic/gin"

	"server/controller"
	"server/middleware"
)

// Setup configures all the routes for the application
func Setup(r *gin.Engine) {
	// Add middleware
	r.Use(middleware.Logger())
	r.Use(middleware.Cors())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// API v1 routes
	api := r.Group("/api/v1")
	{
		// HAProxy related endpoints
		haproxy := api.Group("/haproxy")
		{
			haproxy.GET("/status", controller.HAProxyStatus)
			haproxy.GET("/config", controller.HAProxyGetConfig)
			haproxy.POST("/config", controller.HAProxyUpdateConfig)
			haproxy.POST("/restart", controller.HAProxyRestart)
			haproxy.POST("/start", controller.HAProxyStart)
			haproxy.POST("/stop", controller.HAProxyStop)
		}

		// Engine related endpoints
		engine := api.Group("/engine")
		{
			engine.GET("/status", controller.EngineStatus)
			engine.GET("/config", controller.EngineGetConfig)
			engine.POST("/config", controller.EngineUpdateConfig)
			engine.POST("/restart", controller.EngineRestart)
			engine.POST("/start", controller.EngineStart)
			engine.POST("/stop", controller.EngineStop)
		}

		// Configuration related endpoints
		config := api.Group("/config")
		{
			config.GET("", controller.GetConfig)
			config.POST("", controller.UpdateConfig)
		}
	}
}
