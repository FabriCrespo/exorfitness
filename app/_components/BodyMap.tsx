import { type MuscleId, muscleLabel } from "../_lib/muscles";

export type BodyView = "front" | "back";

type Region = { id: MuscleId; /** Trazos del lado izquierdo; el derecho es su espejo. */ left?: string[]; /** Trazos centrales, sin espejo. */ center?: string[] };

const ARM_UPPER = "M41 98 C40 112 40 126 42 140 L56 142 C58 128 58 114 57 102 Z";
const ARM_LOWER = "M41 146 L56 148 C55 164 52 178 50 194 L39 190 C40 176 41 160 41 146 Z";
const DELTOID = "M58 70 C48 72 42 82 42 96 L56 102 C58 92 62 82 64 74 Z";

const FRONT: Region[] = [
  { id: "pecho", left: ["M98 72 L98 112 C84 116 70 112 62 100 C60 88 66 76 80 72 Z"] },
  { id: "abdomen", center: ["M80 118 L120 118 L118 172 C112 182 88 182 82 172 Z"], left: ["M62 106 L78 118 L80 170 L70 176 C64 160 62 134 62 106 Z"] },
  { id: "hombros", left: [DELTOID] },
  { id: "biceps", left: [ARM_UPPER] },
  { id: "antebrazos", left: [ARM_LOWER] },
  { id: "cuadriceps", left: ["M66 186 L98 186 L96 262 C88 278 76 278 72 262 C66 240 64 210 66 186 Z"] },
  { id: "gemelos", left: ["M70 286 L92 286 L88 380 L76 380 Z"] },
];

const BACK: Region[] = [
  { id: "trapecio", center: ["M100 54 C86 60 72 66 64 72 L100 102 L136 72 C128 66 114 60 100 54 Z"] },
  { id: "espalda", left: ["M64 78 L98 104 L98 152 L76 142 C64 126 62 100 64 78 Z"] },
  { id: "hombros", left: [DELTOID] },
  { id: "triceps", left: [ARM_UPPER] },
  { id: "antebrazos", left: [ARM_LOWER] },
  { id: "lumbar", center: ["M82 154 L118 154 L116 184 L84 184 Z"] },
  { id: "gluteos", left: ["M64 186 L99 186 L99 228 C84 240 66 232 62 214 C60 202 62 194 64 186 Z"] },
  { id: "isquios", left: ["M64 234 L98 232 L96 282 C88 292 76 292 72 280 C66 264 64 250 64 234 Z"] },
  { id: "gemelos", left: ["M68 298 C66 316 68 340 74 378 L86 378 C92 340 94 316 92 298 Z"] },
];

type Props = {
  view: BodyView;
  selected: Set<MuscleId>;
  /** Días desde que se trabajó cada músculo. */
  worked: Partial<Record<MuscleId, number>>;
  onToggle: (id: MuscleId) => void;
};

const MIRROR = "translate(200 0) scale(-1 1)";

/** Maniquí plano con cada músculo como zona tocable. Los dos lados de un músculo se eligen juntos. */
export default function BodyMap({ view, selected, worked, onToggle }: Props) {
  const regions = view === "front" ? FRONT : BACK;
  return (
    <svg className="body-map" viewBox="0 0 200 400" role="group" aria-label={view === "front" ? "Cuerpo, vista frontal" : "Cuerpo, vista posterior"}>
      <g className="body-base" aria-hidden="true">
        <circle cx="100" cy="30" r="18" />
        <rect x="91" y="46" width="18" height="14" rx="4" />
        <path d="M64 68 L136 68 L132 188 L68 188 Z" />
        <path d="M40 94 L58 100 L52 198 L38 194 Z" />
        <path d="M40 94 L58 100 L52 198 L38 194 Z" transform={MIRROR} />
        <path d="M65 184 L99 184 L97 392 L72 392 Z" />
        <path d="M65 184 L99 184 L97 392 L72 392 Z" transform={MIRROR} />
      </g>
      {regions.map((region) => {
        const state = selected.has(region.id) ? "is-selected" : (worked[region.id] ?? 9) <= 1 ? "is-recovering" : "";
        const label = `${muscleLabel(region.id)}${selected.has(region.id) ? ", seleccionado" : ""}`;
        return (
          <g
            key={region.id}
            className={`muscle ${state}`}
            role="button"
            tabIndex={0}
            aria-pressed={selected.has(region.id)}
            aria-label={label}
            onClick={() => onToggle(region.id)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggle(region.id); } }}
          >
            {region.center?.map((d) => <path key={d} d={d} />)}
            {region.left?.map((d) => <path key={`l-${d}`} d={d} />)}
            {region.left?.map((d) => <path key={`r-${d}`} d={d} transform={MIRROR} />)}
          </g>
        );
      })}
    </svg>
  );
}
