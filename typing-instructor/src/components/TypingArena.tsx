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
