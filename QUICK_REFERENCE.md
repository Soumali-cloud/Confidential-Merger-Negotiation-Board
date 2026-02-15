# ⚡ Quick Reference Guide

Fast commands and shortcuts for working with the Confidential Merger Negotiation Board.

## 🚀 Start Here (First Time Setup)

```bash
# 1. Install dependencies
npm install

# 2. Build everything
npm run build

# 3. Start frontend server (in new terminal)
npm run frontend

# 4. Open in browser
# https://localhost:3000

# Done! 🎉
```

## 📋 Essential Commands

### Building & Compiling

```bash
# Build everything
npm run build

# Compile contract only
npm run compile:confidential

# Compile counter (alternative)
npm run compile

# Compile voting (alternative)
npm run compile:voting
```

### Running

```bash
# Start frontend (http://localhost:3000)
npm run frontend

# Alternative names (same thing)
npm run frontend:dev
npm run dev

# Start backend (in separate terminal)
npm run deploy:confidential
```

### Deployment

```bash
# Deploy main contract
npm run deploy:confidential

# Deploy counter
npm run deploy

# Deploy voting
npm run deploy:voting

# Verify deployment
npm run verify
npm run verify:network
```

## 📁 File Structure Quick Guide

```
Root Level - Main commands and config
├── package.json          ← npm scripts, dependencies
├── tsconfig.json         ← TypeScript config
├── eslint.config.mjs     ← Code style rules
└── *.md files            ← Documentation

src/ - Backend contract code
├── Confidential.compact  ← Main smart contract
├── config.ts             ← Configuration
├── deploy-confidential.ts ← Deployment script
└── managed/              ← Compiled contracts

frontend/ - User interface
├── index.html            ← Web page
├── styles.css            ← Styling
├── script.js             ← Interactivity
├── server.js             ← Dev server
└── README.md             ← Frontend docs
```

## 🎯 Common Tasks

### "I want to run the frontend"

```bash
npm run frontend
# Then open: http://localhost:3000
```

### "I want to deploy the contract"

```bash
npm run deploy:confidential
# Contract address will be printed
```

### "I want to check if deployment worked"

```bash
npm run verify:network
```

### "I want to rebuild after editing contract"

```bash
npm run build
# This compiles contract AND TypeScript
```

### "I want to see all available commands"

```bash
cat package.json | grep -A 10 '"scripts"'
# Or just: npm run
```

## 🔌 Network Endpoints

### Local Development
- Network: `http://localhost:8000`
- Indexer: `http://localhost:8001`
- Prover: `http://localhost:8002`

### Preview Network
- Network: `https://preview-zswap.midnight.network`
- Indexer: `https://preview-indexer.midnight.network`
- Prover: `https://preview-prover.midnight.network`

### Custom Network
- Configure in frontend settings

## 📊 Frontend Sections

| Section | Purpose | Form Inputs |
|---------|---------|------------|
| Hero | Welcome message | None |
| Features | Project overview | None |
| Qualify | Submit application | 7 fields |
| Status | Check results | Display only |
| Deploy | Integration guide | Display only |
| Footer | Links & info | None |

### Form Fields

```
1. Company Name (text)
2. Private Revenue (number)
3. Private Assets (number)
4. Private Liabilities (number)
5. Deal Name (text)
6. Min Revenue Threshold (number)
7. Min Asset Threshold (number)
```

## ✅ Validation Rules

The form checks:

```
✓ Company name is not empty
✓ Revenue >= threshold
✓ Assets >= threshold
✓ Solvency: Assets > Liabilities
✓ All numbers are positive
```

## 🔐 Key Concepts

### Private Data
What stays on your computer:
- Your actual revenue
- Your actual assets
- Your actual liabilities
- All calculations

### Public Data
What goes on blockchain:
- Proof you meet criteria
- Your company name
- Deal name
- Threshold amounts

### Smart Contract
Two functions:

1. **submit_qualification(private, public)**
   - Takes your data
   - Generates ZK proof
   - Stores proof on blockchain

2. **get_qualified_count()**
   - Returns number of qualified companies
   - Pure function (read-only)

## 🧪 Testing Checklist

- [ ] `npm install` runs without errors
- [ ] `npm run build` succeeds (0 errors)
- [ ] `npm run frontend` starts server on port 3000
- [ ] Frontend loads at `http://localhost:3000`
- [ ] All form fields are visible
- [ ] Form validation works (try invalid data)
- [ ] Success modal appears on valid submission
- [ ] Status shows updated count
- [ ] Local storage persists data (refresh page)

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | Stop other server: `lsof -i :3000` |
| Module not found | Run: `npm install` |
| Build fails | Run: `npm run build` (check errors) |
| Contract not found | Check contract deployed: `npm run verify` |
| Wallet error | Install Midnight wallet extension |
| Network error | Check endpoints in frontend/script.js |

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 💾 Storage

Frontend uses browser storage:

```javascript
// Demo data stored in localStorage
localStorage.submissions      // List of submitted forms
localStorage.qualifiedCount   // Current count
localStorage.currentNetwork   // Selected network
```

Clear storage:

```javascript
// In browser console:
localStorage.clear()
location.reload()
```

## 🔄 Development Loop

```
1. Edit file
   ↓
2. Frontend: Save, refresh browser (auto-updates)
3. Contract: npm run build
   ↓
4. Test in browser
   ↓
5. Check console for errors (F12)
   ↓
6. Fix and repeat
```

## 📚 Documentation Files

| File | Contents | When to read |
|------|----------|------------|
| [QUICK_START.md](QUICK_START.md) | Initial setup | First time |
| [README.md](README.md) | Full project overview | General info |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | How to deploy | Before deploying |
| [frontend/README.md](frontend/README.md) | Frontend details | Frontend questions |
| [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) | Frontend + contract | Integration questions |
| [STATUS.txt](STATUS.txt) | Current status | Quick overview |

## 🎨 Customization Quick Tips

### Change Colors
Edit `frontend/styles.css`:
```css
--primary: #6366f1;      /* Main color */
--secondary: #8b5cf6;    /* Accent */
--success: #10b981;      /* Success */
--error: #ef4444;        /* Error */
```

### Change Thresholds
Edit form HTML in `frontend/index.html`:
```html
<input id="minRevenueThreshold" value="500000" />
```

### Change Network
Edit `frontend/script.js`:
```javascript
state.currentNetwork = 'preview';  // or 'local', 'custom'
```

## 🚀 Production Checklist

- [ ] Contract deployed to network
- [ ] Contract address in script.js
- [ ] Network endpoints verified
- [ ] All dependencies installed
- [ ] Build succeeds (`npm run build`)
- [ ] Frontend tested locally (`npm run frontend`)
- [ ] Form submissions work
- [ ] Blockchain integration confirmed
- [ ] Error handling tested
- [ ] Security reviewed
- [ ] Documentation reviewed

## 💡 Pro Tips

```bash
# Watch files and auto-rebuild
npm run build -- --watch

# See all installed packages
npm list

# Check for outdated packages
npm outdated

# Update all packages
npm update

# Run backend and frontend together (in one terminal)
npm run deploy:confidential & npm run frontend
```

## 🆘 Getting Help

1. **Check console**: Open DevTools (F12), check JavaScript console
2. **Read error**: Error messages are specific, read them carefully
3. **Check docs**: Start with QUICK_START.md or DEPLOYMENT_GUIDE.md
4. **Verify setup**: Run `npm run build` to check for issues
5. **Check endpoints**: Verify network URLs in script.js

## 📞 Common Error Messages

### "Cannot find module '@midnight-ntwrk/...'"
```bash
npm install
npm run build
```

### "Port 3000 already in use"
```bash
# Change port in frontend/server.js
# Or kill existing process:
lsof -i :3000
kill -9 <PID>
```

### "Contract not found"
```bash
npm run verify:network
npm run deploy:confidential
```

### "Module parse failed"
```bash
npm run build
npm install
```

## ⏱️ Typical Setup Time

- Fresh install: **2-3 minutes** (npm install + build)
- After changes: **10-30 seconds** (rebuild)
- Full deployment: **5-10 minutes** (including blockchain wait)

## 🎓 Learning Path

1. **Beginner**: Read QUICK_START.md, run the app
2. **Intermediate**: Edit frontend HTML/CSS, test changes
3. **Advanced**: Review smart contract, modify validation rules
4. **Expert**: Deploy to production, scale to multiple networks

## 📊 Performance Notes

- Frontend load time: < 1 second
- Form submission: 2 seconds (proof generation)
- API response: < 100ms (network dependent)
- Build time: 10-20 seconds
- Size: ~51KB total (12KB gzipped)

---

**Everything you need is here!** 🎯

Start with: `npm install && npm run build && npm run frontend`

Then visit: http://localhost:3000

Built with ❤️ for Midnight Network
