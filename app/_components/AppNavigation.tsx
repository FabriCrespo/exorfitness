import type { Tab } from "../_lib/types";

type Props = { tab: Tab; onChange: (tab: Tab) => void };

const ITEMS: { id: Tab; label: string }[] = [
  { id: "routine", label: "Rutina" },
  { id: "progress", label: "Progreso" },
  { id: "data", label: "Datos" },
];

export default function AppNavigation({ tab, onChange }: Props) {
  return (
    <nav className="app-nav" aria-label="Secciones">
      {ITEMS.map((item) => (
        <button key={item.id} className={`nav-item ${tab === item.id ? "is-active" : ""}`} onClick={() => onChange(item.id)} aria-current={tab === item.id ? "page" : undefined}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
