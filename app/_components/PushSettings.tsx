"use client";

import { usePush } from "../_lib/use-push";
import type { AppData } from "../_lib/types";

const KINDS = [
  { key: "daily", title: "Recordatorio diario", hint: "Te dice qué rutina toca hoy, a la hora que elijas." },
  { key: "rest", title: "Fin del descanso", hint: "Suena cuando termina el descanso, con el teléfono bloqueado." },
  { key: "missed", title: "Día sin registrar", hint: "A las 21:00 si hoy no guardaste ninguna sesión." },
] as const;

export default function PushSettings({ data }: { data: AppData }) {
  const { state, prefs, busy, message, enable, disable, updatePrefs } = usePush(data);

  return (
    <section className="content-section data-section" aria-labelledby="push-title">
      <h2 id="push-title">Notificaciones</h2>

      {state === "checking" && <p>Comprobando…</p>}
      {state === "unsupported" && <p>Este navegador no admite notificaciones push.</p>}
      {state === "needs-install" && <p>En iPhone, instala la app para activarlas: Compartir → Añadir a pantalla de inicio. Luego ábrela desde el icono y vuelve aquí.</p>}
      {state === "blocked" && <p>Las notificaciones están bloqueadas. Actívalas en Ajustes del teléfono o del navegador y recarga.</p>}

      {(state === "off" || state === "on") && (
        <>
          <p>{state === "on" ? "Activadas en este dispositivo." : "Recibe avisos aunque la app esté cerrada."}</p>
          <ul className="push-list">
            {KINDS.map((kind) => (
              <li key={kind.key}>
                <label className="switch-row">
                  <span>{kind.title}<small>{kind.hint}</small></span>
                  <input type="checkbox" role="switch" checked={prefs[kind.key]} onChange={(event) => updatePrefs({ [kind.key]: event.target.checked })} />
                </label>
              </li>
            ))}
          </ul>
          {prefs.daily && (
            <label className="field-label push-time">Hora del recordatorio
              <input type="time" value={prefs.reminderTime} onChange={(event) => event.target.value && updatePrefs({ reminderTime: event.target.value })} />
            </label>
          )}
          <menu className="backup-actions">
            <li>
              {state === "on"
                ? <button className="secondary-button" onClick={disable} disabled={busy}>Desactivar</button>
                : <button className="primary-button" onClick={enable} disabled={busy}>{busy ? "Activando…" : "Activar notificaciones"}</button>}
            </li>
          </menu>
        </>
      )}
      {message && <p className="inline-message" role="status">{message}</p>}
    </section>
  );
}
