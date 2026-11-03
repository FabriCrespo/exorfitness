"use client";

import { useState } from "react";
import AppHeader from "./_components/AppHeader";
import AppNavigation from "./_components/AppNavigation";
import DataScreen from "./_components/DataScreen";
import ExerciseDialog from "./_components/ExerciseDialog";
import ProgressScreen from "./_components/ProgressScreen";
import RoutineScreen from "./_components/RoutineScreen";
import type { Tab } from "./_lib/types";
import { useWorkout } from "./_lib/use-workout";
import { deriveWorkoutStats } from "./_lib/workout-stats";

export default function Home() {
  const workout = useWorkout();
  const [tab, setTab] = useState<Tab>("routine");
  const [isAddingExercise, setIsAddingExercise] = useState(false);

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

  return (
    <div className="app-frame mx-auto min-h-screen w-full max-w-[1280px] px-4 pb-28 md:px-10 md:pb-12 lg:px-[60px]">
      <AppHeader theme={workout.theme} storageMessage={workout.storageMessage} onHome={() => setTab("routine")} onToggleTheme={workout.toggleTheme} />
      <div className="desktop-nav-wrap"><AppNavigation tab={tab} onChange={setTab} /></div>

      <main>
        {tab === "routine" && (
          <RoutineScreen
            data={data}
            stats={stats}
            onAddExercise={() => setIsAddingExercise(true)}
            onSelectDay={workout.selectDay}
            onRemoveExercise={workout.removeExercise}
            onApplyFlexRoutine={workout.applyFlexRoutine}
            onStart={workout.startWorkout}
            onFinish={workout.finishWorkout}
            onCancel={workout.cancelWorkout}
            onUpdateSet={workout.updateSet}
            onAddSet={workout.addSet}
            onOpenHistory={() => setTab("progress")}
          />
        )}
        {tab === "progress" && <ProgressScreen data={data} stats={stats} onAddMeasurement={workout.addMeasurement} />}
        {tab === "data" && <DataScreen data={data} storageMessage={workout.storageMessage} onExport={workout.exportData} onImport={workout.importData} />}
      </main>

      <AppNavigation tab={tab} onChange={setTab} />

      {isAddingExercise && (
        <ExerciseDialog
          dayLabel={stats.selectedDay.label}
          onClose={() => setIsAddingExercise(false)}
          onSubmit={(name, equipment) => workout.addExercise(name, equipment)}
        />
      )}
      <p className="sr-only" aria-live="polite">{workout.storageMessage}</p>
    </div>
  );
}
