#!/bin/bash
set -euo pipefail

# PALANTIR Deployment Script
# Deploys to Contabo VPS at palantir.hanzla.com
# Usage: ./deploy/deploy.sh

# Load credentials from .env if present
if [ -f .env ]; then
  source .env
fi

VPS_HOST="${VPS_HOST:?VPS_HOST not set}"
VPS_USER="${VPS_USER:?VPS_USER not set}"
APP_DIR="/home/palantir.hanzla.com"
REMOTE_HTML="${APP_DIR}/public_html"
REMOTE_APP="${APP_DIR}/app"
REMOTE_LOGS="${APP_DIR}/logs"

echo "╔══════════════════════════════════════════╗"
echo "║   PALANTIR Deployment                    ║"
echo "║   Target: ${VPS_HOST}                    ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Step 1: Build frontend
echo "[1/6] Building frontend..."
bun run build
echo "  ✓ Frontend built"

# Step 2: Create remote directories
echo "[2/6] Setting up remote directories..."
ssh "${VPS_USER}@${VPS_HOST}" "mkdir -p ${REMOTE_HTML} ${REMOTE_APP}/server ${REMOTE_LOGS}"
echo "  ✓ Directories created"

# Step 3: Upload frontend build
echo "[3/6] Uploading frontend..."
rsync -az --delete dist/ "${VPS_USER}@${VPS_HOST}:${REMOTE_HTML}/"
echo "  ✓ Frontend uploaded"

# Step 4: Upload backend
echo "[4/6] Uploading backend..."
rsync -az server/ "${VPS_USER}@${VPS_HOST}:${REMOTE_APP}/server/"
rsync -az package.json bun.lock tsconfig.json "${VPS_USER}@${VPS_HOST}:${REMOTE_APP}/"
rsync -az deploy/pm2.config.js "${VPS_USER}@${VPS_HOST}:${REMOTE_APP}/"
# Upload .env if exists
if [ -f .env ]; then
  rsync -az .env "${VPS_USER}@${VPS_HOST}:${REMOTE_APP}/.env"
fi
echo "  ✓ Backend uploaded"

# Step 5: Install deps + restart on VPS
echo "[5/6] Installing dependencies on VPS..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${REMOTE_APP} && bun install --production"
echo "  ✓ Dependencies installed"

# Step 6: Restart PM2
echo "[6/6] Restarting backend service..."
ssh "${VPS_USER}@${VPS_HOST}" "cd ${REMOTE_APP} && pm2 restart pm2.config.js || pm2 start pm2.config.js"
echo "  ✓ Backend restarted"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Deployment Complete                    ║"
echo "║   https://palantir.hanzla.com            ║"
echo "╚══════════════════════════════════════════╝"
