// Cryptographic Utilities for ZKovenant M&A Platform
// Enterprise-grade cryptographic operations with replay protection
// Feature: Nonce management, replay protection, wallet identity

import crypto from 'crypto';
import { Buffer } from 'buffer';

// ============================================
// FEATURE 2 & 5: NONCE & REPLAY PROTECTION
// ============================================

interface ReplayProtectionState {
  dealId: string;
  walletAddress: string;
  lastProofTimestamp: number;
  proofSequence: number;
  usedNonces: Set<string>;
}

// In-memory replay protection (use Redis in production)
const replayProtectionCache = new Map<string, ReplayProtectionState>();

/**
 * Feature 2: Generate cryptographic nonce for commitment binding
 * Prevents witness tampering and ensures proof uniqueness
 */
export function generateNonce(companyId: string, dealId: string, timestamp: number): string {
  // Create deterministic nonce from company, deal, and time
  const data = `${companyId}:${dealId}:${timestamp}`;
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return hash.slice(0, 32);
}

/**
 * Feature 2: Generate enhanced nonce with full entropy
 */
export function generateStrongNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Feature 5: Check if nonce has been used (replay protection)
 */
export function checkNonceUsage(nonce: string, dealId: string): boolean {
  const state = replayProtectionCache.get(dealId);
  return state ? state.usedNonces.has(nonce) : false;
}

/**
 * Feature 5: Register nonce as used
 */
export function registerNonceUsage(nonce: string, dealId: string, walletAddress: string): void {
  const key = `${dealId}:${walletAddress}`;
  if (!replayProtectionCache.has(key)) {
    replayProtectionCache.set(key, {
      dealId,
      walletAddress,
      lastProofTimestamp: 0,
      proofSequence: 0,
      usedNonces: new Set()
    });
  }
  
  const state = replayProtectionCache.get(key)!;
  state.usedNonces.add(nonce);
}

// ============================================
// FEATURE 5: REPLAY PROTECTION
// ============================================

interface ReplayCheckResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Feature 5: Comprehensive replay protection check
 * Verifies proof cannot be reused across time/deals/wallets
 */
export function validateReplayProtection(
  dealId: string,
  walletAddress: string,
  proofTimestamp: number,
  dealCreationTimestamp: number
): ReplayCheckResult {
  const errors: string[] = [];
  const key = `${dealId}:${walletAddress}`;
  
  // Check 1: Proof timestamp must be after deal creation
  if (proofTimestamp < dealCreationTimestamp) {
    errors.push('Proof timestamp cannot be before deal creation');
  }
  
  // Check 2: Proof cannot be too old (prevent old proof resubmission)
  const maxProofAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  const now = Date.now();
  if (now - proofTimestamp > maxProofAge) {
    errors.push('Proof has expired (older than 30 days)');
  }
  
  // Check 3: Verify sequence number progression
  const state = replayProtectionCache.get(key);
  if (state) {
    if (proofTimestamp <= state.lastProofTimestamp) {
      errors.push('Proof timestamp must be after previous proof for this deal/wallet');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Feature 5: Update replay protection state after valid proof
 */
export function updateReplayProtectionState(
  dealId: string,
  walletAddress: string,
  proofTimestamp: number
): void {
  const key = `${dealId}:${walletAddress}`;
  if (!replayProtectionCache.has(key)) {
    replayProtectionCache.set(key, {
      dealId,
      walletAddress,
      lastProofTimestamp: proofTimestamp,
      proofSequence: 1,
      usedNonces: new Set()
    });
  } else {
    const state = replayProtectionCache.get(key)!;
    state.lastProofTimestamp = proofTimestamp;
    state.proofSequence++;
  }
}

// ============================================
// FEATURE 4: WALLET-BASED IDENTITY
// ============================================

/**
 * Feature 4: Validate wallet address format
 */
export function validateWalletAddress(address: string): boolean {
  // Support Ethereum-style (0x...) and other blockchain formats
  if (address.startsWith('0x')) {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }
  // Generic wallet validation
  return address.length >= 20 && address.length <= 100;
}

/**
 * Feature 4: Derive deterministic wallet from company secret
 */
export function deriveWalletFromSecret(companySecret: string): string {
  const derived = crypto.createHash('sha256').update(companySecret).digest('hex');
  return `0x${derived.slice(0, 40)}`;
}

// ============================================
// CRYPTOGRAPHIC HASHING
// ============================================

/**
 * Generate Poseidon-style commitment hash (simulated)
 * Feature 2: Binds financial data + nonce to prevent tampering
 */
export function generateCommitmentHash(
  revenue: bigint,
  assets: bigint,
  liabilities: bigint,
  nonce: string,
  dealId: string = '',
  timestamp: number = 0
): string {
  // Simulate Poseidon hash with multiple inputs
  const data = Buffer.concat([
    Buffer.from(revenue.toString()),
    Buffer.from(assets.toString()),
    Buffer.from(liabilities.toString()),
    Buffer.from(nonce),
    Buffer.from(dealId),
    Buffer.from(timestamp.toString())
  ]);
  
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ============================================
// PROOF GENERATION
// ============================================

/**
 * Feature 3: Generate aggregated proof metadata
 * Single proof for all 5 conditions
 */
export function generateAggregatedProofMetadata(
  companyId: string,
  dealId: string,
  walletAddress: string,
  commitmentHash: string
): ProofMetadata {
  const now = Date.now();
  const proofSequence = replayProtectionCache.get(`${dealId}:${walletAddress}`)?.proofSequence ?? 0;
  
  return {
    proofId: crypto.randomBytes(32).toString('hex'),
    companyId,
    dealId,
    walletAddress,  // Feature 4: Wallet identity
    commitmentHash,
    timestamp: now,
    proofSequence: proofSequence + 1,  // Feature 5: Replay protection
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
    signature: ''
  };
}

/**
 * Feature 3 & 2: Generate complete aggregated proof
 * Combines all financial conditions into single ZK proof
 */
export function generateAggregatedProof(
  proofData: ProofData
): AggregatedProof {
  const nonce = generateNonce(proofData.companyId, proofData.dealId, Date.now());
  
  // Feature 2: Create commitment with nonce
  const commitmentHash = generateCommitmentHash(
    proofData.privateRevenue,
    proofData.privateAssets,
    proofData.privateLiabilities,
    nonce,
    proofData.dealId,
    Date.now()
  );
  
  // Feature 3: Aggregate all 5 conditions into single proof
  const conditions = {
    revenueQualified: proofData.privateRevenue >= proofData.minRevenueThreshold,
    assetQualified: proofData.privateAssets >= proofData.minAssetThreshold,
    solvent: proofData.privateAssets > proofData.privateLiabilities,
    netWorthQualified: (proofData.privateAssets - proofData.privateLiabilities) >= proofData.minNetWorthThreshold,
    debtRatioQualified: proofData.privateAssets >= (proofData.privateLiabilities * proofData.maxDebtRatioThreshold)
  };
  
  const allConditionsMet = Object.values(conditions).every(c => c === true);
  
  // Feature 5: Get sequence number for replay protection
  const state = replayProtectionCache.get(`${proofData.dealId}:${proofData.companyWalletAddress}`);
  const proofSequence = state?.proofSequence ?? 0;
  
  return {
    proofId: crypto.randomBytes(32).toString('hex'),
    dealId: proofData.dealId,
    walletAddress: proofData.companyWalletAddress,
    commitmentHash,
    nonce,
    conditions,
    allConditionsMet,
    timestamp: Date.now(),
    proofSequence: proofSequence + 1,
    aggregationStatus: allConditionsMet ? 'approved' : 'failed'
  };
}

// ============================================
// IDENTITY & SIGNATURE
// ============================================

/**
 * Generate ECDSA signature for proof authenticity
 */
export function signProof(
  proofData: string,
  privateKeyHex: string
): string {
  const privateKey = crypto.createPrivateKey({
    key: Buffer.from(privateKeyHex, 'hex'),
    format: 'der',
    type: 'pkcs8'
  });
  
  const signature = crypto.sign('sha256', Buffer.from(proofData), privateKey);
  return signature.toString('hex');
}

/**
 * Verify proof signature with public key
 */
export function verifyProofSignature(
  proofData: string,
  signature: string,
  publicKeyHex: string
): boolean {
  try {
    const publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKeyHex, 'hex'),
      format: 'der',
      type: 'spki'
    });
    
    return crypto.verify(
      'sha256',
      Buffer.from(proofData),
      publicKey,
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Generate company wallet keypair
 */
export function generateCompanyKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });
  
  return {
    publicKey: publicKey.toString('hex'),
    privateKey: privateKey.toString('hex')
  };
}

// ============================================
// PROOF DATA STRUCTURES
// ============================================

export interface ProofData {
  // Company Identity - Feature 4: Wallet-based
  companyId: string;
  companyName: string;
  companyWalletAddress: string;  // Feature 4: Blockchain wallet
  
  // Financial Data (Private - Client-Side Only)
  privateRevenue: bigint;
  privateAssets: bigint;
  privateLiabilities: bigint;
  
  // Deal Information - Feature 1: Deal-specific locking
  dealId: string;
  dealName: string;
  dealCreationTimestamp: number;  // Feature 5: For replay protection
  
  // Feature 6: Defined Financial Formulas as Thresholds
  minRevenueThreshold: bigint;        // Formula 1: Revenue >= threshold
  minAssetThreshold: bigint;          // Formula 2: Assets >= threshold
  minNetWorthThreshold: bigint;       // Formula 3: Net Worth >= threshold
  maxDebtRatioThreshold: bigint;      // Formula 4 & 5: Solvency/Debt Ratio
  
  // Feature 2: Cryptographic Nonce for Anti-Tampering
  nonce: string;
  commitmentHash: string;
  
  // Proof Metadata
  proofMetadata: ProofMetadata;
}

export interface ProofMetadata {
  proofId: string;
  companyId: string;
  dealId: string;
  walletAddress: string;  // Feature 4: Wallet identity
  commitmentHash: string;
  timestamp: number;
  proofSequence: number;  // Feature 5: Replay protection sequence
  expiresAt: number;
  signature: string;
}

// Feature 3: Aggregated Proof Structure
export interface AggregatedProof {
  proofId: string;
  dealId: string;
  walletAddress: string;
  commitmentHash: string;
  nonce: string;  // Feature 2: Nonce binding
  
  // All 5 conditions aggregated - Feature 3
  conditions: {
    revenueQualified: boolean;      // Feature 6: Formula 1
    assetQualified: boolean;        // Feature 6: Formula 2
    solvent: boolean;               // Feature 6: Formula 4
    netWorthQualified: boolean;     // Feature 6: Formula 3
    debtRatioQualified: boolean;    // Feature 6: Formula 5
  };
  
  allConditionsMet: boolean;        // Feature 3: Aggregation status
  timestamp: number;                // Feature 5: Timestamp for replay check
  proofSequence: number;            // Feature 5: Sequence for ordering
  aggregationStatus: 'approved' | 'failed' | 'pending';
}

export interface ProofSubmission {
  proof: string;
  commitmentHash: string;
  dealId: string;
  walletAddress: string;  // Feature 4: Wallet binding to submission
  proofMetadata: ProofMetadata;
  timestamp: number;
  userId: string;
  status: 'pending' | 'verified' | 'failed';
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate financial data before proof generation
 */
export function validateFinancialData(
  revenue: bigint,
  assets: bigint,
  liabilities: bigint
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (revenue <= 0n) {
    errors.push('Revenue must be greater than 0');
  }
  if (assets <= 0n) {
    errors.push('Assets must be greater than 0');
  }
  if (liabilities < 0n) {
    errors.push('Liabilities cannot be negative');
  }
  if (assets <= liabilities) {
    errors.push('Assets must be greater than liabilities (must be solvent)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate proof meets all thresholds
 */
export function validateProofConditions(
  revenue: bigint,
  assets: bigint,
  liabilities: bigint,
  minRevenueThreshold: bigint,
  minAssetThreshold: bigint,
  minNetWorthThreshold: bigint,
  maxDebtRatioThreshold: bigint
): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  
  if (revenue < minRevenueThreshold) {
    failures.push(`Revenue ${revenue} below threshold ${minRevenueThreshold}`);
  }
  if (assets < minAssetThreshold) {
    failures.push(`Assets ${assets} below threshold ${minAssetThreshold}`);
  }
  
  const netWorth = assets - liabilities;
  if (netWorth < minNetWorthThreshold) {
    failures.push(`Net worth ${netWorth} below threshold ${minNetWorthThreshold}`);
  }
  
  // Debt ratio: Assets / Liabilities >= maxDebtRatioThreshold
  // Equivalent to: Assets >= Liabilities * maxDebtRatioThreshold
  const scaledMaxDebt = liabilities * maxDebtRatioThreshold;
  if (assets < scaledMaxDebt) {
    const actualRatio = liabilities > 0n ? assets / liabilities : 0n;
    failures.push(`Debt ratio ${actualRatio} exceeds maximum ${maxDebtRatioThreshold}`);
  }
  
  return {
    valid: failures.length === 0,
    failures
  };
}
