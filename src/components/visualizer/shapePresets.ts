import type { WallSegment } from "./visualizerTypes";
import { createSegment } from "./visualizerTypes";

export type ShapePreset = {
  id: string;
  label: string;
  segments: Omit<WallSegment, "id">[];
  floorEnabled: boolean;
  ceilingEnabled: boolean;
};

function seg(
  length: number,
  height: number,
  turn: 0 | 90 | -90 = 0
): Omit<WallSegment, "id"> {
  return {
    length,
    height,
    turn,
    material: { product: null, finish: "satin" },
  };
}

export const SHAPE_PRESETS: ShapePreset[] = [
  {
    id: "single",
    label: "Single Wall",
    segments: [seg(3, 2.7)],
    floorEnabled: false,
    ceilingEnabled: false,
  },
  {
    id: "l-corner",
    label: "L-Corner",
    segments: [seg(3, 2.7), seg(2, 2.7, 90)],
    floorEnabled: true,
    ceilingEnabled: true,
  },
  {
    id: "u-shower",
    label: "U-Shape / Shower",
    segments: [
      seg(1.2, 2.4),
      seg(2, 2.4, 90),
      seg(1.2, 2.4, 90),
    ],
    floorEnabled: true,
    ceilingEnabled: true,
  },
  {
    id: "alcove",
    label: "Alcove / Niche",
    segments: [
      seg(1.5, 2.4),
      seg(0.6, 2.4, 90),
      seg(1.5, 2.4, 90),
      seg(0.6, 2.4, 90),
      seg(1.5, 2.4, 90),
    ],
    floorEnabled: true,
    ceilingEnabled: true,
  },
  {
    id: "full-room",
    label: "Full Room",
    segments: [
      seg(3, 2.7),
      seg(2.5, 2.7, 90),
      seg(3, 2.7, 90),
      seg(2.5, 2.7, 90),
    ],
    floorEnabled: true,
    ceilingEnabled: true,
  },
  {
    id: "backsplash",
    label: "Kitchen Backsplash",
    segments: [seg(3, 0.6)],
    floorEnabled: false,
    ceilingEnabled: false,
  },
  {
    id: "feature",
    label: "Feature Wall",
    segments: [seg(4, 3)],
    floorEnabled: false,
    ceilingEnabled: false,
  },
];

export function applyPreset(preset: ShapePreset): {
  segments: WallSegment[];
  floorEnabled: boolean;
  ceilingEnabled: boolean;
} {
  const segments = preset.segments.map((s) =>
    createSegment({ ...s })
  );
  return {
    segments,
    floorEnabled: preset.floorEnabled,
    ceilingEnabled: preset.ceilingEnabled,
  };
}
