import type { ReactNode } from "react";
import type { Tab } from "../_lib/types";

type Props = { tab: Tab; onChange: (tab: Tab) => void };

const icon = (path: ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>;

const ITEMS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "home", label: "Inicio", icon: icon(<path d="M4 11.5 12 5l8 6.5V20h-5v-5H9v5H4z" />) },
  { id: "routine", label: "Rutina", icon: icon(<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />) },
  { id: "progress", label: "Progreso", icon: icon(<path d="M5 20V12M10 20V6M15 20v-9M20 20V9" />) },
  { id: "body", label: "Cuerpo", icon: icon(<><circle cx="12" cy="5" r="2.2" /><path d="M8 10h8l-1 5-1 6h-4l-1-6zM8 10 6 15M16 10l2 5" /></>) },
  { id: "data", label: "Datos", icon: icon(<path d="M8 4h8l3 3v13H5V4zM9 11h6M9 15h6" />) },
];

export default function AppNavigation({ tab, onChange }: Props) {
  return (
    <nav className="app-nav" aria-label="Secciones">
      {ITEMS.map((item) => (
        <button key={item.id} className={`nav-item ${tab === item.id ? "is-active" : ""}`} onClick={() => onChange(item.id)} aria-current={tab === item.id ? "page" : undefined}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
