import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { computeSegmentPositions } from "./visualizerUtils";
import type { WallSegment } from "./visualizerTypes";

export type PlanView2DProps = {
  segments: WallSegment[];
  defaultHeight: number;
  selectedSegmentId: string | null;
  onSegmentClick?: (id: string) => void;
  className?: string;
};

export default function PlanView2D({
  segments,
  defaultHeight,
  selectedSegmentId,
  onSegmentClick,
  className = "",
}: PlanView2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const positions = useMemo(
    () => computeSegmentPositions(segments, defaultHeight),
    [segments, defaultHeight]
  );

  const { scale, offset } = useMemo(() => {
    if (positions.length === 0) return { scale: 50, offset: [0, 0] as [number, number] };
    let minX = 0, maxX = 0, minZ = 0, maxZ = 0;
    for (const p of positions) {
      minX = Math.min(minX, p.pathStart[0], p.pathEnd[0]);
      maxX = Math.max(maxX, p.pathStart[0], p.pathEnd[0]);
      minZ = Math.min(minZ, p.pathStart[1], p.pathEnd[1]);
      maxZ = Math.max(maxZ, p.pathStart[1], p.pathEnd[1]);
    }
    const w = maxX - minX || 1;
    const h = maxZ - minZ || 1;
    const size = Math.max(w, h, 2);
    const s = 120 / size;
    const o: [number, number] = [-minX * s + 20, -minZ * s + 20];
    return { scale: s, offset: o };
  }, [positions]);

  const toCanvas = useCallback(
    (x: number, z: number) => [x * scale + offset[0], z * scale + offset[1]] as [number, number],
    [scale, offset]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 200, 120);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, 200, 120);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo((i / 10) * 200, 0);
      ctx.lineTo((i / 10) * 200, 120);
      ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i / 6) * 120);
      ctx.lineTo(200, (i / 6) * 120);
      ctx.stroke();
    }
    for (const p of positions) {
      const [x0, y0] = toCanvas(p.pathStart[0], p.pathStart[1]);
      const [x1, y1] = toCanvas(p.pathEnd[0], p.pathEnd[1]);
      ctx.strokeStyle = p.id === selectedSegmentId ? "#4ade80" : "#888";
      ctx.lineWidth = p.id === selectedSegmentId ? 4 : 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      const midX = (x0 + x1) / 2;
      const midY = (y0 + y1) / 2;
      ctx.fillStyle = "#fff";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${p.width.toFixed(1)}m`, midX, midY - 6);
      ctx.fillText(`${p.height.toFixed(1)}m`, midX, midY + 6);
    }
  }, [positions, selectedSegmentId, toCanvas]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!onSegmentClick) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      for (let i = positions.length - 1; i >= 0; i--) {
        const p = positions[i];
        const [x0, y0] = toCanvas(p.pathStart[0], p.pathStart[1]);
        const [x1, y1] = toCanvas(p.pathEnd[0], p.pathEnd[1]);
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const u = ((mx - x0) * dx + (my - y0) * dy) / (len * len);
        if (u >= 0 && u <= 1) {
          const px = x0 + u * dx;
          const py = y0 + u * dy;
          if (Math.hypot(mx - px, my - py) < 12) {
            onSegmentClick(p.id);
            return;
          }
        }
      }
    },
    [positions, toCanvas, onSegmentClick]
  );

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={120}
      className={`block rounded border ${className}`}
      onPointerDown={handlePointerDown}
      style={{ cursor: onSegmentClick ? "pointer" : "default" }}
    />
  );
}
