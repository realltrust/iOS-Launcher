#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Unsetting poisoned signing env vars (for this build)"
unset WIN_CSC_LINK CSC_LINK 2>/dev/null || true

echo "==> Clearing electron-builder signing cache"
rm -rf "$LOCALAPPDATA/electron-builder/Cache/winCodeSign" 2>/dev/null || true

echo "==> Ensuring cross-env is installed"
npm install --save-dev cross-env >/dev/null

echo "==> Patching package.json"
node - <<'__NODE__'
import { readFile, writeFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));

// Nice-to-have: silence electron-builder warnings
pkg.description = pkg.description || 'Professional typing instructor for web and desktop.';
pkg.author      = pkg.author      || 'Typing Instructor';

pkg.scripts = pkg.scripts || {};
const env = 'cross-env CSC_IDENTITY_AUTO_DISCOVERY=false';

// Only CSC_IDENTITY_AUTO_DISCOVERY is set. WIN_CSC_LINK / CSC_LINK are NOT.
pkg.scripts['electron:dev']   = `${env} node scripts/make-icon.mjs && vite build && electron .`;
pkg.scripts['electron:build'] = `${env} node scripts/make-icon.mjs && tsc && vite build && electron-builder --win`;

pkg.build = pkg.build || {};
pkg.build.win = pkg.build.win || {};
pkg.build.win.forceCodeSigning = false;

await writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  ✓ package.json updated');
__NODE__

echo
echo "==> Building"
npm run electron:build
