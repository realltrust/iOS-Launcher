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
