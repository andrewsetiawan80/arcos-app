import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createBakedTileCanvas,
  computeTileCount,
  getEffectiveCellMm,
  applyPatternUV,
  type PatternSettings,
  DEFAULT_PATTERN,
} from "./tileBaking";

const PRESET_ROOM_URL =
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80";
const WALL_TEXTURE_URL = "/images/ai-demo-wall-texture.png";

// Predefined wall quad for demo room (normalized 0-1) - simulates "AI detected" back wall
const DEMO_WALL_POINTS: { x: number; y: number }[] = [
  { x: 0.15, y: 0.25 },
  { x: 0.85, y: 0.22 },
  { x: 0.88, y: 0.72 },
  { x: 0.12, y: 0.75 },
];

export default function AIDemoOverlay({ dark = false }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [textureLoaded, setTextureLoaded] = useState(false);
  const textureRef = useRef<HTMLImageElement | null>(null);
  const [bakedCanvas, setBakedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [scale, setScale] = useState(3.0); // Wall width in meters
  const [opacity, setOpacity] = useState(0.9);
  const [detecting, setDetecting] = useState(false);
  const [tileWmm, setTileWmm] = useState(600);
  const [tileHmm, setTileHmm] = useState(600);
  const [groutWidthMm, setGroutWidthMm] = useState(2);
  const [groutColor, setGroutColor] = useState("#888888");
  const [mirrorH, setMirrorH] = useState(false);
  const [mirrorV, setMirrorV] = useState(false);
  const [pattern, setPattern] = useState<PatternSettings>(DEFAULT_PATTERN);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPhoto(img);
    };
    img.onerror = () => setPhoto(null);
    img.src = PRESET_ROOM_URL;
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      textureRef.current = img;
      setTextureLoaded(true);
    };
    img.onerror = () => setTextureLoaded(false);
    img.src = WALL_TEXTURE_URL;
  }, []);

  // Bake tile + grout canvas
  useEffect(() => {
    if (!textureRef.current || !textureLoaded) {
      setBakedCanvas(null);
      return;
    }
    const baked = createBakedTileCanvas(
      textureRef.current,
      tileWmm,
      tileHmm,
      groutWidthMm,
      groutColor,
      { preserveAlpha: true, mirrorH, mirrorV }
    );
    setBakedCanvas(baked);
  }, [textureRef.current, textureLoaded, tileWmm, tileHmm, groutWidthMm, groutColor, mirrorH, mirrorV]);

  const detectWallWithAI = useCallback(async () => {
    setDetecting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setPoints(DEMO_WALL_POINTS);
    } finally {
      setDetecting(false);
    }
  }, []);

  const sortPoints = (pts: { x: number; y: number }[]) => {
    if (pts.length !== 4) return pts;
    const cx = pts.reduce((a, p) => a + p.x, 0) / 4;
    const cy = pts.reduce((a, p) => a + p.y, 0) / 4;
    return [...pts].sort((a, b) => {
      const a1 = Math.atan2(a.y - cy, a.x - cx);
      const b1 = Math.atan2(b.y - cy, b.x - cx);
      return a1 - b1;
    });
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    canvas.width = w;
    canvas.height = h;
    ctx.scale(dpr, dpr);

    const cw = rect.width;
    const ch = rect.height;

    if (!photo) {
      ctx.fillStyle = dark ? "#333" : "#f5f5f5";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = dark ? "#666" : "#999";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading room...", cw / 2, ch / 2);
      return;
    }

    const imgAspect = photo.width / photo.height;
    const canvasAspect = cw / ch;
    let drawW: number, drawH: number, offsetX: number, offsetY: number;
    if (canvasAspect > imgAspect) {
      drawH = ch;
      drawW = ch * imgAspect;
      offsetX = (cw - drawW) / 2;
      offsetY = 0;
    } else {
      drawW = cw;
      drawH = cw / imgAspect;
      offsetX = 0;
      offsetY = (ch - drawH) / 2;
    }

    ctx.drawImage(photo, offsetX, offsetY, drawW, drawH);

    const pts = sortPoints(points);
    if (pts.length === 4 && bakedCanvas) {
      const mapped = pts.map((p) => ({
        x: p.x * cw,
        y: p.y * ch,
      }));

      // Compute quad dimensions
      const quadW = Math.hypot(mapped[1].x - mapped[0].x, mapped[1].y - mapped[0].y);
      const quadH = Math.hypot(mapped[3].x - mapped[0].x, mapped[3].y - mapped[0].y);

      const { cellWmm, cellHmm } = getEffectiveCellMm(
        tileWmm,
        tileHmm,
        groutWidthMm,
        mirrorH,
        mirrorV
      );
      const { cols, rows } = computeTileCount(quadW, quadH, cellWmm, cellHmm, quadW, scale);

      // Create a 2x2 tiled source so drawImage never clips at tile boundaries
      const srcW = bakedCanvas.width;
      const srcH = bakedCanvas.height;
      const tiledSrc = document.createElement("canvas");
      tiledSrc.width = srcW * 2;
      tiledSrc.height = srcH * 2;
      const tctx = tiledSrc.getContext("2d");
      if (tctx) {
        tctx.drawImage(bakedCanvas, 0, 0);
        tctx.drawImage(bakedCanvas, srcW, 0);
        tctx.drawImage(bakedCanvas, 0, srcH);
        tctx.drawImage(bakedCanvas, srcW, srcH);
      }

      const N = 24;
      const bilinear = (u: number, v: number) => ({
        x:
          (1 - u) * (1 - v) * mapped[0].x +
          u * (1 - v) * mapped[1].x +
          u * v * mapped[2].x +
          (1 - u) * v * mapped[3].x,
        y:
          (1 - u) * (1 - v) * mapped[0].y +
          u * (1 - v) * mapped[1].y +
          u * v * mapped[2].y +
          (1 - u) * v * mapped[3].y,
      });

      // Fixed texture sample size per subdivision -- perspective handled by ctx.transform
      const duCols = cols / N;
      const dvRows = rows / N;
      const sw = duCols * srcW;
      const sh = dvRows * srcH;

      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          const u0 = i / N;
          const v0 = j / N;
          const u1 = (i + 1) / N;
          const v1 = (j + 1) / N;

          const tileU = u0 * cols;
          const tileV = v0 * rows;
          const { u: pu, v: pv } = applyPatternUV(tileU, tileV, pattern);
          const fracU = ((pu % 1) + 1) % 1;
          const fracV = ((pv % 1) + 1) % 1;

          // Sample from 2x2 tiled source -- sx+sw safely within bounds
          const sx = fracU * srcW;
          const sy = fracV * srcH;

          const dst0 = bilinear(u0, v0);
          const dst1 = bilinear(u1, v0);
          const dst3 = bilinear(u0, v1);

          ctx.save();
          ctx.globalAlpha = opacity;
          ctx.translate(dst0.x, dst0.y);
          ctx.transform(
            dst1.x - dst0.x,
            dst1.y - dst0.y,
            dst3.x - dst0.x,
            dst3.y - dst0.y,
            0,
            0
          );
          ctx.drawImage(tiledSrc, sx, sy, sw, sh, 0, 0, 1, 1);
          ctx.restore();
        }
      }
    }

    points.forEach((p, i) => {
      const px = p.x * cw;
      const py = p.y * ch;
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    if (points.length < 4 && points.length > 0) {
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(points[0].x * cw, points[0].y * ch);
      points.slice(1).forEach((p) => ctx.lineTo(p.x * cw, p.y * ch));
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [photo, points, scale, opacity, bakedCanvas, tileWmm, tileHmm, groutWidthMm, mirrorH, mirrorV, pattern, dark]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "arcos-ai-visualizer-result.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const btnCls = dark
    ? "bg-white/10 hover:bg-white/20 text-white"
    : "bg-gray-100 hover:bg-gray-200 text-[#232323]";
  const btnPrimaryCls = dark
    ? "bg-white text-[#232323] hover:bg-white/90"
    : "bg-[#232323] text-white hover:bg-[#333]";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside
        className={`w-full lg:w-72 shrink-0 space-y-4 ${
          dark ? "text-white" : "text-[#232323]"
        }`}
      >
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="font-medium mb-2">AI Wall Demo</h3>
          <p className="text-sm opacity-80 mb-4">
            Uses AI to detect the back wall and applies your custom texture.
            Click &quot;Detect wall&quot; to run.
          </p>

          <button
            onClick={detectWallWithAI}
            disabled={detecting || !photo}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              detecting || !photo ? "opacity-50 cursor-not-allowed" : btnPrimaryCls
            }`}
          >
            {detecting ? "Detecting..." : "Detect wall with AI"}
          </button>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-1">Wall width (meters)</label>
          <input
            type="range"
            min={1}
            max={6}
            step={0.5}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-50 mt-1">{scale.toFixed(1)}m</div>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs opacity-70 block mb-1">Tile W (mm)</label>
            <input
              type="number"
              min={100}
              max={2000}
              step={50}
              value={tileWmm}
              onChange={(e) => setTileWmm(Number(e.target.value))}
              className={`w-full px-2 py-1 rounded border text-sm ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-[#232323]"}`}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs opacity-70 block mb-1">Tile H (mm)</label>
            <input
              type="number"
              min={100}
              max={2000}
              step={50}
              value={tileHmm}
              onChange={(e) => setTileHmm(Number(e.target.value))}
              className={`w-full px-2 py-1 rounded border text-sm ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-[#232323]"}`}
            />
          </div>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-1">Pattern</label>
          <select
            value={pattern.mode}
            onChange={(e) =>
              setPattern((p) => ({ ...p, mode: e.target.value as PatternSettings["mode"] }))
            }
            className={`w-full px-2 py-2 rounded border ${dark ? "bg-white/10 border-white/20 text-white" : "bg-white border-gray-200 text-[#232323]"}`}
          >
            <option value="stack">Stack</option>
            <option value="brick">Brick (50%)</option>
            <option value="rotate45">Rotate 45°</option>
            <option value="custom">Custom offset</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMirrorH((h) => !h)}
            className={`px-3 py-1.5 rounded text-sm ${mirrorH ? "bg-amber-500/30" : ""} ${btnCls}`}
          >
            Mirror H
          </button>
          <button
            onClick={() => setMirrorV((v) => !v)}
            className={`px-3 py-1.5 rounded text-sm ${mirrorV ? "bg-amber-500/30" : ""} ${btnCls}`}
          >
            Mirror V
          </button>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-1">Grout width (mm)</label>
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={groutWidthMm}
            onChange={(e) => setGroutWidthMm(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-xs opacity-50 mt-1">{groutWidthMm}mm</div>
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-1">Grout color</label>
          <input
            type="color"
            value={groutColor}
            onChange={(e) => setGroutColor(e.target.value)}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="text-xs opacity-70 block mb-1">Opacity</label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPoints([])}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${btnCls}`}
          >
            Reset
          </button>
          <button
            onClick={handleDownload}
            disabled={!photo || points.length < 4}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              photo && points.length >= 4 ? btnPrimaryCls : "opacity-50 cursor-not-allowed"
            }`}
          >
            Download
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 min-h-[400px] rounded-lg overflow-hidden border border-white/10">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
