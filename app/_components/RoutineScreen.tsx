import type { AppData, RoutineDay, SetEntry } from "../_lib/types";
import type { WorkoutStats } from "../_lib/workout-stats";
import { formatDate, formatNumber } from "../_lib/workout-data";
import ExerciseSessionCard from "./ExerciseSessionCard";
import RoutineExerciseRow from "./RoutineExerciseRow";
import WeekSelector from "./WeekSelector";

type Props = {
  data: AppData;
  stats: WorkoutStats;
  onAddExercise: () => void;
  onSelectDay: (index: number) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onApplyFlexRoutine: (source: RoutineDay) => void;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onUpdateSet: (exerciseId: string, setId: string, patch: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  onOpenHistory: () => void;
};

function returnNote({ isCardioDay, focus, hasSessions }: { isCardioDay: boolean; focus: string; hasSessions: boolean }) {
  if (isCardioDay) return "Mantén el ritmo moderado: deberías poder hablar en frases completas. Empieza con 20 minutos si todavía hay fatiga.";
  if (focus === "Full body") return "Al volver después de la pausa, usa cargas cómodas y deja 2–3 repeticiones en reserva. Si te recuperas bien durante un par de semanas, subimos poco a poco.";
  if (hasSessions) return "Usa el último registro como referencia y ajusta el peso a cómo te sientes hoy.";
  return "Primera sesión después de la pausa. Registra cómo te sientes hoy; ese será tu nuevo punto de referencia.";
}

export default function RoutineScreen({ data, stats, onAddExercise, onSelectDay, onRemoveExercise, onApplyFlexRoutine, onStart, onFinish, onCancel, onUpdateSet, onAddSet, onOpenHistory }: Props) {
  const { selectedDay, activeSession, isCardioDay, flexSource, newestFirst } = stats;
  const hasSessions = data.sessions.length > 0;
  const lastLogged = (exerciseId: string) => {
    const workout = newestFirst.find((session) => session.exercises.some((exercise) => exercise.exerciseId === exerciseId));
    const exercise = workout?.exercises.find((item) => item.exerciseId === exerciseId);
    return { workout, exercise };
  };

  return (
    <article className="page-content" aria-labelledby="page-title">
      <WeekSelector days={data.days} selectedIndex={data.selectedDay} completedCount={stats.fixedDaysDone} isComplete={stats.isDayDone} onSelect={onSelectDay} />

      <header className="content-heading">
        <hgroup>
          <p className="date-line">{selectedDay.label} · {selectedDay.flexible ? "elige tu foco" : "tu plan"}</p>
          <h1 id="page-title">{activeSession ? "Sesión en curso" : selectedDay.focus}</h1>
        </hgroup>
        {activeSession && <p className="live-pill"><i />En curso</p>}
      </header>

      {!activeSession && !selectedDay.flexible && <aside className="return-note"><p>{returnNote({ isCardioDay, focus: selectedDay.focus, hasSessions })}</p></aside>}

      {selectedDay.flexible && !activeSession && (
        <section className="flex-day-panel" aria-label="Rutina flexible">
          {selectedDay.exercises.length === 0 ? (
            <>
              <p className="date-line">VIERNES Y SÁBADO SON TUYOS</p>
              <h2>{flexSource ? `Una idea para ${selectedDay.label.toLowerCase()}` : "Esta semana está al día"}</h2>
              <p className="flex-reason">{flexSource?.reason ?? "Tus cuatro días fijos ya tienen registro. Puedes repetir un foco o tomarte el día libre."}</p>
              {flexSource && (
                <section className="suggested-focus" aria-label="Propuesta">
                  <div>
                    <span>PROPUESTA</span>
                    <strong>{flexSource.day.focus}</strong>
                    <small>{flexSource.day.exercises.slice(0, 3).map((exercise) => exercise.name).join(" · ")}</small>
                  </div>
                  <button className="primary-button" onClick={() => onApplyFlexRoutine(flexSource.day)}>Usar esta rutina</button>
                </section>
              )}
            </>
          ) : (
            <>
              <p className="date-line">RUTINA FLEXIBLE</p>
              <h2>{selectedDay.focus}</h2>
              <p className="flex-reason">Puedes cambiar estos ejercicios antes de empezar.</p>
            </>
          )}
        </section>
      )}

      {!activeSession && selectedDay.exercises.length > 0 && (
        <section aria-labelledby="routine-list-title">
          <header className="section-bar">
            <hgroup>
              <h2 id="routine-list-title">Lo que toca</h2>
              <p>{isCardioDay ? "Anota los minutos que completes." : "El peso real lo apuntas durante la sesión."}</p>
            </hgroup>
            <button className="quiet-button" onClick={onAddExercise}>+ Añadir</button>
          </header>
          <ul className="routine-list">
            {selectedDay.exercises.map((exercise, index) => (
              <RoutineExerciseRow key={`${exercise.id}-${index}`} exercise={exercise} index={index} onRemove={onRemoveExercise} />
            ))}
          </ul>
          {!selectedDay.flexible && !hasSessions && (
            <p className="reference-caption">{isCardioDay ? "Haz el bloque a un ritmo moderado y constante." : "Usa las series y repeticiones como guía inicial. Ajusta el peso a cómo te sientes hoy."}</p>
          )}
          <button className="primary-button start-button" onClick={onStart}>Empezar sesión <span>{selectedDay.exercises.length} ejercicios</span></button>
        </section>
      )}

      {activeSession && (
        <section aria-label="Sesión en curso">
          <header className="session-toolbar">
            <p>
              {selectedDay.label} · empezaste {new Date(activeSession.startedAt).toLocaleTimeString("es-BO", { hour: "2-digit", minute: "2-digit" })}
              <span>{hasSessions ? "Si repites un ejercicio, verás tu último registro como referencia." : "Anota lo que hagas hoy; esta sesión será tu primera referencia."}</span>
            </p>
            <menu className="session-actions">
              <li><button className="quiet-button" onClick={onAddExercise}>+ Ejercicio</button></li>
              <li><button className="cancel-session-button" onClick={onCancel} aria-label="Cancelar y descartar esta sesión">Cancelar</button></li>
            </menu>
          </header>

          <ol className="exercise-stack">
            {activeSession.exercises.map((activeExercise, index) => {
              const definition = selectedDay.exercises.find((exercise) => exercise.id === activeExercise.exerciseId);
              if (!definition) return null;
              const { workout, exercise } = lastLogged(definition.id);
              return (
                <li key={`${definition.id}-${index}`}>
                  <ExerciseSessionCard
                    exercise={definition}
                    activeExercise={activeExercise}
                    index={index}
                    previous={exercise}
                    previousWorkout={workout}
                    sessions={data.sessions}
                    onUpdateSet={onUpdateSet}
                    onAddSet={onAddSet}
                  />
                </li>
              );
            })}
          </ol>

          {activeSession.exercises.length === 0 && (
            <p className="empty-inline">
              Agrega el primer ejercicio de la sesión.
              <button className="quiet-button" onClick={onAddExercise}>+ Añadir ejercicio</button>
            </p>
          )}

          <footer className="finish-panel">
            <p>
              <span>{isCardioDay ? "Tiempo registrado" : "Series guardadas"}</span>
              <strong>
                {isCardioDay
                  ? <>{formatNumber(stats.activeMinutes)} <small>min de cardio</small></>
                  : <>{stats.completedSets} <small>· {formatNumber(stats.activeVolume)} kg·reps</small></>}
              </strong>
            </p>
            <button className="finish-button" disabled={stats.completedSets === 0} onClick={onFinish}>Terminar sesión</button>
          </footer>
        </section>
      )}

      <aside className="workout-aside" aria-label="Resumen">
        <section className="volume-panel">
          <header className="volume-panel-head">
            <h2>{activeSession || !stats.lastDaySession ? "Hoy" : "Última sesión"}</h2>
            {stats.comparison !== null && (
              <p className={stats.comparison >= 0 ? "compare-up" : "compare-down"}>
                {stats.comparison > 0 ? "+" : ""}{formatNumber(stats.comparison)} vs. anterior
              </p>
            )}
          </header>
          <strong>{formatNumber(isCardioDay ? stats.dayMinutes : stats.dayVolume)}<small>{isCardioDay ? "min" : "kg·reps"}</small></strong>
          <p>{isCardioDay ? "de cardio registrado" : `${stats.completedSets} ${stats.completedSets === 1 ? "serie registrada" : "series registradas"}`}</p>
        </section>

        <section className="recent-panel">
          <header className="recent-heading">
            <h2>Sesiones recientes</h2>
            <button onClick={onOpenHistory}>Abrir historial</button>
          </header>
          {newestFirst.length === 0 ? (
            <p className="recent-empty">Cuando termines una sesión, quedará aquí.</p>
          ) : (
            <ul className="recent-list">
              {newestFirst.slice(0, 3).map((session) => (
                <li className="recent-row" key={session.id}>
                  <time dateTime={session.finishedAt}>{formatDate(session.finishedAt)}</time>
                  <strong>{data.days[session.dayIndex]?.focus ?? "Sesión"}</strong>
                  <b>{session.cardioMinutes ? `${formatNumber(session.cardioMinutes)} min` : `${formatNumber(session.volume)} kg·reps`}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </article>
  );
}
