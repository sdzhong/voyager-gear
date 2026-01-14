"""Product database model."""
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from app.database import Base


class ProductCategory(str, Enum):
    """Product category enum."""

    LUGGAGE = "luggage"
    BAGS = "bags"
    TRAVEL_ACCESSORIES = "travel_accessories"
    DIGITAL_NOMAD = "digital_nomad"


class Product(Base):
    """Product model for catalog management."""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    image_url = Column(String(500), nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}', category='{self.category}', price={self.price})>"
