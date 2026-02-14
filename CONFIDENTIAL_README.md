# Confidential Merger Negotiation Board

## Project Overview

**Confidential Merger Negotiation Board** is a zero-knowledge (ZK) enabled smart contract system built on Midnight Network for M&A (Mergers & Acquisitions) negotiations. It allows companies in M&A negotiations to share verified financial metrics via zero-knowledge proofs, enabling deal qualification without full financial disclosure until a deal is signed.

### Key Features

- **Privacy-Preserving**: Companies prove financial qualification using ZK proofs without revealing actual numbers
- **ZK Financial Verification**: Verify revenue, assets, and solvency without disclosure
- **Public Audit Trail**: Track qualified negotiations publicly while keeping financial details private
- **Solvent Verification**: Prove that assets > liabilities
- **Threshold-Based Qualification**: Companies can set minimum thresholds for deal qualification

## Architecture

### Smart Contract (Confidential.compact)

The contract implements the following:

```compact
// Private witness: company's confidential financial data
witness private_revenue: field;
witness private_assets: field;
witness private_liabilities: field;

// Public input: minimum thresholds for deal qualification
public_input min_revenue_threshold: field;
public_input min_asset_threshold: field;

// Public ledger: tracks active negotiations
export ledger negotiations: Counter;

// ZK circuits:
- submit_qualification(): Prove financial qualification
- get_qualified_count(): Retrieve number of qualified parties
```

### Primary Circuits

#### submit_qualification()
Proves that:
1. `private_revenue >= min_revenue_threshold`
2. `private_assets >= min_asset_threshold`
3. `private_assets > private_liabilities` (solvency check)

Records a qualified submission in the public ledger without revealing actual financial data.

#### get_qualified_count()
Returns the current count of companies that have submitted successful qualifications.

## Project Structure

```
confidential-contract/
├── src/
│   ├── Confidential.compact              # Main contract definition
│   ├── deploy.ts                         # Alternative deployment script
│   ├── deploy-confidential.ts            # Confidential contract deployment
│   ├── config.ts                         # Configuration
│   ├── index.ts                          # Exports
│   ├── logger.ts                         # Logging utilities
│   └── managed/
│       ├── confidential/                 # Compiled ZK artifacts
│       │   ├── contract/                 # Contract TypeScript bindings
│       │   ├── keys/                     # ZK proof keys
│       │   ├── zkir/                     # ZK intermediate representation
│       │   └── compiler/                 # Compiler metadata
│       ├── counter/                      # Counter contract (template)
│       └── voting/                       # Voting contract (template)
├── dist/                                 # Compiled JavaScript files
├── package.json                          # Project dependencies
├── tsconfig.json                         # TypeScript configuration
├── deployment-confidential.json          # Deployment metadata (generated)
└── CONFIDENTIAL_README.md               # This file
```

## Prerequisites

### System Requirements

- **Node.js**: v23+ (with npm v11+)
- **Git LFS**: For large binary files
- **Docker**: For local network setup
- **Compact Tools**: For contract compilation (optional during deployment)

### Installation Steps

1. **Install Git LFS**
   ```bash
   # Windows (via Git Bash)
   git lfs install
   ```

2. **Install Midnight Compact Compiler** (optional for deployment, required for recompilation)
   For Windows, download the latest release from:
   https://github.com/midnightntwrk/compact/releases

3. **Install Project Dependencies**
   ```bash
   cd confidential-contract
   npm install
   ```

## Deployment

### Quick Deployment (Undeployed/Local Network)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the contract**
   ```bash
   npm run deploy:confidential
   ```

   When prompted:
   - Press Enter to generate a new wallet seed (or paste an existing hex seed)
   - Wait for wallet synchronization
   - If needed, fund your wallet at: http://127.0.0.1:8000 (faucet)
   - The script will generate ZK proofs and deploy the contract

3. **Deployment Output**
   - Contract address will be saved to: `deployment-confidential.json`
   - Wallet seed will be displayed for future use
   - Keep this seed safe!

### Deployment to Test Network (Preview/Preprod)

1. **Set Environment Variables**
   ```bash
   # Unix/Linux/Mac
   export NETWORK_ID=preview
   export INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql
   export INDEXER_WS_URL=wss://indexer.preview.midnight.network/api/v3/graphql/ws
   export NODE_URL=https://node.preview.midnight.network
   export PROOF_SERVER_URL=https://proof-server.preview.midnight.network

   # Windows PowerShell
   $env:NETWORK_ID='preview'
   $env:INDEXER_URL='https://indexer.preview.midnight.network/api/v3/graphql'
   $env:INDEXER_WS_URL='wss://indexer.preview.midnight.network/api/v3/graphql/ws'
   $env:NODE_URL='https://node.preview.midnight.network'
   $env:PROOF_SERVER_URL='https://proof-server.preview.midnight.network'
   ```

2. **Deploy**
   ```bash
   npm run deploy:confidential
   ```

3. **Fund Your Wallet**
   - Use the testnet faucet: https://faucet.preview.midnight.network/
   - Paste your unshielded address when prompted

### Using Existing Network Infrastructure

If you have a running Midnight network node, update environment variables:
- `INDEXER_URL`: GraphQL endpoint
- `INDEXER_WS_URL`: WebSocket endpoint
- `NODE_URL`: Node RPC URL
- `PROOF_SERVER_URL`: Proof server endpoint
- `NETWORK_ID`: Network identifier

## Contract Interaction

### Submitting a Qualification

To submit a financial qualification proof (from application code):

```typescript
import { ConfidentialContract } from '@confidential/merger-negotiation-board';

// Prepare private financial data
const privateRevenue = 1000000n;      // 1M in smallest unit
const privateAssets = 5000000n;       // 5M
const privateLiabilities = 2000000n;  // 2M

// Set public thresholds
const minRevenueThreshold = 500000n;   // 500K minimum
const minAssetThreshold = 1000000n;    // 1M minimum

// Call the submit_qualification circuit (creates ZK proof)
// This is done automatically by the midnight-js-contracts SDK
```

### Querying Qualified Count

```typescript
// Get current count of qualified submissions
const qualifiedCount = await contract.callCircuit('get_qualified_count', {});
console.log(`Qualified companies: ${qualifiedCount}`);
```

## Building from Source

### Compile Contract (Requires Compact Compiler)

```bash
# Recompile the Confidential contract from .compact source
npm run compile:confidential

# This generates:
# - ZK intermediate representation (zkir)
# - Proving/verification keys
# - TypeScript contract bindings
```

### Build TypeScript

```bash
# Compile TypeScript to JavaScript
npm run build
```

## Configuration Files

### deployment-confidential.json

Generated after successful deployment:

```json
{
  "contractAddress": "zm1q...",
  "network": "undeployed|preview|preprod",
  "deployedAt": "2025-02-14T15:30:00.000Z",
  "seed": "a1b2c3d4..."
}
```

### tsconfig.json

TypeScript compilation configuration for ES modules.

### package.json

Project metadata and scripts:
- `compile:confidential`: Compile Confidential.compact contract
- `build`: TypeScript compilation
- `deploy:confidential`: Deploy to configured network

## Troubleshooting

### Network Connection Issues

**Problem**: "Cannot connect to indexer"
```
Solution: Check environment variables and network availability
- Verify NETWORK_ID is set correctly
- Ensure NODE_URL and INDEXER_URL are accessible
- For local network, check if node is running
```

### Wallet Synchronization Timeout

**Problem**: "Timeout waiting for wallet to sync"
```
Solution:
1. Check internet connection
2. Ensure the node is fully synchronized
3. Try again after a few minutes
4. For local network, verify indexer is running
```

### ZK Proof Generation Failed

**Problem**: "Proof generation failed"
```
Solution:
1. Verify proof-server is running and accessible
2. Check available disk space (proofs can be large)
3. Increase timeout: PROOF_SERVER_URL points to correct server
```

### Fund Not Received

**Problem**: "Wallet shows 0 balance"
```
Solution:
1. Verify you're sending to the correct address
2. For testnet, use official faucet
3. Allow time for transaction confirmation
4. Check wallet sync status
```

## Development

### Project Dependencies

Core dependencies:
- `@midnight-ntwrk/compact-js`: Contract compilation
- `@midnight-ntwrk/midnight-js-contracts`: Contract deployment
- `@midnight-ntwrk/wallet-sdk-*`: Wallet implementations
- `@midnight-ntwrk/ledger-v7`: Ledger types
- `rxjs`: Reactive programming

### Extending the Contract

To add new circuits or modify the Confidential contract:

1. Edit `src/Confidential.compact`
2. Run `npm run compile:confidential`
3. Run `npm run build`
4. Update `deploy-confidential.ts` if needed
5. Deploy: `npm run deploy:confidential`

## Security Considerations

### Private Data Handling

- Private witnesses are never transmitted to the network
- Only ZK proofs are submitted (proving correctness without data)
- Financial data remains on the submitting party's device
- Always validate threshold values before verification

### Wallet Security

- Store the deployment seed securely (can restore wallet)
- Never share seed with untrusted parties
- For production: use hardware wallets
- Rotate keys after major contract updates

### Contract Audits

Before production deployment:
- Audit ZK circuits for correctness
- Verify proof key generation process
- Test with sample financial data
- Validate threshold calculations

## License

Apache License 2.0
Copyright (C) 2025 Midnight Foundation

## Support & Documentation

- **Midnight Docs**: https://docs.midnight.network
- **Compact Reference**: https://docs.midnight.network/reference/compact
- **GitHub**: https://github.com/midnightntwrk
- **Community**: Midnight Discord

## Next Steps

1. **Deploy Contract**: Configure network and run `npm run deploy:confidential`
2. **Integrate with Frontend**: Use contract address in frontend-vite-react
3. **Set Public Thresholds**: Configure minimum qualification requirements
4. **Test Submission**: Verify ZK proof submission and verification
5. **Scale to Production**: Migrate to production network infrastructure
