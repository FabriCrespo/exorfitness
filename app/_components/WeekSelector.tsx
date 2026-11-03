import type { RoutineDay } from "../_lib/types";

type Props = {
  days: RoutineDay[];
  selectedIndex: number;
  isComplete: (index: number) => boolean;
  onSelect: (index: number) => void;
};

/** Lunes a sábado según el plan; el domingo es descanso y no se puede elegir. */
export default function WeekSelector({ days, selectedIndex, isComplete, onSelect }: Props) {
  return (
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
        <li>
          <button className="day-tab is-rest" disabled aria-label="Domingo, descanso"><span>Dom</span></button>
        </li>
      </ul>
    </nav>
  );
}
