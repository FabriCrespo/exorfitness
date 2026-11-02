import type { ChangeEvent } from "react";
import type { Measurement, RoutineDay, WorkoutSession } from "../_lib/types";

type Props = {
  days: RoutineDay[];
  sessions: WorkoutSession[];
  measurements: Measurement[];
  storageMessage: string;
  importMessage: string;
  onExport: () => void;
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function DataScreen({ days, sessions, measurements, storageMessage, importMessage, onExport, onImport }: Props) {
  return (
    <section className="page-content" aria-labelledby="page-title">
      <div className="content-heading"><div><p className="date-line">TU COPIA PERSONAL</p><h1 id="page-title">Datos</h1></div></div>
      <section className="content-section data-section">
        <h2>Tu registro se queda en este navegador</h2>
        <p>Descarga una copia JSON para guardarla o pasarla a otro dispositivo.</p>
        <div className="backup-actions"><button className="primary-button" onClick={onExport}>Exportar JSON</button><label className="secondary-button">Importar JSON<input type="file" accept="application/json,.json" onChange={onImport} /></label></div>
        {importMessage && <p className="inline-message" role="status">{importMessage}</p>}
        <p className="storage-note"><i />{storageMessage || "Se guarda al momento."}</p>
      </section>
      <section className="content-section">
        <div className="section-bar"><div><h2>Incluye</h2><p>Rutina, sesiones, medidas, cardio y series al fallo.</p></div></div>
        <div className="data-summary-list"><div><span>Ejercicios en la rutina</span><strong>{days.reduce((sum, day) => sum + day.exercises.length, 0)}</strong></div><div><span>Sesiones</span><strong>{sessions.length}</strong></div><div><span>Medidas</span><strong>{measurements.length}</strong></div></div>
      </section>
    </section>
  );
}
