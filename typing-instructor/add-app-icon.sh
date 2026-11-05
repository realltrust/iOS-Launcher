#!/usr/bin/env bash
# =============================================================================
# Typing Instructor — add branded app icon
# Creates a master SVG, generates PNG/ICO assets, wires them into:
#   - web favicon (<link>, manifest)
#   - Electron window icon
#   - electron-builder Windows installer/exe icon
# Run from project root.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f package.json ]; then
  echo "ERROR: run from project root (where package.json lives)."; exit 1
fi

echo "==> Installing icon build tools (sharp, png-to-ico)"
npm install --save-dev sharp png-to-ico >/dev/null

mkdir -p public build scripts

# -----------------------------------------------------------------------------
# public/icon.svg — master icon (edit this to rebrand)
# -----------------------------------------------------------------------------
cat > public/icon.svg <<'__SVG__'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Typing Instructor">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#bg)"/>
  <rect x="16" y="16" width="480" height="480" rx="112" fill="url(#sheen)"/>
  <rect x="96" y="168" width="320" height="176" rx="28" fill="none" stroke="#ffffff" stroke-width="20"/>
  <g fill="#ffffff">
    <rect x="128" y="203" width="40" height="26" rx="6"/>
    <rect x="182" y="203" width="40" height="26" rx="6"/>
    <rect x="236" y="203" width="40" height="26" rx="6"/>
    <rect x="290" y="203" width="40" height="26" rx="6"/>
    <rect x="344" y="203" width="40" height="26" rx="6"/>
    <rect x="128" y="243" width="40" height="26" rx="6"/>
    <rect x="182" y="243" width="40" height="26" rx="6"/>
    <rect x="236" y="243" width="40" height="26" rx="6"/>
    <rect x="290" y="243" width="40" height="26" rx="6"/>
    <rect x="344" y="243" width="40" height="26" rx="6"/>
    <rect x="168" y="283" width="176" height="26" rx="6"/>
  </g>
</svg>
__SVG__

# -----------------------------------------------------------------------------
# scripts/make-icon.mjs — SVG -> PNG/ICO generator
# -----------------------------------------------------------------------------
cat > scripts/make-icon.mjs <<'__MJS__'
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'public', 'icon.svg');
const svg = await readFile(svgPath);

const jobs = [
  { out: 'build/icon.png',             size: 1024 }, // electron-builder (installer + exe)
  { out: 'electron/icon.png',          size: 512  }, // BrowserWindow (dev + prod)
  { out: 'public/icon-512.png',        size: 512  }, // PWA / manifest
  { out: 'public/icon-192.png',        size: 192  }, // PWA / manifest
  { out: 'public/apple-touch-icon.png',size: 180  }, // iOS
  { out: 'public/favicon-32.png',      size: 32   },
  { out: 'public/favicon-16.png',      size: 16   },
];

// Supersample once at high DPI, resize per output.
const base = sharp(svg, { density: 512 });

for (const { out, size } of jobs) {
  const dest = path.join(root, out);
  await base.clone().resize(size, size).png().toFile(dest);
  console.log(`  ✓ ${out}  (${size}×${size})`);
}

// Multi-resolution favicon.ico (optional — browsers use SVG/PNG anyway).
try {
  const { default: pngToIco } = await import('png-to-ico');
  const sizes = [16, 32, 48, 64, 128, 256];
  const buffers = await Promise.all(
    sizes.map((s) => sharp(svg, { density: 512 }).resize(s, s).png().toBuffer())
  );
  const ico = await pngToIco(buffers);
  await writeFile(path.join(root, 'public', 'favicon.ico'), ico);
  console.log('  ✓ public/favicon.ico');
} catch (e) {
  console.warn('  ! favicon.ico skipped:', e?.message ?? e);
}

console.log('Icon generation complete.');
__MJS__

# -----------------------------------------------------------------------------
# public/manifest.webmanifest
# -----------------------------------------------------------------------------
cat > public/manifest.webmanifest <<'__MANIFEST__'
{
  "name": "Typing Instructor",
  "short_name": "Typing",
  "description": "Learn to type accurately and fast.",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#f1f5f9",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "./icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "./icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
__MANIFEST__

# -----------------------------------------------------------------------------
# index.html — favicon + manifest links
# -----------------------------------------------------------------------------
cat > index.html <<'__HTML__'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#6366f1" />
    <meta name="color-scheme" content="light dark" />
    <title>Typing Instructor</title>
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.webmanifest" />
  </head>
  <body class="bg-slate-100 dark:bg-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
__HTML__

# -----------------------------------------------------------------------------
# electron/main.cjs — pass icon to BrowserWindow
# -----------------------------------------------------------------------------
cat > electron/main.cjs <<'__EM__'
const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

function createWindow() {
  const iconPath = path.join(__dirname, 'icon.png');
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    ...(fs.existsSync(iconPath) ? { icon: iconPath } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const url = process.env.VITE_DEV_SERVER_URL;
  if (url) win.loadURL(url);
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
__EM__

# -----------------------------------------------------------------------------
# package.json — wire icon gen into scripts + electron-builder config
# -----------------------------------------------------------------------------
node - <<'__NODE__'
import { readFile, writeFile } from 'node:fs/promises';
const pkg = JSON.parse(await readFile('package.json', 'utf8'));

pkg.scripts = pkg.scripts || {};
pkg.scripts['make:icon']     = 'node scripts/make-icon.mjs';
pkg.scripts['dev']           = 'node scripts/make-icon.mjs && vite';
pkg.scripts['build']         = 'node scripts/make-icon.mjs && tsc && vite build';
pkg.scripts['electron:dev']  = 'node scripts/make-icon.mjs && vite build && electron .';
pkg.scripts['electron:build']= 'node scripts/make-icon.mjs && tsc && vite build && electron-builder --win';

pkg.build = pkg.build || {};
pkg.build.icon = 'build/icon.png';
pkg.build.win = pkg.build.win || {};
pkg.build.win.icon = 'build/icon.png';
pkg.build.win.target = pkg.build.win.target || ['nsis'];

await writeFile('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  ✓ package.json updated');
__NODE__

# -----------------------------------------------------------------------------
# .gitignore — don't commit generated icons
# -----------------------------------------------------------------------------
if ! grep -q '# generated icons' .gitignore 2>/dev/null; then
  cat >> .gitignore <<'__GI__'

# generated icons (regenerate via: npm run make:icon)
build/icon.png
electron/icon.png
public/favicon-16.png
public/favicon-32.png
public/favicon.ico
public/apple-touch-icon.png
public/icon-192.png
public/icon-512.png
__GI__
  echo "  ✓ .gitignore updated"
fi

# -----------------------------------------------------------------------------
# Generate icons now
# -----------------------------------------------------------------------------
echo
echo "==> Generating icons"
node scripts/make-icon.mjs

echo
echo "✓ Icon wired up. Files created:"
ls -1 public/*.png public/*.ico public/icon.svg build/icon.png electron/icon.png 2>/dev/null | sed 's/^/    /'

cat <<'NEXT'

Next:
  npm run build           # web (regenerates icon, then tsc + vite)
  npm run electron:build  # Windows installer with the new app icon

Preview the master SVG in a browser:  public/icon.svg
Rebrand later by editing that one file, then:  npm run make:icon
NEXT
