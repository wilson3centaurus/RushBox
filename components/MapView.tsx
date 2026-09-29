/**
 * Stylised stand-in for the live map. Swap for Mapbox/Google Maps once the
 * tracking backend streams real coordinates.
 */
export function MapView({
  from,
  to,
  progress = 0.55,
  height = "h-52",
}: {
  from: string;
  to: string;
  progress?: number;
  height?: string;
}) {
  const t = Math.min(Math.max(progress, 0), 1);
  const x = 30 + t * 240;
  const y = 130 - Math.sin(t * Math.PI) * 55;

  return (
    <div className={`relative ${height} w-full overflow-hidden bg-ink-100`}>
      <svg
        viewBox="0 0 300 160"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <rect width="300" height="160" fill="#e8edf2" />
        {[20, 55, 90, 125].map((gy) => (
          <line key={gy} x1="0" y1={gy} x2="300" y2={gy} stroke="#d7dfe7" strokeWidth="1" />
        ))}
        {[40, 95, 150, 205, 260].map((gx) => (
          <line key={gx} x1={gx} y1="0" x2={gx} y2="160" stroke="#d7dfe7" strokeWidth="1" />
        ))}
        <path d="M0 105 H300" stroke="#cbd5e1" strokeWidth="7" />
        <path d="M150 0 V160" stroke="#cbd5e1" strokeWidth="7" />
        <circle cx="70" cy="40" r="22" fill="#d8e6d3" />
        <circle cx="240" cy="60" r="16" fill="#d8e6d3" />

        <path
          d="M30 130 Q150 20 270 130"
          stroke="#2c3e50"
          strokeWidth="3.5"
          fill="none"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
        <circle cx="30" cy="130" r="7" fill="#2c3e50" />
        <circle cx="270" cy="130" r="7" fill="#f39c12" />
        <circle cx={x} cy={y} r="11" fill="#f39c12" opacity="0.25" />
        <circle cx={x} cy={y} r="6" fill="#f39c12" stroke="#fff" strokeWidth="2.5" />
      </svg>

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur px-3 py-2 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-ink-900 shrink-0" />
        <span className="text-[11px] font-medium text-ink-700 truncate flex-1">
          {from}
        </span>
        <span className="text-ink-300">→</span>
        <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
        <span className="text-[11px] font-medium text-ink-700 truncate flex-1">
          {to}
        </span>
      </div>
    </div>
  );
}

export function Timeline({
  steps,
  current,
}: {
  steps: { label: string; sub?: string }[];
  current: number;
}) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li key={s.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-brand-400 text-ink-900"
                      : "bg-ink-200 text-ink-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {last ? null : (
                <span
                  className={`w-0.5 flex-1 min-h-8 ${done ? "bg-emerald-500" : "bg-ink-200"}`}
                />
              )}
            </div>
            <div className={`pb-6 ${last ? "pb-0" : ""}`}>
              <p
                className={`text-sm leading-tight ${active || done ? "font-semibold text-ink-900" : "text-ink-400"}`}
              >
                {s.label}
              </p>
              {s.sub ? (
                <p className="text-xs text-ink-500 mt-0.5">{s.sub}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
