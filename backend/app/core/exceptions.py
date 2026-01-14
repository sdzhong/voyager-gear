"""Custom exception classes for the application."""
from fastapi import HTTPException, status


class AuthenticationError(HTTPException):
    """Exception raised when authentication fails."""

    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class InvalidCredentialsError(HTTPException):
    """Exception raised when login credentials are invalid."""

    def __init__(self, detail: str = "Invalid username or password"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )


class UserAlreadyExistsError(HTTPException):
    """Exception raised when trying to create a user that already exists."""

    def __init__(self, detail: str = "User already exists"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
        )


class UserNotFoundError(HTTPException):
    """Exception raised when a user is not found."""

    def __init__(self, detail: str = "User not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        )


class InactiveUserError(HTTPException):
    """Exception raised when trying to authenticate an inactive user."""

    def __init__(self, detail: str = "User account is inactive"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
        )


class PasswordValidationError(HTTPException):
    """Exception raised when password doesn't meet requirements."""

    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        )
