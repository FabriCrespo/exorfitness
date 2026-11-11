"use client";

import dynamic from "next/dynamic";
import { type MouseEvent, useEffect, useRef } from "react";
import { demoFor, EXERCISE_GEAR, isTechnogym } from "../_lib/exercise-gear";
import { EXERCISE_MOTIONS } from "../_lib/exercise-poses";
import { muscleLabel, musclesOf } from "../_lib/muscles";
import { machineForExercise } from "../_lib/technogym";
import type { RoutineExercise } from "../_lib/types";
import MachineLinks from "./MachineLinks";

const ExerciseModel3D = dynamic(() => import("./ExerciseModel3D"), { ssr: false, loading: () => <div className="exercise-model-3d" /> });

type Props = {
  exercise: RoutineExercise;
  /** Resumen de tu última marca, si la hay. */
  last: string | null;
  onClose: () => void;
};

/** Ficha de un ejercicio: demostración 3D con los músculos iluminados, técnica y datos. */
export default function ExerciseSheet({ exercise, last, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const muscles = musclesOf(exercise);
  const machine = machineForExercise(exercise.id);
  const demo = demoFor(exercise.id, EXERCISE_MOTIONS);
  const technogym = demo ? isTechnogym(EXERCISE_GEAR[demo.id] ?? {}) : false;

  useEffect(() => { dialog.current?.showModal(); }, []);

  const closeOnBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) event.currentTarget.close();
  };

  return (
    <dialog ref={dialog} className="exercise-modal exercise-sheet" aria-labelledby="sheet-title" onClose={onClose} onClick={closeOnBackdropClick}>
      <header className="modal-heading">
        <hgroup>
          <p className="date-line">{exercise.equipment}</p>
          <h2 id="sheet-title">{exercise.name}</h2>
        </hgroup>
        <button className="close-button" type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar">×</button>
      </header>

      {demo ? (
        <>
          <ExerciseModel3D exerciseId={exercise.id} label={exercise.name} muscles={muscles} interactive />
          <p className="sheet-note">Arrastra para girar · los músculos que trabajan brillan en ámbar{!demo.exact && " · demostración aproximada"}</p>
        </>
      ) : (
        <p className="modal-hint">Este ejercicio aún no tiene demostración 3D.</p>
      )}

      <ul className="sheet-tags" aria-label="Detalles">
        {technogym && <li className="is-brand">Technogym</li>}
        {muscles.map((muscle, index) => <li key={muscle} className={index === 0 ? "is-primary" : undefined}>{muscleLabel(muscle)}</li>)}
      </ul>

      <dl className="sheet-facts">
        <div><dt>Objetivo</dt><dd>{exercise.targetSets} × {exercise.targetReps}</dd></div>
        <div><dt>Última vez</dt><dd>{last ?? "Sin registro"}</dd></div>
      </dl>
      <p className="technique-text">{exercise.cue}</p>

      {machine && (
        <section aria-labelledby="sheet-machine" className="sheet-machine">
          <h3 id="sheet-machine" className="list-title">Máquina · {machine.name}</h3>
          <MachineLinks machine={machine} />
        </section>
      )}
    </dialog>
  );
}
