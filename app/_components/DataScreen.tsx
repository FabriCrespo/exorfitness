"use client";

import { type ChangeEvent, useState } from "react";
import type { AppData } from "../_lib/types";

type Props = {
  data: AppData;
  storageMessage: string;
  onExport: () => void;
  onImport: (file: File) => Promise<string | null>;
};

export default function DataScreen({ data, storageMessage, onExport, onImport }: Props) {
  const [importMessage, setImportMessage] = useState("");
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

  return (
    <article className="page-content" aria-labelledby="page-title">
      <header className="content-heading">
        <hgroup><p className="date-line">TU COPIA PERSONAL</p><h1 id="page-title">Datos</h1></hgroup>
      </header>

      <section className="content-section data-section" aria-labelledby="backup-title">
        <h2 id="backup-title">Tu registro se queda en este navegador</h2>
        <p>Descarga una copia JSON para guardarla o pasarla a otro dispositivo.</p>
        <menu className="backup-actions">
          <li><button className="primary-button" onClick={onExport}>Exportar JSON</button></li>
          <li><label className="secondary-button">Importar JSON<input type="file" accept="application/json,.json" onChange={handleImport} /></label></li>
        </menu>
        {importMessage && <p className="inline-message" role="status">{importMessage}</p>}
        <p className="storage-note"><i />{storageMessage || "Se guarda al momento."}</p>
      </section>

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
