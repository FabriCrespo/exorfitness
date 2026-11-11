import type { MuscleId } from "./muscles";
import type { Group, RoutineExercise } from "./types";

export type CatalogExercise = RoutineExercise & { muscles: MuscleId[] };

function entry(id: string, name: string, equipment: string, targetSets: number, targetReps: string, group: Group, muscles: MuscleId[], cue: string): CatalogExercise {
  return { id, name, equipment, targetSets, targetReps, group, cue, muscles };
}

/** Ejercicios conocidos que no están en tu rutina, para ofrecerlos como alternativa. Primer músculo = principal. */
export const CATALOG: CatalogExercise[] = [
  // Glúteos y piernas
  entry("glute-bridge", "Puente de glúteos", "Colchoneta o banco", 3, "12–15", "gluteos", ["gluteos", "isquios"], "Empuja con los talones y aprieta arriba sin arquear la espalda. Descanso: 90 s."),
  entry("cable-pull-through", "Pull-through en polea", "Polea baja y cuerda", 3, "12–15", "gluteos", ["gluteos", "isquios"], "Cadera hacia atrás con la espalda neutra y extiende apretando glúteos. Descanso: 90 s."),
  entry("goblet-squat", "Sentadilla goblet", "Mancuerna", 3, "10–12", "gluteos", ["cuadriceps", "gluteos"], "Mancuerna al pecho, torso erguido y rodillas siguiendo la línea de los pies. Descanso: 90 s."),
  entry("hack-squat", "Hack squat", "Máquina hack", 3, "8–12", "gluteos", ["cuadriceps", "gluteos"], "Pies a la altura de las caderas y baja con control. Descanso: 2 min."),
  entry("walking-lunge", "Zancadas con mancuernas", "Mancuernas", 2, "10–12 / lado", "gluteos", ["cuadriceps", "gluteos"], "Paso largo, torso estable y rodilla sin colapsar hacia dentro. Descanso: 90 s."),
  entry("step-up", "Step-up con mancuernas", "Cajón y mancuernas", 2, "10–12 / lado", "gluteos", ["gluteos", "cuadriceps"], "Empuja con la pierna de arriba, sin impulso con la de abajo. Descanso: 90 s."),
  entry("lying-leg-curl", "Curl femoral acostado", "Máquina de curl acostado", 3, "10–12", "gluteos", ["isquios"], "Cadera pegada al banco y regreso lento. Descanso: 90 s."),
  entry("cable-hip-abduction", "Abducción de cadera en polea", "Polea y tobillera", 2, "12–15 / lado", "gluteos", ["gluteos"], "Pelvis estable y movimiento lateral controlado. Descanso: 60 s."),
  entry("sumo-deadlift", "Peso muerto sumo", "Barra o mancuerna", 3, "8–10", "gluteos", ["gluteos", "isquios", "cuadriceps", "lumbar"], "Pies abiertos, pecho arriba y empuja el suelo. Descanso: 2 min."),
  entry("back-extension", "Extensión lumbar", "Banco de hiperextensión", 3, "10–12", "gluteos", ["lumbar", "gluteos", "isquios"], "Sube hasta alinear el cuerpo, sin hiperextender. Descanso: 90 s."),
  entry("calf-raise", "Elevación de talones (pantorrillas)", "Máquina de pantorrillas Technogym", 3, "12–15", "otro", ["gemelos"], "Hombros bajo las almohadillas, rodillas casi rectas. Baja el talón hasta sentir el estiramiento, sube sobre la punta y pausa 1 s arriba. Descanso: 60 s."),

  // Espalda
  entry("t-bar-row", "Remo en barra T", "Barra T o landmine", 3, "8–12", "espalda", ["espalda", "trapecio", "biceps"], "Torso inclinado y estable, codos hacia atrás. Descanso: 90 s."),
  entry("machine-row", "Remo en máquina", "Máquina de remo", 3, "10–12", "espalda", ["espalda", "trapecio", "biceps"], "Pecho apoyado y junta las escápulas al final. Descanso: 90 s."),
  entry("close-grip-pulldown", "Jalón con agarre cerrado", "Polea alta", 3, "8–12", "espalda", ["espalda", "biceps"], "Baja hacia el pecho sin balancear el torso. Descanso: 90 s."),
  entry("straight-arm-pulldown", "Pulldown con brazos rectos", "Polea alta", 2, "12–15", "espalda", ["espalda"], "Codos casi rectos y baja con los dorsales. Descanso: 60 s."),
  entry("dumbbell-row", "Remo con mancuerna a una mano", "Banco y mancuerna", 3, "10–12 / lado", "espalda", ["espalda", "biceps"], "Espalda plana, tira hacia la cadera. Descanso: 90 s."),
  entry("shrugs", "Encogimientos de hombros", "Mancuernas", 3, "12–15", "espalda", ["trapecio"], "Sube los hombros hacia las orejas sin rotarlos. Descanso: 60 s."),

  // Pecho
  entry("dumbbell-bench-press", "Press de pecho con mancuernas", "Banco y mancuernas", 3, "8–12", "pecho", ["pecho", "triceps", "hombros"], "Escápulas atrás y baja con control. Descanso: 90 s."),
  entry("incline-dumbbell-press", "Press inclinado con mancuernas", "Banco inclinado y mancuernas", 3, "8–12", "pecho", ["pecho", "hombros", "triceps"], "Banco a 30° y empuja sin encoger los hombros. Descanso: 90 s."),
  entry("pec-fly", "Aperturas en máquina", "Máquina pec fly", 3, "12–15", "pecho", ["pecho"], "Codos ligeramente flexionados y junta al frente. Descanso: 60 s."),
  entry("cable-fly", "Aperturas en polea", "Poleas", 2, "12–15", "pecho", ["pecho"], "Abraza al frente y aprieta el pecho. Descanso: 60 s."),
  entry("push-up", "Flexiones", "Peso corporal", 3, "8–15", "pecho", ["pecho", "triceps", "hombros"], "Cuerpo en línea; apoya las rodillas si lo necesitas. Descanso: 90 s."),

  // Hombros
  entry("arnold-press", "Press Arnold", "Mancuernas", 3, "8–12", "hombros", ["hombros", "triceps"], "Gira las palmas al subir, sin arquear la espalda. Descanso: 90 s."),
  entry("front-raise", "Elevaciones frontales", "Mancuernas", 2, "12–15", "hombros", ["hombros"], "Sube hasta la altura de los ojos, sin balanceo. Descanso: 60 s."),
  entry("cable-lateral-raise", "Elevaciones laterales en polea", "Polea baja", 2, "12–15 / lado", "hombros", ["hombros"], "Tensión constante y sin encoger. Descanso: 60 s."),
  entry("rear-delt-fly", "Pájaros con mancuernas", "Mancuernas", 3, "12–15", "hombros", ["hombros", "trapecio"], "Torso inclinado y abre los brazos con codos suaves. Descanso: 60 s."),

  // Brazos
  entry("hammer-curl", "Curl martillo", "Mancuernas", 3, "10–12", "biceps", ["biceps", "antebrazos"], "Palmas enfrentadas y codos pegados. Descanso: 60 s."),
  entry("cable-curl", "Curl en polea", "Polea baja", 3, "10–12", "biceps", ["biceps"], "Tensión continua; no balancees el cuerpo. Descanso: 60 s."),
  entry("preacher-curl", "Curl predicador", "Máquina predicador", 3, "10–12", "biceps", ["biceps"], "Brazos apoyados y baja hasta casi extender. Descanso: 60 s."),
  entry("skull-crusher", "Press francés", "Barra Z o mancuernas", 3, "10–12", "triceps", ["triceps"], "Codos fijos y baja hacia la frente. Descanso: 60 s."),
  entry("overhead-triceps", "Extensión de tríceps sobre la cabeza", "Mancuerna o polea", 3, "10–12", "triceps", ["triceps"], "Codos cerca de la cabeza y extiende completo. Descanso: 60 s."),
  entry("assisted-dip", "Fondos asistidos", "Máquina asistida", 3, "8–10", "triceps", ["triceps", "pecho", "hombros"], "Torso erguido y baja hasta 90° en el codo. Descanso: 90 s."),
  entry("triceps-kickback", "Patada de tríceps", "Mancuerna", 2, "12–15", "triceps", ["triceps"], "Codo fijo a la altura del torso. Descanso: 60 s."),

  // Abdomen
  entry("plank", "Plancha", "Peso corporal", 3, "30–45 s", "otro", ["abdomen"], "Cuerpo en línea, abdomen firme y respiración constante. Descanso: 45 s."),
  entry("cable-crunch", "Crunch en polea", "Polea alta y cuerda", 3, "12–15", "otro", ["abdomen"], "Flexiona la columna, no solo la cadera. Descanso: 60 s."),
  entry("leg-raise", "Elevación de piernas", "Banco o silla romana", 3, "10–15", "otro", ["abdomen"], "Sin balanceo; sube con el abdomen. Descanso: 60 s."),
  entry("dead-bug", "Dead bug", "Colchoneta", 2, "10 / lado", "otro", ["abdomen"], "Zona lumbar pegada al suelo mientras alternas. Descanso: 45 s."),
];

export const CATALOG_BY_ID = new Map(CATALOG.map((item) => [item.id, item]));
