import type { Product, ProductVariant } from "../../types";

export type TileFinish = "matte" | "satin" | "gloss" | "polished";

export type SurfaceMaterial = {
  product: { product: Product; variant: ProductVariant } | null;
  finish: TileFinish;
};

export type UntitledSurfaceStyle = {
  color: string;
  roughness: number;
};

export type WallSegment = {
  id: string;
  length: number; // meters
  height: number; // meters
  turn: 0 | 90 | -90; // degrees, relative to previous segment
  material: SurfaceMaterial;
};

export type FloorConfig = {
  enabled: boolean;
  material: SurfaceMaterial;
};

export type CeilingConfig = {
  enabled: boolean;
  style: UntitledSurfaceStyle;
};

export type WallPaintConfig = {
  color: string;
  roughness: number;
};

export type SegmentPosition = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  pathStart: [number, number];
  pathEnd: [number, number];
};

export const TILE_FINISH_PBR: Record<
  TileFinish,
  { roughness: number; clearcoat: number; envMapIntensity: number }
> = {
  matte: { roughness: 0.7, clearcoat: 0, envMapIntensity: 0.3 },
  satin: { roughness: 0.45, clearcoat: 0.05, envMapIntensity: 0.5 },
  gloss: { roughness: 0.25, clearcoat: 0.15, envMapIntensity: 0.7 },
  polished: { roughness: 0.1, clearcoat: 0.3, envMapIntensity: 0.9 },
};

export const DEFAULT_WALL_PAINT: WallPaintConfig = {
  color: "#f0efe8",
  roughness: 0.9,
};

export const DEFAULT_CEILING_STYLE: UntitledSurfaceStyle = {
  color: "#f5f4ef",
  roughness: 0.95,
};

// Helper function for generating IDs (browser-compatible)
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createSegment(
  overrides: Partial<WallSegment> & { length: number; height: number }
): WallSegment {
  return {
    id: generateId(),
    length: overrides.length,
    height: overrides.height,
    turn: overrides.turn ?? 0,
    material: overrides.material ?? { product: null, finish: "satin" },
    ...overrides,
  };
}
