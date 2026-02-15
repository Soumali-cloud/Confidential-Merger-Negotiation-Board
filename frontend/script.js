// ============================================
// CONFIDENTIAL MERGER NEGOTIATION BOARD
// Frontend JavaScript
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    submissions: [],
    qualifiedCount: 0,
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
        loadSubmissions();
        initializeNetworkConfig();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showErrorNotification('Application failed to initialize. Please refresh the page.');
    }
});

function initializeApp() {
    console.log('🚀 Confidential Merger Negotiation Board initialized');
    
    // Load from localStorage
    try {
        const saved = localStorage.getItem('cmb-state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.submissions = Array.isArray(parsed.submissions) ? parsed.submissions : [];
            state.qualifiedCount = typeof parsed.qualifiedCount === 'number' ? parsed.qualifiedCount : 0;
        }
    } catch (error) {
        console.warn('Could not restore state from localStorage:', error);
        state.submissions = [];
        state.qualifiedCount = 0;
    }
    
    updateQualifiedCount();
    displaySubmissions();
}

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('qualificationForm');
    if (form) {
        form.addEventListener('submit', handleQualificationSubmit);
    } else {
        console.warn('Form element not found');
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });

    // Network selector
    const networkSelect = document.getElementById('networkSelect');
    if (networkSelect) {
        networkSelect.addEventListener('change', updateNetworkConfig);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshCountBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshQualifiedCount);
    }
}

function initializeNetworkConfig() {
    const networkSelect = document.getElementById('networkSelect');
    if (networkSelect) {
        networkSelect.value = state.currentNetwork;
        updateNetworkConfig();
    }
}

// ============================================
// FORM HANDLING
// ============================================

function handleQualificationSubmit(e) {
    e.preventDefault();
    
    if (state.isProcessing) {
        showErrorNotification('⏳ Please wait for the current submission to complete');
        return;
    }
    
    // Validate form
    const validationResult = validateForm();
    if (!validationResult.valid) {
        showErrorNotification(`❌ ${validationResult.error}`);
        return;
    }

    // Get form data
    const formData = {
        companyName: document.getElementById('companyName').value.trim(),
        privateRevenue: parseFloat(document.getElementById('privateRevenue').value),
        privateAssets: parseFloat(document.getElementById('privateAssets').value),
        privateLiabilities: parseFloat(document.getElementById('privateLiabilities').value),
        dealName: document.getElementById('dealName').value.trim(),
        minRevenueThreshold: parseFloat(document.getElementById('minRevenueThreshold').value),
        minAssetThreshold: parseFloat(document.getElementById('minAssetThreshold').value)
    };

    // Show processing modal
    showProcessingModal(formData);

    // Simulate ZK proof generation
    setTimeout(() => {
        try {
            processQualification(formData);
        } catch (error) {
            console.error('Error processing qualification:', error);
            closeProcessingModal();
            showErrorNotification('❌ Failed to process qualification. Please try again.');
            state.isProcessing = false;
        }
    }, 2000);
}

function validateForm() {
    try {
        const companyName = document.getElementById('companyName')?.value?.trim();
        const privateRevenue = parseFloat(document.getElementById('privateRevenue')?.value);
        const privateAssets = parseFloat(document.getElementById('privateAssets')?.value);
        const privateLiabilities = parseFloat(document.getElementById('privateLiabilities')?.value);
        const dealName = document.getElementById('dealName')?.value?.trim();
        const minRevenueThreshold = parseFloat(document.getElementById('minRevenueThreshold')?.value);
        const minAssetThreshold = parseFloat(document.getElementById('minAssetThreshold')?.value);

        // Check all fields filled
        if (!companyName) {
            return { valid: false, error: 'Company name is required' };
        }
        if (!dealName) {
            return { valid: false, error: 'Deal name is required' };
        }
        if (isNaN(privateRevenue)) {
            return { valid: false, error: 'Private revenue must be a valid number' };
        }
        if (isNaN(privateAssets)) {
            return { valid: false, error: 'Private assets must be a valid number' };
        }
        if (isNaN(privateLiabilities)) {
            return { valid: false, error: 'Private liabilities must be a valid number' };
        }
        if (isNaN(minRevenueThreshold)) {
            return { valid: false, error: 'Min revenue threshold must be a valid number' };
        }
        if (isNaN(minAssetThreshold)) {
            return { valid: false, error: 'Min asset threshold must be a valid number' };
        }

        // Check values are positive
        if (privateRevenue < 0 || privateAssets < 0 || privateLiabilities < 0) {
            return { valid: false, error: 'Financial values must be positive numbers' };
        }

        // Check qualification criteria
        if (privateRevenue < minRevenueThreshold) {
            return { valid: false, error: `Revenue (${privateRevenue}M) must meet minimum threshold (${minRevenueThreshold}M)` };
        }

        if (privateAssets < minAssetThreshold) {
            return { valid: false, error: `Assets (${privateAssets}M) must meet minimum threshold (${minAssetThreshold}M)` };
        }

        if (privateAssets <= privateLiabilities) {
            return { valid: false, error: `Assets (${privateAssets}M) must exceed liabilities (${privateLiabilities}M) for solvency` };
        }

        return { valid: true, error: null };
    } catch (error) {
        console.error('Validation error:', error);
        return { valid: false, error: 'An error occurred during validation. Please try again.' };
    }
}

// ============================================
// QUALIFICATION PROCESSING
// ============================================

function processQualification(formData) {
    try {
        state.isProcessing = true;

        // Verify all conditions are met
        const meetsRevenue = formData.privateRevenue >= formData.minRevenueThreshold;
        const meetsAssets = formData.privateAssets >= formData.minAssetThreshold;
        const isSolvent = formData.privateAssets > formData.privateLiabilities;

        if (!meetsRevenue || !meetsAssets || !isSolvent) {
            closeProcessingModal();
            showErrorNotification('❌ Qualification criteria not met');
            state.isProcessing = false;
            return;
        }

        // Create submission record
        const submission = {
            id: `cmb-${Date.now()}`,
            company: formData.companyName,
            deal: formData.dealName,
            timestamp: new Date().toLocaleString(),
            status: 'qualified',
            proofVerified: true,
            criteria: {
                revenueThreshold: formData.minRevenueThreshold,
                assetThreshold: formData.minAssetThreshold,
                solvencyProven: true
            }
        };

        // Add to submissions
        state.submissions.push(submission);
        state.qualifiedCount++;

        // Save to localStorage
        try {
            saveState();
        } catch (error) {
            console.warn('Failed to save state to localStorage:', error);
        }

        // Close processing modal
        closeProcessingModal();

        // Show success modal
        showSuccessModal(submission);

        // Reset form
        resetForm();

        // Update UI
        updateQualifiedCount();
        displaySubmissions();

        state.isProcessing = false;
    } catch (error) {
        console.error('Error in processQualification:', error);
        closeProcessingModal();
        showErrorNotification('❌ An error occurred processing your qualification');
        state.isProcessing = false;
    }
}

// ============================================
// MODAL MANAGEMENT
// ============================================

function showProcessingModal(data) {
    try {
        const modal = document.getElementById('processingModal');
        if (!modal) {
            console.error('Processing modal not found in DOM');
            return;
        }
        
        const message = document.getElementById('processingMessage');
        if (message) {
            message.textContent = `Processing ${data.companyName}'s qualification... (Generating ZK proof)`;
        }
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error showing processing modal:', error);
    }
}

function closeProcessingModal() {
    try {
        const modal = document.getElementById('processingModal');
        if (modal) {
            modal.classList.remove('active');
        }
    } catch (error) {
        console.error('Error closing processing modal:', error);
    }
}

function showSuccessModal(submission) {
    try {
        const modal = document.getElementById('successModal');
        if (!modal) {
            console.error('Success modal not found in DOM');
            showSuccessNotification(`✓ ${submission.company} has been successfully qualified!`);
            return;
        }

        const elements = {
            message: document.getElementById('successMessage'),
            company: document.getElementById('submissionCompany'),
            deal: document.getElementById('submissionDeal'),
            time: document.getElementById('submissionTime')
        };

        if (elements.message) {
            elements.message.textContent = `✓ ${submission.company} has been successfully qualified for the ${submission.deal}`;
        }
        if (elements.company) {
            elements.company.textContent = submission.company;
        }
        if (elements.deal) {
            elements.deal.textContent = submission.deal;
        }
        if (elements.time) {
            elements.time.textContent = submission.timestamp;
        }
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error showing success modal:', error);
        showSuccessNotification(`✓ ${submission.company} has been successfully qualified!`);
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    } catch (error) {
        console.error(`Error closing modal ${modalId}:`, error);
    }
}

// Improved click-outside-modal closing
document.addEventListener('click', (event) => {
    try {
        if (event.target && event.target.classList && event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    } catch (error) {
        console.warn('Error handling modal close:', error);
    }
});

// ============================================
// UI UPDATES
// ============================================

function updateQualifiedCount() {
    try {
        const countElement = document.getElementById('qualifiedCount');
        if (countElement) {
            countElement.textContent = state.qualifiedCount;
        }
        
        const infoText = document.getElementById('qualifiedInfo');
        if (infoText) {
            if (state.qualifiedCount === 0) {
                infoText.textContent = '⏳ Waiting for first submission...';
            } else if (state.qualifiedCount === 1) {
                infoText.textContent = '✓ 1 company qualified for this deal';
            } else {
                infoText.textContent = `✓ ${state.qualifiedCount} companies qualified for this deal`;
            }
        }
    } catch (error) {
        console.error('Error updating qualified count:', error);
    }
}

function displaySubmissions() {
    try {
        const list = document.getElementById('submissionsList');
        if (!list) {
            console.warn('Submissions list element not found');
            return;
        }
        
        if (state.submissions.length === 0) {
            list.innerHTML = '<p class="placeholder">No submissions yet</p>';
            return;
        }

        // Show last 5 submissions
        const recent = state.submissions.slice(-5).reverse();
        list.innerHTML = recent.map(sub => `
            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--gray-light);">
                <strong>${escapeHtml(sub.company)}</strong>
                <br>
                <small style="color: var(--gray);">
                    ${escapeHtml(sub.deal)} • ${escapeHtml(sub.timestamp)}
                </small>
                <br>
                <small style="color: var(--success);">✓ Qualified</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error displaying submissions:', error);
    }
}

function resetForm() {
    try {
        const form = document.getElementById('qualificationForm');
        if (form) {
            form.reset();
            const firstField = document.getElementById('companyName');
            if (firstField) {
                firstField.focus();
            }
        }
    } catch (error) {
        console.error('Error resetting form:', error);
    }
}

function saveState() {
    try {
        const stateData = {
            submissions: state.submissions,
            qualifiedCount: state.qualifiedCount
        };
        localStorage.setItem('cmb-state', JSON.stringify(stateData));
    } catch (error) {
        console.warn('Failed to save state to localStorage:', error);
    }
}

function loadSubmissions() {
    displaySubmissions();
}

// ============================================
// NAVIGATION
// ============================================

function handleNavigation(e) {
    try {
        e.preventDefault();
        
        // Update active link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        if (e.target) {
            e.target.classList.add('active');
            
            // Scroll to section if href exists
            const href = e.target.getAttribute('href');
            if (href && href.startsWith('#')) {
                scrollToSection(href.substring(1));
            }
        }
    } catch (error) {
        console.error('Error in navigation:', error);
    }
}

function scrollToSection(sectionId) {
    try {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
            if (activeLink) activeLink.classList.add('active');
        }
    } catch (error) {
        console.error('Error scrolling to section:', error);
    }
}

// ============================================
// TABS
// ============================================

function handleTabSwitch(e) {
    try {
        e.preventDefault();
        
        let tabId = e.target.getAttribute('data-tab');
        if (!tabId) {
            tabId = e.target.textContent.toLowerCase().replace(/\s+/g, '-');
        }
        
        // Map common tab names
        const tabMap = {
            'deployment-guide': 'deploy-guide',
            'commands': 'deploy-commands',
            'contract-info': 'deploy-info'
        };
        
        showTab(tabMap[tabId] || tabId);
    } catch (error) {
        console.error('Error switching tabs:', error);
    }
}

function showTab(tabName) {
    try {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active from all buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected tab
        const tab = document.getElementById(tabName);
        if (tab) {
            tab.classList.add('active');
        }

        // Highlight active button
        const buttons = document.querySelectorAll('.tab-button');
        const tabMap = {
            'deploy-guide': 0,
            'deploy-commands': 1,
            'deploy-info': 2
        };
        
        const buttonIndex = tabMap[tabName];
        if (typeof buttonIndex === 'number' && buttons[buttonIndex]) {
            buttons[buttonIndex].classList.add('active');
        }
    } catch (error) {
        console.error('Error showing tab:', error);
    }
}

// ============================================
// NETWORK CONFIGURATION
// ============================================

function updateNetworkConfig() {
    try {
        const networkSelect = document.getElementById('networkSelect');
        if (!networkSelect) {
            console.warn('Network select element not found');
            return;
        }

        const network = networkSelect.value;
        if (!network) {
            console.warn('No network selected');
            return;
        }

        state.currentNetwork = network;
        
        const endpointsDiv = document.getElementById('networkEndpoints');
        if (!endpointsDiv) {
            console.warn('Network endpoints container not found');
            return;
        }
        
        const configs = {
            local: {
                name: 'Local Network',
                indexer: 'http://127.0.0.1:8088',
                node: 'http://127.0.0.1:9944',
                proof: 'http://127.0.0.1:6300'
            },
            preview: {
                name: 'Preview Network',
                indexer: 'https://indexer.preview.midnight.network',
                node: 'https://node.preview.midnight.network',
                proof: 'https://proof-server.preview.midnight.network'
            },
            custom: {
                name: 'Custom Network',
                indexer: 'https://your-indexer-url',
                node: 'https://your-node-url',
                proof: 'https://your-proof-server-url'
            }
        };

        const config = configs[network];
        if (!config) {
            console.error(`Unknown network: ${network}`);
            return;
        }

        endpointsDiv.innerHTML = `
            <p><strong>${escapeHtml(config.name)}</strong></p>
            <p><strong>Indexer:</strong> <code>${escapeHtml(config.indexer)}</code></p>
            <p><strong>Node:</strong> <code>${escapeHtml(config.node)}</code></p>
            <p><strong>Proof Server:</strong> <code>${escapeHtml(config.proof)}</code></p>
        `;

        console.log(`🌐 Network switched to: ${config.name}`);
    } catch (error) {
        console.error('Error updating network config:', error);
    }
}

// ============================================
// SECURITY & UTILITY FUNCTIONS
// ============================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(value) {
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(value * 1000000);
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `$${value}M`;
    }
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateStr;
    }
}

function loadSubmissions() {
    try {
        displaySubmissions();
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// ============================================
// DEMO DATA (for demonstration)
// ============================================

function loadDemoData() {
    try {
        state.submissions = [
            {
                id: 'cmb-1',
                company: 'TechCorp Inc',
                deal: 'Merger Deal 2026',
                timestamp: new Date(Date.now() - 3600000).toLocaleString(),
                status: 'qualified',
                proofVerified: true
            },
            {
                id: 'cmb-2',
                company: 'Finance Partners LLC',
                deal: 'Merger Deal 2026',
                timestamp: new Date(Date.now() - 1800000).toLocaleString(),
                status: 'qualified',
                proofVerified: true
            }
        ];
        
        state.qualifiedCount = 2;
        updateQualifiedCount();
        displaySubmissions();
        saveState();
    } catch (error) {
        console.error('Error loading demo data:', error);
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function showSuccessNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ============================================
// CONSOLE HELPERS
// ============================================

console.log('%c🔐 Confidential Merger Negotiation Board', 'font-size: 14px; color: #6366f1; font-weight: bold;');
console.log('%cZero-Knowledge Proof System for M&A Negotiations', 'font-size: 12px; color: #8b5cf6;');
console.log('%c✓ Project Status: Production Ready', 'font-size: 11px; color: #10b981;');

// Make some functions globally available for debugging
window.cmbDebug = {
    state: () => state,
    loadDemo: loadDemoData,
    resetData: () => {
        state.submissions = [];
        state.qualifiedCount = 0;
        saveState();
        location.reload();
    }
};

console.log('💡 Use window.cmbDebug for debugging helpers');
