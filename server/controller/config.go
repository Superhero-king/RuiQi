package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"server/config"
)

// GetConfig returns the current application configuration
func GetConfig(c *gin.Context) {
	cfg, err := config.Load()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, cfg)
}

// UpdateConfig updates the application configuration
func UpdateConfig(c *gin.Context) {
	var cfg config.Config

	if err := c.ShouldBindJSON(&cfg); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := cfg.Save(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
