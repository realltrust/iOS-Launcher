interface Point { label: string; value: number; }

export function LineChart({ points, height = 160 }: { points: Point[]; height?: number }) {
  if (points.length === 0) return <div className="text-slate-400 text-sm">No data yet.</div>;
  const w = 520;
  const pad = 24;
  const max = Math.max(...points.map((p) => p.value), 10);
  const step = points.length > 1 ? (w - pad * 2) / (points.length - 1) : 0;
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${pad + i * step} ${y(p.value)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full">
      <path d={d} fill="none" stroke="#2563eb" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={pad + i * step} cy={y(p.value)} r={3} fill="#2563eb" />
      ))}
      <text x={pad} y={height - 4} fontSize="10" fill="#64748b">{points[0].label}</text>
      <text x={w - pad} y={height - 4} fontSize="10" fill="#64748b" textAnchor="end">
        {points[points.length - 1].label}
      </text>
    </svg>
  );
}
