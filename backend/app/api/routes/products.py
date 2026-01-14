"""Product API routes."""
from typing import Optional
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse, ProductListResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    sort_by: str = Query("created_at", description="Sort by field (price, name, created_at)"),
    sort_order: str = Query("desc", description="Sort order (asc, desc)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    db: Session = Depends(get_db),
):
    """
    Get paginated list of products with filtering and sorting.

    Args:
        page: Page number (1-indexed)
        page_size: Number of items per page
        category: Filter by category
        search: Search query for name and description
        sort_by: Field to sort by (price, name, created_at)
        sort_order: Sort order (asc, desc)
        min_price: Minimum price filter
        max_price: Maximum price filter
        db: Database session

    Returns:
        Paginated product list with metadata
    """
    # Start with base query
    query = db.query(Product)

    # Apply category filter
    if category:
        query = query.filter(Product.category == category)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term)
            )
        )

    # Apply price range filters
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Get total count before pagination
    total = query.count()

    # Apply sorting
    sort_field = getattr(Product, sort_by, Product.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    # Apply pagination
    offset = (page - 1) * page_size
    products = query.offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = ceil(total / page_size) if total > 0 else 1

    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get a single product by ID.

    Args:
        product_id: Product ID
        db: Database session

    Returns:
        Product data

    Raises:
        HTTPException: If product not found
    """
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found"
        )

    return product
