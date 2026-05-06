@echo off
REM ===========================================
REM BME Research Accelerator - Windows Setup Script
REM Run: setup.bat (double-click or in CMD)
REM ===========================================

echo.
echo ==========================================
echo   BME Research Accelerator - Setup Script
echo ==========================================
echo.

REM 1. Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)
echo       ✅ Node.js found: 
node --version

REM 2. Check pnpm
echo.
echo [2/5] Checking pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo       📦 Installing pnpm...
    npm install -g pnpm
) else (
    echo       ✅ pnpm found:
    pnpm --version
)

REM 3. Install dependencies
echo.
echo [3/5] Installing dependencies...
if not exist node_modules (
    call pnpm install
    echo       ✅ Dependencies installed
) else (
    echo       ✅ Dependencies already installed ^(skipping^)
)

REM 4. Check environment config
echo.
echo [4/5] Checking environment configuration...
if not exist .env.local (
    echo       ⚠️  .env.local not found, creating from template...
    copy .env.example .env.local >nul
    echo       ✅ Created .env.local
    echo.
    echo       📝 IMPORTANT: Edit .env.local and add your API key!
    echo              notepad .env.local
) else (
    echo       ✅ .env.local exists
)

REM 5. Verify build
echo.
echo [5/5] Verifying build...
if exist .next rmdir /s /q .next
call pnpm build
if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   🎉 Setup Complete!
    echo ==========================================
    echo.
    echo   Next steps:
    echo     1. Edit .env.local with your API key
    echo     2. Start development server: pnpm dev
    echo     3. Open http://localhost:3000
    echo.
    echo   Useful commands:
    echo     pnpm dev      - Start development server
    echo     pnpm build    - Build for production
    echo     pnpm start    - Start production server
    echo     pnpm lint     - Run ESLint
    echo.
) else (
    echo.
    echo   ❌ Build failed. Please check errors above.
)

pause
