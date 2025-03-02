package middleware

import (
	"simple-waf/config"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger middleware logs the request/response details
func Logger() gin.HandlerFunc {
	log := config.Logger
	isProduction := config.Global.IsProduction

	return func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// Process request
		c.Next()

		// Calculate request time
		elapsed := time.Since(start)
		statusCode := c.Writer.Status()

		// 在生产环境中，只记录错误、警告或较慢的请求
		if !isProduction ||
			statusCode >= 400 ||
			elapsed > 500*time.Millisecond {

			// 根据状态码选择日志级别
			event := log.Info()
			if statusCode >= 400 && statusCode < 500 {
				event = log.Warn()
			} else if statusCode >= 500 {
				event = log.Error()
			}

			event.Str("method", method).
				Str("path", path).
				Int("status", statusCode).
				Dur("latency", elapsed).
				Msg("HTTP Request")
		}
	}
}

// Cors middleware handles CORS requests
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
	}
}
