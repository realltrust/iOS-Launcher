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
