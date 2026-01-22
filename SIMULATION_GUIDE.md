# User Session Simulation Guide

This guide explains how to use the user session simulator to generate realistic traffic and metrics for Voyager Gear.

## Overview

The `simulate_user_sessions.py` script simulates realistic user behavior with a conversion funnel pattern:

```
100 Users Browse
  └─> 30% Register (30 users)
      └─> 40% Add to Cart (12 users)
          └─> 50% Start Checkout (6 users)
              └─> 60% Complete Purchase (3.6 users)
```

**Overall conversion rate: ~3.6%** (realistic for e-commerce)

## Prerequisites

**All services must be running:**

1. Backend API (port 5001)
2. Checkout Service (port 5002)
3. Mock Address Validator (port 5003)

You can start all services with:
```bash
./startup.sh
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python run.py

# Terminal 2 - Mock Validator
cd checkout-service/cmd/mock-validator
go run main.go

# Terminal 3 - Checkout Service
cd checkout-service
go run main.go
```

## Basic Usage

### Quick Start (50 sessions with default rates)
```bash
python3 simulate_user_sessions.py
```

### Custom Number of Sessions
```bash
python3 simulate_user_sessions.py -n 200
```

### Adjust Conversion Rates
```bash
python3 simulate_user_sessions.py -n 100 \
  --register-rate 0.40 \
  --cart-rate 0.50 \
  --checkout-rate 0.60 \
  --complete-rate 0.70
```

## Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `-n`, `--num-sessions` | 50 | Total number of user sessions |
| `--register-rate` | 0.30 | % of browsers who register (30%) |
| `--cart-rate` | 0.40 | % of registered users who add to cart (40%) |
| `--checkout-rate` | 0.50 | % of cart users who start checkout (50%) |
| `--complete-rate` | 0.60 | % of checkout users who complete (60%) |

## What the Simulator Does

### Every Session:
1. **Browses Products** (1-4 pages)
   - Views product listings
   - Some users search for items
   - Some view product details

### 30% Register:
2. **Creates Account**
   - Generates unique username and email
   - Registers via API
   - Gets authentication token

### 40% of Registered Add to Cart:
3. **Adds Items to Cart**
   - Adds 1-5 products (weighted toward 1-2 items)
   - Random quantities (mostly 1, some 2-3)
   - Views cart

### 50% of Cart Users Start Checkout:
4. **Begins Checkout Process**
   - Proceeds to checkout page
   - Fills out shipping address
   - Fills out billing address
   - Enters payment information

### 60% of Checkout Users Complete:
5. **Completes Purchase**
   - Submits order through checkout service
   - Triggers address validation (N+1 issue)
   - Triggers inventory check (N+1 issue)
   - Creates order in database
   - Some orders marked as gifts

## Realistic Timing

The script includes realistic delays between actions:
- Browsing pages: 2-5 seconds
- Viewing products: 3-8 seconds
- Adding to cart: 0.5-2 seconds
- Checkout steps: 4-10 seconds each

## Example Output

```
================================================================================
VOYAGER GEAR - USER SESSION SIMULATOR
================================================================================
Total Sessions: 50
Conversion Funnel:
  Browse → Register: 30%
  Register → Add to Cart: 40%
  Cart → Start Checkout: 50%
  Checkout → Complete: 60%
================================================================================

Found 55 products available for simulation

[10:23:15] Session 1: Browsing 3 page(s) of products
[10:23:22] Session 1: Viewed 20 products
[10:23:28] Session 1: Searched for 'tent', found 8 results
[10:23:31] Session 1: Registered as user_1_4729
[10:23:35] Session 1: Added product 12 to cart (qty: 1)
[10:23:38] Session 1: Added product 45 to cart (qty: 2)
[10:23:40] Session 1: Viewed cart: 2 items
[10:23:43] Session 1: Proceeding to checkout
[10:23:46] Session 1: Starting checkout process
[10:23:52] Session 1: Entering shipping information
[10:24:00] Session 1: Entering billing information
[10:24:07] Session 1: Entering payment information
[10:24:13] Session 1: ✓ Order completed successfully! Order ID: 142

--- Progress: 10/50 sessions completed ---

...

================================================================================
SIMULATION COMPLETE - FINAL STATISTICS
================================================================================
Total Sessions:       50
Browsed Products:     50 (100.0%)
Registered:           14 (28.0% of browsers)
Added to Cart:        6 (42.9% of registered)
Started Checkout:     3 (50.0% of cart users)
Completed Purchase:   2 (66.7% of checkouts)

Overall Conversion:   2/50 = 4.00%
================================================================================
```

## Use Cases

### 1. Load Testing
Test how your application handles multiple concurrent users:
```bash
python3 simulate_user_sessions.py -n 500
```

### 2. Performance Metrics
Generate data to analyze N+1 query performance issues:
```bash
# Watch the Go service logs for timing output
python3 simulate_user_sessions.py -n 100 --complete-rate 0.80
```

### 3. Database Population
Create realistic order data for development:
```bash
python3 simulate_user_sessions.py -n 200
```

### 4. Conversion Funnel Testing
Test different conversion scenarios:
```bash
# High conversion scenario
python3 simulate_user_sessions.py -n 100 \
  --register-rate 0.50 \
  --cart-rate 0.60 \
  --checkout-rate 0.70 \
  --complete-rate 0.80

# Low conversion scenario
python3 simulate_user_sessions.py -n 100 \
  --register-rate 0.20 \
  --cart-rate 0.25 \
  --checkout-rate 0.30 \
  --complete-rate 0.40
```

## Analyzing Results

### Check Database
```bash
sqlite3 backend/voyager.db

-- View orders
SELECT id, user_id, total_amount, status, is_gift, created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;

-- Count orders
SELECT COUNT(*) FROM orders;

-- View users
SELECT id, username, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Conversion metrics
SELECT
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM users) as total_users,
  ROUND((SELECT COUNT(*) FROM orders) * 100.0 / (SELECT COUNT(*) FROM users), 2) as conversion_rate;
```

### Monitor Performance

**Backend logs**: Watch for API request timing
```bash
# In the terminal running the backend
# You'll see request logs for products, cart, checkout, etc.
```

**Go service logs**: Watch for N+1 performance issues
```bash
# In the terminal running checkout service
# Look for lines like:
# Address validation took: 500ms
# Inventory check took: 150ms
```

## Stopping the Simulation

Press `Ctrl+C` to stop the simulation at any time. Statistics will not be displayed if interrupted.

## Troubleshooting

### Services Not Running
```
Error: Connection refused
```
**Solution**: Ensure all services (backend, checkout, validator) are running

### Port Conflicts
```
Error: Address already in use
```
**Solution**: Check that ports 5001, 5002, 5003 are available

### Database Locked
```
Error: database is locked
```
**Solution**: This happens with high concurrency on SQLite. Reduce session count or add delays.

### Out of Stock Errors
```
Checkout failed: 400 - Product out of stock
```
**Solution**: Products run out of stock. Re-seed the database:
```bash
cd backend
python scripts/seed_products.py
```

## Advanced: Custom Scenarios

You can modify the script to simulate specific scenarios:

- **Cart abandonment analysis**: Set `--checkout-rate 0.20`
- **High-value orders**: Modify the script to add more expensive items
- **Gift orders**: The script already randomly marks ~15% as gifts
- **Mobile vs Desktop**: Add user-agent simulation
- **Returning customers**: Add logic to reuse existing users

## Tips

1. **Start small**: Test with 10-20 sessions first
2. **Monitor logs**: Watch all service terminals during simulation
3. **Clean database**: Reset between major simulations for consistent metrics
4. **Realistic rates**: E-commerce conversion rates typically range from 2-5%
5. **Performance testing**: Use 100+ sessions to see N+1 issues clearly

## Integration with Monitoring Tools

This simulator is perfect for:
- Setting up APM (Application Performance Monitoring)
- Testing observability dashboards
- Generating data for Sentry, DataDog, New Relic, etc.
- Load testing with realistic user behavior
- A/B testing different conversion strategies
