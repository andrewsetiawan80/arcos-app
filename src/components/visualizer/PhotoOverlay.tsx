import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product, ProductVariant } from "../../types";
import ProductPicker from "./ProductPicker";
import {
  createBakedTileCanvas,
  bakeLitTileCanvas,
  buildLuminanceMap,
  getEffectiveCellMm,
  applyPatternUV,
  type PatternSettings,
  DEFAULT_PATTERN,
} from "./tileBaking";
import { ROOM_PRESETS, type RoomPreset } from "./roomPresets";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTextureUrl(p: Product): string | undefined {
  return p.textureUrl || p.coverImageUrl;
}

function getNormalMapUrl(p: Product): string | undefined {
  return p.normalMapUrl;
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type TilePlane = {
  id: string;
  points: { x: number; y: number }[];
  cutouts: { x: number; y: number }[][];
  product?: Product | null;
  variant?: ProductVariant | null;
  tileWmm?: number;
  tileHmm?: number;
};

type DragTarget =
  | { type: "plane"; pointIdx: number }
  | { type: "cutout"; cutoutIdx: number; pointIdx: number }
  | { type: "ruler"; pointIdx: 0 | 1 }
  | null;

type ToolMode =
  | "place"         // click 4 corners to create a plane
  | "rect-plane"    // click-drag to create a rectangular plane
  | "cutout"        // click N corners to create a polygon cutout (double-click to close)
  | "rect-cutout"   // click-drag to create a rectangular cutout
  | "ruler";        // click 2 points + specify distance for scale calibration

type Pt = { x: number; y: number };

export type PhotoOverlayProps = {
  product: Product | null;
  variant: ProductVariant | null;
  onProductSelect: (product: Product, variant: ProductVariant) => void;
  products: Product[];
  categories?: { id: string; name: string; slug: string }[];
  dark?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PhotoOverlay({
  product,
  variant,
  onProductSelect,
  products,
  categories = [],
  dark = false,
}: PhotoOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* Photo state */
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [, setPhotoUrl] = useState<string | null>(null);

  /* Preset room state */
  const [activePreset, setActivePreset] = useState<RoomPreset | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  // Processed mask canvas: RGB luminance converted to alpha channel for compositing
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);

  /* Plane state */
  const [planes, setPlanes] = useState<TilePlane[]>([]);
  const [activePlaneIdx, setActivePlaneIdx] = useState(-1);

  /* Interaction state */
  const [dragging, setDragging] = useState<DragTarget>(null);
  const [mode, setMode] = useState<ToolMode>("place");
  const [cutoutPoints, setCutoutPoints] = useState<Pt[]>([]);
  const [rectStart, setRectStart] = useState<Pt | null>(null);
  const [rectPreview, setRectPreview] = useState<Pt | null>(null);

  /* Ruler state */
  const [rulerPoints, setRulerPoints] = useState<[Pt, Pt] | null>(null);
  const [rulerDistanceMm, setRulerDistanceMm] = useState(1000);

  /* Tile / rendering state */
  const [opacity, setOpacity] = useState(0.75);
  const [groutWidthMm, setGroutWidthMm] = useState(2);
  const [groutColor, setGroutColor] = useState("#888888");
  const [tileWmm, setTileWmm] = useState(600);
  const [tileHmm, setTileHmm] = useState(600);
  const [mirrorH, setMirrorH] = useState(false);
  const [mirrorV, setMirrorV] = useState(false);
  const [pattern, setPattern] = useState<PatternSettings>(DEFAULT_PATTERN);
  const [showHandles, setShowHandles] = useState(true);
  const [showBeforeAfter, setShowBeforeAfter] = useState<"after" | "before">("after");
  const [edgeFeatherPx, setEdgeFeatherPx] = useState(10);
  const [luminanceStrength, setLuminanceStrength] = useState(0.35);
  const [lightAzimuth, setLightAzimuth] = useState(45);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [reliefStrength, setReliefStrength] = useState(1);
  const [ambientLight, setAmbientLight] = useState(0.3);

  /* Collapsible sidebar sections */
  const [tileSettingsOpen, setTileSettingsOpen] = useState(true);
  const [overlaySettingsOpen, setOverlaySettingsOpen] = useState(true);
  const [lightingOpen, setLightingOpen] = useState(false);

  /* Baking refs & state */
  const tileImgRef = useRef<HTMLImageElement | null>(null);
  const normalImgRef = useRef<HTMLImageElement | null>(null);
  const luminanceCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const tiledSrcRef = useRef<{
    bakedCanvas: HTMLCanvasElement;
    canvas: HTMLCanvasElement;
    srcW: number;
    srcH: number;
  } | null>(null);
  const [tileImgLoaded, setTileImgLoaded] = useState(false);
  const [normalImgLoaded, setNormalImgLoaded] = useState(false);
  const [bakedCanvas, setBakedCanvas] = useState<HTMLCanvasElement | null>(null);

  /* Per-plane baked canvas cache */
  type BakedCacheEntry = {
    bakedCanvas: HTMLCanvasElement;
    tiledSrc: HTMLCanvasElement;
    srcW: number;
    srcH: number;
  };
  const perPlaneCacheRef = useRef<Map<string, BakedCacheEntry>>(new Map());
  const loadingUrlsRef = useRef<Set<string>>(new Set());
  const [cacheVersion, setCacheVersion] = useState(0);

  const imgUrl = product ? getTextureUrl(product) : undefined;
  const normalUrl = product ? getNormalMapUrl(product) : undefined;

  /* ---------------------------------------------------------------- */
  /*  Ruler → px/meter conversion                                      */
  /* ---------------------------------------------------------------- */

  const rulerPxPerMeter = useMemo(() => {
    if (!rulerPoints || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;
    const pxDist = Math.hypot(
      (rulerPoints[1].x - rulerPoints[0].x) * cw,
      (rulerPoints[1].y - rulerPoints[0].y) * ch
    );
    if (pxDist < 1 || rulerDistanceMm <= 0) return null;
    return pxDist / (rulerDistanceMm / 1000);
  }, [rulerPoints, rulerDistanceMm]);

  // Fallback scale when no ruler is set (3m reference width = old default)
  const fallbackScale = 3.0;

  /* ---------------------------------------------------------------- */
  /*  Tile image loading & baking                                      */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    setTileWmm(product?.size?.w_mm ?? 600);
    setTileHmm(product?.size?.h_mm ?? 600);
  }, [product]);

  useEffect(() => {
    setTileImgLoaded(false);
    tileImgRef.current = null;
    if (!imgUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { tileImgRef.current = img; setTileImgLoaded(true); };
    img.onerror = () => { setTileImgLoaded(false); tileImgRef.current = null; };
    img.src = imgUrl;
  }, [imgUrl]);

  useEffect(() => {
    setNormalImgLoaded(false);
    normalImgRef.current = null;
    if (!normalUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { normalImgRef.current = img; setNormalImgLoaded(true); };
    img.onerror = () => { setNormalImgLoaded(false); normalImgRef.current = null; };
    img.src = normalUrl;
  }, [normalUrl]);

  useEffect(() => {
    if (!tileImgRef.current || !tileImgLoaded) { setBakedCanvas(null); return; }
    if (tileWmm <= 0 || tileHmm <= 0) { setBakedCanvas(null); return; }
    const baked = createBakedTileCanvas(
      tileImgRef.current, tileWmm, tileHmm, groutWidthMm, groutColor,
      { preserveAlpha: true, mirrorH, mirrorV }
    );
    if (baked.width <= 0 || baked.height <= 0) { setBakedCanvas(null); return; }
    let finalCanvas = baked;
    if (normalImgRef.current && normalImgLoaded) {
      finalCanvas = bakeLitTileCanvas(baked, normalImgRef.current, {
        lightAzimuth, lightElevation: 30, lightIntensity, reliefStrength, ambientLight, roughness: 0.5,
      });
    }
    // Apply variant color tint
    if (variant?.color) {
      const tCtx = finalCanvas.getContext("2d");
      if (tCtx) {
        tCtx.globalCompositeOperation = "multiply";
        tCtx.fillStyle = variant.color;
        tCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        tCtx.globalCompositeOperation = "source-over";
      }
    }
    setBakedCanvas(finalCanvas);
  }, [
    tileImgLoaded, normalImgLoaded, tileWmm, tileHmm, groutWidthMm, groutColor,
    mirrorH, mirrorV, lightAzimuth, lightIntensity, reliefStrength, ambientLight, variant,
  ]);

  /* ---------------------------------------------------------------- */
  /*  Per-plane baking cache                                           */
  /* ---------------------------------------------------------------- */

  const perPlaneSettingsKey = `${groutWidthMm}_${groutColor}_${mirrorH}_${mirrorV}_${lightAzimuth}_${lightIntensity}_${reliefStrength}_${ambientLight}`;
  const prevSettingsKeyRef = useRef(perPlaneSettingsKey);

  const planeKeys = planes
    .filter((p) => p.product)
    .map((p) => {
      const url = getTextureUrl(p.product!) || "";
      const pw = p.tileWmm ?? tileWmm;
      const ph = p.tileHmm ?? tileHmm;
      const vc = p.variant?.color || "";
      return url ? `${url}|${pw}|${ph}|${vc}` : "";
    })
    .filter(Boolean);
  const uniquePlaneKeys = Array.from(new Set(planeKeys)).sort().join("||");

  useEffect(() => {
    if (prevSettingsKeyRef.current !== perPlaneSettingsKey) {
      perPlaneCacheRef.current.clear();
      loadingUrlsRef.current.clear();
      prevSettingsKeyRef.current = perPlaneSettingsKey;
    }
    for (const plane of planes) {
      if (!plane.product) continue;
      const texUrl = getTextureUrl(plane.product);
      if (!texUrl) continue;
      const pw = plane.tileWmm ?? tileWmm;
      const ph = plane.tileHmm ?? tileHmm;
      if (pw <= 0 || ph <= 0) continue;
      const vc = plane.variant?.color || "";
      const cacheKey = `${texUrl}|${pw}|${ph}|${vc}`;
      if (perPlaneCacheRef.current.has(cacheKey)) continue;
      if (loadingUrlsRef.current.has(cacheKey)) continue;
      loadingUrlsRef.current.add(cacheKey);
      const tileImg = new Image();
      tileImg.crossOrigin = "anonymous";
      tileImg.onload = () => {
        const baked = createBakedTileCanvas(tileImg, pw, ph, groutWidthMm, groutColor, {
          preserveAlpha: true, mirrorH, mirrorV,
        });
        const finalize = (finalCanvas: HTMLCanvasElement) => {
          const sw2 = finalCanvas.width;
          const sh2 = finalCanvas.height;
          // Guard: skip if baked canvas has no content
          if (sw2 <= 0 || sh2 <= 0) { loadingUrlsRef.current.delete(cacheKey); return; }
          // Apply variant color tint
          if (vc) {
            const tCtx = finalCanvas.getContext("2d");
            if (tCtx) {
              tCtx.globalCompositeOperation = "multiply";
              tCtx.fillStyle = vc;
              tCtx.fillRect(0, 0, sw2, sh2);
              tCtx.globalCompositeOperation = "source-over";
            }
          }
          const ts = document.createElement("canvas");
          ts.width = sw2 * 2; ts.height = sh2 * 2;
          const tc = ts.getContext("2d");
          if (tc) { tc.drawImage(finalCanvas, 0, 0); tc.drawImage(finalCanvas, sw2, 0); tc.drawImage(finalCanvas, 0, sh2); tc.drawImage(finalCanvas, sw2, sh2); }
          perPlaneCacheRef.current.set(cacheKey, { bakedCanvas: finalCanvas, tiledSrc: ts, srcW: sw2, srcH: sh2 });
          loadingUrlsRef.current.delete(cacheKey);
          setCacheVersion((v) => v + 1);
        };
        const nUrl = plane.product ? getNormalMapUrl(plane.product) : undefined;
        if (nUrl) {
          const nImg = new Image();
          nImg.crossOrigin = "anonymous";
          nImg.onload = () => {
            const lit = bakeLitTileCanvas(baked, nImg, {
              lightAzimuth, lightElevation: 30, lightIntensity, reliefStrength, ambientLight, roughness: 0.5,
            });
            finalize(lit);
          };
          nImg.onerror = () => finalize(baked);
          nImg.src = nUrl;
        } else { finalize(baked); }
      };
      tileImg.onerror = () => { loadingUrlsRef.current.delete(cacheKey); };
      tileImg.src = texUrl;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniquePlaneKeys, perPlaneSettingsKey]);

  /* ---------------------------------------------------------------- */
  /*  Photo handling                                                   */
  /* ---------------------------------------------------------------- */

  const loadPhoto = useCallback((file: File) => {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setPhoto(img);
      setPhotoUrl(url);
      setPlanes([]);
      setActivePlaneIdx(-1);
      setRulerPoints(null);
      setActivePreset(null);
      setMaskImg(null);
      if (containerRef.current) {
        containerRef.current.style.aspectRatio = `${img.width} / ${img.height}`;
      }
    };
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadPhoto(file);
  }, [loadPhoto]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { loadPhoto(file); setActivePreset(null); setMaskImg(null); }
  };

  // Convert mask RGB luminance → alpha channel whenever maskImg changes
  useEffect(() => {
    if (!maskImg) { setMaskCanvas(null); return; }
    const c = document.createElement("canvas");
    c.width = maskImg.width;
    c.height = maskImg.height;
    const ctx2 = c.getContext("2d");
    if (!ctx2) return;
    ctx2.drawImage(maskImg, 0, 0);
    const idata = ctx2.getImageData(0, 0, c.width, c.height);
    const d = idata.data;
    for (let i = 0; i < d.length; i += 4) {
      // Luminance → alpha  (white = keep tiles, black = hide tiles)
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
      d[i + 3] = Math.round(lum); // white → 255 alpha, black → 0 alpha
    }
    ctx2.putImageData(idata, 0, 0);
    setMaskCanvas(c);
  }, [maskImg]);

  /** Load a preset room: fetch the photo + alpha mask images. */
  const loadPreset = useCallback((preset: RoomPreset) => {
    setActivePreset(preset);
    setPlanes([]);
    setActivePlaneIdx(-1);
    setRulerPoints(null);
    setMaskImg(null);

    // Load room photo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPhoto(img);
      setPhotoUrl(preset.photoUrl);
      if (containerRef.current) {
        containerRef.current.style.aspectRatio = `${img.width} / ${img.height}`;
      }
    };
    img.src = preset.photoUrl;

    // Load alpha mask
    const mask = new Image();
    mask.crossOrigin = "anonymous";
    mask.onload = () => setMaskImg(mask);
    mask.src = preset.maskUrl;
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Canvas coordinate helpers                                        */
  /* ---------------------------------------------------------------- */

  const getCanvasCoords = (e: React.MouseEvent): Pt | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
  };

  const sortPoints = (pts: Pt[]) => {
    if (pts.length !== 4) return pts;
    const cx = pts.reduce((a, p) => a + p.x, 0) / 4;
    const cy = pts.reduce((a, p) => a + p.y, 0) / 4;
    return [...pts].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  };

  /* ---------------------------------------------------------------- */
  /*  Draw function                                                    */
  /* ---------------------------------------------------------------- */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const cw = rect.width;
    const ch = rect.height;

    if (!photo) {
      ctx.fillStyle = dark ? "#333" : "#f5f5f5";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = dark ? "#666" : "#999";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Select a room above or upload your own photo", cw / 2, ch / 2);
      return;
    }

    // Draw photo
    const imgAspect = photo.width / photo.height;
    const canvasAspect = cw / ch;
    let drawW: number, drawH: number, offsetX: number, offsetY: number;
    if (canvasAspect > imgAspect) {
      drawH = ch; drawW = ch * imgAspect; offsetX = (cw - drawW) / 2; offsetY = 0;
    } else {
      drawW = cw; drawH = cw / imgAspect; offsetX = 0; offsetY = (ch - drawH) / 2;
    }
    ctx.drawImage(photo, offsetX, offsetY, drawW, drawH);

    if (showBeforeAfter === "before") { drawHandles(ctx, cw, ch); return; }

    // ====== Alpha-mask rendering (for preset rooms) ======
    if (maskCanvas && bakedCanvas) {
      // Compute tile dimensions for flat tiling
      const { cellWmm, cellHmm } = getEffectiveCellMm(tileWmm, tileHmm, groutWidthMm, mirrorH, mirrorV);

      // Scale: use preset wallWidthMm or ruler or fallback
      let pxPerMeter: number;
      if (rulerPxPerMeter) {
        pxPerMeter = rulerPxPerMeter;
      } else if (activePreset?.wallWidthMm) {
        pxPerMeter = drawW / (activePreset.wallWidthMm / 1000);
      } else {
        pxPerMeter = drawW / fallbackScale;
      }

      const cellPxW = (cellWmm / 1000) * pxPerMeter;
      const cellPxH = (cellHmm / 1000) * pxPerMeter;
      if (cellPxW > 1 && cellPxH > 1) {
        // Build offscreen canvas with tiled texture using createPattern + transform.
        // Use the FULL-RES baked canvas as the pattern source and let the browser's
        // image smoothing do the downscaling, preserving texture detail.
        const offscreen = document.createElement("canvas");
        offscreen.width = cw;
        offscreen.height = ch;
        const octx = offscreen.getContext("2d");
        if (octx) {
          octx.imageSmoothingEnabled = true;
          octx.imageSmoothingQuality = "high";
          const bw = bakedCanvas.width;
          const bh = bakedCanvas.height;

          // Guard: skip if baked canvas has no content yet
          if (bw > 0 && bh > 0) {

          // Scale factors: map full-res baked canvas → display cell size
          const scaleX = cellPxW / bw;
          const scaleY = cellPxH / bh;

          if (pattern.mode === "brick") {
            // Brick: build a 2-row super-cell at full resolution, then scale
            const brickCanvas = document.createElement("canvas");
            brickCanvas.width = bw;
            brickCanvas.height = bh * 2;
            const bctx = brickCanvas.getContext("2d");
            if (bctx) {
              bctx.drawImage(bakedCanvas, 0, 0);
              // Row 1: offset by 50%
              const halfW = Math.round(bw / 2);
              bctx.drawImage(bakedCanvas, halfW, bh);
              bctx.drawImage(bakedCanvas, halfW - bw, bh);
            }
            const pat = octx.createPattern(brickCanvas, "repeat");
            if (pat) {
              octx.save();
              octx.translate(offsetX, offsetY);
              octx.scale(scaleX, scaleY);
              octx.fillStyle = pat;
              octx.fillRect(0, 0, drawW / scaleX, drawH / scaleY);
              octx.restore();
            }
          } else {
            // Stack / default: use baked canvas directly at full resolution
            const pat = octx.createPattern(bakedCanvas, "repeat");
            if (pat) {
              octx.save();
              octx.translate(offsetX, offsetY);
              octx.scale(scaleX, scaleY);
              octx.fillStyle = pat;
              octx.fillRect(0, 0, drawW / scaleX, drawH / scaleY);
              octx.restore();
            }
          }

          } // end bw > 0 && bh > 0 guard

          // Apply processed alpha mask using destination-in: keeps tiles only where mask is white
          octx.globalCompositeOperation = "destination-in";
          octx.drawImage(maskCanvas, offsetX, offsetY, drawW, drawH);
          octx.globalCompositeOperation = "source-over";

          // Draw masked tiles onto main canvas
          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.drawImage(offscreen, 0, 0);
          ctx.restore();

          // Luminance shadow preservation for mask area
          if (luminanceStrength > 0 && photo && dragging === null) {
            const lumKey = `mask_${Math.round(cw / 2)}_${Math.round(ch / 2)}`;
            const lumCache = luminanceCacheRef.current;
            let lumCanvas = lumCache.get(lumKey);
            if (!lumCanvas) {
              // Build a full-image luminance map (no plane points, covers everything)
              const halfW = Math.round(cw / 2);
              const halfH = Math.round(ch / 2);
              const lumOff = document.createElement("canvas");
              lumOff.width = halfW;
              lumOff.height = halfH;
              const lctx = lumOff.getContext("2d");
              if (lctx) {
                lctx.drawImage(photo, 0, 0, halfW, halfH);
                // Simple gaussian-ish blur by scaling down and up
                const tinyW = Math.max(1, Math.round(halfW / 4));
                const tinyH = Math.max(1, Math.round(halfH / 4));
                const tinyC = document.createElement("canvas");
                tinyC.width = tinyW;
                tinyC.height = tinyH;
                const tctx = tinyC.getContext("2d");
                if (tctx) {
                  tctx.drawImage(lumOff, 0, 0, tinyW, tinyH);
                  lctx.clearRect(0, 0, halfW, halfH);
                  lctx.drawImage(tinyC, 0, 0, halfW, halfH);
                }
                // Apply grayscale
                const idata = lctx.getImageData(0, 0, halfW, halfH);
                const d = idata.data;
                for (let i = 0; i < d.length; i += 4) {
                  const gray = Math.max(40, 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
                  d[i] = d[i + 1] = d[i + 2] = gray;
                }
                lctx.putImageData(idata, 0, 0);
              }
              lumCanvas = lumOff;
              lumCache.set(lumKey, lumCanvas);
            }
            // Apply luminance only within the mask
            const lumMasked = document.createElement("canvas");
            lumMasked.width = cw;
            lumMasked.height = ch;
            const lmctx = lumMasked.getContext("2d");
            if (lmctx) {
              lmctx.drawImage(lumCanvas, 0, 0, cw, ch);
              lmctx.globalCompositeOperation = "destination-in";
              lmctx.drawImage(maskCanvas, offsetX, offsetY, drawW, drawH);
              lmctx.globalCompositeOperation = "source-over";
            }
            ctx.save();
            ctx.globalAlpha = luminanceStrength;
            ctx.globalCompositeOperation = "multiply";
            ctx.drawImage(lumMasked, 0, 0);
            ctx.restore();
          }
        }
      }
    }

    // Global 2x2 tiled source
    let globalTiledSrc: HTMLCanvasElement | null = null;
    let globalSrcW = 0, globalSrcH = 0;
    if (bakedCanvas && bakedCanvas.width > 0 && bakedCanvas.height > 0) {
      const cached = tiledSrcRef.current;
      if (cached && cached.bakedCanvas === bakedCanvas) {
        globalTiledSrc = cached.canvas; globalSrcW = cached.srcW; globalSrcH = cached.srcH;
      } else {
        globalSrcW = bakedCanvas.width; globalSrcH = bakedCanvas.height;
        globalTiledSrc = document.createElement("canvas");
        globalTiledSrc.width = globalSrcW * 2; globalTiledSrc.height = globalSrcH * 2;
        const tctx = globalTiledSrc.getContext("2d");
        if (tctx) { tctx.drawImage(bakedCanvas, 0, 0); tctx.drawImage(bakedCanvas, globalSrcW, 0); tctx.drawImage(bakedCanvas, 0, globalSrcH); tctx.drawImage(bakedCanvas, globalSrcW, globalSrcH); }
        tiledSrcRef.current = { bakedCanvas, canvas: globalTiledSrc, srcW: globalSrcW, srcH: globalSrcH };
      }
    }

    // Render each plane
    for (let pi = 0; pi < planes.length; pi++) {
      const plane = planes[pi];
      const pts = sortPoints(plane.points);
      const planeTileW = plane.product ? (plane.tileWmm ?? tileWmm) : tileWmm;
      const planeTileH = plane.product ? (plane.tileHmm ?? tileHmm) : tileHmm;

      let tiledSrc: HTMLCanvasElement | null = null;
      let srcW = 0, srcH = 0;
      if (plane.product) {
        const texUrl = getTextureUrl(plane.product);
        const vc = plane.variant?.color || "";
        const cacheKey = texUrl ? `${texUrl}|${planeTileW}|${planeTileH}|${vc}` : null;
        const entry = cacheKey ? perPlaneCacheRef.current.get(cacheKey) : null;
        if (entry) { tiledSrc = entry.tiledSrc; srcW = entry.srcW; srcH = entry.srcH; }
      } else {
        tiledSrc = globalTiledSrc; srcW = globalSrcW; srcH = globalSrcH;
      }

      if (pts.length !== 4 || !tiledSrc || srcW <= 0 || srcH <= 0) continue;

      const { cellWmm, cellHmm } = getEffectiveCellMm(planeTileW, planeTileH, groutWidthMm, mirrorH, mirrorV);
      const mapped = pts.map((p) => ({ x: p.x * cw, y: p.y * ch }));
      const quadW = Math.hypot(mapped[1].x - mapped[0].x, mapped[1].y - mapped[0].y);
      const quadH = Math.hypot(mapped[3].x - mapped[0].x, mapped[3].y - mapped[0].y);

      // Tile count using ruler or fallback
      let cols: number, rows: number;
      if (rulerPxPerMeter) {
        const quadWm = quadW / rulerPxPerMeter;
        const quadHm = quadH / rulerPxPerMeter;
        cols = quadWm / (cellWmm / 1000);
        rows = quadHm / (cellHmm / 1000);
      } else {
        const pxPerMeter = quadW / fallbackScale;
        const quadWm = quadW / pxPerMeter;
        const quadHm = quadH / pxPerMeter;
        cols = quadWm / (cellWmm / 1000);
        rows = quadHm / (cellHmm / 1000);
      }

      const N = dragging !== null ? 8 : 16;
      const bilinear = (u: number, v: number) => ({
        x: (1 - u) * (1 - v) * mapped[0].x + u * (1 - v) * mapped[1].x + u * v * mapped[2].x + (1 - u) * v * mapped[3].x,
        y: (1 - u) * (1 - v) * mapped[0].y + u * (1 - v) * mapped[1].y + u * v * mapped[2].y + (1 - u) * v * mapped[3].y,
      });

      const duCols = cols / N, dvRows = rows / N;
      const sw = Math.max(1, duCols * srcW), sh = Math.max(1, dvRows * srcH);
      const featherSize = edgeFeatherPx > 0 ? Math.min(edgeFeatherPx / quadW, edgeFeatherPx / quadH, 0.1) : 0;

      // Clip: quad (clockwise) minus cutouts (counter-clockwise for evenodd)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(mapped[0].x, mapped[0].y);
      ctx.lineTo(mapped[1].x, mapped[1].y);
      ctx.lineTo(mapped[2].x, mapped[2].y);
      ctx.lineTo(mapped[3].x, mapped[3].y);
      ctx.closePath();
      for (const cutout of plane.cutouts) {
        if (cutout.length < 3) continue;
        const cs = cutout.map((p) => ({ x: p.x * cw, y: p.y * ch }));
        // Reverse winding for evenodd hole
        ctx.moveTo(cs[cs.length - 1].x, cs[cs.length - 1].y);
        for (let ci = cs.length - 2; ci >= 0; ci--) ctx.lineTo(cs[ci].x, cs[ci].y);
        ctx.closePath();
      }
      ctx.clip("evenodd");

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const u0 = i / N, v0 = j / N, u1 = (i + 1) / N, v1 = (j + 1) / N;
          const tileU = u0 * cols, tileV = v0 * rows;
          const { u: pu, v: pv } = applyPatternUV(tileU, tileV, pattern);
          const fracU = ((pu % 1) + 1) % 1, fracV = ((pv % 1) + 1) % 1;
          const sx = fracU * srcW, sy = fracV * srcH;
          const edgeFade = featherSize > 0 ? Math.max(0, Math.min(1, Math.min(u0 / featherSize, (1 - u1) / featherSize, v0 / featherSize, (1 - v1) / featherSize))) : 1;
          const dst0 = bilinear(u0, v0), dst1 = bilinear(u1, v0), dst3 = bilinear(u0, v1);
          ctx.save();
          ctx.globalAlpha = opacity * edgeFade;
          ctx.translate(dst0.x, dst0.y);
          ctx.transform(dst1.x - dst0.x, dst1.y - dst0.y, dst3.x - dst0.x, dst3.y - dst0.y, 0, 0);
          ctx.drawImage(tiledSrc, sx, sy, sw, sh, 0, 0, 1, 1);
          ctx.restore();
        }
      }

      // Luminance (shadow preservation)
      if (luminanceStrength > 0 && photo && dragging === null) {
        const lumKey = `${pi}_${plane.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("_")}_${Math.round(cw / 2)}_${Math.round(ch / 2)}`;
        const lumCache = luminanceCacheRef.current;
        let lumCanvas = lumCache.get(lumKey);
        if (!lumCanvas) {
          lumCanvas = buildLuminanceMap(photo, plane.points, Math.round(cw / 2), Math.round(ch / 2), 10);
          lumCache.set(lumKey, lumCanvas);
          if (lumCache.size > 8) { const fk = lumCache.keys().next().value; if (fk !== undefined) lumCache.delete(fk); }
        }
        ctx.save();
        ctx.globalAlpha = luminanceStrength;
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(lumCanvas, 0, 0, cw, ch);
        ctx.restore();
      }

      ctx.restore(); // end clip
    }

    drawHandles(ctx, cw, ch);

    // Ruler line
    if (rulerPoints) {
      const [rp0, rp1] = rulerPoints;
      const rx0 = rp0.x * cw, ry0 = rp0.y * ch, rx1 = rp1.x * cw, ry1 = rp1.y * ch;
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx1, ry1); ctx.stroke();
      ctx.setLineDash([]);
      // Endpoints
      [{ x: rx0, y: ry0 }, { x: rx1, y: ry1 }].forEach((p) => {
        ctx.fillStyle = "#00ff88"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      // Label
      const midX = (rx0 + rx1) / 2, midY = (ry0 + ry1) / 2;
      ctx.fillStyle = "#00ff88"; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${rulerDistanceMm} mm`, midX, midY - 12);
    }

    // Rectangle preview
    if (rectStart && rectPreview && (mode === "rect-plane" || mode === "rect-cutout")) {
      const x0 = rectStart.x * cw, y0 = rectStart.y * ch, x1 = rectPreview.x * cw, y1 = rectPreview.y * ch;
      ctx.strokeStyle = mode === "rect-plane" ? "rgba(255,200,0,0.8)" : "rgba(255,100,100,0.8)";
      ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
      ctx.setLineDash([]);
    }

    // Cutout in-progress feedback
    if ((mode === "cutout") && cutoutPoints.length > 0) {
      ctx.strokeStyle = "rgba(255,100,100,0.8)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(cutoutPoints[0].x * cw, cutoutPoints[0].y * ch);
      cutoutPoints.slice(1).forEach((p) => ctx.lineTo(p.x * cw, p.y * ch));
      ctx.stroke(); ctx.setLineDash([]);
      cutoutPoints.forEach((p) => {
        ctx.fillStyle = "rgba(255,100,100,0.9)"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(p.x * cw, p.y * ch, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.fillStyle = "rgba(255,100,100,0.9)"; ctx.font = "12px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(
        `Cut-out: ${cutoutPoints.length} pts (dbl-click to close)`,
        cutoutPoints[0].x * cw + 12, cutoutPoints[0].y * ch - 8
      );
    }
  }, [
    photo, planes, opacity, bakedCanvas, groutWidthMm, tileWmm, tileHmm,
    mirrorH, mirrorV, pattern, showHandles, showBeforeAfter, activePlaneIdx,
    edgeFeatherPx, luminanceStrength, dragging, mode, cutoutPoints, dark,
    cacheVersion, rulerPoints, rulerDistanceMm, rulerPxPerMeter, rectStart, rectPreview,
    maskCanvas, activePreset,
  ]);

  /* ---------------------------------------------------------------- */
  /*  drawHandles                                                      */
  /* ---------------------------------------------------------------- */

  const drawHandles = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    if (!showHandles) return;

    for (let pi = 0; pi < planes.length; pi++) {
      const plane = planes[pi];
      const pts = plane.points;
      const isActive = pi === activePlaneIdx;

      // Incomplete plane preview
      if (pts.length < 4 && pts.length > 0) {
        ctx.strokeStyle = isActive ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)";
        ctx.setLineDash([4, 4]); ctx.beginPath();
        ctx.moveTo(pts[0].x * cw, pts[0].y * ch);
        pts.slice(1).forEach((p) => ctx.lineTo(p.x * cw, p.y * ch));
        ctx.stroke(); ctx.setLineDash([]);
      }

      if (pts.length === 4) {
        const sorted = sortPoints(pts);
        ctx.strokeStyle = isActive ? "rgba(255,200,0,0.9)" : "rgba(255,255,255,0.4)";
        ctx.lineWidth = isActive ? 2 : 1; ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(sorted[0].x * cw, sorted[0].y * ch);
        sorted.slice(1).forEach((p) => ctx.lineTo(p.x * cw, p.y * ch));
        ctx.closePath(); ctx.stroke();

        // Plane corner handles (white circles)
        if (isActive) {
          pts.forEach((p) => {
            ctx.fillStyle = "#fff"; ctx.strokeStyle = "#333"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p.x * cw, p.y * ch, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          });
        }

        // Cutout outlines + handles
        plane.cutouts.forEach((cutout, ci) => {
          if (cutout.length < 3) return;
          const c = cutout.map((p) => ({ x: p.x * cw, y: p.y * ch }));
          ctx.strokeStyle = "rgba(255,100,100,0.8)"; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(c[0].x, c[0].y);
          c.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);

          // Cutout corner handles (smaller, orange)
          if (isActive) {
            cutout.forEach((p) => {
              ctx.fillStyle = "#ff6644"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
              ctx.beginPath(); ctx.arc(p.x * cw, p.y * ch, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            });
          }
        });
      }
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Animation frame scheduling                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  /* ---------------------------------------------------------------- */
  /*  Interaction handlers                                             */
  /* ---------------------------------------------------------------- */

  const rafRef = useRef<number | null>(null);

  const startDrag = (e: React.MouseEvent, target: DragTarget) => {
    e.stopPropagation();
    if (target && target.type === "plane") setActivePlaneIdx(activePlaneIdx); // keep current
    setDragging(target);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    // Rectangle preview
    if (rectStart && (mode === "rect-plane" || mode === "rect-cutout")) {
      setRectPreview(coords);
      return;
    }

    if (dragging === null) return;
    const planeIdx = activePlaneIdx;
    if (planeIdx < 0 || planeIdx >= planes.length) return;

    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      if (dragging!.type === "plane") {
        setPlanes((prev) => {
          const next = [...prev];
          const plane = { ...next[planeIdx], points: [...next[planeIdx].points] };
          plane.points[dragging!.pointIdx] = coords;
          next[planeIdx] = plane;
          return next;
        });
      } else if (dragging!.type === "cutout") {
        const { cutoutIdx, pointIdx } = dragging as { type: "cutout"; cutoutIdx: number; pointIdx: number };
        setPlanes((prev) => {
          const next = [...prev];
          const plane = { ...next[planeIdx] };
          const cutouts = [...plane.cutouts];
          const cutout = [...cutouts[cutoutIdx]];
          cutout[pointIdx] = coords;
          cutouts[cutoutIdx] = cutout;
          plane.cutouts = cutouts;
          next[planeIdx] = plane;
          return next;
        });
      } else if (dragging!.type === "ruler") {
        const rpi = (dragging as { type: "ruler"; pointIdx: 0 | 1 }).pointIdx;
        setRulerPoints((prev) => {
          if (!prev) return prev;
          const next: [Pt, Pt] = [...prev];
          next[rpi] = coords;
          return next;
        });
      }
    });
  };

  const handleMouseUp = () => {
    // Finalize rectangle
    if (rectStart && rectPreview && (mode === "rect-plane" || mode === "rect-cutout")) {
      const x0 = Math.min(rectStart.x, rectPreview.x);
      const y0 = Math.min(rectStart.y, rectPreview.y);
      const x1 = Math.max(rectStart.x, rectPreview.x);
      const y1 = Math.max(rectStart.y, rectPreview.y);
      if (Math.abs(x1 - x0) > 0.01 && Math.abs(y1 - y0) > 0.01) {
        const corners: Pt[] = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
        if (mode === "rect-plane") {
          const newPlane: TilePlane = { id: generateId(), points: corners, cutouts: [] };
          setPlanes((prev) => [...prev, newPlane]);
          setActivePlaneIdx(planes.length);
        } else if (mode === "rect-cutout" && activePlaneIdx >= 0 && planes[activePlaneIdx]?.points.length === 4) {
          setPlanes((prev) => {
            const next = [...prev];
            next[activePlaneIdx] = { ...next[activePlaneIdx], cutouts: [...next[activePlaneIdx].cutouts, corners] };
            return next;
          });
        }
      }
      setRectStart(null);
      setRectPreview(null);
      return;
    }
    setDragging(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    // Ruler mode: place 2 points
    if (mode === "ruler") {
      if (!rulerPoints) {
        setRulerPoints([coords, coords]);
      } else {
        setRulerPoints([rulerPoints[0], coords]);
        setMode("place"); // done placing ruler
      }
      return;
    }

    // Polygon cutout mode
    if (mode === "cutout" && activePlaneIdx >= 0) {
      setCutoutPoints((prev) => [...prev, coords]);
      return;
    }

    // Rectangle modes: start drag
    if (mode === "rect-plane" || mode === "rect-cutout") {
      setRectStart(coords);
      setRectPreview(coords);
      return;
    }

    // Handle detection: ruler handles
    if (rulerPoints) {
      for (let ri = 0; ri < 2; ri++) {
        const dist = Math.hypot(coords.x - rulerPoints[ri].x, coords.y - rulerPoints[ri].y);
        if (dist < 0.03) { startDrag(e, { type: "ruler", pointIdx: ri as 0 | 1 }); return; }
      }
    }

    // Handle detection: cutout handles (check before plane handles so they take priority)
    if (activePlaneIdx >= 0 && activePlaneIdx < planes.length) {
      const plane = planes[activePlaneIdx];
      for (let ci = 0; ci < plane.cutouts.length; ci++) {
        for (let pi2 = 0; pi2 < plane.cutouts[ci].length; pi2++) {
          const dist = Math.hypot(coords.x - plane.cutouts[ci][pi2].x, coords.y - plane.cutouts[ci][pi2].y);
          if (dist < 0.03) { startDrag(e, { type: "cutout", cutoutIdx: ci, pointIdx: pi2 }); return; }
        }
      }
    }

    // Handle detection: plane handles
    for (let pi = 0; pi < planes.length; pi++) {
      const plane = planes[pi];
      for (let i = 0; i < plane.points.length; i++) {
        const dist = Math.hypot(coords.x - plane.points[i].x, coords.y - plane.points[i].y);
        if (dist < 0.03) {
          setActivePlaneIdx(pi);
          startDrag(e, { type: "plane", pointIdx: i });
          return;
        }
      }
    }

    // Place mode: add corners or create plane
    if (mode === "place" && photo) {
      if (activePlaneIdx >= 0 && planes[activePlaneIdx]?.points.length < 4) {
        const plane = planes[activePlaneIdx];
        const newPoints = [...plane.points, coords];
        setPlanes((prev) => { const next = [...prev]; next[activePlaneIdx] = { ...next[activePlaneIdx], points: newPoints }; return next; });
      } else if (planes.length === 0) {
        setPlanes([{ id: generateId(), points: [coords], cutouts: [] }]);
        setActivePlaneIdx(0);
      } else {
        setActivePlaneIdx(-1);
      }
    } else if (mode !== "cutout") {
      setActivePlaneIdx(-1);
    }
  };

  const handleDoubleClick = () => {
    // Close polygon cutout
    if (mode === "cutout" && cutoutPoints.length >= 3 && activePlaneIdx >= 0) {
      setPlanes((prev) => {
        const next = [...prev];
        next[activePlaneIdx] = {
          ...next[activePlaneIdx],
          cutouts: [...next[activePlaneIdx].cutouts, cutoutPoints],
        };
        return next;
      });
      setCutoutPoints([]);
      setMode("place");
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Keyboard shortcuts                                               */
  /* ---------------------------------------------------------------- */

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "p" || e.key === "P" || e.key === " ") { e.preventDefault(); setShowHandles((h) => !h); }
    if (e.key === "Escape") {
      setMode("place"); setCutoutPoints([]); setRectStart(null); setRectPreview(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* ---------------------------------------------------------------- */
  /*  Plane / product actions                                          */
  /* ---------------------------------------------------------------- */

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "arcos-visualizer-result.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const addPlane = () => {
    setPlanes((prev) => [...prev, { id: generateId(), points: [], cutouts: [] }]);
    setActivePlaneIdx(planes.length);
    setMode("place");
  };

  const handleProductSelect = (p: Product, v: ProductVariant) => {
    if (imgUrl && bakedCanvas) {
      const snapshotKey = `${imgUrl}|${tileWmm}|${tileHmm}|${variant?.color || ""}`;
      if (!perPlaneCacheRef.current.has(snapshotKey)) {
        const cached = tiledSrcRef.current;
        if (cached && cached.bakedCanvas === bakedCanvas) {
          perPlaneCacheRef.current.set(snapshotKey, { bakedCanvas, tiledSrc: cached.canvas, srcW: cached.srcW, srcH: cached.srcH });
        }
      }
    }
    const pw = p.size?.w_mm ?? tileWmm;
    const ph = p.size?.h_mm ?? tileHmm;
    if (activePlaneIdx >= 0 && activePlaneIdx < planes.length) {
      setPlanes((prev) => {
        const next = [...prev];
        next[activePlaneIdx] = { ...next[activePlaneIdx], product: p, variant: v, tileWmm: pw, tileHmm: ph };
        return next;
      });
    }
    onProductSelect(p, v);
  };

  // Get the effective tile dimensions for the active plane (per-plane if product assigned, else global)
  const activePlane = activePlaneIdx >= 0 && activePlaneIdx < planes.length ? planes[activePlaneIdx] : null;
  const effectiveTileW = activePlane?.product ? (activePlane.tileWmm ?? tileWmm) : tileWmm;
  const effectiveTileH = activePlane?.product ? (activePlane.tileHmm ?? tileHmm) : tileHmm;

  const clampTileMm = (n: number) => Math.max(50, Math.min(1200, Number.isFinite(n) ? n : 600));

  const handleTileWChange = (val: number) => {
    const clamped = clampTileMm(val);
    setTileWmm(clamped);
    // Also update the active plane's per-plane dimension and invalidate its cache
    if (activePlaneIdx >= 0 && activePlaneIdx < planes.length && planes[activePlaneIdx]?.product) {
      const plane = planes[activePlaneIdx];
      const texUrl = getTextureUrl(plane.product!);
      const vc = plane.variant?.color || "";
      const oldKey = texUrl ? `${texUrl}|${plane.tileWmm ?? tileWmm}|${plane.tileHmm ?? tileHmm}|${vc}` : null;
      if (oldKey) { perPlaneCacheRef.current.delete(oldKey); loadingUrlsRef.current.delete(oldKey); }
      setPlanes((prev) => {
        const next = [...prev];
        next[activePlaneIdx] = { ...next[activePlaneIdx], tileWmm: clamped };
        return next;
      });
    }
  };

  const handleTileHChange = (val: number) => {
    const clamped = clampTileMm(val);
    setTileHmm(clamped);
    // Also update the active plane's per-plane dimension and invalidate its cache
    if (activePlaneIdx >= 0 && activePlaneIdx < planes.length && planes[activePlaneIdx]?.product) {
      const plane = planes[activePlaneIdx];
      const texUrl = getTextureUrl(plane.product!);
      const vc = plane.variant?.color || "";
      const oldKey = texUrl ? `${texUrl}|${plane.tileWmm ?? tileWmm}|${plane.tileHmm ?? tileHmm}|${vc}` : null;
      if (oldKey) { perPlaneCacheRef.current.delete(oldKey); loadingUrlsRef.current.delete(oldKey); }
      setPlanes((prev) => {
        const next = [...prev];
        next[activePlaneIdx] = { ...next[activePlaneIdx], tileHmm: clamped };
        return next;
      });
    }
  };

  const clearPlaneProduct = () => {
    if (activePlaneIdx < 0 || activePlaneIdx >= planes.length) return;
    setPlanes((prev) => {
      const next = [...prev];
      next[activePlaneIdx] = { ...next[activePlaneIdx], product: null, variant: null, tileWmm: undefined, tileHmm: undefined };
      return next;
    });
  };

  const removePlane = () => {
    if (activePlaneIdx >= 0 && activePlaneIdx < planes.length) {
      setPlanes((prev) => prev.filter((_, i) => i !== activePlaneIdx));
      setActivePlaneIdx(Math.max(-1, activePlaneIdx - 1));
    }
  };

  const removeCutout = (planeIdx: number, cutoutIdx: number) => {
    setPlanes((prev) => {
      const next = [...prev];
      next[planeIdx] = { ...next[planeIdx], cutouts: next[planeIdx].cutouts.filter((_, i) => i !== cutoutIdx) };
      return next;
    });
  };

  /* ---------------------------------------------------------------- */
  /*  CSS helpers                                                      */
  /* ---------------------------------------------------------------- */

  const inputCls = dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-[#232323]";
  const rangeCls = "w-full block min-w-0 cursor-pointer accent-amber-500";
  const btnCls = (active?: boolean) =>
    `px-2 py-1 rounded text-xs font-medium transition-colors ${active ? "ring-2 ring-amber-400" : ""} ${dark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`;
  const sectionHeader = (label: string, open: boolean, toggle: () => void) => (
    <button onClick={toggle} className="w-full flex items-center justify-between text-xs font-medium uppercase tracking-wider opacity-70 mb-2">
      <span>{label}</span>
      <span className="text-[10px]">{open ? "▼" : "▶"}</span>
    </button>
  );


  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ========== SIDEBAR ========== */}
      <aside className={`w-full lg:w-72 shrink-0 space-y-3 overflow-y-auto max-h-[90vh] ${dark ? "text-white" : "text-[#232323]"}`}>
        {/* --- 0. Room Presets Gallery --- */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">Try a Room</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ROOM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset)}
                className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${activePreset?.id === preset.id ? "border-amber-400 ring-2 ring-amber-400/50" : "border-white/10"}`}
                title={preset.name}
              >
                <img
                  src={preset.thumbnail || preset.photoUrl}
                  alt={preset.name}
                  className="w-20 h-14 object-cover"
                />
              </button>
            ))}
          </div>
          {activePreset && (
            <div className="text-xs opacity-60 mt-1">{activePreset.name} — select a product to preview tiles</div>
          )}
        </div>

        {/* --- 1. Photo upload --- */}
        <div className="flex gap-2">
          <label className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium text-center cursor-pointer ${dark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"}`}>
            Upload Photo
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} className="hidden" />
          </label>
          <button onClick={() => { setPlanes([]); setActivePlaneIdx(-1); setCutoutPoints([]); setRulerPoints(null); setActivePreset(null); setMaskImg(null); setPhoto(null); }} className={`px-3 py-2 rounded-lg text-sm font-medium ${dark ? "bg-white/10 hover:bg-white/20" : "bg-gray-100 hover:bg-gray-200"}`}>
            Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!photo || (!maskCanvas && planes.every((p) => p.points.length < 4))}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${photo && (maskCanvas || planes.some((p) => p.points.length >= 4)) ? (dark ? "bg-white text-[#232323]" : "bg-[#232323] text-white") : "opacity-50 cursor-not-allowed"}`}
          >
            PNG
          </button>
        </div>

        {/* --- 2. Planes & Tools --- */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">Planes</div>
          <div className="space-y-1 mb-2">
            {planes.map((plane, i) => {
              const pLabel = plane.product ? plane.product.title : "Using selected";
              return (
                <button key={plane.id} onClick={() => setActivePlaneIdx(i)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${activePlaneIdx === i ? "ring-2 ring-amber-400" : ""} ${dark ? "bg-white/10" : "bg-gray-100"}`}>
                  <span className="font-medium">Plane {i + 1}</span>
                  <span className={`text-xs truncate flex-1 ${plane.product ? "opacity-80" : "opacity-40 italic"}`}>{pLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Plane actions */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <button onClick={addPlane} className={`px-2 py-1 rounded text-xs border border-dashed ${dark ? "border-white/30" : "border-gray-300"}`}>+ Plane</button>
            {activePlaneIdx >= 0 && (
              <>
                {planes[activePlaneIdx]?.product && (
                  <button onClick={clearPlaneProduct} className={btnCls()} title="Unlock this plane">Unlock</button>
                )}
                <button onClick={removePlane} className="px-2 py-1 rounded text-xs text-red-500">Delete</button>
              </>
            )}
          </div>

          {/* Tool buttons */}
          <div className="text-xs font-medium uppercase tracking-wider mb-1.5 opacity-70">Tools</div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            <button onClick={() => { setMode("rect-plane"); setCutoutPoints([]); }} className={btnCls(mode === "rect-plane")}>Rect Plane</button>
            <button onClick={() => { setMode("place"); setCutoutPoints([]); }} className={btnCls(mode === "place")}>4-Pt Plane</button>
            <button
              onClick={() => { setMode("rect-cutout"); setCutoutPoints([]); }}
              disabled={activePlaneIdx < 0 || planes[activePlaneIdx]?.points.length < 4}
              className={`${btnCls(mode === "rect-cutout")} disabled:opacity-40`}
            >Rect Cut</button>
            <button
              onClick={() => { setMode("cutout"); setCutoutPoints([]); }}
              disabled={activePlaneIdx < 0 || planes[activePlaneIdx]?.points.length < 4}
              className={`${btnCls(mode === "cutout")} ${mode === "cutout" ? "ring-red-400" : ""} disabled:opacity-40`}
            >Poly Cut</button>
            <button
              onClick={() => { setMode("ruler"); }}
              className={btnCls(mode === "ruler")}
            >Ruler</button>
          </div>

          {/* Cutout list for active plane */}
          {activePlaneIdx >= 0 && planes[activePlaneIdx]?.cutouts.length > 0 && (
            <div className="space-y-1 mb-2">
              {planes[activePlaneIdx].cutouts.map((_, ci) => (
                <div key={ci} className={`flex items-center justify-between px-2 py-1 rounded text-xs ${dark ? "bg-white/5" : "bg-gray-50"}`}>
                  <span>Cut-out {ci + 1}</span>
                  <button onClick={() => removeCutout(activePlaneIdx, ci)} className="text-red-400 hover:text-red-300">×</button>
                </div>
              ))}
            </div>
          )}

          {/* View toggles */}
          <div className="flex gap-1.5">
            <button onClick={() => setShowHandles((h) => !h)} className={btnCls(!showHandles)}>
              {showHandles ? "Hide handles" : "Show handles"}
            </button>
            <button onClick={() => setShowBeforeAfter((v) => (v === "after" ? "before" : "after"))} className={btnCls()}>
              {showBeforeAfter === "after" ? "Before" : "After"}
            </button>
          </div>
        </div>

        {/* --- Ruler distance input --- */}
        {rulerPoints && (
          <div>
            <label className="text-xs opacity-70 block mb-1">Ruler distance (mm)</label>
            <input
              type="number" min={1} step={1}
              value={rulerDistanceMm}
              onChange={(e) => setRulerDistanceMm(Math.max(1, Number(e.target.value)))}
              className={`w-full px-2 py-1 rounded border ${inputCls}`}
            />
            <div className="text-xs opacity-50 mt-1">
              {rulerPxPerMeter ? `Scale: ${rulerPxPerMeter.toFixed(0)} px/m` : "Place both ruler points"}
            </div>
          </div>
        )}

        {/* --- 3. Product picker --- */}
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">Product</div>
          <ProductPicker
            products={products} categories={categories}
            selectedProduct={product} selectedVariant={variant}
            onSelect={handleProductSelect} dark={dark}
          />
        </div>

        {/* --- 4. Tile Settings (collapsible) --- */}
        <div>
          {sectionHeader("Tile Settings", tileSettingsOpen, () => setTileSettingsOpen((o) => !o))}
          {tileSettingsOpen && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs opacity-70 block mb-1">Tile W (mm)</label>
                  <input type="number" min={50} max={1200} value={effectiveTileW} onChange={(e) => handleTileWChange(Number(e.target.value))} className={`w-full px-2 py-1 rounded border ${inputCls}`} />
                </div>
                <div className="flex-1">
                  <label className="text-xs opacity-70 block mb-1">Tile H (mm)</label>
                  <input type="number" min={50} max={1200} value={effectiveTileH} onChange={(e) => handleTileHChange(Number(e.target.value))} className={`w-full px-2 py-1 rounded border ${inputCls}`} />
                </div>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Pattern</label>
                <select value={pattern.mode} onChange={(e) => setPattern((p) => ({ ...p, mode: e.target.value as PatternSettings["mode"] }))} className={`w-full px-2 py-2 rounded border ${inputCls}`}>
                  <option value="stack">Stack</option>
                  <option value="brick">Brick (50%)</option>
                  <option value="rotate45">Rotate 45°</option>
                  <option value="custom">Custom offset</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setMirrorH((h) => !h)} className={`px-3 py-1.5 rounded text-sm ${mirrorH ? "bg-amber-500/30" : ""} ${dark ? "bg-white/10" : "bg-gray-100"}`}>Mirror H</button>
                <button onClick={() => setMirrorV((v) => !v)} className={`px-3 py-1.5 rounded text-sm ${mirrorV ? "bg-amber-500/30" : ""} ${dark ? "bg-white/10" : "bg-gray-100"}`}>Mirror V</button>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Grout width (mm)</label>
                <input type="range" min={0} max={10} step={0.5} value={groutWidthMm} onChange={(e) => setGroutWidthMm(Number(e.target.value))} className={rangeCls} />
                <div className="text-xs opacity-50 mt-1">{groutWidthMm}mm</div>
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Grout color</label>
                <input type="color" value={groutColor} onChange={(e) => setGroutColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
              </div>
            </div>
          )}
        </div>

        {/* --- 5. Overlay Settings (collapsible) --- */}
        <div>
          {sectionHeader("Overlay", overlaySettingsOpen, () => setOverlaySettingsOpen((o) => !o))}
          {overlaySettingsOpen && (
            <div className="space-y-3">
              <div>
                <label className="text-xs opacity-70 block mb-1">Shadow preservation</label>
                <input type="range" min={0} max={1} step={0.05} value={luminanceStrength} onChange={(e) => setLuminanceStrength(Number(e.target.value))} className={rangeCls} />
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Edge blend (px)</label>
                <input type="range" min={0} max={40} value={edgeFeatherPx} onChange={(e) => setEdgeFeatherPx(Number(e.target.value))} className={rangeCls} />
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Opacity</label>
                <input type="range" min={0.3} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className={rangeCls} />
              </div>
            </div>
          )}
        </div>

        {/* --- 6. Lighting (collapsible, hidden when no normal map) --- */}
        {normalUrl && (
          <div>
            {sectionHeader("Lighting", lightingOpen, () => setLightingOpen((o) => !o))}
            {lightingOpen && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs opacity-70 block mb-1">Light direction (°)</label>
                  <input type="range" min={0} max={360} value={lightAzimuth} onChange={(e) => setLightAzimuth(Number(e.target.value))} className={rangeCls} />
                  <div className="text-xs opacity-50 mt-1">{lightAzimuth}°</div>
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">Light intensity</label>
                  <input type="range" min={0} max={2} step={0.1} value={lightIntensity} onChange={(e) => setLightIntensity(Number(e.target.value))} className={rangeCls} />
                </div>
                <div>
                  <label className="text-xs opacity-70 block mb-1">Relief strength</label>
                  <input type="range" min={0} max={3} step={0.1} value={reliefStrength} onChange={(e) => setReliefStrength(Number(e.target.value))} className={rangeCls} />
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* ========== CANVAS ========== */}
      <div
        ref={containerRef}
        className={`flex-1 min-w-0 rounded-lg overflow-hidden border border-white/10 ${photo ? "self-start" : "min-h-[400px]"}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className="w-full h-full block cursor-crosshair"
        />
      </div>
    </div>
  );
}
