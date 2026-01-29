# Script to start all services for Voyager Gear e-commerce platform
# Run with: ./startup.sh

echo "Starting Voyager Gear services..."

# Start Backend (FastAPI)
echo "Starting Backend on port 5001..."
uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload &
BACKEND_PID=$!

# Start Checkout Service (Go)
echo "Starting Checkout Service on port 5002..."
cd ../checkout-service && export $(cat .env | xargs) && /opt/homebrew/bin/go run main.go &
CHECKOUT_PID=$!

# Wait a moment for services to start
sleep 3

echo ""
echo "All services started!"
echo "Backend: http://localhost:5001"
echo "Checkout Service: http://localhost:5002"
echo ""
echo "Press Ctrl+C to stop all services"

# Trap Ctrl+C and stop all services
trap "echo 'Stopping services...'; kill $BACKEND_PID $CHECKOUT_PID 2>/dev/null; exit" INT

# Wait for all background processes
wait
