# Voyager Gear

A full-stack e-commerce platform for adventure gear with user authentication, featuring a React frontend and FastAPI backend.

## Features

- **User Authentication** - Registration, login, and JWT-based auth
- **Protected Routes** - Secure pages requiring authentication
- **Account Management** - User profile and account settings
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Mock Service Worker** - Development without backend dependency
- **RESTful API** - FastAPI backend with OpenAPI documentation

## Tech Stack

### Frontend
- **React** 19.2.1
- **TypeScript** 5.9.3
- **Vite** 7.2.7 - Lightning-fast build tool
- **React Router** v7 - Client-side routing
- **Tailwind CSS** 4.1.17 - Utility-first CSS
- **MSW** 2.12.4 - API mocking for development
- **Vitest** - Unit testing

### Backend
- **FastAPI** 0.115.0 - Modern Python web framework
- **SQLAlchemy** 2.0.36 - SQL toolkit and ORM
- **JWT Authentication** - Secure token-based auth
- **SQLite** - Database (production-ready for PostgreSQL)
- **Pydantic** - Data validation
- **Pytest** - Testing framework

## Project Structure

```
voyager-gear/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript definitions
│   ├── mocks/           # MSW mock handlers
│   └── public/          # Static assets
│
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Core utilities (security, config)
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── tests/       # Backend tests
│   └── run.py          # Development server
│
└── README.md          # This file
```

## Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 10.x or higher (or npm)
- **Python** 3.10 or higher
- **pip** (Python package manager)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd voyager-gear
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# The .env file is already configured with a secure SECRET_KEY
```

#### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
pnpm install
# or
npm install

# Set up environment variables
cp .env.sample .env
# Update VITE_API_URL if needed (defaults to http://localhost:5000)
```

## Running the Application

### Option 1: Full Stack (Backend + Frontend)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate on Windows
python run.py
```
Backend runs at: **http://localhost:5000**
API docs at: **http://localhost:5000/docs**

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm dev
# or npm run dev
```
Frontend runs at: **http://localhost:3000**

### Option 2: Frontend Only (with MSW Mocks)

The frontend includes Mock Service Worker (MSW) that intercepts API calls, allowing you to develop without running the backend:

```bash
cd frontend
pnpm dev
```

MSW will automatically mock all authentication endpoints. You can:
- Register new users
- Login with any registered user
- Access protected routes
- Test the full auth flow

> **Note:** MSW data is stored in memory and resets on page refresh.

## Using the Application

### 1. Register a New Account
1. Navigate to **http://localhost:3000**
2. Click **Sign up** or visit **/register**
3. Fill in:
   - Username (3-50 characters)
   - Email address
   - Password (min 8 chars, 1 upper, 1 lower, 1 number)
4. Submit to create account (auto-login)

### 2. Login
1. Visit **/login**
2. Enter username/email and password
3. Click **Log In**
4. Redirected to **/account** page

### 3. Access Protected Pages
- **/account** - User profile and account information (requires auth)
- Attempting to access without auth redirects to login
- After login, returns to originally requested page

### 4. Logout
- Click **Log Out** button on account page
- Token is removed and user is logged out

## Development

### Frontend Development

```bash
cd frontend

# Development server with hot reload
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run tests
pnpm test

# Build for production
pnpm build
```

### Backend Development

```bash
cd backend
source venv/bin/activate

# Run development server
python run.py

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# View API documentation
# Open http://localhost:5000/docs in browser
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout user | Yes |

Full API documentation available at **http://localhost:5000/docs** when backend is running.

## Testing

### Frontend Tests
```bash
cd frontend
pnpm test
```

Tests include:
- Component unit tests
- Auth context tests
- Protected route tests
- Form validation tests

### Backend Tests
```bash
cd backend
source venv/bin/activate
pytest
```

Tests include:
- User registration
- Login authentication
- JWT token validation
- Protected endpoint access

## Environment Variables

### Frontend (`.env`)
```env
REACT_APP_TEXT="I'm REACT_APP_TEXT from .env"
VITE_API_URL=http://localhost:5000
```

### Backend (`.env`)
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
SECRET_KEY=<your-generated-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Security
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Security

### Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

### Authentication Flow
1. User registers/logs in
2. Backend generates JWT token (30-min expiration)
3. Frontend stores token in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Backend validates token on protected endpoints

### Security Features
- Bcrypt password hashing (12 rounds)
- JWT tokens with expiration
- SQL injection prevention (SQLAlchemy ORM)
- Input validation (Pydantic)
- CORS configuration
- Protected routes on frontend

## Troubleshooting

### Backend Issues

**Port 5000 already in use:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
```

**Import errors:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Issues

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**MSW not working:**
- Check browser console for MSW initialization messages
- Ensure `mocks/browser.js` is properly imported in `main.tsx`

**CORS errors:**
- Verify backend CORS_ORIGINS includes frontend URL
- Check frontend is connecting to correct API URL

## Production Deployment

### Backend
1. Switch to PostgreSQL database
2. Set `DEBUG=False` in environment
3. Use strong, unique `SECRET_KEY`
4. Enable HTTPS
5. Configure production CORS origins
6. Use a production ASGI server (Gunicorn + Uvicorn)

### Frontend
1. Update `VITE_API_URL` to production API URL
2. Build for production: `pnpm build`
3. Deploy `dist/` folder to hosting service
4. Disable MSW in production build

## Contributing

1. Create a feature branch
2. Make changes
3. Run tests (`pnpm test` and `pytest`)
4. Submit pull request

## License

This project is part of the Voyager Gear application.

## Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Check console logs for errors

---

**Built with ❤️ for adventurers**
