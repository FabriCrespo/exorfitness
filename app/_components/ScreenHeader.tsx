import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  actions?: ReactNode;
};

export default function ScreenHeader({ title, subtitle, onBack, actions }: Props) {
  return (
    <header className="screen-header">
      <button className="icon-button" onClick={onBack} aria-label="Volver">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
      </button>
      <hgroup>
        <h1 id="page-title">{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </hgroup>
      <div className="screen-header-actions">{actions}</div>
    </header>
  );
}
