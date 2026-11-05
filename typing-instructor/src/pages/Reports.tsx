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
