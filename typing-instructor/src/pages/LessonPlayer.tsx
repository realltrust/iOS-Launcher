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
