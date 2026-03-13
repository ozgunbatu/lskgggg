#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# LkSGCompass — Local Development Setup
# Run once: bash dev-setup.sh
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo ""
echo "  🌱 LkSGCompass — Dev Setup"
echo ""

# 1. Create .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  # Generate a real JWT secret
  JWT=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  sed -i.bak "s/CHANGE_ME_USE_OPENSSL_RAND_HEX_32/$JWT/" .env && rm -f .env.bak
  echo "  ✅ .env created with generated JWT_SECRET"
else
  echo "  ✓  .env already exists"
fi

# 2. Install backend dependencies
echo "  📦 Installing backend dependencies..."
cd backend && npm install --silent && cd ..

# 3. Install frontend dependencies
echo "  📦 Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

# 4. Start services
echo ""
echo "  🚀 Starting services with Docker Compose..."
echo "     (PostgreSQL on :5432, Backend on :4000, Frontend on :3000)"
echo ""
docker compose up --build -d

echo ""
echo "  ✅ Done! Open http://localhost:3000"
echo ""
echo "  Demo account:"
echo "    Email:    demo@lksgcompass.com"
echo "    Password: demo12345"
echo ""
echo "  Seed demo data:  docker compose exec backend npx tsx scripts/seed.ts"
echo "  Stop:            docker compose down"
echo "  Logs:            docker compose logs -f"
echo ""
