"use client";

import { useMemo, useState } from "react";
import AppHeader from "./_components/AppHeader";
import AppNavigation from "./_components/AppNavigation";
import BodyScreen from "./_components/BodyScreen";
import DataScreen from "./_components/DataScreen";
import ExerciseDialog from "./_components/ExerciseDialog";
import HomeScreen from "./_components/HomeScreen";
import ProgressScreen from "./_components/ProgressScreen";
import RoutineScreen from "./_components/RoutineScreen";
import type { RoutineExercise, Tab } from "./_lib/types";
import { useWorkout } from "./_lib/use-workout";
import { deriveWorkoutStats } from "./_lib/workout-stats";

export default function Home() {
  const workout = useWorkout();
  const [tab, setTab] = useState<Tab>("home");
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  // Todos los ejercicios conocidos, sin repetir, para poder reutilizarlos en cualquier día.
  const library = useMemo(() => {
    const known = new Map<string, RoutineExercise>();
    for (const day of workout.data.days) for (const exercise of day.exercises) if (!known.has(exercise.id)) known.set(exercise.id, exercise);
    return [...known.values()];
  }, [workout.data.days]);

  if (!workout.hydrated) {
    return (
  <main className="loading-screen">
        <p className="wordmark">exor<span>fitness</span></p>
        <p>Abriendo tu rutina</p>
      </main>
    );
  }

  const { data } = workout;
  const stats = deriveWorkoutStats(data, workout.weekStart);
  // La rutina del día es una pantalla "empujada": lleva flecha de volver y no muestra la barra inferior.
  const showChrome = tab !== "routine";

  return (
    <div className="app-frame mx-auto min-h-screen w-full max-w-[1280px] px-4 pb-28 md:px-10 md:pb-12 lg:px-[60px]">
      {showChrome && <AppHeader theme={workout.theme} storageMessage={workout.storageMessage} onHome={() => setTab("home")} onToggleTheme={workout.toggleTheme} />}
      {showChrome && <div className="desktop-nav-wrap"><AppNavigation tab={tab} onChange={setTab} /></div>}

      <main>
        {tab === "home" && (
          <HomeScreen data={data} stats={stats} onSelectDay={workout.selectDay} onOpenRoutine={() => setTab("routine")} />
        )}
        {tab === "routine" && (
          <RoutineScreen
            data={data}
            stats={stats}
            onBack={() => setTab("home")}
            onAddExercise={() => setIsAddingExercise(true)}
            onRemoveExercise={workout.removeExercise}
            onStart={workout.startWorkout}
            onFinish={workout.finishWorkout}
            onCancel={workout.cancelWorkout}
            onUpdateSet={workout.updateSet}
            onAddSet={workout.addSet}
            onSetNotes={workout.setNotes}
            onCompleteExercise={workout.completeExercise}
            onReplaceExercise={workout.replaceExercise}
            onSetExtraCardio={workout.setExtraCardio}
          />
        )}
        {tab === "body" && <BodyScreen data={data} library={library} onStartCustom={(exercises, title) => { workout.startCustomWorkout(exercises, title); setTab("routine"); }} />}
        {tab === "progress" && <ProgressScreen data={data} stats={stats} onAddMeasurement={workout.addMeasurement} onUpdateSession={workout.updateSession} onDeleteSession={workout.deleteSession} />}
        {tab === "data" && <DataScreen data={data} storageMessage={workout.storageMessage} onExport={workout.exportData} onImport={workout.importData} />}
      </main>

      {showChrome && <AppNavigation tab={tab} onChange={setTab} />}

      {isAddingExercise && (
        <ExerciseDialog
          dayLabel={stats.selectedDay.label}
          onClose={() => setIsAddingExercise(false)}
          library={library}
          sessionActive={stats.activeSession !== null}
          onSubmit={workout.addExercise}
        />
      )}
      <p className="sr-only" aria-live="polite">{workout.storageMessage}</p>
    </div>
  );
}
