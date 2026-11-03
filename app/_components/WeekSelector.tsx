import type { RoutineDay } from "../_lib/types";

type Props = {
  days: RoutineDay[];
  selectedIndex: number;
  completedCount: number;
  isComplete: (index: number) => boolean;
  onSelect: (index: number) => void;
};

export default function WeekSelector({ days, selectedIndex, completedCount, isComplete, onSelect }: Props) {
  const trainingDayCount = days.filter((day) => !day.flexible).length;
  const summary = `${completedCount} de ${trainingDayCount} días registrados`;

  return (
    <>
      <header className="week-heading">
        <p><span>Esta semana</span><strong>{summary}</strong></p>
        <ol className="week-track" aria-label={summary}>
          {days.map((day, index) => !day.flexible && <li key={day.label} className={isComplete(index) ? "done" : undefined} />)}
        </ol>
      </header>
      <nav aria-label="Elegir día">
        <ul className="day-strip">
          {days.map((day, index) => (
            <li key={day.label}>
              <button className={`day-tab ${selectedIndex === index ? "is-selected" : ""}`} onClick={() => onSelect(index)} aria-current={selectedIndex === index ? "date" : undefined} aria-label={`${day.label}${isComplete(index) ? ", registrado" : ""}`}>
                <span>{day.short}</span>
                <span className={isComplete(index) ? "day-mark is-done" : "day-mark"} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
