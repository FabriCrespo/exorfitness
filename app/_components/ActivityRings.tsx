type Ring = { label: string; percent: number; detail: string };

const COLORS = ["var(--ring-1)", "var(--ring-2)", "var(--ring-3)"];
const SIZE = 132;
const STROKE = 13;
const GAP = 3;

/** Anillos de actividad al estilo de la app Fitness de iOS: un anillo por meta semanal. */
export default function ActivityRings({ rings }: { rings: Ring[] }) {
  const center = SIZE / 2;
  return (
    <div className="rings">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={rings.map((ring) => `${ring.label} ${ring.percent}%`).join(", ")}>
        {rings.map((ring, index) => {
          const radius = center - STROKE / 2 - index * (STROKE + GAP);
          const circumference = 2 * Math.PI * radius;
          const progress = Math.min(100, Math.max(0, ring.percent)) / 100;
          return (
            <g key={ring.label} transform={`rotate(-90 ${center} ${center})`}>
              <circle cx={center} cy={center} r={radius} fill="none" stroke={COLORS[index]} strokeOpacity={0.2} strokeWidth={STROKE} />
              {progress > 0 && <circle cx={center} cy={center} r={radius} fill="none" stroke={COLORS[index]} strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={`${circumference * progress} ${circumference}`} />}
            </g>
          );
        })}
      </svg>
      <ul className="rings-legend">
        {rings.map((ring, index) => (
          <li key={ring.label}>
            <i style={{ background: COLORS[index] }} aria-hidden="true" />
            <span>{ring.label}<small>{ring.detail}</small></span>
            <b>{ring.percent}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
