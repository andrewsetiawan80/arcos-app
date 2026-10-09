/**
 * Utility for baking tile + grout into a repeatable canvas cell.
 * Supports custom shapes (triangles, relief panels, etc.) via alpha transparency.
 * Includes mirror super-cell, pattern modes, and PBR lit baking.
 */

export type PatternMode = "stack" | "brick" | "rotate45" | "custom";

export type PatternSettings = {
  mode: PatternMode;
  customOffsetU: number;
  customOffsetV: number;
};

export const DEFAULT_PATTERN: PatternSettings = {
  mode: "stack",
  customOffsetU: 0.5,
  customOffsetV: 0.5,
};

export type BakedTileOptions = {
  preserveAlpha?: boolean;
  mirrorH?: boolean;
  mirrorV?: boolean;
};

export type LitTileOptions = {
  lightAzimuth: number; // 0-360 degrees
  lightElevation: number; // 0-90 degrees
  lightIntensity: number;
  reliefStrength: number;
  ambientLight: number;
  roughness: number;
};

const DEFAULT_LIT_OPTS: LitTileOptions = {
  lightAzimuth: 45,
  lightElevation: 30,
  lightIntensity: 1,
  reliefStrength: 1,
  ambientLight: 0.3,
  roughness: 0.5,
};

/**
 * Apply pattern offset to tile UV coordinates.
 * Returns modified tileU, tileV for the pattern mode.
 */
export function applyPatternUV(
  tileU: number,
  tileV: number,
  pattern: PatternSettings
): { u: number; v: number } {
  switch (pattern.mode) {
    case "stack":
      return { u: tileU, v: tileV };
    case "brick":
      return {
        u: tileU + (Math.floor(tileV) % 2) * 0.5,
        v: tileV,
      };
    case "rotate45": {
      const sqrt2 = Math.SQRT2;
      const u = ((tileU + tileV) / sqrt2) % 1;
      const v = ((tileV - tileU) / sqrt2) % 1;
      return { u: u < 0 ? u + 1 : u, v: v < 0 ? v + 1 : v };
    }
    case "custom":
      return {
        u: tileU + (Math.floor(tileV) % 2) * pattern.customOffsetU,
        v: tileV + (Math.floor(tileU) % 2) * pattern.customOffsetV,
      };
    default:
      return { u: tileU, v: tileV };
  }
}

/**
 * Creates a canvas representing one tile cell (tile + grout).
 * When mirrorH/mirrorV are true, creates a 2x2 super-cell with flipped copies.
 */
export function createBakedTileCanvas(
  tileImg: HTMLImageElement | null,
  tileWmm: number,
  tileHmm: number,
  groutWmm: number,
  groutColor: string,
  options?: BakedTileOptions
): HTMLCanvasElement {
  const pxPerMm = 4;
  const groutPx = groutWmm * pxPerMm;
  const tilePxW = tileWmm * pxPerMm;
  const tilePxH = tileHmm * pxPerMm;
  const cellW = Math.ceil((tileWmm + groutWmm) * pxPerMm);
  const cellH = Math.ceil((tileHmm + groutWmm) * pxPerMm);

  const mirrorH = options?.mirrorH ?? false;
  const mirrorV = options?.mirrorV ?? false;
  const outW = mirrorH ? cellW * 2 : cellW;
  const outH = mirrorV ? cellH * 2 : cellH;

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: false,
    alpha: options?.preserveAlpha ?? true,
  });

  if (!ctx) return canvas;

  const tileX = groutPx / 2;
  const tileY = groutPx / 2;

  if (!mirrorH && !mirrorV) {
    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, cellW, cellH);
    if (tileImg) {
      ctx.drawImage(tileImg, tileX, tileY, tilePxW, tilePxH);
    }
    return canvas;
  }

  // Draw 2x2 super-cell: each quadrant gets one cell, with optional flip
  for (let row = 0; row < (mirrorV ? 2 : 1); row++) {
    for (let col = 0; col < (mirrorH ? 2 : 1); col++) {
      const dx = col * cellW;
      const dy = row * cellH;
      const flipX = mirrorH && col === 1;
      const flipY = mirrorV && row === 1;

      ctx.save();
      ctx.translate(dx, dy);
      if (flipX) {
        ctx.translate(cellW, 0);
        ctx.scale(-1, 1);
      }
      if (flipY) {
        ctx.translate(0, cellH);
        ctx.scale(1, -1);
      }

      ctx.fillStyle = groutColor;
      ctx.fillRect(0, 0, cellW, cellH);
      if (tileImg) {
        ctx.drawImage(tileImg, tileX, tileY, tilePxW, tilePxH);
      }
      ctx.restore();
    }
  }

  return canvas;
}

/**
 * Returns the effective cell dimensions in mm after mirroring.
 */
export function getEffectiveCellMm(
  tileWmm: number,
  tileHmm: number,
  groutWmm: number,
  mirrorH: boolean,
  mirrorV: boolean
): { cellWmm: number; cellHmm: number } {
  const cellW = tileWmm + groutWmm;
  const cellH = tileHmm + groutWmm;
  return {
    cellWmm: mirrorH ? cellW * 2 : cellW,
    cellHmm: mirrorV ? cellH * 2 : cellH,
  };
}

/**
 * Bakes a lit tile canvas using albedo + optional normal map.
 * Per-pixel directional lighting for 3D relief effect.
 */
export function bakeLitTileCanvas(
  albedoCanvas: HTMLCanvasElement,
  normalImg: HTMLImageElement | null,
  opts: Partial<LitTileOptions> = {}
): HTMLCanvasElement {
  const opt = { ...DEFAULT_LIT_OPTS, ...opts };
  const w = albedoCanvas.width;
  const h = albedoCanvas.height;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const rad = (deg: number) => (deg * Math.PI) / 180;
  const az = rad(opt.lightAzimuth);
  const el = rad(opt.lightElevation);
  const lightX = Math.cos(el) * Math.sin(az);
  const lightY = Math.cos(el) * Math.cos(az);
  const lightZ = Math.sin(el);

  const albedoCtx = albedoCanvas.getContext("2d");
  if (!albedoCtx) {
    ctx.drawImage(albedoCanvas, 0, 0);
    return canvas;
  }

  const albedoData = albedoCtx.getImageData(0, 0, w, h);
  const albedo = albedoData.data;

  let normalData: ImageData | null = null;
  if (normalImg && normalImg.complete && normalImg.naturalWidth > 0) {
    const normCanvas = document.createElement("canvas");
    normCanvas.width = w;
    normCanvas.height = h;
    const nctx = normCanvas.getContext("2d");
    if (nctx) {
      nctx.drawImage(normalImg, 0, 0, normalImg.naturalWidth, normalImg.naturalHeight, 0, 0, w, h);
      normalData = nctx.getImageData(0, 0, w, h);
    }
  }

  const out = ctx.createImageData(w, h);
  const outData = out.data;

  for (let i = 0; i < w * h; i++) {
    const i4 = i * 4;
    const r = albedo[i4] / 255;
    const g = albedo[i4 + 1] / 255;
    const b = albedo[i4 + 2] / 255;
    const a = albedo[i4 + 3] / 255;

    let nx = 0.5,
      ny = 0.5,
      nz = 1;
    if (normalData) {
      nx = (normalData.data[i4] / 255) * 2 - 1;
      ny = (normalData.data[i4 + 1] / 255) * 2 - 1;
      nz = (normalData.data[i4 + 2] / 255) * 2 - 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx = (nx / len) * opt.reliefStrength;
      ny = (ny / len) * opt.reliefStrength;
      nz = (nz / len) * opt.reliefStrength;
    }

    const dot = Math.max(0, nx * lightX + ny * lightY + nz * lightZ);
    const diffuse = Math.pow(dot, 1 + (1 - opt.roughness) * 2);
    const lit = opt.ambientLight + diffuse * opt.lightIntensity;

    outData[i4] = Math.round(Math.min(255, r * lit * 255));
    outData[i4 + 1] = Math.round(Math.min(255, g * lit * 255));
    outData[i4 + 2] = Math.round(Math.min(255, b * lit * 255));
    outData[i4 + 3] = Math.round(a * 255);
  }

  ctx.putImageData(out, 0, 0);
  return canvas;
}

/**
 * Point-in-polygon test (ray casting).
 */
function isInsideQuad(x: number, y: number, pts: { x: number; y: number }[]): boolean {
  if (pts.length < 3) return false;
  let inside = false;
  const n = pts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = pts[i].x,
      yi = pts[i].y;
    const xj = pts[j].x,
      yj = pts[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Builds a luminance map from the wall region in the photo.
 * Pixels inside the quad get grayscale luminance; outside get 255 (neutral for multiply).
 * minLuminance (0-255) prevents crushing to black - shadows stay visible but tiles retain relief.
 */
export function buildLuminanceMap(
  photo: HTMLImageElement,
  quadPoints: { x: number; y: number }[],
  canvasW: number,
  canvasH: number,
  blurRadius: number = 20,
  minLuminance: number = 140
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const rect = getPhotoDrawRect(photo, canvasW, canvasH);
  const pts = quadPoints.map((p) => ({ x: p.x * canvasW, y: p.y * canvasH }));

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.drawImage(photo, rect.offsetX, rect.offsetY, rect.drawW, rect.drawH);

  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const d = imgData.data;
  for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      const i = (y * canvasW + x) * 4;
      const l = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
      if (!isInsideQuad(x, y, pts)) {
        d[i] = d[i + 1] = d[i + 2] = 255;
      } else {
        const lifted = Math.max(minLuminance, l);
        d[i] = d[i + 1] = d[i + 2] = lifted;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  if (blurRadius > 0) {
    const blurred = simpleBlurGetData(imgData, canvasW, canvasH, blurRadius);
    ctx.putImageData(blurred, 0, 0);
  }

  return canvas;
}

function getPhotoDrawRect(
  photo: HTMLImageElement,
  canvasW: number,
  canvasH: number
): { offsetX: number; offsetY: number; drawW: number; drawH: number } {
  const imgAspect = photo.width / photo.height;
  const canvasAspect = canvasW / canvasH;
  if (canvasAspect > imgAspect) {
    const drawH = canvasH;
    const drawW = canvasH * imgAspect;
    return { offsetX: (canvasW - drawW) / 2, offsetY: 0, drawW, drawH };
  }
  const drawW = canvasW;
  const drawH = canvasW / imgAspect;
  return { offsetX: 0, offsetY: (canvasH - drawH) / 2, drawW, drawH };
}

function simpleBlurGetData(
  imgData: ImageData,
  w: number,
  h: number,
  radius: number
): ImageData {
  const d = imgData.data;
  const out = new ImageData(w, h);
  const r = Math.min(radius, 10);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0,
        count = 0;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = Math.max(0, Math.min(w - 1, x + dx));
          const ny = Math.max(0, Math.min(h - 1, y + dy));
          const i = (ny * w + nx) * 4;
          sum += (d[i] + d[i + 1] + d[i + 2]) / 3;
          count++;
        }
      }
      const v = Math.round(sum / count);
      const i = (y * w + x) * 4;
      out.data[i] = out.data[i + 1] = out.data[i + 2] = v;
      out.data[i + 3] = d[i + 3];
    }
  }
  return out;
}

/**
 * Compute number of tile columns and rows needed to cover a quad.
 */
export function computeTileCount(
  quadWidthPx: number,
  quadHeightPx: number,
  cellWmm: number,
  cellHmm: number,
  referenceWidthPx: number,
  referenceWidthM: number = 3.0
): { cols: number; rows: number } {
  const pxPerMeter = referenceWidthPx / referenceWidthM;
  const quadWm = quadWidthPx / pxPerMeter;
  const quadHm = quadHeightPx / pxPerMeter;
  const cellWm = cellWmm / 1000;
  const cellHm = cellHmm / 1000;
  const cols = quadWm / cellWm;
  const rows = quadHm / cellHm;
  return { cols, rows };
}
