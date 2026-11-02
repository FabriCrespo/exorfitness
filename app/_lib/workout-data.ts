import type { AppData, Group, LoggedSet, RoutineDay, RoutineExercise, SetEntry } from "./types";

export const STORAGE_KEY = "exorfitness.v1";
export const THEME_KEY = "exorfitness.theme";

function plan(id: string, name: string, equipment: string, targetSets: number, targetReps: string, group: Group, cue: string, trackingMode: RoutineExercise["trackingMode"] = "strength"): RoutineExercise {
  return { id, name, equipment, targetSets, targetReps, group, cue, trackingMode };
}

const GLUTE_EXERCISES = [
  plan("hip-thrust", "Hip thrust", "Banco y barra", 5, "8–10", "gluteos", "Apoya la parte alta de la espalda. Empuja con los talones y aprieta arriba."),
  plan("romanian-deadlift", "Peso muerto rumano", "Barra o mancuernas", 4, "10", "gluteos", "Mantén la espalda larga y lleva la cadera hacia atrás."),
  plan("leg-curl", "Curl femoral", "Máquina de curl femoral", 4, "12", "gluteos", "Ajusta el rodillo y baja el peso con control."),
  plan("bulgarian-split-squat", "Sentadilla búlgara", "Banco y mancuernas", 3, "10 / pierna", "gluteos", "Deja firme el pie delantero y baja hasta donde mantengas el equilibrio."),
  plan("abductor", "Abductores", "Máquina abductora", 4, "15–20", "gluteos", "Abre las piernas sin impulso y vuelve despacio."),
  plan("calf-raise", "Elevación de talones", "Máquina o de pie", 4, "15", "gluteos", "Sube el talón, haz una pausa y baja sin rebotar."),
];

const BACK_SHOULDER_EXERCISES = [
  plan("lat-pulldown", "Jalón al pecho", "Polea alta", 4, "8–10", "espalda", "Lleva la barra hacia el pecho sin inclinarte hacia atrás."),
  plan("seated-row", "Remo sentado", "Polea baja", 3, "10", "espalda", "Mantén el pecho arriba y lleva los codos hacia atrás."),
  plan("chest-supported-row", "Remo con pecho apoyado", "Banco y mancuernas", 3, "10", "espalda", "Apoya el pecho y evita encoger los hombros."),
  plan("face-pull", "Face pull", "Polea y cuerda", 3, "12–15", "espalda", "Tira de la cuerda hacia la cara con los codos separados."),
  plan("shoulder-press", "Press de hombros", "Máquina de press", 4, "10", "hombros", "Empuja hacia arriba sin arquear la espalda."),
  plan("lateral-raise", "Elevación lateral", "Mancuernas", 4, "15", "hombros", "Sube los brazos hasta los hombros sin balancearte."),
];

const ARM_EXERCISES = [
  plan("bicep-curl", "Curl de bíceps", "Mancuernas", 3, "8–10", "biceps", "Mantén los codos cerca del cuerpo y baja despacio."),
  plan("hammer-curl", "Curl martillo", "Mancuernas", 3, "10", "biceps", "Sujeta las mancuernas con las palmas enfrentadas."),
  plan("triceps-pushdown", "Tríceps en polea", "Polea y barra", 4, "12", "triceps", "Mantén los codos quietos mientras bajas la barra."),
  plan("overhead-triceps", "Extensión sobre la cabeza", "Polea y cuerda", 3, "12", "triceps", "Estira los brazos sin abrir los codos hacia los lados."),
];

const CHEST_EXERCISES = [
  plan("chest-press", "Chest press", "Máquina de pecho", 4, "10", "pecho", "Empuja al frente y vuelve sin dejar caer los brazos."),
  plan("pec-deck", "Pec deck", "Máquina pec deck", 3, "12", "pecho", "Junta los brazos con control y mantén el pecho abierto."),
];

const FRIDAY_CARDIO = [
  plan("stationary-bike", "Bicicleta por intervalos", "Bicicleta estática", 1, "28 min", "cardio", "5 min suave para entrar en calor; luego hasta 6 rondas de 1 min vivo + 2 min suave; termina con 5 min fácil. El tramo vivo debe sentirse exigente pero controlado, sin sprint. Al volver, empieza con 3 rondas; añade una en las próximas sesiones si te sientes bien.", "minutes"),
];

const SATURDAY_FULL_BODY = [
  plan("leg-press", "Prensa de piernas", "Máquina de prensa", 2, "8–10", "gluteos", "Baja hasta donde mantengas la espalda apoyada y las rodillas cómodas. Empieza ligero y deja 2–3 repeticiones en reserva."),
  plan("chest-press", "Chest press", "Máquina de pecho", 2, "8–12", "pecho", "Empuja al frente con control. Usa una carga cómoda y termina cada serie sintiendo que podrías hacer 2–3 repeticiones más."),
  plan("seated-row", "Remo sentado", "Polea baja", 2, "8–12", "espalda", "Mantén el pecho arriba y lleva los codos hacia atrás sin balancearte. Deja 2–3 repeticiones en reserva."),
  plan("romanian-deadlift", "Peso muerto rumano", "Mancuernas ligeras", 2, "8–10", "gluteos", "Haz el recorrido corto y cómodo mientras recuperas la técnica; espalda larga, cadera atrás y sin buscar el fallo."),
  plan("dead-bug", "Dead bug", "Colchoneta", 2, "8 / lado", "otro", "Extiende brazo y pierna contrarios sin despegar la espalda del suelo. Muévete despacio y respira."),
];

export const CHEST_ROUTINE = CHEST_EXERCISES;
export const EXERCISE_IMAGES: Record<string, string> = Object.fromEntries(
  ["hip-thrust", "romanian-deadlift", "leg-curl", "bulgarian-split-squat", "abductor", "calf-raise", "lat-pulldown", "seated-row", "chest-supported-row", "face-pull", "shoulder-press", "lateral-raise", "bicep-curl", "hammer-curl", "triceps-pushdown", "overhead-triceps", "chest-press", "pec-deck", "stationary-bike", "leg-press", "dead-bug"].map((id) => [id, `/exercises/${id}.webp`]),
);

export const EXERCISE_ANIMATIONS: Record<string, { src: string; label: string }> = {
  "hip-thrust": { src: "/exercises/animations/hip-thrust.gif", label: "Hip thrust con barra" },
  "romanian-deadlift": { src: "/exercises/animations/romanian-deadlift.gif", label: "Peso muerto rumano con barra" },
  "leg-curl": { src: "/exercises/animations/leg-curl.gif", label: "Curl femoral tumbado en máquina" },
  "bulgarian-split-squat": { src: "/exercises/animations/bulgarian-split-squat.gif", label: "Sentadilla búlgara con mancuernas" },
  abductor: { src: "/exercises/animations/abductor.gif", label: "Abducción de cadera sentada" },
  "calf-raise": { src: "/exercises/animations/calf-raise.gif", label: "Elevación de pantorrillas de pie" },
  "lat-pulldown": { src: "/exercises/animations/lat-pulldown.gif", label: "Jalón al pecho en polea" },
  "seated-row": { src: "/exercises/animations/seated-row.gif", label: "Remo sentado en polea" },
  "chest-supported-row": { src: "/exercises/animations/chest-supported-row.gif", label: "Remo con pecho apoyado" },
  "face-pull": { src: "/exercises/animations/face-pull.gif", label: "Face pull con cuerda" },
  "shoulder-press": { src: "/exercises/animations/shoulder-press.gif", label: "Press de hombros en máquina" },
  "lateral-raise": { src: "/exercises/animations/lateral-raise.gif", label: "Elevación lateral con mancuernas" },
  "bicep-curl": { src: "/exercises/animations/bicep-curl.gif", label: "Curl de bíceps con mancuernas" },
  "hammer-curl": { src: "/exercises/animations/hammer-curl.gif", label: "Curl martillo" },
  "triceps-pushdown": { src: "/exercises/animations/triceps-pushdown.gif", label: "Tríceps en polea con barra" },
  "overhead-triceps": { src: "/exercises/animations/overhead-triceps.gif", label: "Extensión de tríceps sobre la cabeza" },
  "chest-press": { src: "/exercises/animations/chest-press.gif", label: "Chest press en máquina" },
  "pec-deck": { src: "/exercises/animations/pec-deck.gif", label: "Apertura en máquina pec deck" },
  "stationary-bike": { src: "/exercises/animations/stationary-bike.gif", label: "Bicicleta estática" },
  "leg-press": { src: "/exercises/animations/leg-press.gif", label: "Prensa de piernas" },
  "dead-bug": { src: "/exercises/animations/dead-bug.gif", label: "Dead bug" },
};

export function makeDays(): RoutineDay[] {
  return [
    { label: "Lunes", short: "Lun", focus: "Glúteos y piernas", flexible: false, exercises: GLUTE_EXERCISES },
    { label: "Martes", short: "Mar", focus: "Espalda y hombros", flexible: false, exercises: BACK_SHOULDER_EXERCISES },
    { label: "Miércoles", short: "Mié", focus: "Glúteos y piernas", flexible: false, exercises: GLUTE_EXERCISES },
    { label: "Jueves", short: "Jue", focus: "Bíceps y tríceps", flexible: false, exercises: ARM_EXERCISES },
    { label: "Viernes", short: "Vie", focus: "Cardio por intervalos", flexible: false, exercises: FRIDAY_CARDIO },
    { label: "Sábado", short: "Sáb", focus: "Full body", flexible: false, exercises: SATURDAY_FULL_BODY },
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
  return { version: 1, routineVersion: 2, days: makeDays(), sessions: [], activeSession: null, selectedDay: 0, measurements: [] };
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
  const canSeedRoutine = !value.routineVersion && daysAreEmpty && value.sessions.length === 0;
  const selectedDay = value.activeSession?.dayIndex ?? currentDayIndex();
  return {
    ...value,
    routineVersion: 2,
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
