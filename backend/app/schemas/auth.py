"""Pydantic schemas for authentication."""
from pydantic import BaseModel, Field

from app.schemas.user import UserResponse


class LoginRequest(BaseModel):
    """Schema for login request."""

    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class Token(BaseModel):
    """Schema for JWT token response."""

    access_token: str
    token_type: str = "bearer"


class LoginResponse(Token):
    """Schema for login response with user info."""

    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponse


class LogoutResponse(BaseModel):
    """Schema for logout response."""

    message: str = "Successfully logged out"
