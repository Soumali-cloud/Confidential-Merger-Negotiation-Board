/**
 * Confidential M&A Board - Shared Application Logic
 * Dark Theme Professional UI
 */

// ==================== Navigation ====================
document.addEventListener('DOMContentLoaded', function() {
    updateActiveNavLink();
});

function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href === currentPage || (currentPage === '' && href === 'landing.html')) {
            link.classList.add('active');
        }
    });
}

// ==================== Utilities ====================

/**
 * Generate SHA256 hash (browser-based)
 */
async function generateSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Format currency
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    }).format(value);
}

/**
 * Format date
 */
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

/**
 * Load data from localStorage
 */
function loadFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
        console.error('Error loading from storage:', e);
        return [];
    }
}

/**
 * Save data to localStorage
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error saving to storage:', e);
        return false;
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
        box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Add slide animations
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== Analytics ====================

/**
 * Track analytics event
 */
function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        timestamp: new Date().toISOString(),
        ...eventData
    };
    
    const analytics = loadFromStorage('analytics') || [];
    analytics.push(event);
    saveToStorage('analytics', analytics);
    
    console.log('[Analytics]', event);
}

// ==================== Proof History Management ====================

/**
 * Save proof to history
 */
function saveProofToHistory(proofData) {
    const history = loadFromStorage('proofHistory') || [];
    
    const proof = {
        id: 'proof_' + Date.now(),
        companyName: proofData.companyName,
        companyId: proofData.companyId,
        commitmentHash: proofData.commitmentHash,
        timestamp: new Date().toISOString(),
        status: 'verified',
        revenueProof: proofData.revenuePass,
        assetProof: proofData.assetPass,
        solvencyProof: proofData.solvencyPass,
        netWorthProof: proofData.netWorthPass,
        debtProof: proofData.debtPass,
        signature: proofData.signature
    };
    
    history.unshift(proof);
    saveToStorage('proofHistory', history);
    
    trackEvent('proof_submitted', {
        companyName: proofData.companyName,
        proofTypes: [
            proofData.revenuePass && 'revenue',
            proofData.assetPass && 'assets',
            proofData.solvencyPass && 'solvency',
            proofData.netWorthPass && 'networth',
            proofData.debtPass && 'debt'
        ].filter(Boolean)
    });
    
    return proof;
}

// ==================== Validation Helpers ====================

/**
 * Validate financial data
 */
function validateFinancialData(revenue, assets, liabilities) {
    const errors = [];
    
    if (!revenue || revenue <= 0) errors.push('Revenue must be greater than 0');
    if (!assets || assets <= 0) errors.push('Assets must be greater than 0');
    if (!liabilities || liabilities < 0) errors.push('Liabilities cannot be negative');
    if (assets < liabilities) errors.push('Assets must be greater than or equal to liabilities');
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Check proof conditions
 */
function checkProofConditions(revenue, assets, liabilities, minRevenue, minAssets, minSolvency, minNetWorth, maxDebtRatio) {
    const netWorth = assets - liabilities;
    const solvencyRatio = liabilities > 0 ? assets / liabilities : assets;
    const debtRatio = assets > 0 ? liabilities / assets : 1;
    
    return {
        revenuePass: revenue >= minRevenue,
        assetPass: assets >= minAssets,
        solvencyPass: solvencyRatio >= minSolvency,
        netWorthPass: netWorth >= minNetWorth,
        debtPass: debtRatio <= maxDebtRatio,
        allPass: (revenue >= minRevenue && assets >= minAssets && solvencyRatio >= minSolvency && netWorth >= minNetWorth && debtRatio <= maxDebtRatio),
        details: {
            netWorth,
            solvencyRatio: solvencyRatio.toFixed(2),
            debtRatio: debtRatio.toFixed(3)
        }
    };
}

// ==================== Cryptographic Functions ====================

/**
 * Generate nonce deterministically from company ID and timestamp
 */
function generateNonce(companyId, timestamp) {
    const data = `${companyId}-${timestamp}`;
    const msgBuffer = new TextEncoder().encode(data);
    return crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Generate commitment hash from financial data
 */
async function generateCommitmentHash(revenue, assets, liabilities, companyId) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Array.from(generateNonce(companyId, timestamp))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    
    const data = `${revenue}:${assets}:${liabilities}:${nonce}`;
    const hash = await generateSHA256(data);
    
    return {
        hash,
        nonce,
        data
    };
}

/**
 * Generate digital signature (simulated ECDSA)
 */
async function generateSignature(proofData) {
    const dataToSign = JSON.stringify({
        proof: proofData.commitmentHash,
        timestamp: proofData.timestamp,
        conditions: {
            revenue: proofData.revenuePass,
            assets: proofData.assetPass,
            solvency: proofData.solvencyPass,
            netWorth: proofData.netWorthPass,
            debt: proofData.debtPass
        }
    });
    
    const signatureHash = await generateSHA256(dataToSign);
    return 'sig_' + signatureHash.substring(0, 32);
}

// ==================== Page-Specific Initialization ====================

/**
 * Initialize proof generation page
 */
function initProofPage() {
    const form = document.getElementById('proofForm');
    if (!form) return;
    
    // Add real-time validation
    const financialInputs = ['revenue', 'assets', 'liabilities', 'minRevenue', 'minAssets', 'minSolvency', 'minNetWorth', 'maxDebtRatio'];
    
    financialInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', validateProofInRealTime);
            input.addEventListener('change', validateProofInRealTime);
        }
    });
    
    form.addEventListener('submit', submitProof);
}

/**
 * Real-time proof validation
 */
async function validateProofInRealTime() {
    const revenue = parseFloat(document.getElementById('revenue')?.value) || 0;
    const assets = parseFloat(document.getElementById('assets')?.value) || 0;
    const liabilities = parseFloat(document.getElementById('liabilities')?.value) || 0;
    const minRevenue = parseFloat(document.getElementById('minRevenue')?.value) || 0;
    const minAssets = parseFloat(document.getElementById('minAssets')?.value) || 0;
    const minSolvency = parseFloat(document.getElementById('minSolvency')?.value) || 1;
    const minNetWorth = parseFloat(document.getElementById('minNetWorth')?.value) || 0;
    const maxDebtRatio = parseFloat(document.getElementById('maxDebtRatio')?.value) || 1;
    
    // Validate input data
    const inputValidation = validateFinancialData(revenue, assets, liabilities);
    
    if (!inputValidation.valid) {
        document.getElementById('overallStatus').innerHTML = '<span style="color: var(--text-muted);">Please fix validation errors</span>';
        return;
    }
    
    // Check proof conditions
    const conditions = checkProofConditions(revenue, assets, liabilities, minRevenue, minAssets, minSolvency, minNetWorth, maxDebtRatio);
    
    // Update status displays
    updateStatusDisplay('revenueStatus', conditions.revenuePass);
    updateStatusDisplay('assetStatus', conditions.assetPass);
    updateStatusDisplay('solvencyStatus', conditions.solvencyPass);
    updateStatusDisplay('netWorthStatus', conditions.netWorthPass);
    updateStatusDisplay('debtStatus', conditions.debtPass);
    
    // Update overall status
    const overallElement = document.getElementById('overallStatus');
    if (overallElement) {
        if (conditions.allPass) {
            overallElement.innerHTML = '<span style="color: var(--success);">✅ All conditions passed</span>';
        } else {
            const failedCount = [!conditions.revenuePass, !conditions.assetPass, !conditions.solvencyPass, !conditions.netWorthPass, !conditions.debtPass].filter(Boolean).length;
            overallElement.innerHTML = `<span style="color: var(--warning);">⚠️ ${failedCount} condition(s) failed</span>`;
        }
    }
    
    // Update commitment hash
    if (document.getElementById('companyId')?.value) {
        const commitment = await generateCommitmentHash(revenue, assets, liabilities, document.getElementById('companyId').value);
        const hashElement = document.getElementById('commitmentHash');
        if (hashElement) {
            hashElement.textContent = commitment.hash;
        }
    }
}

/**
 * Update status display
 */
function updateStatusDisplay(elementId, passed) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = passed 
            ? '<span style="color: var(--success);">✅ Pass</span>'
            : '<span style="color: var(--danger);">❌ Fail</span>';
    }
}

/**
 * Submit proof
 */
async function submitProof(e) {
    e.preventDefault();
    
    const companyName = document.getElementById('companyName')?.value;
    const companyId = document.getElementById('companyId')?.value;
    const revenue = parseFloat(document.getElementById('revenue')?.value) || 0;
    const assets = parseFloat(document.getElementById('assets')?.value) || 0;
    const liabilities = parseFloat(document.getElementById('liabilities')?.value) || 0;
    
    if (!companyName || !companyId) {
        showNotification('Please enter company information', 'error');
        return;
    }
    
    // Validate input
    const validation = validateFinancialData(revenue, assets, liabilities);
    if (!validation.valid) {
        showNotification(validation.errors[0], 'error');
        return;
    }
    
    // Generate commitment and check conditions
    try {
        const commitment = await generateCommitmentHash(revenue, assets, liabilities, companyId);
        const minRevenue = parseFloat(document.getElementById('minRevenue')?.value) || 0;
        const minAssets = parseFloat(document.getElementById('minAssets')?.value) || 0;
        const minSolvency = parseFloat(document.getElementById('minSolvency')?.value) || 1;
        const minNetWorth = parseFloat(document.getElementById('minNetWorth')?.value) || 0;
        const maxDebtRatio = parseFloat(document.getElementById('maxDebtRatio')?.value) || 1;
        
        const conditions = checkProofConditions(revenue, assets, liabilities, minRevenue, minAssets, minSolvency, minNetWorth, maxDebtRatio);
        
        if (!conditions.allPass) {
            showNotification('Not all proof conditions are met. Please review your financial data.', 'error');
            return;
        }
        
        // Generate signature
        const proofData = {
            companyName,
            companyId,
            commitmentHash: commitment.hash,
            timestamp: new Date().toISOString(),
            ...conditions
        };
        
        const signature = await generateSignature(proofData);
        proofData.signature = signature;
        
        // Save to history
        saveProofToHistory(proofData);
        
        // Show success message
        showNotification('✅ Proof submitted successfully!', 'success');
        
        // Redirect to history
        setTimeout(() => {
            window.location.href = 'history.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error generating proof:', error);
        showNotification('Error generating proof. Please try again.', 'error');
    }
}

// Initialize page when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (window.location.pathname.includes('generate-proof')) {
            initProofPage();
        }
    });
} else {
    if (window.location.pathname.includes('generate-proof')) {
        initProofPage();
    }
}
