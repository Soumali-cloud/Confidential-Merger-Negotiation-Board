// Enhanced Confidential M&A Board - Frontend JavaScript
// Cryptographic commitment generation, proof management, and verification

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    wallet: null,
    connectedAddress: null,
    proofData: null,
    submissions: [],
    currentNetwork: 'local',
    isProcessing: false
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeApp();
        setupEventListeners();
        loadStoredData();
        updateDashboard();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showNotification('error', 'Initialization failed. Please refresh the page.');
    }
});

function initializeApp() {
    console.log('🚀 Confidential M&A Board initialized');
    loadStoredSubmissions();
    updateNetworkInfo();
}

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('proofForm');
    if (form) {
        form.addEventListener('submit', handleProofGeneration);
    }

    // Real-time validation
    form?.addEventListener('input', performRealTimeValidation);

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
}

// ============================================
// WALLET CONNECTION
// ============================================

async function connectWallet() {
    try {
        // Simulate wallet connection
        const address = `0x${Array.from({length: 40}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('')}`;
        
        state.connectedAddress = address;
        document.getElementById('walletAddress').value = address;
        
        showNotification('success', '✓ Wallet connected successfully');
        updateDashboard();
    } catch (error) {
        console.error('Wallet connection failed:', error);
        showNotification('error', 'Failed to connect wallet');
    }
}

// ============================================
// REAL-TIME VALIDATION
// ============================================

function performRealTimeValidation() {
    const revenue = parseFloat(document.getElementById('revenue')?.value || 0);
    const assets = parseFloat(document.getElementById('assets')?.value || 0);
    const liabilities = parseFloat(document.getElementById('liabilities')?.value || 0);

    // Update solvency check
    const solvencyCheck = document.getElementById('solvencyCheck');
    if (assets > liabilities) {
        solvencyCheck.innerHTML = '<span class="status-badge success">✓ Solvent</span>';
    } else if (assets > 0) {
        solvencyCheck.innerHTML = '<span class="status-badge pending">⚠ Not solvent yet</span>';
    } else {
        solvencyCheck.innerHTML = '<span class="status-badge pending">⏳ Enter data</span>';
    }

    // Real-time condition updates
    const minRevenue = parseFloat(document.getElementById('minRevenue')?.value || 0);
    const minAssets = parseFloat(document.getElementById('minAssets')?.value || 0);
    const minNetWorth = parseFloat(document.getElementById('minNetWorth')?.value || 0);
    const maxDebtRatio = parseFloat(document.getElementById('maxDebtRatio')?.value || 1);

    updateConditionStatus('cond-revenue', revenue >= minRevenue, revenue, minRevenue);
    updateConditionStatus('cond-assets', assets >= minAssets, assets, minAssets);
    updateConditionStatus('cond-solvency', assets > liabilities);
    updateConditionStatus('cond-networth', 
        (assets - liabilities) >= minNetWorth, 
        assets - liabilities, 
        minNetWorth
    );
    updateConditionStatus('cond-debtatio',
        liabilities > 0 ? (assets / liabilities) >= maxDebtRatio : true,
        liabilities > 0 ? (assets / liabilities).toFixed(2) : '∞',
        maxDebtRatio
    );

    // Update commitment hash in real-time
    if (revenue > 0 && assets > 0) {
        updateCommitmentDisplay();
    }
}

function updateConditionStatus(elementId, passed, actual = null, threshold = null) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const statusSpan = element.querySelector('.condition-status');
    if (passed) {
        statusSpan.textContent = '✓';
        statusSpan.style.color = '#10b981';
    } else {
        statusSpan.textContent = '✗';
        statusSpan.style.color = '#ef4444';
    }
}

function updateCommitmentDisplay() {
    const revenue = document.getElementById('revenue')?.value;
    const assets = document.getElementById('assets')?.value;
    const liabilities = document.getElementById('liabilities')?.value;
    
    if (revenue && assets && liabilities) {
        const commitment = generateCommitmentHash(revenue, assets, liabilities);
        document.getElementById('commitmentHash').textContent = commitment;
    }
}

// ============================================
// CRYPTOGRAPHIC OPERATIONS
// ============================================

/**
 * Simulate Poseidon hash for commitment generation
 */
function generateCommitmentHash(revenue, assets, liabilities) {
    const timestamp = Date.now().toString();
    const nonce = generateNonce(timestamp);
    
    // Simulate hash (in production, use actual crypto library)
    const data = `${revenue}|${assets}|${liabilities}|${nonce}`;
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(64, '0');
}

function generateNonce(timestamp) {
    return `nonce_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateProofId() {
    return `proof_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// PROOF GENERATION & SUBMISSION
// ============================================

async function handleProofGeneration(event) {
    event.preventDefault();
    
    if (!state.connectedAddress) {
        showNotification('error', '⚠ Please connect your wallet first');
        return;
    }

    if (state.isProcessing) return;
    
    try {
        state.isProcessing = true;
        
        // Collect form data
        const proofData = collectProofData();
        
        // Validate data
        const validation = validateProofData(proofData);
        if (!validation.valid) {
            throw new Error(validation.errors.join(', '));
        }

        // Update UI with processing status
        updateProcessingUI();

        // Step 1: Data Validation
        await simulateDelay(1000);
        markStepComplete('step-validation');

        // Step 2: Commitment Generation
        await simulateDelay(1500);
        const commitment = generateCommitmentHash(
            proofData.privateRevenue,
            proofData.privateAssets,
            proofData.privateLiabilities
        );
        markStepComplete('step-commitment');

        // Step 3: Proof Generation
        await simulateDelay(2000);
        const proof = generateZKProof(proofData, commitment);
        markStepComplete('step-proof');

        // Step 4: Digital Signature
        await simulateDelay(1000);
        const signature = signProof(proof);
        markStepComplete('step-signature');

        // Step 5: Blockchain Submission
        await simulateDelay(2000);
        await submitProofToBlockchain(proofData, proof, commitment, signature);
        markStepComplete('step-submission');

        // Show success
        showProofSuccess(proofData, proof, commitment);

    } catch (error) {
        console.error('Proof generation failed:', error);
        showNotification('error', `Failed: ${error.message}`);
        resetProcessingUI();
    } finally {
        state.isProcessing = false;
    }
}

function collectProofData() {
    return {
        companyName: document.getElementById('companyName').value,
        companyId: document.getElementById('companyId').value,
        walletAddress: state.connectedAddress,
        privateRevenue: BigInt(document.getElementById('revenue').value || 0),
        privateAssets: BigInt(document.getElementById('assets').value || 0),
        privateLiabilities: BigInt(document.getElementById('liabilities').value || 0),
        dealName: document.getElementById('dealName').value,
        dealId: document.getElementById('dealId').value,
        minRevenueThreshold: BigInt(document.getElementById('minRevenue').value || 0),
        minAssetThreshold: BigInt(document.getElementById('minAssets').value || 0),
        minNetWorthThreshold: BigInt(document.getElementById('minNetWorth').value || 0),
        maxDebtRatioThreshold: BigInt(document.getElementById('maxDebtRatio').value || 1),
        timestamp: Date.now()
    };
}

function validateProofData(data) {
    const errors = [];

    if (!data.companyName) errors.push('Company name required');
    if (!data.companyId) errors.push('Company ID required');
    if (data.privateRevenue <= 0n) errors.push('Revenue must be > 0');
    if (data.privateAssets <= 0n) errors.push('Assets must be > 0');
    if (data.privateLiabilities < 0n) errors.push('Liabilities cannot be negative');
    if (data.privateAssets <= data.privateLiabilities) errors.push('Must be solvent');
    if (!data.dealName) errors.push('Deal name required');
    if (!data.dealId) errors.push('Deal ID required');

    return {
        valid: errors.length === 0,
        errors
    };
}

function generateZKProof(proofData, commitment) {
    // Simulate ZK proof generation
    const conditions = {
        revenue_threshold_met: proofData.privateRevenue >= proofData.minRevenueThreshold,
        asset_threshold_met: proofData.privateAssets >= proofData.minAssetThreshold,
        solvent: proofData.privateAssets > proofData.privateLiabilities,
        net_worth_met: (proofData.privateAssets - proofData.privateLiabilities) >= proofData.minNetWorthThreshold,
        debt_ratio_valid: proofData.privateAssets >= (proofData.privateLiabilities * proofData.maxDebtRatioThreshold)
    };

    return {
        proofId: generateProofId(),
        commitmentHash: commitment,
        conditions,
        timestamp: Date.now(),
        verified: Object.values(conditions).every(v => v)
    };
}

function signProof(proof) {
    // Simulate ECDSA signature
    return {
        signature: `sig_${Math.random().toString(36).substr(2, 64)}`,
        publicKey: state.connectedAddress,
        timestamp: Date.now()
    };
}

async function submitProofToBlockchain(proofData, proof, commitment, signature) {
    // Simulate blockchain submission
    const submission = {
        proofId: proof.proofId,
        companyId: proofData.companyId,
        companyName: proofData.companyName,
        dealId: proofData.dealId,
        dealName: proofData.dealName,
        commitmentHash: commitment,
        proof: proof,
        signature: signature,
        walletAddress: state.connectedAddress,
        submittedAt: new Date().toISOString(),
        status: 'verified',
        blockNumber: Math.floor(Math.random() * 1000000)
    };

    state.submissions.push(submission);
    saveSubmissions();

    return submission;
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function updateProcessingUI() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('completed', 'active', 'pending');
        if (index === 0) {
            step.classList.add('active');
        }
    });

    document.querySelectorAll('.condition-status').forEach(el => {
        el.textContent = '⏳';
        el.style.color = '#f59e0b';
    });
}

function markStepComplete(stepId) {
    const step = document.getElementById(stepId);
    if (step) {
        step.classList.remove('active', 'pending');
        step.classList.add('completed');
        step.querySelector('.step-status').textContent = '✓';

        // Move to next step
        const nextStep = step.nextElementSibling;
        if (nextStep?.classList.contains('step')) {
            nextStep.classList.add('active');
        }
    }
}

function resetProcessingUI() {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('completed', 'active');
    });
    document.querySelectorAll('.step-status').forEach(el => {
        el.textContent = '⏳';
    });
}

function updateDashboard() {
    const submitCount = state.submissions.length;
    const verifiedCount = state.submissions.filter(s => s.status === 'verified').length;

    document.getElementById('statProofs').textContent = submitCount;
    document.getElementById('statVerified').textContent = verifiedCount;
    document.getElementById('statDeals').textContent = new Set(
        state.submissions.map(s => s.dealId)
    ).size;

    document.getElementById('totalProofs').textContent = submitCount;
    document.getElementById('qualifiedCount').textContent = verifiedCount;
    document.getElementById('activeDealCount').textContent = new Set(
        state.submissions.map(s => s.dealId)
    ).size;
}

// ============================================
// SUCCESS & NOTIFICATIONS
// ============================================

function showProofSuccess(proofData, proof, commitment) {
    const modal = document.getElementById('proofSuccessModal');
    document.getElementById('successMessage').textContent = 
        `✓ Your qualification proof has been successfully verified and recorded on-chain!`;
    document.getElementById('modalCompany').textContent = proofData.companyName;
    document.getElementById('modalDeal').textContent = proofData.dealName;
    document.getElementById('modalProofId').textContent = proof.proofId;
    document.getElementById('modalCommitment').textContent = commitment.substring(0, 32) + '...';

    modal.classList.add('active');
    
    // Reset form
    setTimeout(resetForm, 2000);
}

function showNotification(type, message) {
    // In production, use a proper notification library
    if (type === 'success') {
        console.log('✓', message);
    } else if (type === 'error') {
        console.error('✗', message);
        alert(message);
    } else {
        console.log(message);
    }
}

// ============================================
// VERIFICATION
// ============================================

async function verifyProof() {
    const proofId = document.getElementById('verifyProofId').value;
    if (!proofId) {
        showNotification('error', 'Please enter a proof ID');
        return;
    }

    const submission = state.submissions.find(s => 
        s.proofId === proofId || s.commitmentHash.includes(proofId)
    );

    if (!submission) {
        showNotification('error', 'Proof not found');
        return;
    }

    const resultDiv = document.getElementById('verificationResult');
    document.getElementById('resultStatus').textContent = 
        submission.status === 'verified' ? '✓ Verified' : '⏳ Pending';
    document.getElementById('resultCompany').textContent = submission.companyName;
    document.getElementById('resultDeal').textContent = submission.dealName;
    document.getElementById('resultTime').textContent = new Date(submission.submittedAt).toLocaleString();
    document.getElementById('resultHash').textContent = submission.commitmentHash.substring(0, 64) + '...';

    resultDiv.style.display = 'block';
}

// ============================================
// UTILITIES
// ============================================

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetForm() {
    document.getElementById('proofForm').reset();
    resetProcessingUI();
    document.querySelectorAll('.condition-status').forEach(el => {
        el.textContent = '⏳';
    });
    document.getElementById('commitmentHash').textContent = 'Waiting for data...';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function submitAnother() {
    closeModal('proofSuccessModal');
    resetForm();
}

function handleNavigation(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
}

function updateNetworkInfo() {
    document.getElementById('networkName').textContent = 'Local Network (Development)';
}

async function refreshHistory() {
    updateDashboard();
    loadStoredSubmissions();
    showNotification('success', 'History refreshed');
}

// ============================================
// STORAGE
// ============================================

function saveSubmissions() {
    localStorage.setItem('cmb-submissions', JSON.stringify(state.submissions));
}

function loadStoredSubmissions() {
    try {
        const stored = localStorage.getItem('cmb-submissions');
        state.submissions = stored ? JSON.parse(stored) : [];
        displaySubmissions();
        updateDashboard();
    } catch (error) {
        console.warn('Could not load submissions:', error);
        state.submissions = [];
    }
}

function loadStoredData() {
    // Load any other stored data
}

function displaySubmissions() {
    const tbody = document.getElementById('historyBody');
    if (state.submissions.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No submissions yet</td></tr>';
        return;
    }

    tbody.innerHTML = state.submissions.map(submission => `
        <tr>
            <td>${submission.companyName}</td>
            <td>${submission.dealName}</td>
            <td><code>${submission.commitmentHash.substring(0, 16)}...</code></td>
            <td>
                <span class="badge ${submission.status === 'verified' ? 'success' : 'pending'}">
                    ${submission.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                </span>
            </td>
            <td>${new Date(submission.submittedAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-small" onclick="viewProofDetails('${submission.proofId}')">
                    View
                </button>
            </td>
        </tr>
    `).join('');
}

function viewProofDetails(proofId) {
    const submission = state.submissions.find(s => s.proofId === proofId);
    if (submission) {
        document.getElementById('verifyProofId').value = proofId;
        verifyProof();
        document.querySelector('.nav-link[href="#verify"]').click();
    }
}
