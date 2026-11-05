#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Backing up src/data/keyboard.ts -> src/data/keyboard.ts.bak2"
cp src/data/keyboard.ts src/data/keyboard.ts.bak2

cat > src/data/keyboard.ts <<'__KBD__'
export type Finger =
  | 'lp' | 'lr' | 'lm' | 'li' | 'th' | 'ri' | 'rm' | 'rr' | 'rp';

export const FINGER_COLORS: Record<Finger, string> = {
  lp: '#f87171', lr: '#fb923c', lm: '#facc15', li: '#4ade80',
  th: '#94a3b8', ri: '#2dd4bf', rm: '#60a5fa', rr: '#a78bfa', rp: '#f472b6',
};

export const FINGER_LABELS: Record<Finger, string> = {
  lp: 'Left pinky', lr: 'Left ring', lm: 'Left middle', li: 'Left index',
  th: 'Thumb', ri: 'Right index', rm: 'Right middle', rr: 'Right ring', rp: 'Right pinky',
};

const FINGER: Record<string, Finger> = {
  '`': 'lp', '1': 'lp', q: 'lp', a: 'lp', z: 'lp',
  '2': 'lr', w: 'lr', s: 'lr', x: 'lr',
  '3': 'lm', e: 'lm', d: 'lm', c: 'lm',
  '4': 'li', '5': 'li', r: 'li', t: 'li', f: 'li', g: 'li', v: 'li', b: 'li',
  '6': 'ri', '7': 'ri', y: 'ri', u: 'ri', h: 'ri', j: 'ri', n: 'ri', m: 'ri',
  '8': 'rm', i: 'rm', k: 'rm', ',': 'rm',
  '9': 'rr', o: 'rr', l: 'rr', '.': 'rr',
  '0': 'rp', '-': 'rp', '=': 'rp', p: 'rp', '[': 'rp', ']': 'rp',
  '\\': 'rp', ';': 'rp', "'": 'rp', '/': 'rp',
  ' ': 'th',
};

export const fingerOf = (key: string): Finger | undefined => FINGER[key];

export interface KeyDef { label: string; code: string; wide?: number; special?: boolean; }

const chars = (s: string): KeyDef[] =>
  s.split('').map((c) => ({ label: c, code: c }));

export const LAYOUTS: Record<string, KeyDef[][]> = {
  qwerty: [
    [
      ...chars('`1234567890-='),
      { label: 'Backspace', code: 'Backspace', wide: 2, special: true },
    ],
    [
      { label: 'Tab', code: 'Tab', wide: 1.5, special: true },
      ...chars('qwertyuiop'),
      { label: '[', code: '[' },
      { label: ']', code: ']' },
      { label: '\\', code: '\\', wide: 1.5 },
    ],
    [
      { label: 'Caps', code: 'CapsLock', wide: 1.8, special: true },
      ...chars('asdfghjkl'),
      { label: ';', code: ';' },
      { label: "'", code: "'" },
      { label: 'Enter', code: 'Enter', wide: 2.2, special: true },
    ],
    [
      { label: 'Shift', code: 'ShiftLeft', wide: 2.2, special: true },
      ...chars('zxcvbnm'),
      { label: ',', code: ',' },
      { label: '.', code: '.' },
      { label: '/', code: '/' },
      { label: 'Shift', code: 'ShiftRight', wide: 2.2, special: true },
    ],
    [
      { label: 'Space', code: ' ', wide: 9 },
    ],
  ],
};
__KBD__

echo "==> npm run build"
npm run build

echo
echo "✓ Build OK. Run: npm run dev"
