import type { RoutineDay } from "../_lib/types";

type Props = {
  days: RoutineDay[];
  selectedIndex: number;
  completedCount: number;
  isComplete: (index: number) => boolean;
  onSelect: (index: number) => void;
};

export default function WeekSelector({ days, selectedIndex, completedCount, isComplete, onSelect }: Props) {
  const trainingDays = days.filter((day) => !day.flexible);

  return (
    <>
      <div className="week-heading">
        <div><span>Esta semana</span><strong>{completedCount} de {trainingDays.length} días registrados</strong></div>
        <div className="week-track" aria-label={`${completedCount} de ${trainingDays.length} días registrados`}>
          {days.map((day, index) => !day.flexible && <i key={day.label} className={isComplete(index) ? "done" : ""} />)}
        </div>
      </div>
      <div className="day-strip" aria-label="Elegir día">
        {days.map((day, index) => (
          <button key={day.label} className={`day-tab ${selectedIndex === index ? "is-selected" : ""}`} onClick={() => onSelect(index)} aria-pressed={selectedIndex === index}>
            <span>{day.short}</span><i className={isComplete(index) ? "day-mark is-done" : "day-mark"} />
          </button>
        ))}
      </div>
    </>
  );
}
