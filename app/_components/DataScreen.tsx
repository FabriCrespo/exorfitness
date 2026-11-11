"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import type { AppData } from "../_lib/types";
import PushSettings from "./PushSettings";
import { periodPayload, sessionDays, sessionWeeks } from "../_lib/export-sessions";

type Props = {
  data: AppData;
  storageMessage: string;
  onExport: () => void;
  onImport: (file: File) => Promise<string | null>;
};

export default function DataScreen({ data, storageMessage, onExport, onImport }: Props) {
  const [importMessage, setImportMessage] = useState("");
  const [scope, setScope] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const periods = useMemo(() => (scope === "day" ? sessionDays(data.sessions) : sessionWeeks(data.sessions)), [data.sessions, scope]);
  const period = periods.find((item) => item.key === selected) ?? periods[0];
  const exerciseCount = data.days.reduce((sum, day) => sum + day.exercises.length, 0);

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setImportMessage("");
    const message = await onImport(file);
    if (message) setImportMessage(message);
    input.value = "";
  };

  const payload = () => JSON.stringify(periodPayload(period, scope, data), null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(payload());
      setShareMessage("Copiado al portapapeles.");
    } catch {
      setShareMessage("No se pudo copiar. Prueba con Descargar.");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([payload()], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `exorfitness-${scope === "day" ? "dia" : "semana"}-${period.key}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setShareMessage("Archivo descargado.");
  };

  const changeScope = (next: "day" | "week") => { setScope(next); setSelected(""); setShareMessage(""); };

  return (
    <article className="page-content" aria-labelledby="page-title">
      <header className="content-heading">
        <hgroup><p className="date-line">TU COPIA PERSONAL</p><h1 id="page-title">Datos</h1></hgroup>
      </header>

      <section className="content-section data-section" aria-labelledby="backup-title">
        <h2 id="backup-title">Tu registro se queda en este navegador</h2>
        <p>Respaldo completo de toda la app. Para un solo día o semana, usa la sección de abajo.</p>
        <menu className="backup-actions">
          <li><button className="primary-button" onClick={onExport}>Respaldo completo</button></li>
          <li><label className="secondary-button">Importar JSON<input type="file" accept="application/json,.json" onChange={handleImport} /></label></li>
        </menu>
        {importMessage && <p className="inline-message" role="status">{importMessage}</p>}
        <p className="storage-note"><i />{storageMessage || "Se guarda al momento."}</p>
      </section>

      <section className="content-section data-section" aria-labelledby="share-title">
        <h2 id="share-title">Copiar o descargar</h2>
        <p>Elige un día o una semana de sesiones.</p>
        {period ? (
          <>
            <div className="segmented share-scope" role="group" aria-label="Periodo">
              <button type="button" className={scope === "day" ? "is-active" : undefined} aria-pressed={scope === "day"} onClick={() => changeScope("day")}>Día</button>
              <button type="button" className={scope === "week" ? "is-active" : undefined} aria-pressed={scope === "week"} onClick={() => changeScope("week")}>Semana</button>
            </div>
            <label className="share-select"><span className="sr-only">{scope === "day" ? "Día" : "Semana"}</span>
              <select value={period.key} onChange={(event) => { setSelected(event.target.value); setShareMessage(""); }}>
                {periods.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </select>
            </label>
            <figure className="share-preview">
              <figcaption>Vista previa · {period.sessions.length} {period.sessions.length === 1 ? "sesión" : "sesiones"}</figcaption>
              <pre tabIndex={0} aria-label="Vista previa del JSON"><code>{payload()}</code></pre>
            </figure>
            <menu className="backup-actions">
              <li><button className="primary-button" onClick={copy}>Copiar</button></li>
              <li><button className="secondary-button" onClick={download}>Descargar</button></li>
            </menu>
            {shareMessage && <p className="inline-message" role="status">{shareMessage}</p>}
          </>
        ) : (
          <p className="empty-state">Cuando termines una sesión podrás copiarla o descargarla aquí.</p>
        )}
      </section>

      <PushSettings data={data} />

      <section className="content-section" aria-labelledby="summary-title">
        <header className="section-bar">
          <hgroup><h2 id="summary-title">Incluye</h2><p>Rutina, sesiones, medidas, cardio y series al fallo.</p></hgroup>
        </header>
        <dl className="data-summary-list">
          <div><dt>Ejercicios en la rutina</dt><dd><strong>{exerciseCount}</strong></dd></div>
          <div><dt>Sesiones</dt><dd><strong>{data.sessions.length}</strong></dd></div>
          <div><dt>Medidas</dt><dd><strong>{data.measurements.length}</strong></dd></div>
        </dl>
      </section>
    </article>
  );
}
