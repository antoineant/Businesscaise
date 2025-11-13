#!/bin/bash

################################################################################
# Post-Pull Setup Script for BusinessCaise
#
# Run this after pulling changes from the repository to ensure all
# dependencies are installed and services are configured correctly.
#
# Usage: ./setup-after-pull.sh
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}BusinessCaise - Post-Pull Setup${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Step 1: Root dependencies
echo -e "${YELLOW}Step 1: Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Step 2: Backend dependencies
echo -e "${YELLOW}Step 2: Installing backend dependencies...${NC}"
cd backend
npm install
cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 3: Backend .env file
echo -e "${YELLOW}Step 3: Checking backend .env file...${NC}"
if [ ! -f "backend/.env" ]; then
  echo -e "${YELLOW}Creating backend/.env from example...${NC}"
  cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=businesscase
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=businesscase_dev_secret_key_please_change_in_production_2024
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3002
EOF
  echo -e "${GREEN}✓ Created backend/.env${NC}"
else
  echo -e "${GREEN}✓ backend/.env exists${NC}"
fi
echo ""

# Step 4: GM Dashboard dependencies
echo -e "${YELLOW}Step 4: Installing GM Dashboard dependencies...${NC}"
if [ -d "gm-dashboard" ]; then
  cd gm-dashboard
  npm install
  cd ..
  echo -e "${GREEN}✓ GM Dashboard dependencies installed${NC}"
else
  echo -e "${YELLOW}⚠ GM Dashboard directory not found (skipping)${NC}"
fi
echo ""

# Step 5: GM Dashboard .env file
echo -e "${YELLOW}Step 5: Checking GM Dashboard .env file...${NC}"
if [ -d "gm-dashboard" ]; then
  if [ ! -f "gm-dashboard/.env" ]; then
    echo -e "${YELLOW}Creating gm-dashboard/.env...${NC}"
    cat > gm-dashboard/.env << 'EOF'
VITE_API_URL=http://localhost:3001/api
EOF
    echo -e "${GREEN}✓ Created gm-dashboard/.env${NC}"
  else
    echo -e "${GREEN}✓ gm-dashboard/.env exists${NC}"
  fi
fi
echo ""

# Step 6: Database check
echo -e "${YELLOW}Step 6: Checking database...${NC}"
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
  echo -e "${GREEN}✓ Database created${NC}"
else
  echo -e "${GREEN}✓ Database 'businesscase' exists${NC}"
fi
echo ""

# Step 7: Test backend compilation
echo -e "${YELLOW}Step 7: Testing backend TypeScript compilation...${NC}"
cd backend
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend compiles successfully${NC}"
else
  echo -e "${RED}✗ Backend compilation failed${NC}"
  echo "Run 'cd backend && npm run build' to see errors"
  cd ..
  exit 1
fi
cd ..
echo ""

# Step 8: Create logs directory
echo -e "${YELLOW}Step 8: Creating logs directory...${NC}"
mkdir -p logs
echo -e "${GREEN}✓ Logs directory ready${NC}"
echo ""

# Step 9: Playwright setup (if needed)
echo -e "${YELLOW}Step 9: Checking Playwright installation...${NC}"
if [ ! -d "node_modules/@playwright" ]; then
  echo -e "${YELLOW}Installing Playwright...${NC}"
  npm install --save-dev @playwright/test
  npx playwright install chromium
  echo -e "${GREEN}✓ Playwright installed${NC}"
else
  echo -e "${GREEN}✓ Playwright already installed${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}Setup Complete!${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""
echo "You can now run:"
echo "  • Backend:        cd backend && npm run dev"
echo "  • GM Dashboard:   cd gm-dashboard && npm run dev"
echo "  • Team Frontend:  npm run dev"
echo "  • E2E Tests:      ./run-e2e-tests.sh"
echo ""
echo -e "${GREEN}✓ All setup steps completed successfully${NC}"
