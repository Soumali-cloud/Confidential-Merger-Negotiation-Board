# Quick Start Guide - Confidential Merger Negotiation Board

## 🚀 30-Second Deployment

```bash
# 1. Install dependencies
npm install

# 2. Build the contract
npm run build

# 3. Deploy to network
npm run deploy:confidential

# When prompted:
# - Press Enter to generate new seed
# - Wait for wallet sync and network confirmation
# - Contract will deploy automatically
```

## ✓ Verify Deployment

```bash
npm run verify
```

Shows deployment details and confirms everything is working.

## 📍 Key Files

| File | Purpose |
|------|---------|
| `src/Confidential.compact` | Smart contract definition |
| `src/deploy-confidential.ts` | Deployment script |
| `deployment-confidential.json` | Deployment metadata (created after deploy) |
| `CONFIDENTIAL_README.md` | Full documentation |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment steps |

## 🔧 Environment Setup

### For Local Network (Development)

```bash
# Uses built-in 127.0.0.1:9944 and 127.0.0.1:8088
npm run deploy:confidential
```

### For Preview Network (Testing)

```bash
# Set once:
export NETWORK_ID=preview
export INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql
export INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v3/graphql/ws
export NODE_URL=https://node.preview.midnight.network
export PROOF_SERVER_URL=https://proof-server.preview.midnight.network

# Then deploy:
npm run deploy:confidential
```

## 📊 Contract Features

### What This Contract Does

1. **Private Financial Verification** 🔒
   - Prove revenue meets minimum threshold
   - Prove assets meet minimum threshold
   - Prove solvency (assets > liabilities)
   - No actual numbers are revealed!

2. **Public Audit Trail** 📋
   - Track number of qualified companies
   - Verify submission history
   - Public transparency

3. **Zero-Knowledge Proofs** ✨
   - All proofs generated on user device
   - Only proof submitted to network, not data
   - Complete privacy guaranteed

## 🎯 Typical Workflow

```
1. Company A submits ZK proof of financial qualification
   ↓
2. Proof verified on-chain (private data stays private)
   ↓
3. Negotiation count incremented publicly
   ↓
4. Company B submits proof
   ↓
5. Both identified as "qualified" - ready for deal details
   ↓
6. Deal terms negotiated with confidence
```

## 💼 Integration Example

### After Deployment

1. Get contract address from `deployment-confidential.json`:
   ```json
   {
     "contractAddress": "zm1q...",
     "network": "preview",
     ...
   }
   ```

2. Use in your frontend:
   ```typescript
   const CONTRACT_ADDRESS = "zm1q...";
   
   // Submit qualification
   const proof = await generateQualificationProof({
     private_revenue: userRevenue,
     private_assets: userAssets,
     private_liabilities: userLiabilities,
     min_revenue_threshold: 500_000_000_000_000n,
     min_asset_threshold: 1_000_000_000_000_000n,
   });
   
   // Submit proof to contract
   await submitProof(CONTRACT_ADDRESS, proof);
   ```

## 🔍 Checking Your Deployment

### View Contract Address
```bash
cat deployment-confidential.json | grep contractAddress
```

### Check Seed (Do NOT share!)
```bash
cat deployment-confidential.json | grep seed
```

### Verify Network
```bash
cat deployment-confidential.json | grep network
```

## ⚠️ Important Notes

- **Save Your Seed**: Can restore wallet from seed in deployment file
- **Network Dependent**: Contract works on configured network
- **No Undo**: Each deployment creates new contract instance
- **Gas Required**: Transaction fees apply on test/prod networks

## 🆘 Quick Troubleshooting

### "Cannot connect to indexer"
```bash
# Check network is running, try again
npm run deploy:confidential
```

### "Timeout waiting for wallet"
```bash
# Network might be slow, wait and retry
npm run deploy:confidential
```

### "Insufficient funds"
```bash
# Use faucet to get test tokens
# Preview: https://faucet.preview.midnight.network/
# Paste your unshielded address shown in terminal
```

### "Build failed"
```bash
# Rebuild
npm run build

# Then deploy
npm run deploy:confidential
```

## 📚 Full Documentation

- **Contract Details**: See `CONFIDENTIAL_README.md`
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Midnight Docs**: https://docs.midnight.network

## ✨ Next Steps

1. ✓ Deploy contract (`npm run deploy:confidential`)
2. ✓ Verify deployment (`npm run verify`)
3. Integrate with frontend (`frontend-vite-react`)
4. Test ZK proof generation
5. Deploy to production network

---

**Ready to deploy?** → `npm run deploy:confidential` 🚀
