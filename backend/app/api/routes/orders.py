"""Order API routes."""
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_user
from app.core.exceptions import OutOfStockError, OrderNotFoundError
from app.database import get_db
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["orders"])


def generate_order_number() -> str:
    """Generate a unique order number."""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    return f"ORD-{timestamp}"


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Create a new order.

    Args:
        order_data: Order details including addresses, payment, and items
        current_user: Authenticated user
        db: Database session

    Returns:
        Created order with items

    Raises:
        OutOfStockError: If any product has insufficient stock
    """
    # Generate unique order number
    order_number = generate_order_number()

    # Create order
    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        status='pending',
        # Shipping address
        shipping_first_name=order_data.shipping_first_name,
        shipping_last_name=order_data.shipping_last_name,
        shipping_address_line1=order_data.shipping_address_line1,
        shipping_address_line2=order_data.shipping_address_line2,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_zip_code=order_data.shipping_zip_code,
        shipping_country=order_data.shipping_country,
        shipping_phone=order_data.shipping_phone,
        # Billing address
        billing_same_as_shipping=order_data.billing_same_as_shipping,
        billing_first_name=order_data.billing_first_name,
        billing_last_name=order_data.billing_last_name,
        billing_address_line1=order_data.billing_address_line1,
        billing_address_line2=order_data.billing_address_line2,
        billing_city=order_data.billing_city,
        billing_state=order_data.billing_state,
        billing_zip_code=order_data.billing_zip_code,
        billing_country=order_data.billing_country,
        # Gift options
        is_gift=order_data.is_gift,
        gift_message=order_data.gift_message,
        gift_wrap=order_data.gift_wrap,
        # Payment
        payment_method=order_data.payment_method,
        card_last_four=order_data.card_last_four,
        card_brand=order_data.card_brand,
        # Totals
        subtotal=order_data.subtotal,
        discount_amount=order_data.discount_amount,
        promo_code=order_data.promo_code,
        tax_amount=order_data.tax_amount,
        shipping_amount=order_data.shipping_amount,
        total_amount=order_data.total_amount,
    )

    db.add(order)
    db.flush()

    # Create order items and decrement stock
    for item_data in order_data.items:
        # Get product and check stock
        product = db.query(Product).filter(Product.id == item_data.product_id).first()

        if not product:
            raise OutOfStockError(f"Product {item_data.product_id} not found")

        if product.stock < item_data.quantity:
            raise OutOfStockError(
                f"Insufficient stock for {product.name}. "
                f"Requested: {item_data.quantity}, Available: {product.stock}"
            )

        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=item_data.product_name,
            product_price=item_data.product_price,
            quantity=item_data.quantity,
            subtotal=item_data.subtotal,
        )
        db.add(order_item)

        # Decrement stock
        product.stock -= item_data.quantity

    db.commit()
    db.refresh(order)

    # Load relationships
    order = db.query(Order)\
        .filter(Order.id == order.id)\
        .options(joinedload(Order.items))\
        .first()

    return order


@router.get("", response_model=list[OrderResponse])
def get_user_orders(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Get all orders for the current user.

    Args:
        current_user: Authenticated user
        db: Database session

    Returns:
        List of user's orders
    """
    orders = db.query(Order)\
        .filter(Order.user_id == current_user.id)\
        .order_by(Order.created_at.desc())\
        .options(joinedload(Order.items))\
        .all()

    return orders


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Get a specific order by ID.

    Args:
        order_id: Order ID
        current_user: Authenticated user
        db: Database session

    Returns:
        Order details

    Raises:
        OrderNotFoundError: If order doesn't exist or doesn't belong to user
    """
    order = db.query(Order)\
        .filter(Order.id == order_id, Order.user_id == current_user.id)\
        .options(joinedload(Order.items))\
        .first()

    if not order:
        raise OrderNotFoundError("Order not found")

    return order


@router.post("/guest", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_guest_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new guest order (no authentication required).

    Args:
        order_data: Order details including guest_email, addresses, payment, and items
        db: Database session

    Returns:
        Created order with items

    Raises:
        HTTPException: If guest_email is not provided
        OutOfStockError: If any product has insufficient stock
    """
    # Validate that guest_email is provided
    if not order_data.guest_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="guest_email is required for guest orders"
        )

    # Generate unique order number
    order_number = generate_order_number()

    # Create order
    order = Order(
        user_id=None,
        guest_email=order_data.guest_email,
        order_number=order_number,
        status='pending',
        # Shipping address
        shipping_first_name=order_data.shipping_first_name,
        shipping_last_name=order_data.shipping_last_name,
        shipping_address_line1=order_data.shipping_address_line1,
        shipping_address_line2=order_data.shipping_address_line2,
        shipping_city=order_data.shipping_city,
        shipping_state=order_data.shipping_state,
        shipping_zip_code=order_data.shipping_zip_code,
        shipping_country=order_data.shipping_country,
        shipping_phone=order_data.shipping_phone,
        # Billing address
        billing_same_as_shipping=order_data.billing_same_as_shipping,
        billing_first_name=order_data.billing_first_name,
        billing_last_name=order_data.billing_last_name,
        billing_address_line1=order_data.billing_address_line1,
        billing_address_line2=order_data.billing_address_line2,
        billing_city=order_data.billing_city,
        billing_state=order_data.billing_state,
        billing_zip_code=order_data.billing_zip_code,
        billing_country=order_data.billing_country,
        # Gift options
        is_gift=order_data.is_gift,
        gift_message=order_data.gift_message,
        gift_wrap=order_data.gift_wrap,
        # Payment
        payment_method=order_data.payment_method,
        card_last_four=order_data.card_last_four,
        card_brand=order_data.card_brand,
        # Totals
        subtotal=order_data.subtotal,
        discount_amount=order_data.discount_amount,
        promo_code=order_data.promo_code,
        tax_amount=order_data.tax_amount,
        shipping_amount=order_data.shipping_amount,
        total_amount=order_data.total_amount,
    )

    db.add(order)
    db.flush()

    # Create order items and decrement stock
    for item_data in order_data.items:
        # Get product and check stock
        product = db.query(Product).filter(Product.id == item_data.product_id).first()

        if not product:
            raise OutOfStockError(f"Product {item_data.product_id} not found")

        if product.stock < item_data.quantity:
            raise OutOfStockError(
                f"Insufficient stock for {product.name}. "
                f"Requested: {item_data.quantity}, Available: {product.stock}"
            )

        # Create order item
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            product_name=item_data.product_name,
            product_price=item_data.product_price,
            quantity=item_data.quantity,
            subtotal=item_data.subtotal,
        )
        db.add(order_item)

        # Decrement stock
        product.stock -= item_data.quantity

    db.commit()
    db.refresh(order)

    # Load relationships
    order = db.query(Order)\
        .filter(Order.id == order.id)\
        .options(joinedload(Order.items))\
        .first()

    return order


@router.get("/guest/{order_id}", response_model=OrderResponse)
def get_guest_order(
    order_id: int,
    email: str = Query(..., description="Guest email for verification"),
    db: Session = Depends(get_db)
):
    """
    Get a guest order by ID (requires email verification).

    Args:
        order_id: Order ID
        email: Guest email for verification
        db: Database session

    Returns:
        Order details

    Raises:
        OrderNotFoundError: If order doesn't exist or email doesn't match
    """
    order = db.query(Order)\
        .filter(Order.id == order_id, Order.guest_email == email)\
        .options(joinedload(Order.items))\
        .first()

    if not order:
        raise OrderNotFoundError("Order not found or email does not match")

    return order
