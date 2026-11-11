import type { MuscleId } from "./muscles";

export type MachineLink = { label: string; url: string };
export type MachineVideo = { title: string; url: string; /** No es de Technogym: sirve para la técnica, pero la máquina puede verse distinta. */ generic?: boolean };

export type Machine = {
  id: string;
  name: string;
  line: string;
  muscles: MuscleId[];
  /** Ejercicios de la app que se hacen en esta máquina. */
  exercises: string[];
  pages: MachineLink[];
  videos: MachineVideo[];
  note?: string;
};

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/**
 * Máquinas Technogym del gimnasio y sus guías. Los enlaces salieron de una búsqueda web (páginas de producto
 * de technogym.com y videos de YouTube); si alguno deja de funcionar, buscar el nombre de la máquina en YouTube.
 */
export const MACHINES: Machine[] = [
  {
    id: "leg-press", name: "Prensa de piernas", line: "Selection 900 Leg Press", muscles: ["cuadriceps", "gluteos", "isquios", "gemelos"],
    exercises: ["leg-press", "hack-squat"],
    pages: [{ label: "Ficha en technogym.com", url: "https://www.technogym.com/en-INT/product/selection-900-leg-press_MNAP.html" }],
    videos: [
      { title: "How to use the Leg Press machine (Technogym)", url: yt("JrMOMoE5dg4") },
      { title: "Technogym Selection 900 Leg Press", url: yt("_n8lxyX-shU") },
      { title: "Leg Press Demo (incluye elevaciones de talones)", url: yt("4QP68FJqOMU") },
    ],
  },
  {
    id: "leg-curl", name: "Curl femoral sentado", line: "Seated Leg Curl", muscles: ["isquios"],
    exercises: ["leg-curl", "lying-leg-curl"],
    pages: [{ label: "Dual Leg Curl / Extension (Selection 700)", url: "https://www.technogym.com/en-INT/product/selection-700-dual-leg-curl-extension_MNMC.html" }],
    videos: [
      { title: "Exercise Tutorial: Technogym Seated Leg Curl Machine", url: yt("IOufFLwNOTU") },
      { title: "Technogym Seated Leg Curl · Set Up & Execution", url: yt("6aFuzQMYE00") },
    ],
  },
  {
    id: "leg-extension", name: "Extensión de cuádriceps", line: "Leg Extension", muscles: ["cuadriceps"],
    exercises: ["leg-extension"],
    pages: [{ label: "Dual Leg Curl / Extension (Selection 700)", url: "https://www.technogym.com/en-INT/product/selection-700-dual-leg-curl-extension_MNMC.html" }],
    videos: [
      { title: "Exercise Tutorial: Technogym Leg Extension Machine", url: yt("2lvdnQg04PM") },
      { title: "How to use LEG EXTENSION machine by Technogym", url: yt("jCJSOkBo1gc") },
      { title: "Selection MED: Leg Press, Leg Curl y Leg Extension", url: yt("24XRQw4cV_8") },
    ],
  },
  {
    id: "abductor", name: "Abductores", line: "Selection 900 Abductor", muscles: ["gluteos"],
    exercises: ["abductor"],
    pages: [{ label: "Ficha en technogym.com", url: "https://www.technogym.com/en-US/product/selection-900-abductor_MNPP.html" }],
    videos: [
      { title: "Technogym Abductor Machine (GymCalc)", url: yt("PrxHtzTCT2k") },
      { title: "Technogym Selection 700 Dual Abductor / Adductor", url: yt("1bOsBcLefzw") },
    ],
  },
  {
    id: "glute", name: "Hip thrust y glute press", line: "Selection 900 Hip Thrust / Glute Press", muscles: ["gluteos", "isquios"],
    exercises: ["hip-thrust", "glute-bridge"],
    pages: [
      { label: "Selection 900 Hip Thrust", url: "https://www.technogym.com/en-INT/product/selection-900-hip-thrust_MN2P.html" },
      { label: "Selection 900 Glute Press", url: "https://www.technogym.com/en-US/product/selection-900-glute-press_MN4P.html" },
    ],
    videos: [{ title: "Technogym Pure Strength Hip Thrust · Set Up & Execution", url: yt("y50EcGQku58") }],
    note: "En tu rutina haces el hip thrust con barra y banco; esta es la versión de máquina.",
  },
  {
    id: "calf", name: "Pantorrillas", line: "Selection 900 Standing Calf · Pure Calf", muscles: ["gemelos"],
    exercises: ["calf-raise"],
    pages: [
      { label: "Selection 900 Standing Calf (de pie)", url: "https://www.technogym.com/en-US/product/selection-900-standing-calf_MN5P.html" },
      { label: "Pure Strength Calf (sentado, con discos)", url: "https://www.technogym.com/en-US/product/pure-calf_MG4500-NBGJV0.html" },
    ],
    videos: [
      { title: "Rotary Calf by Technogym · uso y errores comunes", url: yt("6B1rH5rFXsA") },
      { title: "Leg Press Demo: elevaciones de talones en la prensa", url: yt("4QP68FJqOMU") },
      { title: "Standing Calf Raise (técnica correcta)", url: yt("4HQ8Am9IuME"), generic: true },
    ],
    note: "Si el gimnasio no tiene máquina de pantorrillas, se hacen igual en la prensa, empujando solo con la punta de los pies.",
  },
  {
    id: "chest-press", name: "Chest press", line: "Chest Press (Selection)", muscles: ["pecho", "triceps", "hombros"],
    exercises: ["chest-press"],
    pages: [{ label: "Guía de entrenamiento en technogym.com", url: "https://www.technogym.com/en-INT/stories/training-with-the-chest-press-machine/" }],
    videos: [
      { title: "Exercise Tutorial: Technogym Chest Press Machine", url: yt("n1Dyy3De1Rc") },
      { title: "Technogym Pin Loaded Chest Press · Set Up & Execution", url: yt("H9hKFDLKnGQ") },
    ],
  },
  {
    id: "shoulder-press", name: "Press de hombros", line: "Shoulder Press (Selection)", muscles: ["hombros", "triceps"],
    exercises: ["shoulder-press", "arnold-press"],
    pages: [],
    videos: [
      { title: "Exercise Tutorial: Technogym Shoulder Press (agarre neutro)", url: yt("c3Z8NXdcvEs") },
      { title: "Technogym Pin Loaded Shoulder Press · Set Up & Execution", url: yt("v_2ZrziwRE0") },
    ],
  },
  {
    id: "lat", name: "Jalón al pecho", line: "Selection 900 Lat Machine / Pulldown", muscles: ["espalda", "biceps"],
    exercises: ["lat-pulldown", "close-grip-pulldown"],
    pages: [
      { label: "Selection 900 Lat Machine", url: "https://www.technogym.com/en-INT/product/selection-900-lat-machine_MNLP.html" },
      { label: "Selection 900 Pulldown", url: "https://www.technogym.com/en-US/product/selection-900-pulldown_MNVP.html" },
    ],
    videos: [
      { title: "Exercise Tutorial: Technogym Lat Pulldown Machine", url: yt("N_kTW-coueo") },
      { title: "How to use LAT MACHINE & PULLDOWN by Technogym", url: yt("phMDnDsTsa0") },
    ],
  },
  {
    id: "low-row", name: "Remo bajo", line: "Low Row (Selection)", muscles: ["espalda", "trapecio", "biceps"],
    exercises: ["seated-row", "machine-row", "t-bar-row"],
    pages: [],
    videos: [
      { title: "Exercise Tutorial: Technogym Row / Low Row", url: yt("rADR-qRgx2A") },
      { title: "Technogym Pin Loaded Low Row · Set Up & Execution", url: yt("Y2MUZlL4Qtw") },
    ],
  },
  {
    id: "assisted", name: "Dominadas y fondos asistidos", line: "Kneeling Easy Chin Dip", muscles: ["espalda", "biceps", "triceps"],
    exercises: ["assisted-pullup", "assisted-dip"],
    pages: [{ label: "Ficha en technogym.com", url: "https://www.technogym.com/en-US/product/kneeling-easy-chin-dip_MB91.html" }],
    videos: [
      { title: "How to use KNEELING EASY CHIN DIP machine by Technogym", url: yt("HGP-WuWetY0") },
      { title: "Exercise Tutorial: Technogym Assisted Pull Up (agarre neutro)", url: yt("aYPEH4WRo9Q") },
    ],
  },
  {
    id: "rear-delt", name: "Pec fly y reverse fly", line: "Pectoral / Reverse Fly", muscles: ["pecho", "hombros", "trapecio"],
    exercises: ["reverse-pec-deck", "pec-fly", "rear-delt-fly"],
    pages: [],
    videos: [{ title: "PECTORAL / REVERSE FLY · Technogym (en francés)", url: yt("kMRHUbcg3XQ") }],
    note: "Es el único video específico de Technogym que encontré; la técnica es la misma en otras pec deck.",
  },
  {
    id: "arm-curl", name: "Curl de bíceps en máquina", line: "Arm Curl", muscles: ["biceps"],
    exercises: ["preacher-curl"],
    pages: [],
    videos: [
      { title: "Technogym Arm Curl · Set Up & Execution", url: yt("VV8Q9kb5dPw") },
      { title: "Technogym Machines · Bicep Curl", url: yt("PwlEt3AjNEk") },
    ],
  },
  {
    id: "arm-extension", name: "Extensión de tríceps en máquina", line: "Arm Extension", muscles: ["triceps"],
    exercises: ["triceps-kickback"],
    pages: [],
    videos: [
      { title: "Technogym Arm Extension · Set Up & Execution", url: yt("e52m4r4qtDM") },
      { title: "Technogym · Tricep Extension", url: yt("uVadjNSTk8Y") },
    ],
  },
  {
    id: "abs", name: "Abdominales", line: "Abdominal Crunch", muscles: ["abdomen"],
    exercises: ["ab-machine"],
    pages: [],
    videos: [
      { title: "Technogym Machine · Abdominal Crunch", url: yt("qWtYjH0enBA") },
      { title: "How to use ABDOMINAL CRUNCH machine by Technogym", url: yt("m_TnNDJAUF8") },
    ],
  },
  {
    id: "cable", name: "Poleas (Kinesis)", line: "Kinesis Stations", muscles: ["espalda", "hombros", "gluteos", "triceps"],
    exercises: ["face-pull", "glute-kickback", "single-arm-row", "cable-pullover", "triceps-pushdown", "cable-crunch", "cable-curl", "cable-fly"],
    pages: [],
    videos: [
      { title: "How to use the High Pull Kinesis machine (Technogym)", url: yt("fdhxHezFWJk") },
      { title: "How to use the Low Pull Kinesis machine (Technogym)", url: yt("4-Ktc4Y-eXs") },
      { title: "The Kinesis Channel (tutoriales y rutinas)", url: "https://www.youtube.com/channel/UCFgfxX0X2jUjcGpsVVDIghg" },
    ],
    note: "Kinesis es una de las estaciones de poleas de Technogym. Confirma en tu gimnasio cuál tienen.",
  },
  {
    id: "elliptical", name: "Elíptica", line: "Excite Cross Trainer", muscles: [],
    exercises: ["elliptical"],
    pages: [{ label: "Guía de uso y beneficios", url: "https://www.technogym.com/en-INT/stories/why-start-using-elliptical-machine/" }],
    videos: [{ title: "Exercise Tutorial: Technogym Cross Trainer / Elliptical", url: yt("-KNl9Kl1CJM") }],
  },
];

export const machineForExercise = (exerciseId: string) => MACHINES.find((machine) => machine.exercises.includes(exerciseId));
