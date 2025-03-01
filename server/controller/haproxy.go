package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"server/service/haproxy"
)

// HAProxyStatus returns the current status of HAProxy
func HAProxyStatus(c *gin.Context) {
	status, err := haproxy.GetStatus()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, status)
}

// HAProxyGetConfig returns the current HAProxy configuration
func HAProxyGetConfig(c *gin.Context) {
	config, err := haproxy.GetConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, config)
}

// HAProxyUpdateConfig updates the HAProxy configuration
func HAProxyUpdateConfig(c *gin.Context) {
	var req struct {
		Config string `json:"config"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if err := haproxy.UpdateConfig(req.Config); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// HAProxyRestart restarts the HAProxy service
func HAProxyRestart(c *gin.Context) {
	if err := haproxy.Restart(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// HAProxyStart starts the HAProxy service
func HAProxyStart(c *gin.Context) {
	if err := haproxy.Start(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}

// HAProxyStop stops the HAProxy service
func HAProxyStop(c *gin.Context) {
	if err := haproxy.Stop(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
