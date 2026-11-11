export type Group = "gluteos" | "espalda" | "hombros" | "biceps" | "triceps" | "pecho" | "cardio" | "otro";

export type RoutineExercise = {
  id: string;
  name: string;
  equipment: string;
  targetSets: number;
  targetReps: string;
  group: Group;
  cue: string;
  trackingMode?: "strength" | "minutes";
};

export type RoutineDay = {
  label: string;
  short: string;
  focus: string;
  flexible: boolean;
  exercises: RoutineExercise[];
};

export type SetEntry = { id: string; weightKg: string; reps: string; durationMinutes?: string; complete: boolean; toFailure: boolean };
export type ActiveExercise = { exerciseId: string; sets: SetEntry[]; notes?: string; done?: boolean };
export type ActiveSession = { id: string; dayIndex: number; startedAt: string; exercises: ActiveExercise[]; extraCardioMinutes?: string; date?: string; extras?: RoutineExercise[]; custom?: boolean; title?: string };
export type LoggedSet = { weightKg: number; reps: number; durationMinutes?: number; toFailure: boolean };
export type LoggedExercise = { exerciseId: string; name: string; group: Group; sets: LoggedSet[]; notes?: string };
export type WorkoutSession = {
  id: string;
  dayIndex: number;
  startedAt: string;
  finishedAt: string;
  exercises: LoggedExercise[];
  volume: number;
  cardioMinutes?: number;
  /** Sesión libre armada desde el mapa muscular: no cuenta como un día de la rutina. */
  custom?: boolean;
  title?: string;
};
export type Measurement = { id: string; area: string; value: number; unit: string; recordedAt: string };
export type AppData = {
  version: 1;
  routineVersion: number;
  days: RoutineDay[];
  sessions: WorkoutSession[];
  activeSession: ActiveSession | null;
  selectedDay: number;
  measurements: Measurement[];
};

export type Tab = "home" | "routine" | "progress" | "body" | "data";
export type Theme = "light" | "dark";
