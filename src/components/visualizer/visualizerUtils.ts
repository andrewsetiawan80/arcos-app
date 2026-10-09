import type { WallSegment, SegmentPosition } from "./visualizerTypes";

/**
 * Traces the wall segment path and returns 3D positions/rotations for each segment.
 * Path starts at origin, heading -Z. Each segment's turn is applied before extending.
 */
export function computeSegmentPositions(
  segments: WallSegment[],
  defaultHeight: number
): SegmentPosition[] {
  const result: SegmentPosition[] = [];
  let x = 0;
  let z = 0;
  let heading = 0; // 0 = -Z, 90 = +X, 180 = +Z, -90 = -X

  for (const seg of segments) {
    heading = (heading + seg.turn + 360) % 360;
    const h = seg.height > 0 ? seg.height : defaultHeight;

    const rad = (heading * Math.PI) / 180;
    const dx = Math.sin(rad) * seg.length;
    const dz = -Math.cos(rad) * seg.length;

    const midX = x + dx / 2;
    const midZ = z + dz / 2;

    // Wall normal = perpendicular to path, pointing "left" (interior)
    const normalAngle = rad + Math.PI / 2;
    const normalX = Math.sin(normalAngle);
    const normalZ = -Math.cos(normalAngle);

    // Three.js plane default: XY, normal +Z. We need rotation to match our normal.
    let rotY = 0;
    if (Math.abs(normalZ) > 0.99) {
      rotY = normalZ > 0 ? 0 : Math.PI;
    } else {
      rotY = -Math.atan2(normalX, normalZ);
    }

    result.push({
      id: seg.id,
      position: [midX, h / 2, midZ],
      rotation: [0, rotY, 0],
      width: seg.length,
      height: h,
      pathStart: [x, z],
      pathEnd: [x + dx, z + dz],
    });

    x += dx;
    z += dz;
  }

  return result;
}

/**
 * Returns 2D polygon points for the floor as axis-aligned bounding box of the path.
 * Good for L, U, and rectangular layouts.
 */
export function computeFloorPolygon(
  segments: WallSegment[],
  defaultHeight: number
): [number, number][] {
  const positions = computeSegmentPositions(segments, defaultHeight);
  if (positions.length === 0) return [];

  let minX = 0;
  let maxX = 0;
  let minZ = 0;
  let maxZ = 0;

  for (const p of positions) {
    minX = Math.min(minX, p.pathStart[0], p.pathEnd[0]);
    maxX = Math.max(maxX, p.pathStart[0], p.pathEnd[0]);
    minZ = Math.min(minZ, p.pathStart[1], p.pathEnd[1]);
    maxZ = Math.max(maxZ, p.pathStart[1], p.pathEnd[1]);
  }

  return [
    [minX, minZ],
    [maxX, minZ],
    [maxX, maxZ],
    [minX, maxZ],
  ];
}

export type EnclosingWall = {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
};

const TOL = 0.02; // meters tolerance for edge matching

/**
 * Returns wall planes needed to close the room. Only adds enclosing walls when
 * floor.enabled and we have 2+ segments. For single wall/backsplash, returns [].
 */
export function computeEnclosingWalls(
  segments: WallSegment[],
  wallHeight: number,
  floorEnabled: boolean
): EnclosingWall[] {
  if (!floorEnabled || segments.length < 2) return [];

  const positions = computeSegmentPositions(segments, wallHeight);
  if (positions.length === 0) return [];

  let minX = 0;
  let maxX = 0;
  let minZ = 0;
  let maxZ = 0;
  for (const p of positions) {
    minX = Math.min(minX, p.pathStart[0], p.pathEnd[0]);
    maxX = Math.max(maxX, p.pathStart[0], p.pathEnd[0]);
    minZ = Math.min(minZ, p.pathStart[1], p.pathEnd[1]);
    maxZ = Math.max(maxZ, p.pathStart[1], p.pathEnd[1]);
  }

  // Path edges: each segment covers one edge
  type Edge = { a: [number, number]; b: [number, number] };
  const pathEdges: Edge[] = positions.map((p) => ({
    a: p.pathStart,
    b: p.pathEnd,
  }));

  const edgesMatch = (e1: Edge, e2: Edge): boolean => {
    const d = (a: [number, number], b: [number, number]) =>
      Math.hypot(a[0] - b[0], a[1] - b[1]);
    return (
      (d(e1.a, e2.a) < TOL && d(e1.b, e2.b) < TOL) ||
      (d(e1.a, e2.b) < TOL && d(e1.b, e2.a) < TOL)
    );
  };

  const result: EnclosingWall[] = [];
  const h = wallHeight;

  // Bbox edges: left (x=minX), right (x=maxX), top (z=minZ), bottom (z=maxZ)
  const leftEdge: Edge = { a: [minX, minZ], b: [minX, maxZ] };
  const rightEdge: Edge = { a: [maxX, minZ], b: [maxX, maxZ] };
  const topEdge: Edge = { a: [minX, minZ], b: [maxX, minZ] };
  const bottomEdge: Edge = { a: [minX, maxZ], b: [maxX, maxZ] };

  if (!pathEdges.some((e) => edgesMatch(e, rightEdge))) {
    result.push({
      position: [maxX, h / 2, (minZ + maxZ) / 2],
      rotation: [0, -Math.PI / 2, 0],
      width: maxZ - minZ,
      height: h,
    });
  }
  if (!pathEdges.some((e) => edgesMatch(e, bottomEdge))) {
    result.push({
      position: [(minX + maxX) / 2, h / 2, maxZ],
      rotation: [0, 0, 0],
      width: maxX - minX,
      height: h,
    });
  }
  if (!pathEdges.some((e) => edgesMatch(e, leftEdge))) {
    result.push({
      position: [minX, h / 2, (minZ + maxZ) / 2],
      rotation: [0, Math.PI / 2, 0],
      width: maxZ - minZ,
      height: h,
    });
  }
  if (!pathEdges.some((e) => edgesMatch(e, topEdge))) {
    result.push({
      position: [(minX + maxX) / 2, h / 2, minZ],
      rotation: [0, Math.PI, 0],
      width: maxX - minX,
      height: h,
    });
  }

  return result;
}

/**
 * Get bounding box of the layout for camera framing.
 */
export function getLayoutBounds(
  segments: WallSegment[],
  defaultHeight: number
): { center: [number, number, number]; size: number } {
  const positions = computeSegmentPositions(segments, defaultHeight);
  if (positions.length === 0) {
    return { center: [0, 1.5, 0], size: 5 };
  }

  let minX = 0;
  let maxX = 0;
  let minZ = 0;
  let maxZ = 0;
  let maxH = 0;

  for (const p of positions) {
    minX = Math.min(minX, p.position[0] - p.width / 2, p.position[0] + p.width / 2);
    maxX = Math.max(maxX, p.position[0] - p.width / 2, p.position[0] + p.width / 2);
    minZ = Math.min(minZ, p.position[2] - p.width / 2, p.position[2] + p.width / 2);
    maxZ = Math.max(maxZ, p.position[2] - p.width / 2, p.position[2] + p.width / 2);
    maxH = Math.max(maxH, p.height);
  }

  const center: [number, number, number] = [
    (minX + maxX) / 2,
    maxH / 2,
    (minZ + maxZ) / 2,
  ];
  const size = Math.max(maxX - minX, maxZ - minZ, maxH, 3) * 1.2;

  return { center, size };
}
