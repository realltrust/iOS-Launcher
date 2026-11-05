#!/usr/bin/env bash
# =============================================================================
# Typing Instructor — beautify pass
# Applies gradient mesh + SVG waves + glass cards + animated hero login.
# Run from project root (where package.json lives).
# =============================================================================
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src/pages ]; then
  echo "ERROR: run this from the project root (where package.json lives)."
  exit 1
fi

echo "==> Backing up files to *.bak"
for f in tailwind.config.js index.html src/index.css src/main.tsx src/App.tsx \
         src/pages/Login.tsx src/pages/Dashboard.tsx ; do
  [ -f "$f" ] && cp "$f" "$f.bak"
done

mkdir -p src/components

# -----------------------------------------------------------------------------
# tailwind.config.js — keyframes + animations
# -----------------------------------------------------------------------------
cat > tailwind.config.js <<'__TW__'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%':      { transform: 'translateY(-18px) rotate(4deg)' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.55' },
          '50%':      { opacity: '0.9' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out both',
        'pulse-slow': 'pulse-slow 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
};
__TW__

# -----------------------------------------------------------------------------
# index.html — theme color + font preconnect
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
  </head>
  <body class="bg-slate-100 dark:bg-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
__HTML__

# -----------------------------------------------------------------------------
# src/index.css — glass utilities + scrollbar polish
# -----------------------------------------------------------------------------
cat > src/index.css <<'__CSS__'
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
}
.dark body { color: #e2e8f0; }

@layer components {
  .glass-card {
    @apply rounded-2xl border border-white/60 bg-white/70 shadow-xl shadow-slate-900/5 backdrop-blur-xl
           dark:border-slate-700/60 dark:bg-slate-800/60;
  }
  .glass-soft {
    @apply rounded-xl border border-white/50 bg-white/55 backdrop-blur-md
           dark:border-slate-700/50 dark:bg-slate-800/50;
  }
  .glass-nav {
    @apply border-white/50 bg-white/75 backdrop-blur-xl
           dark:border-slate-800/60 dark:bg-slate-900/70;
  }
}

.key { transition: transform .05s, background-color .1s; }
.key:active, .key.pressed { transform: scale(0.94); }

/* Subtle scrollbar in dark mode */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-thumb { background: rgba(100,116,139,.35); border-radius: 8px; }
.dark ::-webkit-scrollbar-thumb { background: rgba(148,163,184,.25); }

@media print {
  body * { visibility: hidden; }
  #certificate, #certificate * { visibility: visible; }
  #certificate { position: absolute; left: 0; top: 0; width: 100%; }
}
__CSS__

# -----------------------------------------------------------------------------
# src/components/Background.tsx — fixed background layer (SVG + CSS)
# -----------------------------------------------------------------------------
cat > src/components/Background.tsx <<'__BG__'
export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

      {/* Color blobs (soft mesh) */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-400/30 blur-3xl animate-pulse-slow dark:bg-indigo-500/20" />
      <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
      <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-3xl animate-pulse-slow dark:bg-violet-500/20" />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Bottom wave (SVG) */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[34%] w-full opacity-50 dark:opacity-25"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,224 C240,128 480,288 720,224 C960,160 1200,256 1440,192 L1440,320 L0,320 Z"
          fill="url(#wave-g)"
        />
        <path
          d="M0,256 C240,192 480,320 720,272 C960,224 1200,304 1440,240 L1440,320 L0,320 Z"
          fill="url(#wave-g2)"
        />
      </svg>

      {/* Top-right subtle diagonal strokes */}
      <svg
        className="absolute -right-10 top-0 h-72 w-72 opacity-30 dark:opacity-15"
        viewBox="0 0 200 200"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={20 + i * 24}
            y1="0"
            x2={140 + i * 24}
            y2="200"
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
__BG__

# -----------------------------------------------------------------------------
# src/main.tsx — render Background behind App
# -----------------------------------------------------------------------------
cat > src/main.tsx <<'__MAIN__'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Background } from './components/Background';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Background />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
__MAIN__

# -----------------------------------------------------------------------------
# src/App.tsx — glass sidebar, denser nav
# -----------------------------------------------------------------------------
cat > src/App.tsx <<'__APP__'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
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
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <aside className="glass-nav md:w-60 p-4 flex md:flex-col gap-2 overflow-x-auto md:border-b-0 border-b">
        <div className="flex items-center gap-2 mb-4 whitespace-nowrap">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" strokeLinecap="round" />
            </svg>
          </div>
          <div className="font-bold text-slate-800 dark:text-white">Typing Instructor</div>
        </div>

        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`
            }
          >
            {n.label}
          </NavLink>
        ))}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <NavLink
            to="/teacher"
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60'
              }`
            }
          >
            Teacher
          </NavLink>
        )}
        <div className="md:mt-auto pt-4">
          <LogoutButton />
        </div>
      </aside>

      <main className="relative flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto animate-fade-in">
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
  const { logout, user, setTheme } = useAuth();
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
        {user ? user.username : 'Guest'}
      </div>
      {user && (
        <button
          onClick={() => setTheme(user.settings.theme === 'dark' ? 'light' : 'dark')}
          className="w-full rounded-lg bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-slate-700/50 px-3 py-1.5 text-xs font-medium"
        >
          {user.settings.theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      )}
      <button
        onClick={logout}
        className="w-full rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/20 transition"
      >
        Sign out
      </button>
    </div>
  );
}
__APP__

# -----------------------------------------------------------------------------
# src/pages/Login.tsx — hero with floating keys + glass card
# -----------------------------------------------------------------------------
cat > src/pages/Login.tsx <<'__LOGIN__'
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const FLOATERS = ['A','S','D','F','J','K','L',';','Q','W','E','R','T','Y','U','I','O','P','G','H'];

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
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Floating letter field */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {FLOATERS.map((ch, i) => (
          <div
            key={i}
            className="absolute select-none font-black text-indigo-500/10 dark:text-indigo-300/10 animate-float"
            style={{
              top: `${(i * 37) % 90}%`,
              left: `${(i * 53) % 95}%`,
              fontSize: `${2.2 + (i % 4)}rem`,
              animationDelay: `${(i * 0.35).toFixed(2)}s`,
              animationDuration: `${6 + (i % 3)}s`,
            }}
          >
            {ch}
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">Typing Instructor</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Learn to type, the right way</div>
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex gap-2 mb-4 rounded-lg bg-white/50 dark:bg-slate-900/40 p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                  mode === m
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {mode === 'register' && (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'learner' | 'teacher')}
                className="w-full rounded-lg border border-slate-300/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/60 px-3 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="learner">Learner</option>
                <option value="teacher">Teacher</option>
              </select>
            )}
            {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}
            <button className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button
            onClick={loginAsGuest}
            className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Continue as guest (practice only)
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
          Your data stays on this device. No cloud account needed.
        </p>
      </div>
    </div>
  );
}
__LOGIN__

# -----------------------------------------------------------------------------
# src/pages/Dashboard.tsx — glass hero + glass stat cards
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
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1); }
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
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 p-6 text-white shadow-xl shadow-indigo-500/25">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-cyan-300/30 blur-2xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="relative">
          <h1 className="text-2xl font-bold">Welcome back{user ? `, ${user.username}` : ', guest'}</h1>
          <p className="text-indigo-100">Keep practicing — consistency beats intensity.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              🔥 {streak}-day streak
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              🏆 {earned.length} achievements
            </span>
            <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              ⚡ {latest ? latest.stats.netWpm : 0} WPM
            </span>
          </div>
        </div>
      </div>

      {guest && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-100/70 dark:bg-amber-500/10 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 p-3 text-sm backdrop-blur">
          You are in guest mode. Create an account to save progress.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Net WPM" value={latest ? latest.stats.netWpm : 0} accent="from-indigo-500 to-cyan-500" />
        <Stat label="Accuracy" value={latest ? `${latest.stats.accuracy}%` : '—'} accent="from-emerald-500 to-teal-500" />
        <Stat label="Lessons done" value={`${completed}/${CURRICULUM.length}`} accent="from-violet-500 to-fuchsia-500" />
        <Stat label="Practice time" value={`${Math.round(totalTimeMs / 60000)} min`} accent="from-amber-500 to-orange-500" />
        <Stat label="Day streak" value={streak} accent="from-rose-500 to-pink-500" />
        <Stat label="Sessions" value={results.length} accent="from-sky-500 to-blue-500" />
        <Stat label="Achievements" value={`${earned.length}/${ACHIEVEMENTS.length}`} accent="from-cyan-500 to-indigo-500" />
        <Stat label="Level" value={completed >= 24 ? 'Advanced' : completed >= 14 ? 'Intermediate' : 'Beginner'} accent="from-indigo-500 to-violet-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">WPM progress</h2>
          <LineChart points={chartPoints} />
        </div>
        <div className="glass-card p-4">
          <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Recommended next lesson</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-3">{nextLesson.title} — {nextLesson.description}</p>
          <Link
            to={`/lessons/${nextLesson.id}`}
            className="inline-block rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/25"
          >
            Start lesson
          </Link>
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Recent results</h2>
        {results.length === 0 && <p className="text-slate-500 text-sm">No results yet. Start a lesson!</p>}
        <ul className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
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

function Stat({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
__DASH__

# =============================================================================
# Build
# =============================================================================
echo "==> npm run build"
npm run build

cat <<'NEXT'

✓ Beautify pass applied.

What changed:
  • Fixed gradient-mesh background with animated color blobs
  • SVG wave at bottom + diagonal strokes at top-right
  • Animated dot grid overlay
  • Glass-morphism cards & sidebar (glass-card / glass-nav utilities)
  • Hero login with floating letter field
  • Gradient-brand hero card on the dashboard + accent bars on stat tiles
  • Smooth fade-in on routes

Run:  npm run dev

Revert anything with the *.bak files if you dislike a change.
NEXT