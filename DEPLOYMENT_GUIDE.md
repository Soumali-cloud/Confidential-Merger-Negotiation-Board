# Confidential Merger Negotiation Board - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Confidential Merger Negotiation Board ZK smart contract on the Midnight Network.

## Prerequisites Checklist

- [ ] Node.js v23+ installed
- [ ] npm v11+ installed  
- [ ] Git and Git LFS installed
- [ ] 2-5 minutes to complete deployment

## Step 1: Verify Installation

```bash
# Check Node.js version (should be v23+)
node --version

# Check npm version (should be v11+)
npm --version

# Check Git LFS
git lfs version
```

## Step 2: Navigate to Project

```bash
cd confidential-contract
```

## Step 3: Build the Contract

```bash
# Install dependencies (if not done)
npm install

# Build TypeScript to JavaScript
npm run build
```

Expected output: No errors, completion of TypeScript compilation.

## Step 4: Deploy to Network

### Option A: Local Undeployed Network (Development)

```bash
npm run deploy:confidential
```

When prompted:
1. **Hex Seed**: Press Enter to generate new seed (or paste existing seed)
2. **Wait**: Script will sync wallet and wait for network
3. **Fund Wallet**: If using local network, access faucet
4. **Confirmation**: Success message with contract address

### Option B: Preview/Test Network

```bash
# Set environment (one-time setup)
export NETWORK_ID=preview
export INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql
export INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v3/graphql/ws
export NODE_URL=https://node.preview.midnight.network
export PROOF_SERVER_URL=https://proof-server.preview.midnight.network

# Deploy
npm run deploy:confidential
```

When deployment requests funds:
1. Open: https://faucet.preview.midnight.network/
2. Paste the unshielded address shown in terminal
3. Send tNight tokens
4. Wait for confirmation (~30-60 seconds)
5. Deployment will continue automatically

## Step 5: Save Deployment Information

After successful deployment, you'll see:

```
╔══════════════════════════════════════════════════════════╗
║  Confidential Merger Negotiation Board                   ║
║           Network: [network-name]                        ║
╚══════════════════════════════════════════════════════════╝
  Project: Confidential Merger Negotiation Board
  Address: zm1q...
  Saved:   deployment-confidential.json
```

**Important**: Save these values:
- Contract Address: `zm1q...`
- Wallet Seed: Save securely (can restore wallet)
- Network: For frontend configuration

## Step 6: Update Frontend (if applicable)

Update your frontend .env file:

```env
VITE_CONTRACT_ADDRESS=zm1q...  # From deployment
VITE_NETWORK_ID=preview         # Network you deployed to
```

## Deployment Status

### ✓ Successful Deployment

- Contract address generated
- `deployment-confidential.json` created
- Ready for contract interactions
- Can integrate with frontend/CLI

### ✗ Failed Deployment

Common issues and solutions:

| Error | Solution |
|-------|----------|
| "Cannot connect to indexer" | Check internet, verify INDEXER_URL |
| "Timeout waiting for sync" | Ensure node is running, check network |
| "Insufficient funds" | Use faucet to fund wallet |
| "Proof generation failed" | Check proof server URL, restart process |
| "Port 9944 already in use" | Kill existing process or use different port |

## Verification

After deployment, verify the contract:

```bash
# Check deployment file was created
ls -la deployment-confidential.json

# View deployment details
cat deployment-confidential.json
```

## Using the Deployed Contract

Once deployed, you can:

1. **Integrate with Counter-CLI**:
   ```bash
   cd counter-cli
   VITE_CONTRACT_ADDRESS=zm1q... npm run dev:preview
   ```

2. **Integrate with Frontend**:
   ```bash
   cd frontend-vite-react
   npm run dev
   # Frontend will use VITE_CONTRACT_ADDRESS from .env
   ```

3. **Call Circuits**:
   Use the contract address to interact with ZK circuits through SDK

## Network Details

### Undeployed Network
- Endpoint: `http://127.0.0.1:9944`
- Indexer: `http://127.0.0.1:8088`
- Purpose: Local development
- Notes: Requires running local network containers

### Preview Network
- Endpoint: `https://node.preview.midnight.network`
- Indexer: `https://indexer.preview.midnight.network`
- Purpose: Testing before production
- Faucet: https://faucet.preview.midnight.network/
- Notes: Public testnet, persistent deployments

### Preprod Network  
- Endpoint: `https://node.preprod.midnight.network`
- Indexer: `https://indexer.preprod.midnight.network`
- Purpose: Pre-production validation
- Faucet: https://faucet.preprod.midnight.network/
- Notes: More stable than preview

## Troubleshooting Deployment

### Issue: "Error: EADDRINUSE :::9944"
The port is already in use.
```bash
# Kill the process using port 9944
# Windows PowerShell:
Get-Process | Where-Object { $_.Path -like "*node*" } | Stop-Process -Force

# Then retry deployment
npm run deploy:confidential
```

### Issue: "Wallet sync timeout"
The wallet cannot sync with the network.
```bash
# Increase timeout (edit deploy-confidential.ts if needed)
# Or check:
# 1. Is the indexer running?
# 2. Is your internet connection stable?
# 3. Is the network responding?

# Try again:
npm run deploy:confidential
```

### Issue: "Proof generation failed"
ZK proof creation encountered an error.
```bash
# Verification:
# 1. Check proof server is running: curl $PROOF_SERVER_URL/health
# 2. Ensure sufficient disk space for proof files
# 3. Try deployment again with verbose logging:
DEBUG_LEVEL=debug npm run deploy:confidential
```

## Post-Deployment

1. **Document the Address**: Store the contract address safely
2. **Test Integration**: Verify contract through CLI or API
3. **Monitor Deployment**: Keep console output for reference
4. **Plan Next Steps**: Integration with UI, user testing, etc.

## Undoing a Deployment

To retry or redeploy with a different configuration:

1. Delete `deployment-confidential.json` (if starting fresh)
2. Generate new seed or use existing
3. Run deployment again:
   ```bash
   npm run deploy:confidential
   ```

Each deployment creates a new contract instance on the network.

## Support

If you encounter issues:

1. Check the [CONFIDENTIAL_README.md](./CONFIDENTIAL_README.md)
2. Review environment variable configuration
3. Verify network connectivity
4. Check Midnight documentation: https://docs.midnight.network
5. Contact Midnight community on Discord

---

**Happy deploying!** 🚀
