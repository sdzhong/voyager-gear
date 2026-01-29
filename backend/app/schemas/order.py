"""Pydantic schemas for Order models."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, EmailStr

from app.schemas.product import ProductResponse


class OrderItemCreate(BaseModel):
    """Schema for creating an order item."""

    product_id: int = Field(..., gt=0, description="Product ID")
    product_name: str = Field(..., min_length=1, description="Product name")
    product_price: float = Field(..., gt=0, description="Product price")
    quantity: int = Field(..., gt=0, description="Item quantity")
    subtotal: float = Field(..., ge=0, description="Item subtotal")


class OrderItemResponse(BaseModel):
    """Schema for order item response."""

    id: int
    order_id: int
    product_id: int
    product_name: str
    product_price: float
    quantity: int
    subtotal: float
    created_at: datetime

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order."""

    # Guest Email (required for guest orders)
    guest_email: Optional[EmailStr] = Field(None, description="Email for guest checkout")

    # Shipping Address
    shipping_first_name: str = Field(..., min_length=1, max_length=100)
    shipping_last_name: str = Field(..., min_length=1, max_length=100)
    shipping_address_line1: str = Field(..., min_length=1, max_length=200)
    shipping_address_line2: Optional[str] = Field(None, max_length=200)
    shipping_city: str = Field(..., min_length=1, max_length=100)
    shipping_state: str = Field(..., min_length=2, max_length=50)
    shipping_zip_code: str = Field(..., min_length=5, max_length=20)
    shipping_country: str = Field(default="USA", max_length=50)
    shipping_phone: Optional[str] = Field(None, max_length=20)

    # Billing Address
    billing_same_as_shipping: bool = Field(default=True)
    billing_first_name: Optional[str] = Field(None, max_length=100)
    billing_last_name: Optional[str] = Field(None, max_length=100)
    billing_address_line1: Optional[str] = Field(None, max_length=200)
    billing_address_line2: Optional[str] = Field(None, max_length=200)
    billing_city: Optional[str] = Field(None, max_length=100)
    billing_state: Optional[str] = Field(None, max_length=50)
    billing_zip_code: Optional[str] = Field(None, max_length=20)
    billing_country: Optional[str] = Field(None, max_length=50)

    # Gift Options
    is_gift: bool = Field(default=False)
    gift_message: Optional[str] = Field(None)
    gift_wrap: bool = Field(default=False)

    # Payment Information
    payment_method: str = Field(default="credit_card", max_length=20)
    card_last_four: Optional[str] = Field(None, min_length=4, max_length=4)
    card_brand: Optional[str] = Field(None, max_length=20)

    # Order Totals
    subtotal: float = Field(..., ge=0)
    discount_amount: float = Field(default=0.00, ge=0)
    promo_code: Optional[str] = Field(None, max_length=50)
    tax_amount: float = Field(..., ge=0)
    shipping_amount: float = Field(..., ge=0)
    total_amount: float = Field(..., gt=0)

    # Order Items
    items: list[OrderItemCreate] = Field(..., min_length=1, description="Order items")


class OrderResponse(BaseModel):
    """Schema for order response."""

    id: int
    user_id: Optional[int]
    guest_email: Optional[str]
    order_number: str
    status: str

    # Shipping Address
    shipping_first_name: str
    shipping_last_name: str
    shipping_address_line1: str
    shipping_address_line2: Optional[str]
    shipping_city: str
    shipping_state: str
    shipping_zip_code: str
    shipping_country: str
    shipping_phone: Optional[str]

    # Billing Address
    billing_same_as_shipping: bool
    billing_first_name: Optional[str]
    billing_last_name: Optional[str]
    billing_address_line1: Optional[str]
    billing_address_line2: Optional[str]
    billing_city: Optional[str]
    billing_state: Optional[str]
    billing_zip_code: Optional[str]
    billing_country: Optional[str]

    # Gift Options
    is_gift: bool
    gift_message: Optional[str]
    gift_wrap: bool

    # Payment Information
    payment_method: str
    card_last_four: Optional[str]
    card_brand: Optional[str]

    # Order Totals
    subtotal: float
    discount_amount: float
    promo_code: Optional[str]
    tax_amount: float
    shipping_amount: float
    total_amount: float

    # Order Items
    items: list[OrderItemResponse]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
