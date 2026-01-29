package main

import (
	"checkout-service/clients"
	"checkout-service/config"
	"checkout-service/handlers"
	"checkout-service/middleware"
	"checkout-service/services"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	fapiClient := clients.NewFastAPIClient(cfg.FastAPIBaseURL)
	addressValidator := services.NewAddressValidator(cfg.ValidatorAPIURL)
	inventoryChecker := services.NewInventoryChecker(fapiClient)
	checkoutService := services.NewCheckoutService(addressValidator, inventoryChecker, fapiClient)
	checkoutHandler := handlers.NewCheckoutHandler(checkoutService)

	gin.SetMode(gin.DebugMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/health", handlers.HealthCheck)

	api := r.Group("/api")
	{
		// Authenticated checkout route
		checkout := api.Group("/checkout")
		checkout.Use(middleware.AuthMiddleware(cfg.SecretKey))
		{
			checkout.POST("/process", checkoutHandler.ProcessCheckout)
		}

		// Guest checkout route (no authentication required)
		guestCheckout := api.Group("/guest-checkout")
		{
			guestCheckout.POST("/process", checkoutHandler.ProcessGuestCheckout)
		}
	}

	log.Printf("Checkout service starting on :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
