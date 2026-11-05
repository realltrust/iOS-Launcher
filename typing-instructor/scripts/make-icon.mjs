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
