package main

import (
	"log"
	"net/http"
	"os"

	"backend/internal/database"
	"backend/internal/handler"
	"backend/internal/repository"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	// Load .env if exists
	_ = godotenv.Load()

	// Initialize Database
	db, err := database.InitDB()
	if err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}
	defer db.Close()

	// Run Database Migrations
	if err := database.RunMigrations(db); err != nil {
		log.Printf("Warning: Migration execution encountered an error: %v", err)
	}

	// Initialize Repositories
	itemRepo := repository.NewItemRepository(db)
	locationRepo := repository.NewLocationRepository(db)
	stockRepo := repository.NewStockRepository(db)

	// Initialize Services
	itemService := service.NewItemService(itemRepo)
	locationService := service.NewLocationService(locationRepo)
	stockService := service.NewStockService(stockRepo, itemRepo, locationRepo)

	// Initialize Handlers
	itemHandler := handler.NewItemHandler(itemService)
	locationHandler := handler.NewLocationHandler(locationService)
	stockHandler := handler.NewStockHandler(stockService)

	// Setup Gin Router
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(handler.LoggerMiddleware())
	r.Use(handler.CentralErrorHandler())
	r.Use(CORSMiddleware())

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP", "service": "warehouse-management-api"})
	})

	// Swagger / OpenAPI documentation
	r.StaticFile("/docs/swagger.yaml", "docs/swagger.yaml")
	r.GET("/docs", func(c *gin.Context) {
		c.Header("Content-Type", "text/html; charset=utf-8")
		html := `<!DOCTYPE html>
<html>
<head>
  <title>Warehouse API Swagger Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/docs/swagger.yaml',
      dom_id: '#swagger-ui',
    });
  </script>
</body>
</html>`
		c.String(http.StatusOK, html)
	})

	// API v1 Routes
	v1 := r.Group("/api/v1")
	{
		// Item endpoints
		v1.POST("/items", itemHandler.Create)
		v1.GET("/items", itemHandler.List)
		v1.GET("/items/categories", itemHandler.GetCategories)
		v1.GET("/items/:id", itemHandler.GetByID)
		v1.PUT("/items/:id", itemHandler.Update)
		v1.DELETE("/items/:id", itemHandler.Delete)

		// Stock endpoints
		v1.POST("/stock/receive", stockHandler.Receive)
		v1.GET("/stock/:item_id", stockHandler.GetByItemID)

		// Location endpoints (bonus)
		v1.GET("/locations", locationHandler.List)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Warehouse API Server running on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
