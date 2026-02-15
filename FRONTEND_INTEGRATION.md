# 🔌 Frontend & Smart Contract Integration Guide

Complete guide for integrating the Confidential Merger Negotiation Board frontend with the Midnight Network smart contract backend.

## 📋 Overview

The frontend is currently in **demo mode** with simulated data. This guide shows how to connect it to the actual smart contract for real zero-knowledge proof submissions.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Browser (Frontend)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  HTML UI (index.html)                            │   │
│  │  - Company details form                          │   │
│  │  - Financial metrics input                       │   │
│  │  - Status dashboard                             │   │
│  └──────────────────────────────────────────────────┘   │
│                       ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  JavaScript Logic (script.js)                    │   │
│  │  - Form validation                               │   │
│  │  - State management                              │   │
│  │  - User interactions                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                       ↓ (INTEGRATION POINT)
┌─────────────────────────────────────────────────────────┐
│         Midnight Network Backend                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Smart Contract (Confidential.compact)           │   │
│  │  - submit_qualification: Private → Public        │   │
│  │  - get_qualified_count: Pure query               │   │
│  └──────────────────────────────────────────────────┘   │
│                       ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Blockchain (Midnight Network Ledger)           │   │
│  │  - Stores qualified companies                    │   │
│  │  - Verfies ZK proofs                             │   │
│  │  - Maintains audit trail                         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Integration Steps

### Step 1: Set Up Backend Server

First, ensure your contract deployment server is running:

```bash
# Terminal 1 - Backend Server
npm run deploy:confidential

# This will output:
# Contract deployed at: <contract-address>
# Network: <network-url>
```

**Save these values:**
- Contract Address: `[ADDRESS]`
- Network URL: `[NETWORK_URL]`
- Prover Endpoint: `[PROVER_URL]`

### Step 2: Update Frontend Configuration

Edit `frontend/script.js` and update the network configuration:

```javascript
// Location: near the top of script.js

const NETWORKS = {
  local: {
    name: 'Local Network',
    zswapEndpoint: 'http://localhost:8000',
    indexer: 'http://localhost:8001',
    prover: 'http://localhost:8002',
    contractAddress: '[CONTRACT_Address_FROM_DEPLOYMENT]'
  },
  preview: {
    name: 'Preview Network',
    zswapEndpoint: 'https://preview-zswap.midnight.network',
    indexer: 'https://preview-indexer.midnight.network',
    prover: 'https://preview-prover.midnight.network',
    contractAddress: '[CONTRACT_ADDRESS_FROM_PREVIEW_DEPLOYMENT]'
  },
  custom: {
    name: 'Custom Network',
    zswapEndpoint: '', // Will be filled by user
    indexer: '',
    prover: '',
    contractAddress: '' // Will be filled by user
  }
};
```

### Step 3: Import Midnight SDK

Add the required imports to `frontend/script.js`:

```javascript
// At the top of the file, after the NETWORKS definition:

import {
  MidnightProvider,
  WalletService,
  ConnectWalletInput,
  ContractInterface,
  ZKPublicData,
  ZKPrivateState,
} from '@midnight-ntwrk/midnight-js-contracts';

import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { publicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
```

### Step 4: Replace Demo Function with Contract Call

Find the `processQualification()` function in `script.js`:

**Current (Demo) Version:**
```javascript
async function processQualification(formData) {
  // Simulated ZK proof (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Demo logic...
  const qualifies = validateCriteria(formData);
  // ...etc
}
```

**Replace with (Production) Version:**
```javascript
async function processQualification(formData) {
  const network = NETWORKS[state.currentNetwork];
  
  try {
    // 1. Initialize providers
    const providers = {
      zkConfig: new NodeZKConfigProvider(),
      proof: httpClientProofProvider(network.prover),
      publicData: publicDataProvider(network.indexer),
      privateState: levelPrivateStateProvider()
    };
    
    // 2. Connect wallet
    const wallet = await WalletService.connectWallet({
      onProviderDetected: async (provider) => {
        return provider;
      }
    });
    
    // 3. Create provider with contract
    const provider = new MidnightProvider(
      network.zswapEndpoint,
      providers,
      wallet
    );
    
    // 4. Get contract instance
    const contract = await provider.getContract(network.contractAddress);
    
    // 5. Prepare witness data (private)
    const privateWitness = {
      companyName: formData.companyName,
      privateRevenue: BigInt(formData.privateRevenue),
      privateAssets: BigInt(formData.privateAssets),
      privateLiabilities: BigInt(formData.privateLiabilities)
    };
    
    // 6. Prepare public thresholds
    const publicInput = {
      minRevenueThreshold: BigInt(formData.minRevenueThreshold),
      minAssetThreshold: BigInt(formData.minAssetThreshold),
      dealName: formData.dealName
    };
    
    // 7. Call contract function (generates ZK proof)
    const txResult = await contract.submit_qualification(
      privateWitness,
      publicInput
    );
    
    // 8. Wait for transaction confirmation
    const receipt = await txResult.wait();
    
    // 9. Query updated qualified count
    const countResult = await contract.get_qualified_count();
    
    // 10. Update UI
    updateUIWithResult({
      success: true,
      transactionHash: receipt.hash,
      qualifiedCount: Number(countResult),
      timestamp: new Date()
    });
    
    return true;
    
  } catch (error) {
    console.error('Contract call failed:', error);
    updateUIWithResult({
      success: false,
      error: error.message,
      timestamp: new Date()
    });
    return false;
  }
}
```

### Step 5: Add Wallet Connection

Add wallet initialization before form submission:

```javascript
async function connectWallet() {
  try {
    const walletConnect = new WalletService();
    const wallet = await walletConnect.connect();
    
    if (!wallet) {
      throw new Error('Wallet connection failed');
    }
    
    // Update UI to show connected wallet
    const walletAddress = await wallet.getAddress();
    updateWalletDisplay(walletAddress);
    
    return wallet;
    
  } catch (error) {
    console.error('Wallet connection error:', error);
    showErrorModal('Failed to connect wallet: ' + error.message);
  }
}

// Call this when user clicks "Connect Wallet" button
document.getElementById('connect-wallet-btn')?.addEventListener('click', connectWallet);
```

### Step 6: Add Contract Type Definitions

Copy the generated types from your contract deployment:

```javascript
// In script.js, after imports:

import type { ContractInstance } from '../src/managed/confidential/contract';

// This ensures TypeScript knows the contract interface
interface QualificationSubmission {
  companyName: string;
  timestamp: number;
  transactionHash: string;
  qualified: boolean;
}
```

## 📊 Data Flow

### Submission Flow

```
1. User fills form
   ↓
2. Frontend validates input locally
   ↓
3. Click "Submit" button
   ↓
4. JavaScript:
   - Prepare private witness (company financials)
   - Prepare public input (thresholds)
   ↓
5. Contract Call:
   - Generate ZK proof locally
   - Submit proof to contract
   ↓
6. Blockchain:
   - Verify ZK proof
   - Store submission record
   - Update qualified count
   ↓
7. Receipt:
   - Transaction hash
   - Updated qualified count
   ↓
8. UI Updates:
   - Show success/failure
   - Update dashboard
   - Persist to localStorage
```

### Query Flow

```
1. Page loads
   ↓
2. JavaScript:
   - Get current network
   - Create contract connection
   ↓
3. Contract Query:
   - Call get_qualified_count()
   ↓
4. Blockchain:
   - Return current count
   ↓
5. UI Updates:
   - Display qualified count
   - Update status dashboard
```

## 🔐 Security Considerations

### Private Data Handling

```javascript
// ✅ GOOD - Private data stays in witness
const privateWitness = {
  privateRevenue: formData.privateRevenue,  // NOT revealed
  privateAssets: formData.privateAssets,    // NOT revealed
  privateLiabilities: formData.privateLiabilities  // NOT revealed
};

// ❌ BAD - Don't send private data to blockchain
const publicInput = {
  revenue: formData.privateRevenue,  // WRONG! public now
};
```

### Local Computation

```javascript
// ✅ GOOD - Computations happen locally
// ZK proof is generated in the browser
const proof = await contract.generateProof(privateWitness, publicInput);

// ❌ BAD - Don't send raw data to server
// fetch('/api/check-qualification', { body: formData })
```

### Validation Timing

```javascript
// ✅ GOOD - Validate on client and contract
// Client-side validation for UX
if (!validateForm(formData)) return;

// Contract-side validation for security
// assert revenue >= threshold
// assert assets >= threshold
// assert assets > liabilities

// ❌ BAD - Only client-side validation
// if (validateForm(formData)) {
//   trust it on contract
// }
```

## 🧪 Testing Integration

### Test 1: Network Connection

```javascript
// In browser console:
async function testNetwork() {
  const network = NETWORKS['local'];
  try {
    const response = await fetch(network.zswapEndpoint + '/health');
    console.log('Network healthy:', await response.json());
  } catch (error) {
    console.error('Network unreachable:', error);
  }
}

testNetwork();
```

### Test 2: Contract Connection

```javascript
// In browser console:
async function testContractConnection() {
  const network = NETWORKS['local'];
  try {
    // Replace with your actual contract import
    const contract = await provider.getContract(network.contractAddress);
    const count = await contract.get_qualified_count();
    console.log('Current qualified count:', Number(count));
  } catch (error) {
    console.error('Contract unreachable:', error);
  }
}

testContractConnection();
```

### Test 3: Full Submission

```javascript
// In browser console:
async function testSubmission() {
  const testData = {
    companyName: 'Test Corp',
    privateRevenue: 1000000,
    privateAssets: 5000000,
    privateLiabilities: 1000000,
    dealName: 'Test Deal',
    minRevenueThreshold: 500000,
    minAssetThreshold: 2000000
  };
  
  const result = await processQualification(testData);
  console.log('Submission result:', result);
}

testSubmission();
```

## 📦 Required Packages

Ensure all Midnight Network packages are installed:

```bash
npm install \
  @midnight-ntwrk/midnight-js-contracts \
  @midnight-ntwrk/midnight-js-http-client-proof-provider \
  @midnight-ntwrk/midnight-js-indexer-public-data-provider \
  @midnight-ntwrk/midnight-js-level-private-state-provider \
  @midnight-ntwrk/midnight-js-node-zk-config-provider \
  @midnight-ntwrk/wallet-sdk-facade
```

These are already in `package.json`, so just ensure `npm install` is run.

## 🚀 Deployment Checklist

- [ ] Contract deployed to network
- [ ] Contract address documented
- [ ] Network endpoints accessible
- [ ] Wallet service configured
- [ ] Frontend environment variables updated
- [ ] Network configuration populated in script.js
- [ ] Contract imports validated
- [ ] Type definitions generated
- [ ] Test submission executed
- [ ] Success/error handling works
- [ ] UI updates correctly
- [ ] localStorage persistence enabled
- [ ] Browser console shows no errors
- [ ] All three networks tested (local, preview, custom)

## 🔗 Important Files

| File | Purpose | Edit Location |
|------|---------|-------------|
| `frontend/script.js` | Main integration logic | Lines 1-100 (config section) |
| `src/Confidential.compact` | Smart contract definition | Backend (don't edit from frontend) |
| `src/managed/confidential/contract/index.d.ts` | Contract types | Auto-generated from compile |
| `src/deploy-confidential.ts` | Contract deployment | Backend |
| `package.json` | Dependencies & scripts | Root |

## 🐛 Troubleshooting

### Issue: "Contract not found at address"

```javascript
// Check deployed address
console.log('Looking for contract at:', NETWORKS[state.currentNetwork].contractAddress);

// Verify contract was actually deployed
npm run verify:network
```

### Issue: "Wallet not detected"

```javascript
// Ensure wallet extension is installed
if (typeof window.midnight === 'undefined') {
  console.error('Midnight wallet not detected. Install extension first.');
}
```

### Issue: "Proof generation failed"

```javascript
// Check prover service is running
curl http://localhost:8002/health

// Check private state is properly formatted
console.log('Private witness:', privateWitness);
console.log('Public input:', publicInput);
```

### Issue: "Form validation passes but contract rejects"

```javascript
// Contract has additional validation. Check:
// 1. Revenue >= minRevenueThreshold
// 2. Assets >= minAssetThreshold  
// 3. Assets > Liabilities

// These are checked in the smart circuit itself
```

## 📚 Additional Resources

- [Midnight Network Documentation](https://docs.midnight.network)
- [Smart Contract Guide](../../DEPLOYMENT_GUIDE.md)
- [Contract Source](../../src/Confidential.compact)
- [Type Definitions](../../src/managed/confidential/contract/index.d.ts)
- [Deployment Info](../../DEPLOYMENT_SUMMARY.md)

## ✨ Next Steps

1. **Deploy contract** - Run `npm run deploy:confidential`
2. **Note addresses** - Save contract address and network URLs
3. **Update config** - Edit NETWORKS in script.js
4. **Test locally** - Run `npm run frontend` and test submission
5. **Verify chain** - Check transaction on blockchain explorer
6. **Deploy to production** - Host frontend on your server

## 🎯 Summary

The integration process:

1. ✅ Frontend ready (HTML/CSS/JS complete)
2. ✅ Backend ready (contract compiled)
3. 👉 **Connect them** (update script.js with contract details)
4. 🧪 Test (submit qualification, verify blockchain update)
5. 🚀 Deploy (host frontend, monitor contract)

---

**Questions?** Check the console for specific error messages - they often point to the exact issue!

Built for the Midnight Network 🌙
