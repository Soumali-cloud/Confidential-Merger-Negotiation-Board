#!/usr/bin/env node

/**
 * Contract Deployment Verification Script
 * Verifies that the Confidential Merger Negotiation Board contract deployed correctly
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const deploymentPath = path.resolve(__dirname, 'deployment-confidential.json');

interface DeploymentInfo {
  contractAddress: string;
  network: string;
  deployedAt: string;
  seed: string;
}

function banner(text: string): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  const padding = Math.floor((60 - text.length) / 2);
  console.log(`║${' '.repeat(padding)}${text}${' '.repeat(60 - padding - text.length)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

function success(msg: string): void {
  console.log(`✓ ${msg}`);
}

function error(msg: string): void {
  console.log(`✗ ${msg}`);
}

function info(msg: string): void {
  console.log(`ℹ ${msg}`);
}

async function verifyDeployment(): Promise<void> {
  banner('Confidential Contract Verification');

  // Check if deployment file exists
  if (!fs.existsSync(deploymentPath)) {
    error('Deployment file not found');
    info(`Expected at: ${deploymentPath}`);
    info('Run "npm run deploy:confidential" to deploy first.');
    process.exit(1);
  }

  success('Deployment file found');

  // Parse deployment info
  let deployment: DeploymentInfo;
  try {
    const content = fs.readFileSync(deploymentPath, 'utf-8');
    deployment = JSON.parse(content);
  } catch (e) {
    error('Failed to parse deployment file');
    console.error(e);
    process.exit(1);
  }

  success('Deployment file parsed');

  // Validate deployment structure
  const requiredFields: (keyof DeploymentInfo)[] = ['contractAddress', 'network', 'deployedAt', 'seed'];
  const missingFields = requiredFields.filter(field => !deployment[field]);

  if (missingFields.length > 0) {
    error(`Missing fields: ${missingFields.join(', ')}`);
    process.exit(1);
  }

  success('All required fields present');

  // Display deployment info
  console.log('\nDeployment Information:');
  console.log('├─ Contract Address:', deployment.contractAddress);
  console.log('├─ Network:', deployment.network);
  console.log('├─ Deployed At:', new Date(deployment.deployedAt).toLocaleString());
  console.log('└─ Seed (stored securely):', **HIDDEN**');

  // Verify contract format
  if (!deployment.contractAddress.startsWith('zm1q')) {
    error('Invalid contract address format');
    info('Midnight contract addresses should start with "zm1q"');
    process.exit(1);
  }

  success('Contract address format valid');

  // Check network connectivity (optional)
  if (process.argv.includes('--check-network')) {
    await checkNetworkConnectivity(deployment.network);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✓ Deployment Verification Complete');
  console.log('═'.repeat(60));

  console.log('\nNext steps:');
  console.log('1. Integrate contract address with frontend/CLI');
  console.log('2. Set VITE_CONTRACT_ADDRESS environment variable');
  console.log('3. Test contract interactions');

  if (deployment.network === 'undeployed') {
    console.log('\n⚠️  Note: Contract deployed on local undeployed network');
    console.log('   Make sure your local Midnight network is running!');
  }
}

async function checkNetworkConnectivity(network: string): Promise<void> {
  console.log('\nChecking network connectivity...');
  
  const endpoints: Record<string, string> = {
    undeployed: 'http://127.0.0.1:9944',
    preview: 'https://node.preview.midnight.network',
    preprod: 'https://node.preprod.midnight.network',
  };

  const endpoint = endpoints[network] || endpoints.undeployed;

  try {
    const response = await fetch(endpoint, { method: 'HEAD', timeout: 5000 });
    if (response.ok || response.status !== 404) {
      success(`Network endpoint accessible: ${endpoint}`);
    } else {
      error(`Network endpoint returned status: ${response.status}`);
    }
  } catch (e) {
    error(`Cannot reach network: ${endpoint}`);
    info(`Make sure your network is running or check your connection`);
  }
}

// Run verification
verifyDeployment().catch(err => {
  error('Verification failed');
  console.error(err);
  process.exit(1);
});
