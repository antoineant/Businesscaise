#!/bin/bash

################################################################################
# BusinessCaise E2E Test Orchestration Script
#
# This script orchestrates the complete E2E testing workflow:
# 1. Checks prerequisites
# 2. Starts all required services (PostgreSQL, Backend, GM Dashboard, Team Frontend)
# 3. Runs E2E tests
# 4. Generates reports
# 5. Cleans up services
#
# Usage:
#   ./run-e2e-tests.sh              # Run all tests
#   ./run-e2e-tests.sh --gm-only    # Run only GM Dashboard tests
#   ./run-e2e-tests.sh --team-only  # Run only Team Frontend tests
#   ./run-e2e-tests.sh --integration # Run only integration tests (includes submission scoring)
#   ./run-e2e-tests.sh --headed      # Run tests in headed mode (see browser)
#   ./run-e2e-tests.sh --ui          # Run tests in UI mode
#
# Test Suites:
#   - GM Dashboard: Game creation, session management, team monitoring, analytics
#   - Team Frontend: Player registration, game join, decision submission
#   - Integration: Multi-service workflows (GM-Player interaction, submission scoring)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
TEST_MODE="all"
HEADED=""
UI_MODE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --gm-only)
      TEST_MODE="gm"
      shift
      ;;
    --team-only)
      TEST_MODE="team"
      shift
      ;;
    --integration)
      TEST_MODE="integration"
      shift
      ;;
    --headed)
      HEADED="--headed"
      shift
      ;;
    --ui)
      UI_MODE="--ui"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: $0 [--gm-only|--team-only|--integration] [--headed] [--ui]"
      exit 1
      ;;
  esac
done

# PIDs for cleanup
POSTGRES_PID=""
BACKEND_PID=""
GM_DASHBOARD_PID=""
TEAM_FRONTEND_PID=""

# Cleanup function
cleanup() {
  echo ""
  echo -e "${YELLOW}===========================================${NC}"
  echo -e "${YELLOW}Cleaning up services...${NC}"
  echo -e "${YELLOW}===========================================${NC}"

  if [ ! -z "$TEAM_FRONTEND_PID" ]; then
    echo "Stopping Team Frontend (PID: $TEAM_FRONTEND_PID)..."
    kill $TEAM_FRONTEND_PID 2>/dev/null || true
  fi

  if [ ! -z "$GM_DASHBOARD_PID" ]; then
    echo "Stopping GM Dashboard (PID: $GM_DASHBOARD_PID)..."
    kill $GM_DASHBOARD_PID 2>/dev/null || true
  fi

  if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || true
  fi

  # Kill any remaining node processes on our ports
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  lsof -ti:3002 | xargs kill -9 2>/dev/null || true
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true

  echo -e "${GREEN}✓ Cleanup complete${NC}"
}

# Set trap to cleanup on exit
trap cleanup EXIT INT TERM

# Function to check if a port is in use
check_port() {
  lsof -ti:$1 > /dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
  local url=$1
  local service_name=$2
  local max_wait=60
  local wait_time=0

  echo -n "Waiting for $service_name to be ready"
  while ! curl -s "$url" > /dev/null 2>&1; do
    if [ $wait_time -ge $max_wait ]; then
      echo ""
      echo -e "${RED}✗ $service_name failed to start within ${max_wait}s${NC}"
      exit 1
    fi
    echo -n "."
    sleep 2
    wait_time=$((wait_time + 2))
  done
  echo ""
  echo -e "${GREEN}✓ $service_name is ready${NC}"
}

# Main script
main() {
  echo -e "${BLUE}===========================================${NC}"
  echo -e "${BLUE}BusinessCaise E2E Testing${NC}"
  echo -e "${BLUE}===========================================${NC}"
  echo ""

  # Step 1: Check prerequisites
  echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

  if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"

  if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL client is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ PostgreSQL client installed${NC}"

  if ! command -v npx &> /dev/null; then
    echo -e "${RED}✗ npx is not installed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ npx available${NC}"

  # Check if Playwright is installed
  if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}Playwright not found. Installing...${NC}"
    npm install --save-dev @playwright/test
    npx playwright install chromium
  fi
  echo -e "${GREEN}✓ Playwright installed${NC}"

  echo ""

  # Step 2: Check PostgreSQL
  echo -e "${YELLOW}Step 2: Checking PostgreSQL...${NC}"

  if ! pg_isready > /dev/null 2>&1; then
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL:"
    echo "  macOS: brew services start postgresql@14"
    echo "  Linux: sudo systemctl start postgresql"
    exit 1
  fi
  echo -e "${GREEN}✓ PostgreSQL is running${NC}"

  # Check if database exists
  if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw businesscase; then
    echo -e "${YELLOW}Database 'businesscase' not found. Creating...${NC}"
    cd backend && ./setup-db.sh && cd ..
  fi
  echo -e "${GREEN}✓ Database 'businesscase' exists${NC}"

  echo ""

  # Step 3: Start services
  echo -e "${YELLOW}Step 3: Starting services...${NC}"

  # Kill any processes on our ports
  echo "Cleaning up any existing processes on ports 3001, 3002, 5173..."
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  lsof -ti:3002 | xargs kill -9 2>/dev/null || true
  lsof -ti:5173 | xargs kill -9 2>/dev/null || true
  sleep 2

  # Start Backend
  echo "Starting Backend API (port 3001)..."
  cd backend
  # Source .env file to ensure environment variables are loaded
  if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Loaded environment variables from backend/.env"
  fi
  npm run dev > ../logs/backend-e2e.log 2>&1 &
  BACKEND_PID=$!
  cd ..
  wait_for_service "http://localhost:3001/api/auth/me" "Backend API"

  # Start GM Dashboard (if needed)
  if [ "$TEST_MODE" = "all" ] || [ "$TEST_MODE" = "gm" ] || [ "$TEST_MODE" = "integration" ]; then
    echo "Starting GM Dashboard (port 3002)..."
    cd gm-dashboard
    npm run dev > ../logs/gm-dashboard-e2e.log 2>&1 &
    GM_DASHBOARD_PID=$!
    cd ..
    wait_for_service "http://localhost:3002" "GM Dashboard"
  fi

  # Start Team Frontend (if needed)
  # Note: Integration tests require Team Frontend for submission scoring workflow
  if [ "$TEST_MODE" = "all" ] || [ "$TEST_MODE" = "team" ] || [ "$TEST_MODE" = "integration" ]; then
    echo "Starting Team Frontend (port 5173)..."
    npm run dev > logs/team-frontend-e2e.log 2>&1 &
    TEAM_FRONTEND_PID=$!
    wait_for_service "http://localhost:5173" "Team Frontend"
  fi

  echo ""
  echo -e "${GREEN}✓ All services started${NC}"
  echo ""

  # Step 4: Run E2E tests
  echo -e "${YELLOW}Step 4: Running E2E tests...${NC}"
  echo ""

  # Create logs directory
  mkdir -p logs
  mkdir -p e2e-results

  # Determine which tests to run
  TEST_ARGS=""
  case $TEST_MODE in
    gm)
      TEST_ARGS="--project=gm-dashboard"
      echo "Running GM Dashboard tests only..."
      ;;
    team)
      TEST_ARGS="--project=team-frontend"
      echo "Running Team Frontend tests only..."
      ;;
    integration)
      TEST_ARGS="--project=integration"
      echo "Running Integration tests only..."
      ;;
    all)
      echo "Running all tests..."
      ;;
  esac

  # Add headed/UI mode if specified
  if [ ! -z "$HEADED" ]; then
    TEST_ARGS="$TEST_ARGS $HEADED"
  fi

  if [ ! -z "$UI_MODE" ]; then
    TEST_ARGS="$TEST_ARGS $UI_MODE"
  fi

  # Run tests
  if npx playwright test $TEST_ARGS; then
    echo ""
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}✓ All E2E tests passed!${NC}"
    echo -e "${GREEN}===========================================${NC}"
    TEST_RESULT=0
  else
    echo ""
    echo -e "${RED}===========================================${NC}"
    echo -e "${RED}✗ Some E2E tests failed${NC}"
    echo -e "${RED}===========================================${NC}"
    TEST_RESULT=1
  fi

  echo ""

  # Step 5: Generate report
  echo -e "${YELLOW}Step 5: Generating test report...${NC}"

  if [ -z "$UI_MODE" ]; then
    echo "Opening HTML report..."
    npx playwright show-report &
    sleep 2
  fi

  # Print summary
  echo ""
  echo -e "${BLUE}===========================================${NC}"
  echo -e "${BLUE}Test Summary${NC}"
  echo -e "${BLUE}===========================================${NC}"
  echo "Backend API:      http://localhost:3001"
  echo "GM Dashboard:     http://localhost:3002"
  echo "Team Frontend:    http://localhost:5173"
  echo ""
  echo "Test Results:     test-results/"
  echo "Screenshots:      e2e-results/"
  echo "HTML Report:      playwright-report/index.html"
  echo "Backend Logs:     logs/backend-e2e.log"
  echo "GM Dashboard Logs: logs/gm-dashboard-e2e.log"
  echo "Team Frontend Logs: logs/team-frontend-e2e.log"
  echo -e "${BLUE}===========================================${NC}"
  echo ""

  if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ Testing completed successfully${NC}"
  else
    echo -e "${RED}✗ Testing completed with failures${NC}"
    echo "Check the HTML report for details: npx playwright show-report"
  fi

  exit $TEST_RESULT
}

# Run main function
main
