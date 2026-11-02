#!/usr/bin/env python3
"""Split a transparent 2x2 exercise contact sheet into stable, aligned frames."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sheet", type=Path, help="Input 2x2 transparent contact sheet")
    parser.add_argument("exercise_id", help="Filename-safe exercise ID")
    parser.add_argument("--output-dir", type=Path, default=Path("assets/exercise-animations/frames"))
    args = parser.parse_args()

    with Image.open(args.sheet) as source:
        image = source.convert("RGBA")
    width, height = image.size
    if width % 2 or height % 2:
        raise SystemExit(f"contact sheet must have even dimensions, got {width}x{height}")

    cell_width, cell_height = width // 2, height // 2
    frames: list[Image.Image] = []
    for row in range(2):
        for column in range(2):
            frame = image.crop((column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height))
            alpha = frame.getchannel("A").point(lambda value: 0 if value < 18 else value)
            frame.putalpha(alpha)
            frames.append(frame)

    union_alpha = frames[0].getchannel("A")
    for frame in frames[1:]:
        union_alpha = ImageChops.lighter(union_alpha, frame.getchannel("A"))
    bounds = union_alpha.getbbox()
    if bounds is None:
        raise SystemExit("contact sheet contains no visible subject")

    left, top, right, bottom = bounds
    margin = max(8, round(min(cell_width, cell_height) * 0.035))
    stable_bounds = (
        max(0, left - margin),
        max(0, top - margin),
        min(cell_width, right + margin),
        min(cell_height, bottom + margin),
    )
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for index, frame in enumerate(frames, start=1):
        frame.crop(stable_bounds).save(args.output_dir / f"{args.exercise_id}_{index:02}.png")

    print(f"{args.exercise_id}: {len(frames)} frames, shared crop {stable_bounds}")


if __name__ == "__main__":
    main()
