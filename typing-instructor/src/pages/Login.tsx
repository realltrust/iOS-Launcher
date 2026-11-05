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
