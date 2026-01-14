"""Authentication API routes."""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.config import settings
from app.core.exceptions import (
    InvalidCredentialsError,
    PasswordValidationError,
    UserAlreadyExistsError,
)
from app.core.security import (
    create_access_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user data

    Raises:
        UserAlreadyExistsError: If username or email already exists
        PasswordValidationError: If password doesn't meet requirements
    """
    # Validate password strength
    is_valid, error_message = validate_password_strength(user_data.password)
    if not is_valid:
        raise PasswordValidationError(error_message)

    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise UserAlreadyExistsError("Username already taken")

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise UserAlreadyExistsError("Email already registered")

    # Create new user
    hashed_pw = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pw,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.

    Args:
        credentials: Login credentials (username/email and password)
        db: Database session

    Returns:
        JWT token and user data

    Raises:
        InvalidCredentialsError: If credentials are invalid
    """
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == credentials.username) | (User.email == credentials.username)
    ).first()

    if not user:
        raise InvalidCredentialsError()

    # Verify password
    if not verify_password(credentials.password, user.hashed_password):
        raise InvalidCredentialsError()

    # Check if user is active
    if not user.is_active:
        raise InvalidCredentialsError("Account is inactive")

    # Create access token
    access_token = create_access_token(data={"sub": user.id})

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Get current authenticated user information.

    Args:
        current_user: Current user from JWT token

    Returns:
        Current user data
    """
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: Annotated[User, Depends(get_current_user)]):
    """
    Logout current user.

    Note: With JWT tokens, actual logout is handled client-side by removing the token.
    This endpoint exists for consistency and potential future token blacklisting.

    Args:
        current_user: Current user from JWT token

    Returns:
        No content (204 status)
    """
    # In a production system, you might want to blacklist the token here
    # For now, this is a no-op as JWT logout is client-side
    return None
