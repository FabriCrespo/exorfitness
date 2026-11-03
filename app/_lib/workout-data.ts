import type { AppData, Group, LoggedSet, RoutineDay, RoutineExercise, SetEntry } from "./types";

export const STORAGE_KEY = "exorfitness.v1";
export const THEME_KEY = "exorfitness.theme";

function plan(id: string, name: string, equipment: string, targetSets: number, targetReps: string, group: Group, cue: string, trackingMode: RoutineExercise["trackingMode"] = "strength"): RoutineExercise {
  return { id, name, equipment, targetSets, targetReps, group, cue, trackingMode };
}

const MONDAY = [
  plan("hip-thrust", "Hip thrust", "Banco y barra", 3, "8–12", "gluteos", "Pausa breve arriba y mantén el abdomen firme. Descanso: 2 min."),
  plan("romanian-deadlift", "Peso muerto rumano", "Barra o mancuernas", 3, "8–10", "gluteos", "Espalda neutral y cadera hacia atrás. Descanso: 2 min."),
  plan("leg-curl", "Curl femoral sentado", "Máquina de curl femoral", 3, "10–12", "gluteos", "Controla tanto la subida como el regreso. Descanso: 90 s."),
  plan("abductor", "Máquina de abductores", "Máquina abductora", 2, "15–20", "gluteos", "Rango cómodo, sin movimientos bruscos. Descanso: 60 s."),
];

const TUESDAY = [
  plan("lat-pulldown", "Jalón al pecho", "Polea alta", 3, "8–12", "espalda", "Lleva la barra a la parte alta del pecho sin balancear el torso. Descanso: 90 s."),
  plan("seated-row", "Remo sentado en polea", "Polea baja", 3, "10–12", "espalda", "Torso estable y codos hacia atrás. Descanso: 90 s."),
  plan("chest-supported-row", "Remo con pecho apoyado", "Banco y mancuernas", 2, "10–12", "espalda", "Pecho apoyado y sin impulso. Descanso: 90 s."),
  plan("face-pull", "Face pull en polea", "Polea y cuerda", 2, "12–15", "espalda", "Cuerda hacia el rostro con los codos abiertos. Descanso: 60 s."),
  plan("bicep-curl", "Curl de bíceps con mancuernas", "Mancuernas", 2, "10–12", "biceps", "No balancees el cuerpo; controla el descenso. Descanso: 60 s."),
];

const WEDNESDAY = [
  plan("chest-press", "Chest press en máquina", "Máquina de pecho", 3, "8–12", "pecho", "Hombros apoyados y movimiento controlado. Descanso: 90 s."),
  plan("lateral-raise", "Elevaciones laterales", "Mancuernas", 3, "12–15", "hombros", "Mancuernas ligeras, sin encoger los hombros. Descanso: 60 s."),
  plan("shoulder-press", "Press de hombros en máquina", "Máquina de press", 2, "8–12", "hombros", "Rango de movimiento cómodo. Descanso: 90 s."),
  plan("triceps-pushdown", "Extensión de tríceps en polea", "Polea", 2, "10–12", "triceps", "Codos cerca del cuerpo. Descanso: 60 s."),
  plan("ab-machine", "Máquina de abdominales", "Máquina de abdominales", 2, "12–15", "otro", "Ajusta el asiento, controla la flexión y no tires del cuello. Descanso: 60 s."),
];

const THURSDAY = [
  plan("leg-press", "Prensa de piernas", "Máquina de prensa", 3, "10–12", "gluteos", "No bloquees las rodillas. Si aparece mareo, detente. Descanso: 2 min."),
  plan("bulgarian-split-squat", "Sentadilla búlgara", "Banco y mancuernas", 2, "8–10 / lado", "gluteos", "Usa apoyo si lo necesitas para el equilibrio. Descanso: 90 s."),
  plan("leg-extension", "Extensión de cuádriceps", "Máquina de extensión", 2, "12–15", "otro", "Evita golpear o bloquear las rodillas al extender. Descanso: 60 s."),
  plan("glute-kickback", "Patada de glúteo en polea", "Polea", 2, "12–15 / lado", "gluteos", "Pelvis estable, sin arquear la espalda. Descanso: 60 s."),
  plan("abductor", "Máquina de abductores", "Máquina abductora", 2, "15–20", "gluteos", "Movimiento controlado. Descanso: 60 s."),
];

const FRIDAY = [
  plan("assisted-pullup", "Dominadas asistidas", "Máquina asistida", 3, "8–10", "espalda", "Ajusta la asistencia para una ejecución controlada. Descanso: 2 min."),
  plan("single-arm-row", "Remo unilateral en polea", "Polea", 3, "10–12 / lado", "espalda", "Torso estable, sin rotarlo. Descanso: 90 s."),
  plan("cable-pullover", "Pullover en polea", "Polea", 2, "12–15", "espalda", "Ligera flexión de codos y regreso controlado. Descanso: 60 s."),
  plan("reverse-pec-deck", "Reverse pec deck", "Máquina pec deck", 2, "12–15", "hombros", "Sin impulso y con el cuello relajado. Descanso: 60 s."),
  plan("ab-machine", "Máquina de abdominales", "Máquina de abdominales", 2, "12–15", "otro", "Peso controlable, sin tirar del cuello. Descanso: 60 s."),
];

const SATURDAY_CARDIO = [
  plan("elliptical", "Elíptica", "Elíptica", 1, "20–30 min", "cardio", "5 min suave de entrada en calor, 20–30 min a ritmo moderado (esfuerzo 4–5 de 10, que puedas hablar en frases completas) y 5 min muy suave para enfriar. Empieza con 20 min si hay fatiga. Nada de HIIT las primeras semanas.", "minutes"),
];

export const CHEST_ROUTINE = WEDNESDAY.slice(0, 1);

export function makeDays(): RoutineDay[] {
  return [
    { label: "Lunes", short: "Lun", focus: "Glúteos y femorales", flexible: false, exercises: MONDAY },
    { label: "Martes", short: "Mar", focus: "Espalda y bíceps", flexible: false, exercises: TUESDAY },
    { label: "Miércoles", short: "Mié", focus: "Pecho, hombros y tríceps", flexible: false, exercises: WEDNESDAY },
    { label: "Jueves", short: "Jue", focus: "Glúteos y cuádriceps", flexible: false, exercises: THURSDAY },
    { label: "Viernes", short: "Vie", focus: "Espalda y hombros posteriores", flexible: false, exercises: FRIDAY },
    { label: "Sábado", short: "Sáb", focus: "Cardio", flexible: false, exercises: SATURDAY_CARDIO },
  ];
}

export function currentDayIndex() {
  const weekday = new Date().getDay();
  return weekday === 0 ? 0 : weekday - 1;
}

export function startOfLocalWeek() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date;
}

export function defaultData(): AppData {
  return { version: 1, routineVersion: 3, days: makeDays(), sessions: [], activeSession: null, selectedDay: 0, measurements: [] };
}

export function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function planExercise(id: string, name: string, equipment: string, targetSets: number, targetReps: string, cue: string): RoutineExercise {
  return plan(id, name, equipment, targetSets, targetReps, "otro", cue);
}

export function blankSets(count: number): SetEntry[] {
  return Array.from({ length: count }, () => ({ id: makeId(), weightKg: "", reps: "", durationMinutes: "", complete: false, toFailure: false }));
}

export function isAppData(value: unknown): value is AppData {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AppData>;
  return item.version === 1 && Array.isArray(item.days) && item.days.length === 6 &&
    Array.isArray(item.sessions) && Array.isArray(item.measurements) &&
    (item.activeSession === null || typeof item.activeSession === "object");
}

export function normalizeData(value: AppData): AppData {
  const defaults = makeDays();
  const daysAreEmpty = value.days.every((day) => !day.exercises?.length);
  const migrate = value.routineVersion < 3 && !value.activeSession;
  const canSeedRoutine = (!value.routineVersion && daysAreEmpty && value.sessions.length === 0) || migrate;
  const selectedDay = value.activeSession?.dayIndex ?? currentDayIndex();
  return {
    ...value,
    routineVersion: migrate || canSeedRoutine ? 3 : value.routineVersion,
    days: canSeedRoutine ? defaults : value.days.map((day, index) => {
      const base = defaults[index];
      const shouldApplyWeekendPlan = value.routineVersion < 2 && index >= 4;
      const exercises = shouldApplyWeekendPlan ? base.exercises : (day.exercises ?? []).map((exercise) => {
        const standard = base.exercises.find((item) => item.id === exercise.id);
        const fallback = standard ?? plan(exercise.id, exercise.name, "Por elegir", exercise.targetSets || 3, "8–12", "otro", "Añade una pista para este ejercicio.");
        return {
          ...fallback,
          ...exercise,
          equipment: exercise.equipment ?? fallback.equipment,
          targetReps: exercise.targetReps ?? fallback.targetReps,
          group: exercise.group ?? fallback.group,
          cue: exercise.cue ?? fallback.cue,
        };
      });
      return {
        ...base,
        ...day,
        short: day.short ?? base.short,
        focus: shouldApplyWeekendPlan ? base.focus : day.focus ?? day.label ?? base.focus,
        flexible: shouldApplyWeekendPlan ? false : day.flexible ?? base.flexible,
        exercises,
      };
    }),
    selectedDay,
  };
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(value).toLocaleDateString("es-BO", options);
}

export function daysAgo(value: string) {
  const previous = new Date(value);
  const today = new Date();
  previous.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - previous.getTime()) / 86_400_000));
}

export function volumeOf(sets: LoggedSet[]) {
  return sets.reduce((total, set) => total + set.weightKg * set.reps, 0);
}

export function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("es-BO", { maximumFractionDigits }).format(value);
}
