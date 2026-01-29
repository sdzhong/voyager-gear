package handlers

import (
	"checkout-service/models"
	"checkout-service/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CheckoutHandler struct {
	checkoutService *services.CheckoutService
}

func NewCheckoutHandler(checkoutService *services.CheckoutService) *CheckoutHandler {
	return &CheckoutHandler{
		checkoutService: checkoutService,
	}
}

func (h *CheckoutHandler) ProcessCheckout(c *gin.Context) {
	var req models.CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	token, exists := c.Get("token")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token not found"})
		return
	}

	resp, err := h.checkoutService.ProcessCheckout(&req, token.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *CheckoutHandler) ProcessGuestCheckout(c *gin.Context) {
	var req models.CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// Validate that guest_email is provided
	if req.GuestEmail == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "guest_email is required for guest checkout"})
		return
	}

	resp, err := h.checkoutService.ProcessGuestCheckout(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "healthy", "service": "checkout"})
}
