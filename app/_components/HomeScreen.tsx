import type { AppData } from "../_lib/types";
import type { WorkoutStats } from "../_lib/workout-stats";
import { currentDayIndex, estimateMinutes, PROFILE } from "../_lib/workout-data";
import WeekSelector from "./WeekSelector";

type Props = {
  data: AppData;
  stats: WorkoutStats;
  onSelectDay: (index: number) => void;
  onOpenRoutine: () => void;
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "おはよう";
  if (hour < 19) return "こんにちは";
  return "こんばんは";
}

export default function HomeScreen({ data, stats, onSelectDay, onOpenRoutine }: Props) {
  const { selectedDay } = stats;
  const isToday = data.selectedDay === currentDayIndex();
  const hasActiveSession = Boolean(data.activeSession);

  return (
    <article className="page-content home-screen" aria-labelledby="page-title">
      <header className="home-hero has-sun has-waves">
        <p>{greeting()},</p>
        <h1 id="page-title">{PROFILE.name}</h1>
        <p className="home-hero-meta">Semana {stats.weekNumber} · {PROFILE.phase}</p>
      </header>

      <section aria-labelledby="week-title" className="home-week">
        <header className="section-row">
          <h2 id="week-title">Tu semana</h2>
          <p>{stats.fixedDaysDone} de {stats.trainingDayCount} días</p>
        </header>
        <WeekSelector days={data.days} selectedIndex={data.selectedDay} isComplete={stats.isDayDone} onSelect={onSelectDay} />
      </section>

      <button className="today-card" onClick={onOpenRoutine}>
        <svg className="today-card-mountain" viewBox="0 0 200 80" aria-hidden="true"><path d="M0 80 70 26l14 10 20-24 14 18 18-10 64 60z" fill="currentColor" opacity=".22" /><circle cx="150" cy="22" r="9" fill="currentColor" opacity=".3" /></svg>
        <span className="today-card-label">{hasActiveSession ? "SESIÓN EN CURSO" : isToday ? "HOY TOCA" : selectedDay.label.toUpperCase()}</span>
        <strong>{selectedDay.focus}</strong>
        <span className="today-card-meta">
          {selectedDay.exercises.length} {selectedDay.exercises.length === 1 ? "ejercicio" : "ejercicios"} · ~{estimateMinutes(selectedDay)} min
        </span>
        <svg className="today-card-arrow" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
      </button>

      <section aria-labelledby="goals-title">
        <header className="section-row"><h2 id="goals-title">Metas del plan</h2></header>
        <ul className="goal-list">
          {stats.goals.map((goal) => (
            <li key={goal.label}>
              <p><span>{goal.label}</span><b>{goal.percent}%</b></p>
              <meter min={0} max={100} value={goal.percent} aria-label={`${goal.label}: ${goal.done} de ${goal.target}`} />
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
