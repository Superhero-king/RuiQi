package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"server/service/engine"
)

// EngineStatus returns the current status of the WAF engine
func EngineStatus(c *gin.Context) {
	status, err := engine.GetStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, status)
}

// EngineGetConfig returns the current engine configuration
func EngineGetConfig(c *gin.Context) {
	config, err := engine.GetConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, config)
}

// EngineUpdateConfig updates the engine configuration
func EngineUpdateConfig(c *gin.Context) {
	var req struct {
		Config string `json:"config"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := engine.UpdateConfig(req.Config); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// EngineRestart restarts the engine service
func EngineRestart(c *gin.Context) {
	if err := engine.Restart(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// EngineStart starts the engine service
func EngineStart(c *gin.Context) {
	if err := engine.Start(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// EngineStop stops the engine service
func EngineStop(c *gin.Context) {
	if err := engine.Stop(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
