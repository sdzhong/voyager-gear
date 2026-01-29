# Voyager Gear

A full-stack e-commerce platform for adventure gear with user authentication, featuring a React frontend and FastAPI backend.

## Features

- **User Authentication** - Registration, login, and JWT-based auth
- **Product Catalog** - Browse 120+ adventure gear products across 4 categories
- **Shopping Cart** - Guest and authenticated cart support with persistence
- **Checkout System** - Multi-step checkout with order processing
- **Order Management** - View order history and details
- **Microservices Architecture** - Go-based checkout and validation services
- **Protected Routes** - Secure pages requiring authentication
- **Account Management** - User profile and account settings
- **Modern UI** - Clean, responsive design with Tailwind CSS
- **Mock Service Worker** - Development without backend dependency
- **RESTful API** - FastAPI backend with OpenAPI documentation
- **User Session Simulator** - Generate realistic traffic for testing

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

### Microservices (Go)
- **Checkout Service** - Order processing and orchestration
- **Mock Address Validator** - Address validation with N+1 patterns
- **Go** 1.21+ - High-performance microservices

## Project Structure

```
voyager-gear/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components (Products, Cart, Checkout, Orders)
│   │   ├── contexts/     # React contexts (Auth, Checkout)
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Utility functions
│   │   └── types/        # TypeScript definitions
│   ├── mocks/           # MSW mock handlers
│   └── public/          # Static assets
│
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/         # API routes (auth, products, cart, orders)
│   │   ├── core/        # Core utilities (security, config)
│   │   ├── models/      # Database models (User, Product, Cart, Order)
│   │   ├── schemas/     # Pydantic schemas
│   │   └── tests/       # Backend tests
│   ├── scripts/        # Utility scripts (seed_products.py)
│   └── run.py          # Development server
│
├── checkout-service/  # Go microservices
│   ├── cmd/
│   │   └── mock-validator/  # Address validation service
│   ├── services/       # Checkout orchestration
│   ├── handlers/       # HTTP handlers
│   └── main.go         # Service entry point
│
├── simulate_user_sessions.py  # Traffic simulator
├── startup.sh         # Start all services script
└── README.md          # This file
```

## Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 10.x or higher (or npm)
- **Python** 3.10 or higher
- **pip** (Python package manager)
- **Go** 1.21 or higher (for checkout services)

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
# Update VITE_API_URL if needed (defaults to http://localhost:5001)
```

## Running the Application

### Option 1: Quick Start (All Services with startup.sh)

The easiest way to start all services at once:

```bash
./startup.sh
```

This will automatically start:
- **Backend API** - http://localhost:5001
- **Checkout Service** - http://localhost:5002
- **Mock Validator** - http://localhost:5003
- **Frontend** - http://localhost:3000

Press `Ctrl+C` to stop all services.

> **Note:** Requires Python virtual environment to be set up in `backend/venv` and all dependencies installed.

### Option 2: Manual Startup (Individual Services)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# or venv\Scripts\activate on Windows
python run.py
```
Backend runs at: **http://localhost:5001**
API docs at: **http://localhost:5001/docs**

**Terminal 2 - Mock Validator:**
```bash
cd checkout-service/cmd/mock-validator
go run main.go
```
Mock Validator runs at: **http://localhost:5003**

**Terminal 3 - Checkout Service:**
```bash
cd checkout-service
go run main.go
```
Checkout Service runs at: **http://localhost:5002**

**Terminal 4 - Frontend:**
```bash
cd frontend
pnpm dev
# or npm run dev
```
Frontend runs at: **http://localhost:3000**

### Option 3: Frontend Only (with MSW Mocks)

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

### 1. Browse Products
1. Navigate to **http://localhost:3000**
2. Browse 120+ products across 4 categories:
   - Outdoor Adventure
   - Urban Exploration
   - Travel Essentials
   - Digital Nomad
3. Use search to find specific items
4. View product details, prices, and availability

### 2. Shopping Cart
- Add products to cart (guest or authenticated)
- Adjust quantities or remove items
- View cart subtotal and item count
- Guest carts persist in localStorage
- Authenticated carts sync with backend

### 3. Register & Login
1. Click **Sign up** or visit **/register**
2. Fill in username, email, and password (min 8 chars, 1 upper, 1 lower, 1 number)
3. Auto-login after registration
4. Login at **/login** with username/email and password

### 4. Checkout Process
1. Click **Proceed to Checkout** from cart
2. Complete 5-step checkout flow:
   - Review cart items
   - Enter shipping address
   - Enter billing address (or use same as shipping)
   - Enter payment information (mock)
   - Confirm order
3. View order confirmation with order number

### 5. Order History
- Visit **/orders** to view all past orders
- Click on any order to see detailed information
- View order status, items, and totals

### 6. Protected Routes
- **/account**, **/checkout**, **/orders** require authentication
- Attempting to access without auth redirects to login
- After login, returns to originally requested page

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

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | List all products | No |
| GET | `/api/products/{id}` | Get product by ID | No |
| GET | `/api/products/search` | Search products | No |

### Cart

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user's cart | Optional* |
| POST | `/api/cart/items` | Add item to cart | Optional* |
| PUT | `/api/cart/items/{id}` | Update cart item | Optional* |
| DELETE | `/api/cart/items/{id}` | Remove cart item | Optional* |
| POST | `/api/cart/merge` | Merge guest cart | Yes |

*Cart works for both guest and authenticated users

### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | List user orders | Yes |
| GET | `/api/orders/{id}` | Get order details | Yes |
| POST | `/api/orders` | Create new order | Yes |

### Checkout (Go Service)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/checkout` | Process checkout | Yes |

Full API documentation available at **http://localhost:5001/docs** when backend is running.

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

## User Session Simulator

Generate realistic user traffic and test the full e-commerce flow:

```bash
# Basic simulation (50 sessions with default conversion rates)
python3 simulate_user_sessions.py

# Custom simulation
python3 simulate_user_sessions.py -n 100 \
  --register-rate 0.40 \
  --cart-rate 0.60 \
  --checkout-rate 0.50 \
  --complete-rate 0.70
```

The simulator:
- Browses products with realistic timing delays
- Registers users and logs in to get JWT tokens
- Adds items to cart (1-5 products per session)
- Completes multi-step checkout flow
- Provides detailed conversion funnel statistics

**Example output:**
```
Total Sessions:       50
Browsed Products:     50 (100.0%)
Registered:           15 (30.0% of browsers)
Added to Cart:        6 (40.0% of registered)
Started Checkout:     3 (50.0% of cart users)
Completed Purchase:   2 (66.7% of checkouts)

Overall Conversion:   2/50 = 4.00%
```

See `SIMULATION_GUIDE.md` for detailed documentation.

## Environment Variables

### Frontend (`.env`)
```env
REACT_APP_TEXT="I'm REACT_APP_TEXT from .env"
VITE_API_URL=http://localhost:5001
```

### Backend (`.env`)
```env
# Application
APP_NAME=Voyager Gear API
DEBUG=True
ENVIRONMENT=development

# Server
HOST=0.0.0.0
PORT=5001

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
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

### Checkout Service (`.env`)
```env
SECRET_KEY=<same-as-backend-secret-key>
FASTAPI_BASE_URL=http://localhost:5001
VALIDATOR_API_URL=http://localhost:5003
PORT=5002
GIN_MODE=debug
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

**Port 5001 already in use:**
```bash
# Find and kill process
lsof -ti:5001 | xargs kill -9
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
