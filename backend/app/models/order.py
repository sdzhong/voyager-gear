"""Order database model."""
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.orm import validates
from app.database import Base


class Order(Base):
    """Order model for storing customer orders."""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    guest_email = Column(String(255), nullable=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    status = Column(String(20), nullable=False, default='pending', index=True)

    # Shipping Address
    shipping_first_name = Column(String(100), nullable=False)
    shipping_last_name = Column(String(100), nullable=False)
    shipping_address_line1 = Column(String(200), nullable=False)
    shipping_address_line2 = Column(String(200), nullable=True)
    shipping_city = Column(String(100), nullable=False)
    shipping_state = Column(String(50), nullable=False)
    shipping_zip_code = Column(String(20), nullable=False)
    shipping_country = Column(String(50), nullable=False, default='USA')
    shipping_phone = Column(String(20), nullable=True)

    # Billing Address
    billing_same_as_shipping = Column(Boolean, nullable=False, default=True)
    billing_first_name = Column(String(100), nullable=True)
    billing_last_name = Column(String(100), nullable=True)
    billing_address_line1 = Column(String(200), nullable=True)
    billing_address_line2 = Column(String(200), nullable=True)
    billing_city = Column(String(100), nullable=True)
    billing_state = Column(String(50), nullable=True)
    billing_zip_code = Column(String(20), nullable=True)
    billing_country = Column(String(50), nullable=True)

    # Gift Options
    is_gift = Column(Boolean, nullable=False, default=False)
    gift_message = Column(Text, nullable=True)
    gift_wrap = Column(Boolean, nullable=False, default=False)

    # Payment Information
    payment_method = Column(String(20), nullable=False, default='credit_card')
    card_last_four = Column(String(4), nullable=True)
    card_brand = Column(String(20), nullable=True)

    # Order Totals
    subtotal = Column(Float, nullable=False)
    discount_amount = Column(Float, nullable=False, default=0.00)
    promo_code = Column(String(50), nullable=True)
    tax_amount = Column(Float, nullable=False)
    shipping_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    # Add constraint: at least one of user_id or guest_email must be present
    __table_args__ = (
        CheckConstraint(
            '(user_id IS NOT NULL AND guest_email IS NULL) OR (user_id IS NULL AND guest_email IS NOT NULL)',
            name='check_user_or_guest'
        ),
    )

    @property
    def is_guest_order(self) -> bool:
        """Check if this is a guest order."""
        return self.guest_email is not None

    def __repr__(self):
        return f"<Order(id={self.id}, order_number='{self.order_number}', total={self.total_amount})>"
