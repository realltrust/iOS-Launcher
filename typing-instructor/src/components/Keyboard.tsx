import { LAYOUTS, FINGER_COLORS, fingerOf, FINGER_LABELS } from '../data/keyboard';

interface Props {
  nextKey?: string;
  lastKey?: string;
  errorKey?: string;
  layout?: string;
}

export function Keyboard({ nextKey, lastKey, errorKey, layout = 'qwerty' }: Props) {
  const rows = LAYOUTS[layout] ?? LAYOUTS.qwerty;
  const nextFinger = nextKey ? fingerOf(nextKey.toLowerCase()) : undefined;

  return (
    <div className="w-full max-w-3xl mx-auto select-none">
      <div className="space-y-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-1">
            {row.map((k) => {
              const isNext = nextKey && nextKey.toLowerCase() === k.code.toLowerCase();
              const isLast = lastKey && lastKey.toLowerCase() === k.code.toLowerCase();
              const isErr = errorKey && errorKey.toLowerCase() === k.code.toLowerCase();
              const finger = fingerOf(k.code.toLowerCase());
              const bg = finger ? FINGER_COLORS[finger] : '#cbd5e1';
              return (
                <div
                  key={k.code + k.label}
                  className={`key flex items-center justify-center rounded-md border text-xs font-semibold
                    ${isErr ? 'ring-2 ring-red-500' : ''}
                    ${isNext ? 'ring-2 ring-blue-600 scale-105' : ''}
                    ${isLast ? 'pressed' : ''}`}
                  style={{
                    width: `${(k.wide ?? 1) * 2.6}rem`,
                    height: '2.6rem',
                    backgroundColor: isNext ? '#bfdbfe' : isLast ? '#dbeafe' : bg,
                    color: '#0f172a',
                    opacity: k.special ? 0.85 : 1,
                  }}
                >
                  {k.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300">
        {nextFinger
          ? <>Next key: <b>{nextKey}</b> — use <b>{FINGER_LABELS[nextFinger]}</b></>
          : 'Home row: A S D F — J K L ;'}
      </div>
    </div>
  );
}
