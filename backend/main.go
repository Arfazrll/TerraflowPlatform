package main

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

type SensorData struct {
	Distance      float64 `json:"distance"`
	Ph            float64 `json:"ph"`
	PhVolt        float64 `json:"phVolt"`
	Servo         int     `json:"servo"`
	Servo2        int     `json:"servo2"`
	Pump          int     `json:"pump"`
	WaterDetected int     `json:"waterDetected"`
	Timestamp     int64   `json:"timestamp"`
}

type DeviceStatus struct {
	Status int    `json:"status"`
	Mode   string `json:"mode"`
}

type CommandRequest struct {
	Servo int `json:"servo,omitempty"`
	Pump  int `json:"pump,omitempty"`
}

func main() {
	port := getEnv("PORT", "8080")
	allowedOrigins := getEnv("ALLOWED_ORIGINS", "http://localhost:3000")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin != "" && isAllowedOrigin(origin, allowedOrigins) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Vary", "Origin")
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		}
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"app":    "terraflow-backend",
		})
	})

	r.GET("/api/config", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"firebaseConfig": gin.H{
				"apiKey":            getEnv("FIREBASE_API_KEY", ""),
				"authDomain":        getEnv("FIREBASE_AUTH_DOMAIN", ""),
				"databaseURL":       getEnv("FIREBASE_DATABASE_URL", ""),
				"projectId":         getEnv("FIREBASE_PROJECT_ID", ""),
				"storageBucket":     getEnv("FIREBASE_STORAGE_BUCKET", ""),
				"messagingSenderId": getEnv("FIREBASE_MESSAGING_SENDER_ID", ""),
				"appId":             getEnv("FIREBASE_APP_ID", ""),
			},
		})
	})

	r.Run(":" + port)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func isAllowedOrigin(origin string, allowed string) bool {
	for _, o := range strings.Split(allowed, ",") {
		if strings.TrimSpace(o) == origin {
			return true
		}
	}
	return false
}
