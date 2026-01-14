# Voyager Gear API

FastAPI backend service with JWT authentication for the Voyager Gear e-commerce platform.

## Features

- **User Registration** - Create new user accounts with password validation
- **JWT Authentication** - Secure token-based authentication
- **User Management** - Get current user information
- **Password Security** - Bcrypt hashing with secure password requirements
- **SQLite Database** - Lightweight database for development
- **CORS Support** - Configured for frontend integration
- **OpenAPI Documentation** - Automatic API documentation

## Tech Stack

- **FastAPI** 0.115.0 - Modern Python web framework
- **SQLAlchemy** 2.0.36 - ORM for database operations
- **Passlib** with Bcrypt - Password hashing
- **Python-JOSE** - JWT token generation and validation
- **Pydantic** - Data validation and settings management
- **Uvicorn** - ASGI server
- **SQLite** - Database (easily switchable to PostgreSQL)

## Setup

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. **Create and activate virtual environment**:
```bash
cd backend
python -m venv venv

# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env and update SECRET_KEY (already generated for you)
```

### Running the Server

**Development mode** (with auto-reload):
```bash
python run.py
```

The API will be available at:
- **API**: http://localhost:5000
- **OpenAPI Docs**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc

## API Endpoints

### Authentication

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "username": "string (3-50 chars)",
  "email": "user@example.com",
  "password": "string (min 8 chars, 1 upper, 1 lower, 1 number)"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-13T12:00:00Z"
}
```

#### POST /api/auth/login
Authenticate user and get JWT token.

**Request:**
```json
{
  "username": "testuser",  // Can be username or email
  "password": "Test123!!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "user@example.com",
    "is_active": true,
    "is_verified": false,
    "created_at": "2026-01-13T12:00:00Z"
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "user@example.com",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-13T12:00:00Z"
}
```

#### POST /api/auth/logout
Logout current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** 204 No Content

## Database

The application uses SQLite by default, with the database file created at `./voyager.db`.

### Database Schema

**users** table:
- `id` - INTEGER PRIMARY KEY
- `username` - VARCHAR(50) UNIQUE NOT NULL
- `email` - VARCHAR(100) UNIQUE NOT NULL
- `hashed_password` - VARCHAR(255) NOT NULL
- `is_active` - BOOLEAN DEFAULT TRUE
- `is_verified` - BOOLEAN DEFAULT FALSE
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Switching to PostgreSQL

To use PostgreSQL in production:

1. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

2. Update `DATABASE_URL` in `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/voyager_gear
```

## Testing

Run tests with pytest:
```bash
pytest
```

Run tests with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Security Features

- **Password Requirements**: Minimum 8 characters, 1 uppercase, 1 lowercase, 1 number
- **Bcrypt Hashing**: 12 rounds for password hashing
- **JWT Tokens**: HS256 algorithm with 30-minute expiration
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **Input Validation**: Pydantic schemas for all endpoints
- **CORS Configuration**: Restricted to specific origins
- **Rate Limiting**: Optional rate limiting middleware

## Configuration

All configuration is managed through environment variables in `.env`:

```env
# Application
APP_NAME=Voyager Gear API
DEBUG=True
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=5000

# Database
DATABASE_URL=sqlite:///./voyager.db

# JWT
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
AUTH_RATE_LIMIT_PER_MINUTE=5
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration management
│   ├── database.py          # Database setup and session
│   ├── models/
│   │   └── user.py          # User database model
│   ├── schemas/
│   │   ├── user.py          # User Pydantic schemas
│   │   └── auth.py          # Auth request/response schemas
│   ├── api/
│   │   ├── deps.py          # Dependency injection
│   │   └── routes/
│   │       └── auth.py      # Authentication endpoints
│   ├── core/
│   │   ├── security.py      # JWT and password utilities
│   │   └── exceptions.py    # Custom exceptions
│   └── tests/
│       └── test_auth.py     # Authentication tests
├── .env                     # Environment variables
├── .env.example             # Example environment file
├── requirements.txt         # Python dependencies
├── run.py                   # Development server script
└── README.md                # This file
```

## Development

### Adding New Endpoints

1. Create route handler in `app/api/routes/`
2. Define Pydantic schemas in `app/schemas/`
3. Add route to `app/main.py`
4. Write tests in `app/tests/`

### Code Style

The project follows:
- PEP 8 style guide
- Type hints for all functions
- Docstrings for all public functions
- Maximum line length: 100 characters

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Locked
```bash
# Remove database file and restart
rm voyager.db
python run.py
```

### Import Errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

## License

This project is part of the Voyager Gear application.
