#!/usr/bin/env bash
# =============================================================================
# Typing Instructor — bootstrap script
# Creates the complete project in ./typing-instructor/
#
# Usage:
#   chmod +x bootstrap-typing-instructor.sh
#   ./bootstrap-typing-instructor.sh                 # default: install + build
#   ./bootstrap-typing-instructor.sh --skip-install  # don't run npm install
#   ./bootstrap-typing-instructor.sh --skip-build    # don't run npm run build
#   ROOT=my-app ./bootstrap-typing-instructor.sh     # custom target folder
# =============================================================================

set -euo pipefail

ROOT="${ROOT:-typing-instructor}"
SKIP_INSTALL=0
SKIP_BUILD=0

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=1 ;;
    --skip-build)   SKIP_BUILD=1 ;;
    -h|--help)
      cat <<HELP
Usage: $0 [--skip-install] [--skip-build]

Creates a complete "Typing Instructor" project in ./$ROOT/.

Options:
  --skip-install   Do not run npm install.
  --skip-build     Do not run npm run build.
  --help           Show this message.

Override the target folder with: ROOT=mydir $0
HELP
      exit 0
      ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if [ -d "$ROOT" ]; then
  echo "ERROR: directory '$ROOT' already exists."
  echo "Move or remove it first, or set ROOT=<other-folder>."
  exit 1
fi

echo "==> Creating project in ./$ROOT/"
mkdir -p "$ROOT"/electron "$ROOT"/src/data "$ROOT"/src/lib "$ROOT"/src/context "$ROOT"/src/components "$ROOT"/src/pages
cd "$ROOT"

# -----------------------------------------------------------------------------
# package.json
# -----------------------------------------------------------------------------
cat > package.json <<'__PKG__'
{
  "name": "typing-instructor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "main": "electron/main.cjs",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "electron:dev": "vite build && electron .",
    "electron:build": "vite build && electron-builder --win",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "idb": "^8.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "electron": "^31.0.0",
    "electron-builder": "^24.13.3",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.4",
    "vite": "^5.4.3"
  },
  "build": {
    "appId": "com.typinginstructor.app",
    "productName": "Typing Instructor",
    "files": ["dist/**/*", "electron/**/*"],
    "directories": { "output": "release" },
    "win": { "target": ["nsis"] }
  }
}
__PKG__

# -----------------------------------------------------------------------------
# vite.config.ts
# -----------------------------------------------------------------------------
cat > vite.config.ts <<'__VITE__'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: 5173 },
});
__VITE__

# -----------------------------------------------------------------------------
# tsconfig.json
# -----------------------------------------------------------------------------
cat > tsconfig.json <<'__TS__'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src"]
}
__TS__

# -----------------------------------------------------------------------------
# tailwind.config.js
# -----------------------------------------------------------------------------
cat > tailwind.config.js <<'__TW__'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [],
};
__TW__

# -----------------------------------------------------------------------------
# postcss.config.js
# -----------------------------------------------------------------------------
cat > postcss.config.js <<'__PC__'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } };
__PC__

# -----------------------------------------------------------------------------
# .gitignore
# -----------------------------------------------------------------------------
cat > .gitignore <<'__GI__'
node_modules/
dist/
release/
.DS_Store
*.log
__GI__

# -----------------------------------------------------------------------------
# index.html
# -----------------------------------------------------------------------------
cat > index.html <<'__HTML__'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Typing Instructor</title>
  </head>
  <body class="bg-slate-100 dark:bg-slate-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
__HTML__

# -----------------------------------------------------------------------------
# electron/main.cjs
# -----------------------------------------------------------------------------
cat > electron/main.cjs <<'__EM__'
const { app, BrowserWindow } = require('electron');
const path = require('node:path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
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
# electron/preload.cjs
# -----------------------------------------------------------------------------
cat > electron/preload.cjs <<'__EP__'
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('desktop', { platform: process.platform, version: process.versions.electron });
__EP__

# -----------------------------------------------------------------------------
# src/main.tsx
# -----------------------------------------------------------------------------
cat > src/main.tsx <<'__MAIN__'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
__MAIN__

# -----------------------------------------------------------------------------
# src/index.css
# -----------------------------------------------------------------------------
cat > src/index.css <<'__CSS__'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.key { transition: transform .05s, background-color .1s; }
.key:active, .key.pressed { transform: scale(0.94); }
@media print {
  body * { visibility: hidden; }
  #certificate, #certificate * { visibility: visible; }
  #certificate { position: absolute; left: 0; top: 0; width: 100%; }
}
__CSS__

# -----------------------------------------------------------------------------
# src/types.ts
# -----------------------------------------------------------------------------
cat > src/types.ts <<'__TYPES__'
export type Role = 'learner' | 'teacher' | 'admin';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface UserRecord {
  id: string;
  username: string;
  salt: string;
  hash: string;
  role: Role;
  createdAt: number;
  settings: { theme: 'light' | 'dark' };
  teacherId?: string;
}

export interface TypingStats {
  wpm: number;
  netWpm: number;
  cpm: number;
  accuracy: number;
  correct: number;
  incorrect: number;
  backspaces: number;
  keystrokes: number;
  elapsedMs: number;
  progress: number;
  consistency: number;
}

export interface TypingResult {
  id: string;
  userId: string;
  kind: 'lesson' | 'test' | 'game';
  refId: string;
  date: number;
  stats: TypingStats;
  meta?: Record<string, unknown>;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  bestWpm: number;
  bestAccuracy: number;
  attempts: number;
  lastAt: number;
}

export interface LessonDef {
  id: string;
  level: Level;
  title: string;
  description: string;
  focusKeys: string[];
  generate: () => string;
  minWpm?: number;
  minAccuracy?: number;
}
__TYPES__

# -----------------------------------------------------------------------------
# src/data/keyboard.ts
# -----------------------------------------------------------------------------
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

export const LAYOUTS: Record<string, KeyDef[][]> = {
  qwerty: [
    ['`','1','2','3','4','5','6','7','8','9','0','-','='].map(c => ({ label: c, code: c }))
      .concat([{ label: 'Backspace', code: 'Backspace', wide: 2, special: true }]),
    [{ label: 'Tab', code: 'Tab', wide: 1.5, special: true },
      ...'qwertyuiop'.split('').map(c => ({ label: c, code: c })),
      { label: '[', code: '[' }, { label: ']', code: ']' },
      { label: '\\', code: '\\', wide: 1.5 }],
    [{ label: 'Caps', code: 'CapsLock', wide: 1.8, special: true },
      ...'asdfghjkl'.split('').map(c => ({ label: c, code: c })),
      { label: ';', code: ';' }, { label: "'", code: "'" },
      { label: 'Enter', code: 'Enter', wide: 2.2, special: true }],
    [{ label: 'Shift', code: 'ShiftLeft', wide: 2.2, special: true },
      ...'zxcvbnm'.split('').map(c => ({ label: c, code: c })),
      { label: ',', code: ',' }, { label: '.', code: '.' }, { label: '/', code: '/' },
      { label: 'Shift', code: 'ShiftRight', wide: 2.2, special: true }],
    [{ label: 'Space', code: ' ', wide: 9 }],
  ],
};
__KBD__

# -----------------------------------------------------------------------------
# src/data/curriculum.ts
# -----------------------------------------------------------------------------
cat > src/data/curriculum.ts <<'__CURR__'
import type { LessonDef } from '../types';

const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const drill = (keys: string[], n = 12) =>
  Array.from({ length: n }, () => pick(keys)).join(' ');

const COMMON = ('the be of and a to in he have it that for they i with as not on she at by this we you do but from or ' +
  'which one would all will there say who make when can more if no man out other so what time up go about than into could ' +
  'state only new year some take come these know see use get like then first any work now may such give over think most ' +
  'even find day also after way many must look before great back through years much where your').split(' ');

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice every day to build muscle memory and speed.',
  'Accuracy comes before speed in professional typing.',
  'A journey of a thousand miles begins with a single step.',
  'Keep your wrists relaxed and your fingers curved.',
  'Type with rhythm and let your eyes lead the way.',
];

const PARAGRAPHS = [
  'Professional typing is not only about speed. It is about accuracy, rhythm, and control. A typist who types slowly but accurately will finish a document before one who races ahead and makes mistakes. Build the habit of reading a few words ahead while your fingers follow the rhythm of the keyboard.',
  'When you first learn to touch type, your speed will feel slow. This is normal. Your brain is building new pathways. Each repetition strengthens the connection between the letter you see and the finger that presses it. Trust the process, and your speed will rise naturally.',
  'Business correspondence requires clear, concise language. Type your letters with care, checking names, dates, and figures. A single mistyped digit can change a quotation or a deadline. Accuracy is the professional standard.',
];

const PROGRAM = [
  'const sum = (a, b) => a + b;',
  'for (let i = 0; i < 10; i++) { console.log(i); }',
  'function greet(name) { return `Hello, ${name}!`; }',
  'if (user.isActive && user.role === "admin") { grantAccess(); }',
  'export default class User { constructor(id) { this.id = id; } }',
];

export const CURRICULUM: LessonDef[] = [
  { id: 'b-intro', level: 'beginner', title: 'Introduction to Typing', description: 'Learn posture, home row, and how this tutor works.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split('')) },
  { id: 'b-posture', level: 'beginner', title: 'Sitting Posture', description: 'Feet flat, back straight, wrists relaxed, fingers curved.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split('')) },
  { id: 'b-home', level: 'beginner', title: 'Home Row Keys', description: 'Place fingers on ASDF and JKL; — your anchor.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split(''), 16) },
  { id: 'b-left', level: 'beginner', title: 'Left-Hand Exercises', description: 'Focus on A S D F.', focusKeys: ['a','s','d','f'], generate: () => drill('asdf'.split(''), 16) },
  { id: 'b-right', level: 'beginner', title: 'Right-Hand Exercises', description: 'Focus on J K L ;.', focusKeys: ['j','k','l',';'], generate: () => drill('jkl;'.split(''), 16) },
  { id: 'b-fingers', level: 'beginner', title: 'Individual Finger Exercises', description: 'Strengthen each finger in turn.', focusKeys: ['a','s','d','f','j','k','l',';'], generate: () => drill('asdfjkl;'.split(''), 20) },
  { id: 'b-upper', level: 'beginner', title: 'Upper Row Keys', description: 'Reach up to Q W E R T Y U I O P.', focusKeys: ['q','w','e','r','t','y','u','i','o','p'], generate: () => drill('qwertyuiop'.split(''), 16) },
  { id: 'b-lower', level: 'beginner', title: 'Lower Row Keys', description: 'Reach down to Z X C V B N M.', focusKeys: ['z','x','c','v','b','n','m'], generate: () => drill('zxcvbnm'.split(''), 16) },
  { id: 'b-capital', level: 'beginner', title: 'Capital Letters', description: 'Use Shift with the opposite hand.', focusKeys: ['a','s','d','f','j','k','l'], generate: () => Array.from({length: 10}, () => pick(['As','Df','Jk','Ls','Fd','Kj','Sa','Dl'])).join(' ') },
  { id: 'b-shift', level: 'beginner', title: 'Shift Key Training', description: 'Alternate Shift hands while typing capitals.', focusKeys: ['a','s','d','f','j','k','l'], generate: () => Array.from({length: 10}, () => pick(['Aa','Ss','Dd','Ff','Jj','Kk','Ll'])).join(' ') },
  { id: 'b-space', level: 'beginner', title: 'Spacebar Training', description: 'Use your thumb for the spacebar.', focusKeys: [' '], generate: () => drill(['a','s','d','f','j','k','l'], 14) },
  { id: 'b-enter', level: 'beginner', title: 'Enter, Backspace, Tab', description: 'Practice control keys.', focusKeys: ['Enter','Backspace','Tab'], generate: () => 'a b c d e f g h i j k l m n o p' },
  { id: 'b-punct', level: 'beginner', title: 'Basic Punctuation', description: 'Period, comma, and semicolon.', focusKeys: ['.',',',';'], generate: () => drill(['a.','s,','d;','f.','j,','k;'], 12) },
  { id: 'b-numbers', level: 'beginner', title: 'Numbers', description: 'Reach up to the number row.', focusKeys: '1234567890'.split(''), generate: () => drill('1234567890'.split(''), 16) },

  { id: 'i-words', level: 'intermediate', title: 'Word Typing', description: 'Type common words smoothly.', focusKeys: [], generate: () => Array.from({length: 14}, () => pick(COMMON)).join(' ') },
  { id: 'i-sentence', level: 'intermediate', title: 'Sentence Typing', description: 'Complete full sentences.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-para', level: 'intermediate', title: 'Paragraph Typing', description: 'Type a paragraph without stopping.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'i-common', level: 'intermediate', title: 'Common English Words', description: 'The 100 most-used words.', focusKeys: [], generate: () => Array.from({length: 16}, () => pick(COMMON)).join(' ') },
  { id: 'i-combos', level: 'intermediate', title: 'Letter Combinations', description: 'Common pairs like th, er, in, on.', focusKeys: [], generate: () => drill('th er in on an re he st ed nd'.split(' '), 14) },
  { id: 'i-caps', level: 'intermediate', title: 'Capitalization Exercises', description: 'Capitalize names and sentence starts.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-punct', level: 'intermediate', title: 'Punctuation Exercises', description: 'Commas, quotes, and question marks.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-numbers', level: 'intermediate', title: 'Number Row Exercises', description: 'Numbers mixed with letters.', focusKeys: [], generate: () => Array.from({length: 12}, () => pick(['2024','42','100%','3.14','7:30','#5'])).join(' ') },
  { id: 'i-speed', level: 'intermediate', title: 'Speed Building', description: 'Push pace while staying accurate.', focusKeys: [], generate: () => pick(SENTENCES) },
  { id: 'i-accuracy', level: 'intermediate', title: 'Accuracy Improvement', description: 'Slow down and hit every key.', focusKeys: [], generate: () => pick(SENTENCES) },

  { id: 'a-passage', level: 'advanced', title: 'Long Passages', description: 'Type a full paragraph at speed.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-doc', level: 'advanced', title: 'Professional Documents', description: 'Formal document typing.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-business', level: 'advanced', title: 'Business Correspondence', description: 'Letters and memos.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-academic', level: 'advanced', title: 'Academic Typing', description: 'Research and citation text.', focusKeys: [], generate: () => pick(PARAGRAPHS) },
  { id: 'a-programming', level: 'advanced', title: 'Programming Typing', description: 'Code syntax and symbols.', focusKeys: [], generate: () => pick(PROGRAM) },
  { id: 'a-advpunct', level: 'advanced', title: 'Advanced Punctuation', description: 'Brackets, quotes, and symbols.', focusKeys: [], generate: () => pick(PROGRAM) },
  { id: 'a-timed', level: 'advanced', title: 'Timed Challenge', description: 'Push for 60+ WPM.', focusKeys: [], generate: () => pick(PARAGRAPHS), minWpm: 60, minAccuracy: 95 },
  { id: 'a-speed', level: 'advanced', title: 'High-Speed Development', description: 'Maximum pace, minimum errors.', focusKeys: [], generate: () => pick(PARAGRAPHS), minWpm: 70, minAccuracy: 96 },
];
__CURR__

# -----------------------------------------------------------------------------
# src/data/achievements.ts
# -----------------------------------------------------------------------------
cat > src/data/achievements.ts <<'__ACH__'
import type { TypingResult, LessonProgress } from '../types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: (results: TypingResult[], progress: LessonProgress[]) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-step', title: 'First Step', description: 'Complete your first lesson.', earned: (_r, p) => p.some(x => x.completed) },
  { id: 'twenty', title: 'Getting Serious', description: 'Complete 20 lessons.', earned: (_r, p) => p.filter(x => x.completed).length >= 20 },
  { id: 'wpm30', title: '30 WPM Club', description: 'Reach 30 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 30) },
  { id: 'wpm50', title: '50 WPM Club', description: 'Reach 50 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 50) },
  { id: 'wpm70', title: '70 WPM Club', description: 'Reach 70 net WPM.', earned: r => r.some(x => x.stats.netWpm >= 70) },
  { id: 'accuracy98', title: 'Sharpshooter', description: '98% accuracy in a test.', earned: r => r.some(x => x.kind === 'test' && x.stats.accuracy >= 98) },
  { id: 'ten-results', title: 'Persistent', description: 'Record 10 sessions.', earned: r => r.length >= 10 },
];
__ACH__

# -----------------------------------------------------------------------------
# src/lib/typing.ts
# -----------------------------------------------------------------------------
cat > src/lib/typing.ts <<'__TYPING__'
import type { TypingStats } from '../types';

export function computeStats(
  target: string,
  typed: string,
  elapsedMs: number,
  backspaces: number,
  intervals: number[],
): TypingStats {
  let correct = 0;
  let incorrect = 0;
  const n = Math.min(typed.length, target.length);
  for (let i = 0; i < n; i++) {
    if (typed[i] === target[i]) correct++;
    else incorrect++;
  }
  if (typed.length > target.length) incorrect += typed.length - target.length;

  const minutes = Math.max(elapsedMs, 1) / 60000;
  const grossWpm = typed.length / 5 / minutes;
  const netWpm = Math.max(0, correct - incorrect) / 5 / minutes;
  const cpm = typed.length / minutes;
  const accuracy = typed.length === 0 ? 100 : (correct / (correct + incorrect)) * 100;
  const progress = target.length ? Math.min(typed.length / target.length, 1) * 100 : 0;

  let consistency = 100;
  if (intervals.length > 3) {
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    consistency = Math.max(0, Math.min(100, 100 - cv * 100));
  }

  return {
    wpm: Math.round(grossWpm),
    netWpm: Math.round(netWpm),
    cpm: Math.round(cpm),
    accuracy: Math.round(accuracy * 10) / 10,
    correct,
    incorrect,
    backspaces,
    keystrokes: typed.length + backspaces,
    elapsedMs,
    progress: Math.round(progress * 10) / 10,
    consistency: Math.round(consistency),
  };
}
__TYPING__

# -----------------------------------------------------------------------------
# src/lib/db.ts
# -----------------------------------------------------------------------------
cat > src/lib/db.ts <<'__DB__'
import { openDB, type DBSchema } from 'idb';
import type { UserRecord, TypingResult, LessonProgress } from '../types';

interface AppDB extends DBSchema {
  users: { key: string; value: UserRecord; indexes: { byUsername: string } };
  results: { key: string; value: TypingResult; indexes: { byUser: string } };
  progress: { key: string; value: LessonProgress; indexes: { byUser: string } };
}

const dbp = openDB<AppDB>('typing-instructor', 1, {
  upgrade(db) {
    const users = db.createObjectStore('users', { keyPath: 'id' });
    users.createIndex('byUsername', 'username', { unique: true });
    const results = db.createObjectStore('results', { keyPath: 'id' });
    results.createIndex('byUser', 'userId');
    const progress = db.createObjectStore('progress', { keyPath: 'id' });
    progress.createIndex('byUser', 'userId');
  },
});

export const uid = () =>
  (crypto as any).randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);

export async function getUserByUsername(username: string) {
  const db = await dbp;
  return db.getFromIndex('users', 'byUsername', username.toLowerCase());
}

export async function putUser(user: UserRecord) {
  const db = await dbp;
  await db.put('users', user);
  return user;
}

export async function getUsers() {
  const db = await dbp;
  return db.getAll('users');
}

export async function addResult(result: TypingResult) {
  const db = await dbp;
  await db.put('results', result);
}

export async function getResultsForUser(userId: string) {
  const db = await dbp;
  const all = await db.getAllFromIndex('results', 'byUser', userId);
  return all.sort((a, b) => a.date - b.date);
}

export async function getProgressForUser(userId: string) {
  const db = await dbp;
  return db.getAllFromIndex('progress', 'byUser', userId);
}

export async function saveProgress(p: LessonProgress) {
  const db = await dbp;
  await db.put('progress', p);
}
__DB__

# -----------------------------------------------------------------------------
# src/lib/auth.ts
# -----------------------------------------------------------------------------
cat > src/lib/auth.ts <<'__AUTH__'
import { uid } from './db';

export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const newSalt = () => uid();
__AUTH__

# -----------------------------------------------------------------------------
# src/context/AuthContext.tsx
# -----------------------------------------------------------------------------
cat > src/context/AuthContext.tsx <<'__CTX__'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { UserRecord } from '../types';
import { getUserByUsername, putUser, uid } from '../lib/db';
import { hashPassword, newSalt } from '../lib/auth';

interface AuthCtx {
  user: UserRecord | null;
  guest: boolean;
  login: (u: string, p: string) => Promise<string | null>;
  register: (u: string, p: string, role?: 'learner' | 'teacher') => Promise<string | null>;
  logout: () => void;
  loginAsGuest: () => void;
  setTheme: (t: 'light' | 'dark') => Promise<void>;
}

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
const SESSION_KEY = 'ti:session';
const GUEST_KEY = 'ti:guest';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRecord | null>(null);
  const [guest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const id = localStorage.getItem(SESSION_KEY);
      if (id) {
        const u = await getUserByUsername(id);
        if (u) setUser(u);
      }
      setGuest(localStorage.getItem(GUEST_KEY) === '1');
    })();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', user?.settings.theme === 'dark');
  }, [user?.settings.theme]);

  const login = async (u: string, p: string) => {
    const rec = await getUserByUsername(u);
    if (!rec) return 'User not found';
    const h = await hashPassword(p, rec.salt);
    if (h !== rec.hash) return 'Incorrect password';
    setUser(rec);
    localStorage.setItem(SESSION_KEY, rec.username);
    localStorage.removeItem(GUEST_KEY);
    setGuest(false);
    return null;
  };

  const register = async (u: string, p: string, role: 'learner' | 'teacher' = 'learner') => {
    if (!/^[a-zA-Z0-9_.-]{3,24}$/.test(u)) return 'Username must be 3-24 chars (letters, digits, . _ -)';
    if (p.length < 6) return 'Password must be at least 6 characters';
    const exists = await getUserByUsername(u);
    if (exists) return 'Username already taken';
    const salt = newSalt();
    const hash = await hashPassword(p, salt);
    const rec: UserRecord = {
      id: uid(),
      username: u.toLowerCase(),
      salt,
      hash,
      role,
      createdAt: Date.now(),
      settings: { theme: 'light' },
    };
    await putUser(rec);
    setUser(rec);
    localStorage.setItem(SESSION_KEY, rec.username);
    return null;
  };

  const logout = () => {
    setUser(null);
    setGuest(false);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(GUEST_KEY);
  };

  const loginAsGuest = () => {
    setGuest(true);
    localStorage.setItem(GUEST_KEY, '1');
  };

  const setTheme = async (t: 'light' | 'dark') => {
    if (!user) return;
    const next = { ...user, settings: { ...user.settings, theme: t } };
    await putUser(next);
    setUser(next);
  };

  return (
    <Ctx.Provider value={{ user, guest, login, register, logout, loginAsGuest, setTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
__CTX__

# -----------------------------------------------------------------------------
# src/components/Keyboard.tsx
# -----------------------------------------------------------------------------
cat > src/components/Keyboard.tsx <<'__KBC__'
import { LAYOUTS, FINGER_COLORS, fingerOf, FINGER_LABELS } from '../data/keyboard';

interface Props {
  nextKey?: string;
  lastKey?: string;
  errorKey?: string;
  layout?: string;
}

export function Keyboard({ nextKey, lastKey, errorKey, layout = 'qwerty' }: Props) {
  const rows = LAYOUTS[layout] ?? LAYOUTS.qwerty;
  const nextFinger = nextKey ? fingerOf(nextKey.toLowerCase()) : undefined;

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      <div className="space-y-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((k) => {
              const isNext = nextKey && nextKey.toLowerCase() === k.code.toLowerCase();
              const isLast = lastKey && lastKey.toLowerCase() === k.code.toLowerCase();
              const isErr = errorKey && errorKey.toLowerCase() === k.code.toLowerCase();
              const finger = fingerOf(k.code.toLowerCase());
              const bg = finger ? FINGER_COLORS[finger] : '#cbd5e1';
              return (
                <div
                  key={k.code + k.label}
                  className={`key flex items-center justify-center rounded-md border text-xs font-semibold
                    ${isErr ? 'ring-2 ring-red-500' : ''}
                    ${isNext ? 'ring-2 ring-blue-600 scale-105' : ''}
                    ${isLast ? 'pressed' : ''}`}
                  style={{
                    width: `${(k.wide ?? 1) * 2.6}rem`,
                    height: '2.6rem',
                    backgroundColor: isNext ? '#bfdbfe' : isLast ? '#dbeafe' : bg,
                    color: '#0f172a',
                    opacity: k.special ? 0.85 : 1,
                  }}
                >
                  {k.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
        {nextFinger
          ? <>Next key: <b>{nextKey}</b> — use <b>{FINGER_LABELS[nextFinger]}</b></>
          : 'Home row: A S D F — J K L ;'}
      </div>
    </div>
  );
}
__KBC__

# -----------------------------------------------------------------------------
# src/components/LineChart.tsx
# -----------------------------------------------------------------------------
cat > src/components/LineChart.tsx <<'__LC__'
interface Point { label: string; value: number; }

export function LineChart({ points, height = 160 }: { points: Point[]; height?: number }) {
  if (points.length === 0) return <div className="text-slate-400 text-sm">No data yet.</div>;
  const w = 520;
  const pad = 24;
  const max = Math.max(...points.map((p) => p.value), 10);
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step} ${y(p.value)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full">
      <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={pad + i * step} cy={y(p.value)} r={3} fill="#2563eb" />
      ))}
      <text x={pad} y={height - 4} fontSize="10" fill="#64748b">{points[0].label}</text>
      <text x={w - pad} y={height - 4} fontSize="10" fill="#64748b" textAnchor="end">
        {points[points.length - 1].label}
      </text>
    </svg>
  );
}
__LC__

# -----------------------------------------------------------------------------
# src/components/TypingArena.tsx
# -----------------------------------------------------------------------------
cat > src/components/TypingArena.tsx <<'__TA__'
import { useEffect, useMemo, useRef, useState } from 'react';
import { computeStats } from '../lib/typing';
import type { TypingStats } from '../types';
import { Keyboard } from './Keyboard';

interface Props {
  text: string;
  onComplete?: (stats: TypingStats) => void;
  timeLimitSec?: number;
  showKeyboard?: boolean;
  onLiveStats?: (s: TypingStats) => void;
}

export function TypingArena({ text, onComplete, timeLimitSec, showKeyboard = true, onLiveStats }: Props) {
  const [typed, setTyped] = useState('');
  const [startAt, setStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [backspaces, setBackspaces] = useState(0);
  const intervals = useRef<number[]>([]);
  const lastKeyTime = useRef<number>(0);
  const [lastKey, setLastKey] = useState<string | undefined>();
  const [errorKey, setErrorKey] = useState<string | undefined>();
  const completed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startAt) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [startAt]);

  const elapsed = startAt ? now - startAt : 0;
  const remaining = timeLimitSec ? Math.max(0, timeLimitSec * 1000 - elapsed) : null;

  const stats = useMemo(
    () => computeStats(text, typed, elapsed, backspaces, intervals.current),
    [text, typed, elapsed, backspaces],
  );

  useEffect(() => { onLiveStats?.(stats); }, [stats, onLiveStats]);

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete?.(stats);
  };

  const isDone = typed.length >= text.length;
  useEffect(() => {
    if (isDone && typed.length > 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  useEffect(() => {
    if (timeLimitSec && startAt && remaining === 0) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, startAt]);

  useEffect(() => { containerRef.current?.focus(); }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (completed.current) return;
    if (e.key === 'Tab') return;
    e.preventDefault();

    const nowMs = Date.now();
    if (!startAt) setStartAt(nowMs);

    if (e.key === 'Backspace') {
      if (typed.length > 0) {
        setTyped(typed.slice(0, -1));
        setBackspaces((b) => b + 1);
      }
      return;
    }
    if (e.key.length !== 1) return;

    const idx = typed.length;
    const expected = text[idx];
    const actual = e.key;
    setLastKey(actual);
    if (actual !== expected) {
      setErrorKey(actual);
      setTimeout(() => setErrorKey(undefined), 250);
    }
    if (lastKeyTime.current) intervals.current.push(nowMs - lastKeyTime.current);
    lastKeyTime.current = nowMs;

    setTyped(typed + actual);
  };

  const nextKey = text[typed.length];

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKey} className="outline-none">
      <div className="mb-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
        <span><b>{stats.netWpm}</b> net WPM</span>
        <span><b>{stats.wpm}</b> gross WPM</span>
        <span><b>{stats.accuracy}%</b> accuracy</span>
        <span><b>{stats.incorrect}</b> errors</span>
        {remaining !== null && (
          <span><b>{Math.ceil(remaining / 1000)}s</b> left</span>
        )}
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 p-4 text-lg leading-relaxed font-mono whitespace-pre-wrap">
        {text.split('').map((ch, i) => {
          let cls = 'text-slate-400 dark:text-slate-500';
          if (i < typed.length) {
            cls = typed[i] === ch
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-red-600 underline decoration-red-500';
          } else if (i === typed.length) {
            cls = 'bg-blue-200 dark:bg-blue-700 rounded px-0.5 text-slate-900 dark:text-white';
          }
          return <span key={i} className={cls}>{ch}</span>;
        })}
      </div>

      {showKeyboard && <div className="mt-6"><Keyboard nextKey={nextKey} lastKey={lastKey} errorKey={errorKey} /></div>}

      <div className="mt-3 h-2 w-full rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{ width: `${stats.progress}%` }} />
      </div>
    </div>
  );
}
__TA__

# -----------------------------------------------------------------------------
# src/pages/Login.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Login.tsx <<'__LOGIN__'
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'learner' | 'teacher'>('learner');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = mode === 'login'
      ? await login(username, password)
      : await register(username, password, role);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-xl p-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Typing Instructor</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Learn to type accurately and fast.</p>

        <div className="flex gap-2 mb-4">
          {(['login', 'register'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === m ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}>
              {m === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white" />
          {mode === 'register' && (
            <select value={role} onChange={(e) => setRole(e.target.value as 'learner' | 'teacher')}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white">
              <option value="learner">Learner</option>
              <option value="teacher">Teacher</option>
            </select>
          )}
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button onClick={loginAsGuest} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          Continue as guest (practice only)
        </button>
      </div>
    </div>
  );
}
__LOGIN__

# -----------------------------------------------------------------------------
# src/pages/Dashboard.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Dashboard.tsx <<'__DASH__'
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResultsForUser, getProgressForUser } from '../lib/db';
import type { TypingResult, LessonProgress } from '../types';
import { CURRICULUM } from '../data/curriculum';
import { ACHIEVEMENTS } from '../data/achievements';
import { LineChart } from '../components/LineChart';

export default function Dashboard() {
  const { user, guest } = useAuth();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setResults(await getResultsForUser(user.id));
      setProgress(await getProgressForUser(user.id));
    })();
  }, [user]);

  const latest = results[results.length - 1];
  const completed = progress.filter((p) => p.completed).length;
  const totalTimeMs = results.reduce((a, r) => a + r.stats.elapsedMs, 0);
  const streak = useMemo(() => {
    const days = new Set(results.map((r) => new Date(r.date).toDateString()));
    let s = 0;
    const d = new Date();
    while (days.has(d.toDateString())) {
      s++;
      d.setDate(d.getDate() - 1);
    }
    return s;
  }, [results]);

  const chartPoints = results.slice(-15).map((r) => ({
    label: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: r.stats.netWpm,
  }));

  const nextLesson = CURRICULUM.find(
    (l) => !progress.find((p) => p.lessonId === l.id && p.completed),
  ) ?? CURRICULUM[0];

  const earned = ACHIEVEMENTS.filter((a) => a.earned(results, progress));

  if (!user && !guest) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back{user ? `, ${user.username}` : ', guest'}</h1>
        <p className="text-blue-100">Keep practicing — consistency beats intensity.</p>
      </div>

      {guest && (
        <div className="rounded-xl bg-amber-100 text-amber-900 p-3 text-sm">
          You are in guest mode. Create an account to save progress.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Net WPM" value={latest ? latest.stats.netWpm : 0} />
        <Stat label="Accuracy" value={latest ? `${latest.stats.accuracy}%` : '—'} />
        <Stat label="Lessons done" value={`${completed}/${CURRICULUM.length}`} />
        <Stat label="Practice time" value={`${Math.round(totalTimeMs / 60000)} min`} />
        <Stat label="Day streak" value={streak} />
        <Stat label="Sessions" value={results.length} />
        <Stat label="Achievements" value={`${earned.length}/${ACHIEVEMENTS.length}`} />
        <Stat label="Level" value={completed >= 24 ? 'Advanced' : completed >= 14 ? 'Intermediate' : 'Beginner'} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">WPM progress</h2>
          <LineChart points={chartPoints} />
        </div>
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Recommended next lesson</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">{nextLesson.title} — {nextLesson.description}</p>
          <Link to={`/lessons/${nextLesson.id}`} className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
            Start lesson
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Recent results</h2>
        {results.length === 0 && <p className="text-slate-500 text-sm">No results yet. Start a lesson!</p>}
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
          {results.slice(-6).reverse().map((r) => (
            <li key={r.id} className="py-2 flex justify-between text-sm">
              <span className="text-slate-700 dark:text-slate-200">{r.kind} · {r.refId}</span>
              <span className="text-slate-500 dark:text-slate-400">{r.stats.netWpm} WPM · {r.stats.accuracy}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
__DASH__

# -----------------------------------------------------------------------------
# src/pages/Lessons.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Lessons.tsx <<'__LS__'
import { Link } from 'react-router-dom';
import { CURRICULUM } from '../data/curriculum';

export default function Lessons() {
  const levels = ['beginner', 'intermediate', 'advanced'] as const;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Typing Lessons</h1>
      {levels.map((lvl) => (
        <section key={lvl}>
          <h2 className="text-lg font-semibold capitalize text-slate-800 dark:text-slate-100 mb-3">{lvl}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CURRICULUM.filter((l) => l.level === lvl).map((l) => (
              <Link key={l.id} to={`/lessons/${l.id}`}
                className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow hover:shadow-md transition">
                <div className="font-semibold text-slate-900 dark:text-white">{l.title}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{l.description}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
__LS__

# -----------------------------------------------------------------------------
# src/pages/LessonPlayer.tsx
# -----------------------------------------------------------------------------
cat > src/pages/LessonPlayer.tsx <<'__LP__'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { CURRICULUM } from '../data/curriculum';
import { TypingArena } from '../components/TypingArena';
import { useAuth } from '../context/AuthContext';
import { addResult, getProgressForUser, saveProgress, uid } from '../lib/db';
import type { TypingStats } from '../types';

export default function LessonPlayer() {
  const { id } = useParams();
  const lesson = CURRICULUM.find((l) => l.id === id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState<TypingStats | null>(null);
  // Regenerate text whenever the lesson changes or the user clicks Repeat.
  const text = useMemo(() => (lesson ? lesson.generate() : ''), [lesson, done === null]);

  if (!lesson) return <div>Lesson not found.</div>;

  const onComplete = async (stats: TypingStats) => {
    setDone(stats);
    if (!user) return;
    await addResult({
      id: uid(), userId: user.id, kind: 'lesson', refId: lesson.id,
      date: Date.now(), stats,
    });
    const all = await getProgressForUser(user.id);
    const prev = all.find((p) => p.lessonId === lesson.id);
    const passed = (stats.accuracy >= (lesson.minAccuracy ?? 90)) &&
      (stats.netWpm >= (lesson.minWpm ?? 0));
    await saveProgress({
      id: `${user.id}:${lesson.id}`,
      userId: user.id,
      lessonId: lesson.id,
      completed: Boolean(prev?.completed || passed),
      bestWpm: Math.max(prev?.bestWpm ?? 0, stats.netWpm),
      bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, stats.accuracy),
      attempts: (prev?.attempts ?? 0) + 1,
      lastAt: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <Link to="/lessons" className="text-sm text-blue-600">← All lessons</Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lesson.title}</h1>
      <p className="text-slate-600 dark:text-slate-300">{lesson.description}</p>

      {!done ? (
        <TypingArena text={text} onComplete={onComplete} />
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow space-y-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Lesson complete</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Kv k="Net WPM" v={done.netWpm} />
            <Kv k="Accuracy" v={`${done.accuracy}%`} />
            <Kv k="Errors" v={done.incorrect} />
            <Kv k="Consistency" v={`${done.consistency}%`} />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setDone(null); }} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Repeat</button>
            <button onClick={() => navigate('/lessons')} className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Kv({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="rounded-lg bg-slate-100 dark:bg-slate-700 p-3">
      <div className="text-xs text-slate-500 dark:text-slate-400">{k}</div>
      <div className="text-lg font-bold text-slate-900 dark:text-white">{v}</div>
    </div>
  );
}
__LP__

# -----------------------------------------------------------------------------
# src/pages/Tests.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Tests.tsx <<'__TEST__'
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TypingArena } from '../components/TypingArena';
import { addResult, uid } from '../lib/db';
import type { TypingStats } from '../types';

const PASSAGE =
  'The art of typing well is built on patience and repetition. Each day you practice, your fingers learn the shape of the keyboard a little better. Speed follows accuracy, never the reverse. Keep your eyes on the screen, your wrists relaxed, and your mind focused on the words ahead. With steady practice, what once felt difficult becomes natural and effortless.';

const DURATIONS = [1, 2, 3, 5, 10];

export default function Tests() {
  const { user } = useAuth();
  const [duration, setDuration] = useState(1);
  const [custom, setCustom] = useState(4);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<TypingStats | null>(null);

  const minutes = duration === 0 ? custom : duration;

  const onComplete = async (stats: TypingStats) => {
    setResult(stats);
    if (user) {
      await addResult({
        id: uid(), userId: user.id, kind: 'test', refId: `${minutes}min`,
        date: Date.now(), stats,
      });
    }
  };

  if (started && !result) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{minutes}-minute test</h1>
        <TypingArena text={PASSAGE.repeat(Math.max(1, Math.ceil(minutes * 2)))} timeLimitSec={minutes * 60} onComplete={onComplete} />
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Test result</h1>
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow grid grid-cols-2 md:grid-cols-4 gap-4">
          <Big k="Net WPM" v={result.netWpm} />
          <Big k="Gross WPM" v={result.wpm} />
          <Big k="Accuracy" v={`${result.accuracy}%`} />
          <Big k="Errors" v={result.incorrect} />
          <Big k="CPM" v={result.cpm} />
          <Big k="Consistency" v={`${result.consistency}%`} />
          <Big k="Backspaces" v={result.backspaces} />
          <Big k="Time" v={`${Math.round(result.elapsedMs / 1000)}s`} />
        </div>
        <button onClick={() => { setStarted(false); setResult(null); }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Take another test</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Typing Tests</h1>
      <div className="flex flex-wrap gap-2">
        {DURATIONS.map((d) => (
          <button key={d} onClick={() => setDuration(d)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${duration === d ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}>
            {d} min
          </button>
        ))}
        <button onClick={() => setDuration(0)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${duration === 0 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800'}`}>
          Custom
        </button>
        {duration === 0 && (
          <input type="number" min={1} max={30} value={custom} onChange={(e) => setCustom(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-300 px-2 py-2 dark:bg-slate-900 dark:text-white" />
        )}
      </div>
      <button onClick={() => setStarted(true)}
        className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white">Start {minutes}-minute test</button>
    </div>
  );
}

function Big({ k, v }: { k: string; v: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase text-slate-500">{k}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{v}</div>
    </div>
  );
}
__TEST__

# -----------------------------------------------------------------------------
# src/pages/Games.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Games.tsx <<'__GAME__'
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addResult, uid } from '../lib/db';
import { computeStats } from '../lib/typing';

const WORDS = ('type fast word game speed key board finger hands mind focus rhythm flow skill ' +
  'practice learn improve accurate quick smooth steady control master').split(' ');

export default function Games() {
  const { user } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [current, setCurrent] = useState('');
  const [input, setInput] = useState('');
  const startAt = useRef(0);
  const charsTyped = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const randomWord = () => WORDS[Math.floor(Math.random() * WORDS.length)];

  const start = () => {
    setPlaying(true);
    setScore(0);
    setMisses(0);
    setTimeLeft(30);
    setCurrent(randomWord());
    setInput('');
    startAt.current = Date.now();
    charsTyped.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  useEffect(() => {
    if (playing && input === current) {
      setScore((s) => s + 1);
      charsTyped.current += current.length + 1;
      setCurrent(randomWord());
      setInput('');
    }
  }, [input, current, playing]);

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!playing) return;
    if (e.key.length === 1) {
      e.preventDefault();
      if (e.key === current[input.length]) setInput(input + e.key);
      else setMisses((m) => m + 1);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
    }
  };

  const saveGame = async () => {
    if (!user) return;
    const elapsed = Date.now() - startAt.current;
    const target = ' '.repeat(Math.max(charsTyped.current, 1));
    const typed = ' '.repeat(Math.max(charsTyped.current - misses, 1));
    const stats = computeStats(target, typed, elapsed, 0, []);
    await addResult({ id: uid(), userId: user.id, kind: 'game', refId: 'word-rush', date: Date.now(), stats, meta: { score } });
  };

  useEffect(() => {
    if (!playing && score > 0) saveGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const accuracy = useMemo(() => {
    const total = score + misses;
    return total === 0 ? 100 : Math.round((score / total) * 100);
  }, [score, misses]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Typing Games</h1>

      {!playing ? (
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Word Rush</h2>
          <p className="text-slate-600 dark:text-slate-300">Type each word before the timer runs out. 30 seconds. Every wrong key costs you.</p>
          {score > 0 && (
            <p className="text-sm text-slate-500">Last run — Score: {score}, Accuracy: {accuracy}%</p>
          )}
          <button onClick={start} className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white">Play</button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
          <div className="flex justify-between text-sm text-slate-500 mb-4">
            <span>Score: <b className="text-slate-900 dark:text-white">{score}</b></span>
            <span>Time: <b className="text-slate-900 dark:text-white">{timeLeft}s</b></span>
            <span>Accuracy: <b className="text-slate-900 dark:text-white">{accuracy}%</b></span>
          </div>
          <div className="text-center text-5xl font-bold tracking-widest text-slate-900 dark:text-white mb-6">{current}</div>
          <input ref={inputRef} value={input} onChange={() => {}} onKeyDown={onKey}
            className="w-full text-center text-2xl rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white" />
        </div>
      )}
    </div>
  );
}
__GAME__

# -----------------------------------------------------------------------------
# src/pages/Reports.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Reports.tsx <<'__REP__'
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getResultsForUser, getProgressForUser } from '../lib/db';
import type { TypingResult, LessonProgress } from '../types';
import { LineChart } from '../components/LineChart';

export default function Reports() {
  const { user } = useAuth();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setResults(await getResultsForUser(user.id));
      setProgress(await getProgressForUser(user.id));
    })();
  }, [user]);

  const wpmPoints = results.map((r) => ({
    label: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: r.stats.netWpm,
  }));
  const accPoints = results.map((r) => ({
    label: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: r.stats.accuracy,
  }));

  const exportCsv = () => {
    const rows = [['date', 'kind', 'refId', 'netWpm', 'wpm', 'accuracy', 'errors', 'consistency']];
    for (const r of results) {
      rows.push([
        new Date(r.date).toISOString(), r.kind, r.refId,
        String(r.stats.netWpm), String(r.stats.wpm),
        String(r.stats.accuracy), String(r.stats.incorrect), String(r.stats.consistency),
      ]);
    }
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `typing-report-${Date.now()}.csv`;
    a.click();
  };

  if (!user) return <div className="text-slate-500">Sign in to see reports.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
        <button onClick={exportCsv} className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold">Export CSV</button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">WPM over time</h2>
        <LineChart points={wpmPoints} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Accuracy over time</h2>
        <LineChart points={accPoints} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 p-4 shadow">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Personal records</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Best WPM: <b>{Math.max(0, ...results.map((r) => r.stats.netWpm))}</b> ·
          Best accuracy: <b>{results.length ? Math.max(...results.map((r) => r.stats.accuracy)) : 0}%</b> ·
          Lessons completed: <b>{progress.filter((p) => p.completed).length}</b>
        </p>
      </div>
    </div>
  );
}
__REP__

# -----------------------------------------------------------------------------
# src/pages/Certificates.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Certificates.tsx <<'__CERT__'
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getResultsForUser, getProgressForUser } from '../lib/db';
import type { TypingResult, LessonProgress } from '../types';

export default function Certificates() {
  const { user } = useAuth();
  const [results, setResults] = useState<TypingResult[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setResults(await getResultsForUser(user.id));
      setProgress(await getProgressForUser(user.id));
    })();
  }, [user]);

  const bestWpm = Math.max(0, ...results.map((r) => r.stats.netWpm));
  const bestAcc = results.length ? Math.max(...results.map((r) => r.stats.accuracy)) : 0;
  const completed = progress.filter((p) => p.completed).length;

  const levels = useMemo(() => [
    { key: 'beginner', title: 'Beginner', req: 10, met: completed >= 10 },
    { key: 'intermediate', title: 'Intermediate', req: 30, met: completed >= 30 },
    { key: 'advanced', title: 'Advanced', req: 60, met: completed >= 60 },
  ], [completed]);

  const [active, setActive] = useState<{ level: string; title: string } | null>(null);

  if (!user) return <div className="text-slate-500">Sign in to access certificates.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Certificates</h1>
      <div className="grid sm:grid-cols-3 gap-3">
        {levels.map((l) => (
          <div key={l.key} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow">
            <div className="font-semibold text-slate-900 dark:text-white">{l.title} Certificate</div>
            <div className="text-sm text-slate-500 mt-1">Complete {l.req} lessons</div>
            {l.met
              ? <button onClick={() => setActive({ level: l.key, title: l.title })}
                  className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">View</button>
              : <div className="mt-3 text-sm text-slate-400">Locked</div>}
          </div>
        ))}
      </div>

      {active && (
        <div className="space-y-3">
          <div id="certificate" className="rounded-2xl bg-white p-12 text-center shadow-2xl" style={{ border: '8px double #1e3a8a' }}>
            <div className="text-sm tracking-[0.3em] text-blue-700">TYPING INSTRUCTOR</div>
            <div className="mt-4 text-3xl font-bold text-slate-900">Certificate of Achievement</div>
            <div className="mt-6 text-slate-600">This certifies that</div>
            <div className="mt-2 text-2xl font-bold text-blue-800">{user.username}</div>
            <div className="mt-4 text-slate-600">has successfully completed the</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{active.title} Typing Program</div>
            <div className="mt-6 text-slate-700">
              Best speed: <b>{bestWpm} WPM</b> · Accuracy: <b>{bestAcc}%</b>
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Issued {new Date().toLocaleDateString()} · Ref: {user.id.slice(0, 8).toUpperCase()}-{active.level.toUpperCase()}
            </div>
          </div>
          <div className="flex gap-2 print:hidden">
            <button onClick={() => window.print()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Print / Save as PDF</button>
            <button onClick={() => setActive(null)} className="rounded-lg bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-semibold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
__CERT__

# -----------------------------------------------------------------------------
# src/pages/Teacher.tsx
# -----------------------------------------------------------------------------
cat > src/pages/Teacher.tsx <<'__TCHR__'
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, getResultsForUser } from '../lib/db';
import type { UserRecord, TypingResult } from '../types';

export default function Teacher() {
  const { user } = useAuth();
  const [learners, setLearners] = useState<UserRecord[]>([]);
  const [results, setResults] = useState<Record<string, TypingResult[]>>({});

  useEffect(() => {
    (async () => {
      const all = await getUsers();
      const ls = all.filter((u) => u.role === 'learner');
      setLearners(ls);
      const map: Record<string, TypingResult[]> = {};
      for (const l of ls) map[l.id] = await getResultsForUser(l.id);
      setResults(map);
    })();
  }, []);

  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    return <div className="text-slate-500">Teacher access only.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teacher Dashboard</h1>
      {learners.length === 0 && <p className="text-slate-500">No learners yet. Ask learners to register.</p>}
      <div className="space-y-3">
        {learners.map((l) => {
          const rs = results[l.id] ?? [];
          const best = Math.max(0, ...rs.map((r) => r.stats.netWpm));
          const avgAcc = rs.length ? rs.reduce((a, r) => a + r.stats.accuracy, 0) / rs.length : 0;
          return (
            <div key={l.id} className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow flex flex-wrap justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{l.username}</div>
                <div className="text-xs text-slate-500">Joined {new Date(l.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-6 text-sm">
                <span>Sessions: <b>{rs.length}</b></span>
                <span>Best WPM: <b>{best}</b></span>
                <span>Avg accuracy: <b>{avgAcc.toFixed(1)}%</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
__TCHR__

# -----------------------------------------------------------------------------
# src/App.tsx
# -----------------------------------------------------------------------------
cat > src/App.tsx <<'__APP__'
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lessons from './pages/Lessons';
import LessonPlayer from './pages/LessonPlayer';
import Tests from './pages/Tests';
import Games from './pages/Games';
import Reports from './pages/Reports';
import Certificates from './pages/Certificates';
import Teacher from './pages/Teacher';

const NAV = [
  { to: '/', label: 'Dashboard' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/tests', label: 'Tests' },
  { to: '/games', label: 'Games' },
  { to: '/reports', label: 'Reports' },
  { to: '/certificates', label: 'Certificates' },
];

export default function App() {
  const { user, guest } = useAuth();
  const location = useLocation();

  if (!user && !guest) return <Login />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 bg-white dark:bg-slate-800 shadow-md p-4 flex md:flex-col gap-2 overflow-x-auto">
        <div className="font-bold text-blue-700 dark:text-blue-400 mb-4 whitespace-nowrap">Typing Instructor</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
            {n.label}
          </NavLink>
        ))}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <NavLink to="/teacher" className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${isActive ? 'bg-blue-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
            Teacher
          </NavLink>
        )}
        <div className="md:mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/lessons/:id" element={<LessonPlayer />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/games" element={<Games />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="*" element={<Navigate to="/" replace state={{ from: location.pathname }} />} />
        </Routes>
      </main>
    </div>
  );
}

function LogoutButton() {
  const { logout, user, guest, setTheme } = useAuth();
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 truncate">{user ? user.username : 'Guest'}</div>
      {user && (
        <button onClick={() => setTheme(user.settings.theme === 'dark' ? 'light' : 'dark')}
          className="w-full rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium">
          {user.settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      )}
      <button onClick={logout} className="w-full rounded-lg bg-red-100 text-red-700 px-3 py-1.5 text-xs font-semibold">Sign out</button>
    </div>
  );
}
__APP__

# =============================================================================
# README
# =============================================================================
cat > README.md <<'__README__'
# Typing Instructor

A professional typing tutor (Mavis-Beacon-style) — web + Electron desktop.

## Quick start (web)

```bash
npm install
npm run dev