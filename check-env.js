#!/usr/bin/env node

/**
 * BME Research Accelerator - Environment Check Script
 * Run: node check-env.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 BME Research Accelerator - Environment Check\n');
console.log('=' .repeat(50));

let allPassed = true;

// 1. Node.js version
console.log('\n📦 Runtime Environment:');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`  ✅ Node.js: ${nodeVersion} (>= 18 required)`);
} else {
  console.log(`  ❌ Node.js: ${nodeVersion} (need >= 18)`);
  allPassed = false;
}

// 2. Package manager
try {
  const pnpmResult = require('child_process').execSync('pnpm --version').toString().trim();
  console.log(`  ✅ pnpm: ${pnpmResult}`);
} catch {
  try {
    const npmResult = require('child_process').execSync('npm --version').toString().trim();
    console.log(`  ⚠️  npm: ${npmResult} (pnpm recommended)`);
  } catch {
    console.log('  ❌ No package manager found');
    allPassed = false;
  }
}

// 3. Dependencies
console.log('\n📚 Dependencies:');
const pkgPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  // Critical dependencies
  const criticalDeps = ['next', 'react', 'react-dom', 'typescript', 'pdf-parse', 'pdfjs-dist'];
  criticalDeps.forEach(dep => {
    if (deps[dep]) {
      console.log(`  ✅ ${dep}: ${deps[dep]}`);
    } else {
      console.log(`  ❌ ${dep}: MISSING`);
      allPassed = false;
    }
  });
  
  // Count total deps
  console.log(`\n  📊 Total dependencies: ${Object.keys(deps).length}`);
} else {
  console.log('  ❌ package.json not found');
  allPassed = false;
}

// 4. Configuration files
console.log('\n⚙️  Configuration Files:');
const configFiles = [
  { file: '.env.local', desc: 'Environment variables (API keys)', optional: true },
  { file: '.eslintrc.json', desc: 'ESLint configuration' },
  { file: '.prettierrc', desc: 'Prettier configuration' },
  { file: '.editorconfig', desc: 'Editor configuration' },
  { file: 'tsconfig.json', desc: 'TypeScript configuration' },
  { file: 'next.config.mjs', desc: 'Next.js configuration' },
  { file: '.gitignore', desc: 'Git ignore rules' },
  { file: 'Dockerfile', desc: 'Docker build config (optional)', optional: true },
];

configFiles.forEach(({ file, desc, optional }) => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`  ✅ ${file}`);
  } else if (optional) {
    console.log(`  ⚪ ${file} (${desc}) - optional`);
  } else {
    console.log(`  ❌ ${file} (${desc}) - MISSING`);
    allPassed = false;
  }
});

// 5. API Endpoints (check if they exist)
console.log('\n🌐 API Routes:');
const apiDir = path.join(__dirname, 'app/api');
if (fs.existsSync(apiDir)) {
  const routes = fs.readdirSync(apiDir);
  routes.forEach(route => {
    const routePath = path.join(apiDir, route, 'route.ts') || path.join(apiDir, route, 'route.js');
    if (fs.existsSync(routePath) || fs.existsSync(routePath.replace('.ts', '.js'))) {
      console.log(`  ✅ /api/${route}`);
    }
  });
  console.log(`  📊 Total API endpoints: ${routes.length}`);
} else {
  console.log('  ⚠️  No API routes found (will be created on build)');
}

// 6. UI Components
console.log('\n🎨 UI Components:');
const uiDir = path.join(__dirname, 'components/ui');
if (fs.existsSync(uiDir)) {
  const components = fs.readdirSync(uiDir).filter(f => f.endsWith('.tsx'));
  console.log(`  ✅ shadcn/ui components: ${components.length} installed`);
} else {
  console.log('  ⚠️  No UI components found');
}

// Final result
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All checks passed! Ready to run.\n');
  console.log('Next steps:');
  console.log('  1. Ensure .env.local has your API key');
  console.log(' 2. Run: pnpm dev');
  console.log('  3. Open: http://localhost:3000\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
