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
