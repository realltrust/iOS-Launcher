import type { TypingStats } from '../types';

export function computeStats(
  target: string,
  typed: string,
  elapsedMs: number,
  backspaces: number,
  intervals: number[],
): TypingStats {
  let correct = 0;
  let incorrect = 0;
  const n = Math.min(typed.length, target.length);
  for (let i = 0; i < n; i++) {
    if (typed[i] === target[i]) correct++;
    else incorrect++;
  }
  if (typed.length > target.length) incorrect += typed.length - target.length;

  const minutes = Math.max(elapsedMs, 1) / 60000;
  const grossWpm = typed.length / 5 / minutes;
  const netWpm = Math.max(0, correct - incorrect) / 5 / minutes;
  const cpm = typed.length / minutes;
  const accuracy = typed.length === 0 ? 100 : (correct / (correct + incorrect)) * 100;
  const progress = target.length ? Math.min(typed.length / target.length, 1) * 100 : 0;

  let consistency = 100;
  if (intervals.length > 3) {
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    consistency = Math.max(0, Math.min(100, 100 - cv * 100));
  }

  return {
    wpm: Math.round(grossWpm),
    netWpm: Math.round(netWpm),
    cpm: Math.round(cpm),
    accuracy: Math.round(accuracy * 10) / 10,
    correct,
    incorrect,
    backspaces,
    keystrokes: typed.length + backspaces,
    elapsedMs,
    progress: Math.round(progress * 10) / 10,
    consistency: Math.round(consistency),
  };
}
