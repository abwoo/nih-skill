#!/bin/bash

# ===========================================
# BME Research Accelerator - Development Setup Script
# Run: chmod +x setup.sh && ./setup.sh
# ===========================================

set -e

echo "🚀 BME Research Accelerator - Setup Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Node.js version
echo -e "\n${YELLOW}1. Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js >= 18"
    exit 1
fi

# 2. Check pnpm
echo -e "\n${YELLOW}2. Checking pnpm...${NC}"
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "✅ pnpm found: $PNPM_VERSION"
else
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# 3. Install dependencies
echo -e "\n${YELLOW}3. Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed (skipping)"
fi

# 4. Check .env.local
echo -e "\n${YELLOW}4. Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found, creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "📝 IMPORTANT: Edit .env.local and add your API key!"
    echo "   nano .env.local"
else
    echo "✅ .env.local exists"
fi

# 5. Verify build
echo -e "\n${YELLOW}5. Verifying build...${NC}"
rm -rf .next
pnpm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build successful!${NC}"
else
    echo -e "\n❌ Build failed. Please check the errors above."
    exit 1
fi

# 6. Done!
echo -e "\n${GREEN}=========================================="
echo "🎉 Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local with your API key"
echo "  2. Start development server: pnpm dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  pnpm dev      - Start development server"
echo "  pnpm build    - Build for production"
echo "  pnpm start    - Start production server"
echo "  pnpm lint     - Run ESLint"
echo ""
