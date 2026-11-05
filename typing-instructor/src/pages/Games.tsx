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
