"""Pydantic schemas for Product model."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    """Base product schema with common fields."""

    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    description: str = Field(..., min_length=1, description="Product description")
    price: float = Field(..., gt=0, description="Product price")
    category: str = Field(..., description="Product category")
    image_url: str = Field(..., max_length=500, description="Product image URL")
    stock: int = Field(default=0, ge=0, description="Stock quantity")


class ProductCreate(ProductBase):
    """Schema for creating a new product."""

    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    image_url: Optional[str] = Field(None, max_length=500)
    stock: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    """Schema for product response."""

    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema for paginated product list response."""

    products: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True
