package services

import (
	"checkout-service/clients"
	"checkout-service/models"
	"log"
	"time"
)

type CheckoutService struct{
	addressValidator *AddressValidator
	inventoryChecker *InventoryChecker
	fapiClient       *clients.FastAPIClient
}

func NewCheckoutService(
	addressValidator *AddressValidator,
	inventoryChecker *InventoryChecker,
	fapiClient *clients.FastAPIClient,
) *CheckoutService {
	return &CheckoutService{
		addressValidator: addressValidator,
		inventoryChecker: inventoryChecker,
		fapiClient:       fapiClient,
	}
}

func (cs *CheckoutService) ProcessCheckout(req *models.CheckoutRequest, token string) (*models.CheckoutResponse, error) {
	startTime := time.Now()

	log.Println("Starting address validation...")
	addrStart := time.Now()

	if err := cs.addressValidator.Validate(req.ShippingAddress); err != nil {
		return nil, err
	}

	if !req.BillingIsSameAsShipping {
		if err := cs.addressValidator.Validate(req.BillingAddress); err != nil {
			return nil, err
		}
	}

	log.Printf("Address validation took: %v", time.Since(addrStart))

	log.Println("Starting inventory check...")
	invStart := time.Now()

	if err := cs.inventoryChecker.ValidateStock(req.Items); err != nil {
		return nil, err
	}

	log.Printf("Inventory check took: %v", time.Since(invStart))

	orderReq := models.OrderCreateRequest{
		ShippingFirstName:     req.ShippingAddress.FirstName,
		ShippingLastName:      req.ShippingAddress.LastName,
		ShippingAddressLine1:  req.ShippingAddress.AddressLine1,
		ShippingAddressLine2:  req.ShippingAddress.AddressLine2,
		ShippingCity:          req.ShippingAddress.City,
		ShippingState:         req.ShippingAddress.State,
		ShippingZipCode:       req.ShippingAddress.ZipCode,
		ShippingCountry:       req.ShippingAddress.Country,
		ShippingPhone:         req.ShippingAddress.Phone,
		BillingSameAsShipping: req.BillingIsSameAsShipping,
		BillingFirstName:      req.BillingAddress.FirstName,
		BillingLastName:       req.BillingAddress.LastName,
		BillingAddressLine1:   req.BillingAddress.AddressLine1,
		BillingAddressLine2:   req.BillingAddress.AddressLine2,
		BillingCity:           req.BillingAddress.City,
		BillingState:          req.BillingAddress.State,
		BillingZipCode:        req.BillingAddress.ZipCode,
		BillingCountry:        req.BillingAddress.Country,
		IsGift:                req.IsGift,
		GiftMessage:           req.GiftMessage,
		GiftWrap:              req.GiftWrap,
		PaymentMethod:         req.PaymentMethod,
		CardLastFour:          req.CardLastFour,
		CardBrand:             req.CardBrand,
		Subtotal:              req.Subtotal,
		DiscountAmount:        req.DiscountAmount,
		PromoCode:             req.PromoCode,
		TaxAmount:             req.TaxAmount,
		ShippingAmount:        req.ShippingAmount,
		TotalAmount:           req.TotalAmount,
	}

	for _, item := range req.Items {
		orderReq.Items = append(orderReq.Items, models.OrderItemCreate{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductPrice: item.Price,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		})
	}

	log.Println("Creating order...")
	orderResp, err := cs.fapiClient.CreateOrder(orderReq, token)
	if err != nil {
		return nil, err
	}

	log.Println("Clearing cart...")
	if err := cs.fapiClient.ClearCart(token); err != nil {
		log.Printf("Warning: Failed to clear cart: %v", err)
	}

	log.Printf("Total checkout processing time: %v", time.Since(startTime))

	return &models.CheckoutResponse{
		OrderID:     orderResp.ID,
		OrderNumber: orderResp.OrderNumber,
		Status:      orderResp.Status,
		Total:       orderResp.TotalAmount,
	}, nil
}

func (cs *CheckoutService) ProcessGuestCheckout(req *models.CheckoutRequest) (*models.CheckoutResponse, error) {
	startTime := time.Now()

	log.Println("Starting guest checkout - address validation...")
	addrStart := time.Now()

	if err := cs.addressValidator.Validate(req.ShippingAddress); err != nil {
		return nil, err
	}

	if !req.BillingIsSameAsShipping {
		if err := cs.addressValidator.Validate(req.BillingAddress); err != nil {
			return nil, err
		}
	}

	log.Printf("Address validation took: %v", time.Since(addrStart))

	log.Println("Starting inventory check...")
	invStart := time.Now()

	if err := cs.inventoryChecker.ValidateStock(req.Items); err != nil {
		return nil, err
	}

	log.Printf("Inventory check took: %v", time.Since(invStart))

	orderReq := models.OrderCreateRequest{
		GuestEmail:            req.GuestEmail,
		ShippingFirstName:     req.ShippingAddress.FirstName,
		ShippingLastName:      req.ShippingAddress.LastName,
		ShippingAddressLine1:  req.ShippingAddress.AddressLine1,
		ShippingAddressLine2:  req.ShippingAddress.AddressLine2,
		ShippingCity:          req.ShippingAddress.City,
		ShippingState:         req.ShippingAddress.State,
		ShippingZipCode:       req.ShippingAddress.ZipCode,
		ShippingCountry:       req.ShippingAddress.Country,
		ShippingPhone:         req.ShippingAddress.Phone,
		BillingSameAsShipping: req.BillingIsSameAsShipping,
		BillingFirstName:      req.BillingAddress.FirstName,
		BillingLastName:       req.BillingAddress.LastName,
		BillingAddressLine1:   req.BillingAddress.AddressLine1,
		BillingAddressLine2:   req.BillingAddress.AddressLine2,
		BillingCity:           req.BillingAddress.City,
		BillingState:          req.BillingAddress.State,
		BillingZipCode:        req.BillingAddress.ZipCode,
		BillingCountry:        req.BillingAddress.Country,
		IsGift:                req.IsGift,
		GiftMessage:           req.GiftMessage,
		GiftWrap:              req.GiftWrap,
		PaymentMethod:         req.PaymentMethod,
		CardLastFour:          req.CardLastFour,
		CardBrand:             req.CardBrand,
		Subtotal:              req.Subtotal,
		DiscountAmount:        req.DiscountAmount,
		PromoCode:             req.PromoCode,
		TaxAmount:             req.TaxAmount,
		ShippingAmount:        req.ShippingAmount,
		TotalAmount:           req.TotalAmount,
	}

	for _, item := range req.Items {
		orderReq.Items = append(orderReq.Items, models.OrderItemCreate{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductPrice: item.Price,
			Quantity:     item.Quantity,
			Subtotal:     item.Subtotal,
		})
	}

	log.Println("Creating guest order...")
	orderResp, err := cs.fapiClient.CreateGuestOrder(orderReq)
	if err != nil {
		return nil, err
	}

	// Note: We don't clear cart for guest users as they don't have a server-side cart

	log.Printf("Total guest checkout processing time: %v", time.Since(startTime))

	return &models.CheckoutResponse{
		OrderID:     orderResp.ID,
		OrderNumber: orderResp.OrderNumber,
		Status:      orderResp.Status,
		Total:       orderResp.TotalAmount,
	}, nil
}
