export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950" />

      {/* Color blobs (soft mesh) */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-400/30 blur-3xl animate-pulse-slow dark:bg-indigo-500/20" />
      <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-500/20" />
      <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-400/20 blur-3xl animate-pulse-slow dark:bg-violet-500/20" />

      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(99 102 241) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Bottom wave (SVG) */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[34%] w-full opacity-50 dark:opacity-25"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="wave-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wave-g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,224 C240,128 480,288 720,224 C960,160 1200,256 1440,192 L1440,320 L0,320 Z"
          fill="url(#wave-g)"
        />
        <path
          d="M0,256 C240,192 480,320 720,272 C960,224 1200,304 1440,240 L1440,320 L0,320 Z"
          fill="url(#wave-g2)"
        />
      </svg>

      {/* Top-right subtle diagonal strokes */}
      <svg
        className="absolute -right-10 top-0 h-72 w-72 opacity-30 dark:opacity-15"
        viewBox="0 0 200 200"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={i}
            x1={20 + i * 24}
            y1="0"
            x2={140 + i * 24}
            y2="200"
            stroke="#6366f1"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </div>
  );
}
