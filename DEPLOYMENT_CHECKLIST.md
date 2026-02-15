# ✅ Deployment Checklist & Runbook

Complete step-by-step guide for deploying the Confidential Merger Negotiation Board to production.

## 📋 Pre-Deployment Verification

### System Requirements
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm v9+ installed (`npm --version`)
- [ ] Git installed (optional)
- [ ] 2GB disk space available
- [ ] Port 3000 available
- [ ] Port 8000-8002 available (if local network)
- [ ] Modern browser (Chrome, Firefox, Safari, Edge)

### Repository Setup
- [ ] Code cloned/copied to workspace
- [ ] All files present in directory structure
- [ ] No build artifacts from previous attempts
- [ ] Clean terminal/command prompt ready

## 🔧 Phase 1: Installation & Build

### Step 1.1: Install Dependencies

```bash
# Navigate to project root
cd Confidential-Merger-Negotiation-Board

# Install all npm packages
npm install

# Expected: 50-100 packages installed
# Time: 1-3 minutes depending on internet
```

**Verification:**
```bash
# Should show list of installed packages
npm list --depth=0

# Check for any missing peer dependencies
npm ls
```

**✅ Success Criteria:**
- No ERR messages
- All packages installed to node_modules/
- `npm list` shows the project packages

---

### Step 1.2: Build the Project

```bash
# Full build (contract + TypeScript)
npm run build

# Expected output:
# > npm run compile:confidential
# > compact compile src/Confidential.compact src/managed/confidential
# > tsc
# (completed successfully)
```

**Verification:**
```bash
# Check for compiled files
ls -la dist/
ls -la src/managed/confidential/

# Should show: contract, compiler, keys, zkir folders
```

**✅ Success Criteria:**
- Build completes with **0 errors**
- `dist/` folder created with TypeScript output
- No warnings (warnings are OK)
- Contract files in `src/managed/confidential/`

---

## 🎯 Phase 2: Frontend Setup

### Step 2.1: Verify Frontend Files

```bash
# Check all frontend files exist
ls -la frontend/

# Should show:
# index.html
# styles.css
# script.js
# server.js
# README.md
```

**✅ Success Criteria:**
- All 5 files present
- No syntax errors in JavaScript
- File sizes reasonable (html: 20-30KB, css: 15-20KB, js: 10-15KB)

---

### Step 2.2: Test Frontend Server

```bash
# Terminal 1: Start frontend server
npm run frontend

# Expected output:
# Server running on http://localhost:3000
# Press Ctrl+C to stop

# Terminal 2: Test connectivity
curl http://localhost:3000

# You should get HTML content back
```

**Verification in Browser:**
```
1. Open: http://localhost:3000
2. Should see: Hero section with "Confidential Merger Negotiation Board"
3. Page should be fully styled (colors, fonts, layout)
4. All navigation links should be clickable
```

**✅ Success Criteria:**
- Server starts without errors
- Page loads in browser
- All styling visible
- Console shows no errors (F12)
- No 404 errors for resources

---

## 🚀 Phase 3: Smart Contract Deployment

### Step 3.1: Set Up Network Connection

**For Local Network:**
```bash
# Ensure local network is running (separate process)
# Typically: docker run midnight-network

# Verify connection
curl http://localhost:8000/health

# Should show: {"status":"healthy"}
```

**For Preview Network:**
```bash
# No setup needed, uses public endpoints
# Just verify internet connection
ping preview-zswap.midnight.network
```

**For Custom Network:**
```bash
# Note your network endpoints:
# ZSWAP: [your-zswap-endpoint]
# INDEXER: [your-indexer-endpoint]
# PROVER: [your-prover-endpoint]

# Verify each endpoint is reachable
curl [your-zswap-endpoint]/health
```

**✅ Success Criteria:**
- Network responds to health check
- Connection is stable
- Endpoints are noted and correct

---

### Step 3.2: Deploy Contract

```bash
# Terminal 3: Deploy to network
npm run deploy:confidential

# Expected output will be similar to:
# [INFO] Deploying Confidential contract...
# [INFO] Wallet set up
# [INFO] Contract deployed successfully
# [INFO] Contract address: midnight1...
# [INFO] Network: [network-url]
# [INFO] Transaction hash: 0x...
```

**📝 Important: Save These Values**

Create a `.env.production` file or note these down:

```
CONTRACT_ADDRESS=midnight1...
NETWORK_ZSWAP=http://localhost:8000  (or https://preview...)
NETWORK_INDEXER=http://localhost:8001
NETWORK_PROVER=http://localhost:8002
DEPLOYMENT_TXHASH=0x...
DEPLOYMENT_TIMESTAMP=2024-02-15T...
```

**✅ Success Criteria:**
- Deployment completes without errors
- Contract address is output
- No "insufficient funds" errors
- Transaction is mined (check blockchain explorer)

---

### Step 3.3: Verify Deployment

```bash
# Verify contract is accessible
npm run verify:network

# Expected output:
# [INFO] Verifying deployment...
# [INFO] Contract found at: [address]
# [INFO] Contract callable: ✓
# [INFO] Network connection: ✓
# [INFO] Ready for use ✓
```

**Additional Verification:**
```bash
# Check blockchain explorer (if available)
# Search for transaction hash
# Verify contract is listed as "verified"

# Check current qualified count
curl -X POST http://localhost:8000/contract/query \
  -d '{"function": "get_qualified_count"}' \
  -H "Content-Type: application/json"
```

**✅ Success Criteria:**
- Verification script returns success
- Contract address is valid
- get_qualified_count returns 0 or valid number
- No timeout errors

---

## 🔌 Phase 4: Frontend-Contract Integration

### Step 4.1: Update Frontend Configuration

**Edit: `frontend/script.js`**

Find this section (around line 20-50):

```javascript
const NETWORKS = {
  local: {
    zswapEndpoint: 'http://localhost:8000',
    indexer: 'http://localhost:8001',
    prover: 'http://localhost:8002',
    contractAddress: '[REPLACE_WITH_YOUR_ADDRESS]'
  },
```

Replace `[REPLACE_WITH_YOUR_ADDRESS]` with actual contract address from Step 3.2

**Example:**
```javascript
contractAddress: 'midnight1qyfn76anzj5r5dakllqe0v76npry5wt3r6pnwz6xhnjvvml59'
```

**✅ Success Criteria:**
- Contract address is updated
- Network endpoints are correct
- No syntax errors (check console)
- File saves without errors

---

### Step 4.2: Test Form Submission

**In Browser:**

1. Open: http://localhost:3000
2. Scroll to "Qualification Form" section
3. Fill in test data:
   ```
   Company Name: Test Corp
   Private Revenue: 1000000
   Private Assets: 5000000
   Private Liabilities: 1000000
   Deal Name: Test Deal
   Min Revenue Threshold: 500000
   Min Asset Threshold: 2000000
   ```
4. Click "Submit for Qualification"
5. Watch for processing modal
6. Wait 2-10 seconds for result
7. Check console (F12) for any errors

**Expected Sequence:**
```
1. "Processing your qualification..."
2. [Generating ZK proof...]
3. [Submitting to blockchain...]
4. Success modal appears (or error modal)
5. Dashboard updates with new count
6. Page caches submission in localStorage
```

**✅ Success Criteria:**
- Form submits without JavaScript errors
- Processing modal appears
- Success or specific error message shown
- No network timeout errors
- Dashboard count updates

---

## 📊 Phase 5: Complete System Testing

### Step 5.1: Test All Features

**Navigation Testing:**
- [ ] All navigation links work
- [ ] Smooth scrolling to sections
- [ ] Mobile menu (if applicable)

**Form Testing:**
- [ ] All form fields accept input
- [ ] Validation works (try invalid numbers)
- [ ] Error messages appear correctly
- [ ] Tab order is logical (keyboard navigation)

**UI Elements Testing:**
- [ ] All buttons are clickable
- [ ] Modals open and close properly
- [ ] Status updates in real-time
- [ ] Responsive design (test on mobile)

**Data Testing:**
- [ ] Submissions persist in localStorage
- [ ] Qualified count increments correctly
- [ ] No data loss on page refresh
- [ ] Multiple submissions work

**Network Testing:**
- [ ] Switch between networks in dropdown
- [ ] Each network shows correct endpoint
- [ ] Submissions work on different networks
- [ ] No CORS errors

---

### Step 5.2: Browser Console Check

Open Developer Tools (F12), Check Console tab:

```javascript
// Should see clean startup messages
// Should NOT see:
// - Uncaught errors (red)
// - Failed to fetch (network issues)
// - Module not found
// - Undefined references

// Should be able to run:
window.cmbDebug.state()           // View current state
window.cmbDebug.loadDemo()        // Load test data
window.cmbDebug.resetData()       // Clear all
```

**✅ Success Criteria:**
- No red error messages
- Console is clean
- Debug functions available
- No warnings about mixed content (http/https)

---

### Step 5.3: Security Verification

**Check Private Data:**
```javascript
// In browser console:
const state = window.cmbDebug.state();
console.log(state.submissions);

// Should see:
// - Company names (OK to see)
// - NO raw revenue numbers (should be hidden)
// - NO asset numbers (should be hidden)
// - NO liability numbers (should be hidden)
// - Only proof hash (OK to see)
```

**✅ Success Criteria:**
- Private financial data NOT in localStorage
- Only proof hashes stored
- Network requests don't include raw data
- Form data not sent to analytics

---

## 🌐 Phase 6: Production Deployment

### Step 6.1: Choose Hosting

**Option A: Static Hosting (Recommended for v1)**

Platforms:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Azure Static Web Apps

**Deployment:**
```bash
# Copy frontend files
cp -r frontend/* ./deploy/

# Remove server.js (not needed on static host)
rm ./deploy/server.js

# Deploy folder contents
```

**Option B: Server Hosting**

Platforms:
- Node.js server (Heroku, Railway, Render)
- Docker container (AWS ECS, Google Cloud Run)
- Traditional VPS (DigitalOcean, Linode)

**Deployment:**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY frontend/ .
EXPOSE 3000
CMD ["node", "server.js"]
```

**Option C: Local Server (dev/demo only)**

```bash
# Keep running: npm run frontend
# Access via: http://localhost:3000
# Share via ngrok: ngrok http 3000
```

### Step 6.2: Configure Production Environment

**Create: `.env.production`**

```
# Network Configuration
VITE_NETWORK=preview
VITE_CONTRACT_ADDRESS=midnight1...
VITE_ZSWAP_ENDPOINT=https://preview-zswap.midnight.network
VITE_INDEXER_ENDPOINT=https://preview-indexer.midnight.network
VITE_PROVER_ENDPOINT=https://preview-prover.midnight.network

# Application Settings
VITE_APP_NAME=Confidential Merger Negotiation Board
VITE_APP_VERSION=1.0.0
VITE_ANALYTICS_DISABLED=true
```

**Update Frontend:**
```javascript
// In script.js, read from environment:
const config = {
  network: process.env.VITE_NETWORK || 'local',
  contractAddress: process.env.VITE_CONTRACT_ADDRESS,
  endpoints: {
    zswap: process.env.VITE_ZSWAP_ENDPOINT,
    indexer: process.env.VITE_INDEXER_ENDPOINT,
    prover: process.env.VITE_PROVER_ENDPOINT
  }
};
```

**✅ Success Criteria:**
- Environment variables are set
- No hardcoded addresses in production code
- Configuration loads from environment
- Secrets are not committed to git

---

### Step 6.3: Final Production Test

**Before Going Live, Test:**

1. **Load Test**: Can 10+ users use simultaneously?
2. **Stress Test**: Try 100 rapid submissions
3. **Network Failover**: What if prover is down?
4. **Mobile Test**: Works on all major devices?
5. **Accessibility Test**: Screen reader compatibility?
6. **Security Scan**: OWASP Top 10 check?

**Test Checklist:**
```bash
# Performance (Lighthouse in Chrome)
# Accessibility (axe DevTools)
# Security (npm audit)
npm audit

# Load testing
ab -n 100 -c 10 https://your-domain.com/
```

**✅ Success Criteria:**
- Lighthouse score: 90+
- Security audit: 0 critical issues
- 100+ concurrent connections stable
- No data breaches in test
- Mobile usage smooth
- Form submission under 10s

---

## 🎯 Post-Deployment

### Step 6.4: Monitoring Setup

**Set Up Alerts For:**

- [ ] Downtime (page not loading)
- [ ] High error rate (> 5% failures)
- [ ] Slow response (> 5 seconds)
- [ ] Network issues (contract unreachable)
- [ ] Contract failures (submission rejects)

**Monitoring Tools:**
- Sentry (error tracking)
- DataDog (performance monitoring)
- Logz.io (log management)
- Grafana (dashboards)
- CloudFlare (DDoS protection)

### Step 6.5: Maintenance Schedule

```
Daily:
  - Monitor error logs
  - Check contract function (get_qualified_count)
  - Review new submissions

Weekly:
  - Backup data
  - Check for security updates
  - Review analytics

Monthly:
  - Performance report
  - User feedback review
  - Update dependencies (npm audit fix)
```

---

## ✅ Completion Verification

**Project is Ready for Production When:**

- [x] All builds complete with 0 errors
- [x] Frontend loads and styled correctly
- [x] Form submissions work end-to-end
- [x] Blockchain integration confirmed
- [x] Private data stays private
- [x] No console errors in production
- [x] Mobile responsive
- [x] Performance acceptable (< 3s load)
- [x] Security audit passed
- [x] Monitoring in place
- [x] Documentation complete
- [x] Backup/recovery plan ready

---

## 🆘 Deployment Troubleshooting

### Build Fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill it
kill -9 [PID]

# Or change port in frontend/server.js
```

### Contract Deployment Fails

```bash
# Check balance
npm run verify:network

# Try again with more gas
npm run deploy:confidential -- --gas=5000000
```

### Frontend Won't Load

```bash
# Check server is running
curl http://localhost:3000

# Check console for network errors (F12)
# Check CORS headers
# Verify contract address is set
```

### Zero Submissions

```bash
# Contract might not be callable
# Verify with:
npm run verify:network

# Check wallet has gas/funds
# Try a test submission in browser console
```

---

## 📞 Support Resources

- **Issues**: Check browser console (F12)
- **Errors**: Search error message in docs
- **Questions**: Review FRONTEND_INTEGRATION.md
- **Contract**: See DEPLOYMENT_GUIDE.md
- **Quick help**: QUICK_REFERENCE.md

---

## 📊 Deployment Timeline

- Phase 1 (Install): 5-10 minutes
- Phase 2 (Frontend): 5 minutes
- Phase 3 (Contract): 10-20 minutes
- Phase 4 (Integration): 5-10 minutes
- Phase 5 (Testing): 15-30 minutes
- Phase 6 (Production): 20-60 minutes depending on host

**Total: 60-130 minutes (1-2 hours)**

---

## ✨ Success! 🎉

Once all phases complete:

✅ Your Confidential Merger Negotiation Board is **LIVE**

Users can now:
- Visit your hosted URL
- Fill out qualification forms
- Submit zero-knowledge proofs
- See their status
- Trust blockchain records

**Congratulations on a successful deployment!**

---

Built for the Midnight Network 🌙

Last Updated: February 15, 2024
Version: 1.0.0
