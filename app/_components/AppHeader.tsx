import Image from "next/image";
import type { Theme } from "../_lib/types";

type Props = {
  theme: Theme;
  storageMessage: string;
  onHome: () => void;
  onToggleTheme: () => void;
};

export default function AppHeader({ theme, storageMessage, onHome, onToggleTheme }: Props) {
  const nextTheme = theme === "light" ? "oscuro" : "claro";

  return (
    <header className="topbar flex items-center justify-between">
      <button className="wordmark" onClick={onHome} aria-label="ExorFitness, ir a tu rutina">
        <Image src="/exorfitness-mark.svg" width={38} height={38} alt="" aria-hidden="true" />
      </button>
      <div className="topbar-actions">
        <button className="theme-toggle" onClick={onToggleTheme} aria-label={`Activar modo ${nextTheme}`} title={`Cambiar a modo ${nextTheme}`}>
          {theme === "light" ? (
            <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.4 12.7A7 7 0 0 1 7.3 3.6 7.1 7.1 0 1 0 16.4 12.7Z" /><path d="M13.8 3.2v3.2M12.2 4.8h3.2" /></svg>
          ) : (
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.3" /><path d="M10 1.8v2M10 16.2v2M18.2 10h-2M3.8 10h-2m14-5.8-1.4 1.4M5.6 14.4l-1.4 1.4m11.6 0-1.4-1.4M5.6 5.6 4.2 4.2" /></svg>
          )}
          <span>{theme === "light" ? "Oscuro" : "Claro"}</span>
        </button>
        <span className="save-indicator"><i />{storageMessage || "Se guarda al momento"}</span>
      </div>
    </header>
  );
}
