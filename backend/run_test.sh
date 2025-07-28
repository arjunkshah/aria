#!/bin/bash

# ARIA Backend Test Script
# This script sets up the backend and runs the complete test suite

set -e

echo "🚀 ARIA Backend Test Suite"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is required but not installed"
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is required but not installed"
    exit 1
fi

print_status "Installing dependencies..."
pip3 install -r requirements.txt

print_status "Setting up environment..."
export GITHUB_TOKEN="gho_************************************"  # Replace with your actual token

print_status "Starting backend server..."
python3 main.py &
BACKEND_PID=$!

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    print_success "Backend is running on http://localhost:8000"
else
    print_error "Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_status "Running API test suite..."
python3 test_api.py

# Cleanup
print_status "Stopping backend server..."
kill $BACKEND_PID 2>/dev/null || true

print_success "Test completed!"
echo ""
echo "To run the backend manually:"
echo "  cd backend"
echo "  python3 main.py"
echo ""
echo "To test with a real PR:"
echo "  1. Start the backend"
echo "  2. Run: python3 test_api.py"
echo "  3. Create and merge a PR in the aria repository"
echo "  4. Watch for auto-generation notifications!" 