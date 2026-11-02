"use client";

import { useState } from "react";
import Image from "next/image";
import type { RoutineExercise } from "../_lib/types";

type Props = {
  exercise: RoutineExercise;
  localSrc: string;
  animation?: { src: string; label: string };
  variant: "routine" | "session";
};

export default function ExerciseVisual({ exercise, localSrc, animation, variant }: Props) {
  const [animationFailed, setAnimationFailed] = useState(false);
  const useAnimation = Boolean(animation && !animationFailed);
  const src = useAnimation ? animation!.src : localSrc;

  return (
    <div className={`exercise-visual ${variant}-visual`}>
      <Image
        className={`${variant === "session" ? "exercise-photo" : "routine-photo"} ${useAnimation ? "is-animated" : ""}`}
        src={src}
        alt={`${exercise.name} con ${exercise.equipment}`}
        width={variant === "session" ? 720 : 68}
        height={variant === "session" ? 920 : 68}
        unoptimized={useAnimation}
        onError={() => {
          if (animation && !animationFailed) setAnimationFailed(true);
        }}
      />
      {variant === "session" && useAnimation && (
        <p className="image-credit">Demostracion: {animation!.label}</p>
      )}
    </div>
  );
}
