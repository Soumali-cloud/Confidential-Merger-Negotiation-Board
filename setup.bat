@echo off
REM Confidential Merger Negotiation Board - Setup Script (Windows)
REM This script prepares the project for deployment

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  Confidential Merger Negotiation Board - Setup             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
echo Checking Node.js...
node --version > nul 2>&1 || (
  echo.
  echo ❌ ERROR: Node.js is not installed
  echo Install from: https://nodejs.org/ (v23 or later)
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo   ✓ Node.js: %NODE_VERSION%

REM Check npm
echo Checking npm...
npm --version > nul 2>&1 || (
  echo.
  echo ❌ ERROR: npm is not installed
  exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo   ✓ npm: %NPM_VERSION%

REM Check Git
echo Checking Git...
git --version > nul 2>&1 || (
  echo.
  echo ❌ ERROR: Git is not installed
  echo Install from: https://git-scm.com/
  exit /b 1
)
echo   ✓ Git installed

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if errorlevel 1 goto :error
echo   ✓ Dependencies installed

REM Build project
echo.
echo Building project...
call npm run build
if errorlevel 1 goto :error
echo   ✓ Project built successfully

REM Compile contract
echo.
echo Compiling Confidential contract...
call npm run compile:confidential
if errorlevel 1 goto :error
echo   ✓ Confidential contract compiled

REM Success
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✓ Setup Complete!                                         ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo   1. Configure network environment (optional):
echo      set NETWORK_ID=preview
echo      set INDEXER_URL=https://indexer.preview.midnight.network/api/v3/graphql
echo      set NODE_URL=https://node.preview.midnight.network
echo      set PROOF_SERVER_URL=https://proof-server.preview.midnight.network
echo.
echo   2. Deploy the contract:
echo      npm run deploy:confidential
echo.
echo See QUICK_START.md or DEPLOYMENT_GUIDE.md for details.
echo.
exit /b 0

:error
echo.
echo ❌ Setup failed! Check errors above.
exit /b 1
