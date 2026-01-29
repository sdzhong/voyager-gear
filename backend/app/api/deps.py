"""Dependency injection for API routes."""
from typing import Annotated

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import AuthenticationError, UserNotFoundError
from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User


def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token.

    Args:
        authorization: Authorization header with Bearer token
        db: Database session

    Returns:
        User model instance

    Raises:
        AuthenticationError: If token is invalid or missing
        UserNotFoundError: If user doesn't exist
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise AuthenticationError("Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise AuthenticationError("Invalid token payload")
        user_id: int = int(user_id_str)
    except JWTError:
        raise AuthenticationError("Could not validate credentials")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise UserNotFoundError()

    if not user.is_active:
        raise AuthenticationError("User account is inactive")

    return user


def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    """
    Dependency to get current active user.

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        User model instance

    Raises:
        AuthenticationError: If user is not active
    """
    if not current_user.is_active:
        raise AuthenticationError("User account is inactive")

    return current_user
