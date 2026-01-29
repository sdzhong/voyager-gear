package models

type Address struct {
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	AddressLine1 string `json:"address_line1"`
	AddressLine2 string `json:"address_line2,omitempty"`
	City         string `json:"city"`
	State        string `json:"state"`
	ZipCode      string `json:"zip_code"`
	Country      string `json:"country"`
	Phone        string `json:"phone,omitempty"`
}

type CartItem struct {
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"product_price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

type CheckoutRequest struct {
	GuestEmail              string     `json:"guest_email,omitempty"`
	ShippingAddress         Address    `json:"shipping_address"`
	BillingAddress          Address    `json:"billing_address"`
	BillingIsSameAsShipping bool       `json:"billing_same_as_shipping"`
	IsGift                  bool       `json:"is_gift"`
	GiftMessage             string     `json:"gift_message,omitempty"`
	GiftWrap                bool       `json:"gift_wrap"`
	PaymentMethod           string     `json:"payment_method"`
	CardLastFour            string     `json:"card_last_four"`
	CardBrand               string     `json:"card_brand"`
	Items                   []CartItem `json:"items"`
	Subtotal                float64    `json:"subtotal"`
	DiscountAmount          float64    `json:"discount_amount"`
	PromoCode               string     `json:"promo_code,omitempty"`
	TaxAmount               float64    `json:"tax_amount"`
	ShippingAmount          float64    `json:"shipping_amount"`
	TotalAmount             float64    `json:"total_amount"`
}

type CheckoutResponse struct {
	OrderID     int     `json:"order_id"`
	OrderNumber string  `json:"order_number"`
	Status      string  `json:"status"`
	Total       float64 `json:"total"`
}

type Product struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Stock int     `json:"stock"`
}

type OrderItemCreate struct {
	ProductID    int     `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductPrice float64 `json:"product_price"`
	Quantity     int     `json:"quantity"`
	Subtotal     float64 `json:"subtotal"`
}

type OrderCreateRequest struct {
	GuestEmail              string            `json:"guest_email,omitempty"`
	ShippingFirstName       string            `json:"shipping_first_name"`
	ShippingLastName        string            `json:"shipping_last_name"`
	ShippingAddressLine1    string            `json:"shipping_address_line1"`
	ShippingAddressLine2    string            `json:"shipping_address_line2,omitempty"`
	ShippingCity            string            `json:"shipping_city"`
	ShippingState           string            `json:"shipping_state"`
	ShippingZipCode         string            `json:"shipping_zip_code"`
	ShippingCountry         string            `json:"shipping_country"`
	ShippingPhone           string            `json:"shipping_phone,omitempty"`
	BillingSameAsShipping   bool              `json:"billing_same_as_shipping"`
	BillingFirstName        string            `json:"billing_first_name,omitempty"`
	BillingLastName         string            `json:"billing_last_name,omitempty"`
	BillingAddressLine1     string            `json:"billing_address_line1,omitempty"`
	BillingAddressLine2     string            `json:"billing_address_line2,omitempty"`
	BillingCity             string            `json:"billing_city,omitempty"`
	BillingState            string            `json:"billing_state,omitempty"`
	BillingZipCode          string            `json:"billing_zip_code,omitempty"`
	BillingCountry          string            `json:"billing_country,omitempty"`
	IsGift                  bool              `json:"is_gift"`
	GiftMessage             string            `json:"gift_message,omitempty"`
	GiftWrap                bool              `json:"gift_wrap"`
	PaymentMethod           string            `json:"payment_method"`
	CardLastFour            string            `json:"card_last_four,omitempty"`
	CardBrand               string            `json:"card_brand,omitempty"`
	Subtotal                float64           `json:"subtotal"`
	DiscountAmount          float64           `json:"discount_amount"`
	PromoCode               string            `json:"promo_code,omitempty"`
	TaxAmount               float64           `json:"tax_amount"`
	ShippingAmount          float64           `json:"shipping_amount"`
	TotalAmount             float64           `json:"total_amount"`
	Items                   []OrderItemCreate `json:"items"`
}

type OrderResponse struct {
	ID          int     `json:"id"`
	OrderNumber string  `json:"order_number"`
	Status      string  `json:"status"`
	TotalAmount float64 `json:"total_amount"`
}
