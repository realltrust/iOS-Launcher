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
