#!/bin/bash
# Confidential Merger Negotiation Board - Setup Script
# This script prepares the project for deployment

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Confidential Merger Negotiation Board - Setup             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo "Checking Node.js..."
NODE_VERSION=$(node --version)
echo "  ✓ Node.js: $NODE_VERSION"

# Check npm
echo "Checking npm..."
NPM_VERSION=$(npm --version)
echo "  ✓ npm: $NPM_VERSION"

# Check Git LFS
echo "Checking Git LFS..."
git lfs version > /dev/null 2>&1 || {
  echo "  ⚠️  Git LFS not installed. Installing..."
  # Installation varies by OS
  if [[ "$OSTYPE" == "darwin"* ]]; then
    brew install git-lfs
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo apt-get install git-lfs
  fi
  git lfs install
}
echo "  ✓ Git LFS ready"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install
echo "  ✓ Dependencies installed"

# Build project
echo ""
echo "Building project..."
npm run build
echo "  ✓ Project built successfully"

# Compile contract
echo ""
echo "Compiling Confidential contract..."
npm run compile:confidential
echo "  ✓ Confidential contract compiled"

# Success
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✓ Setup Complete!                                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Configure network environment (optional):"
echo "     export NETWORK_ID=preview"
echo "     export INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql"
echo "     export NODE_URL=https://node.preview.midnight.network"
echo "     export PROOF_SERVER_URL=https://proof-server.preview.midnight.network"
echo ""
echo "  2. Deploy the contract:"
echo "     npm run deploy:confidential"
echo ""
echo "See QUICK_START.md or DEPLOYMENT_GUIDE.md for details."
echo ""
