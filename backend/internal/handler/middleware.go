package handler

import (
	"log"
	"net/http"
	"time"

	"backend/internal/model"

	"github.com/gin-gonic/gin"
)

func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()

		if raw != "" {
			path = path + "?" + raw
		}

		log.Printf("[HTTP] %d | %12v | %s | %s %s",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}

func CentralErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC RECOVERY] %v", err)
				c.JSON(http.StatusInternalServerError, model.ErrorResponse(
					"Internal Server Error",
					[]model.FieldError{{Field: "server", Reason: "An unexpected error occurred"}},
				))
				c.Abort()
			}
		}()
		c.Next()
	}
}
