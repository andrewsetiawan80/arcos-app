import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Product, ProductVariant } from "../../types";

export type WallCanvas2DProps = {
  widthMm: number;
  heightMm: number;
  product: Product | null;
  variant: ProductVariant | null;
  groutWidthMm?: number;
  groutColor?: string;
  brickOffset?: boolean;
  className?: string;
};

function getTextureUrl(p: Product): string | undefined {
  return p.textureUrl || p.coverImageUrl;
}

export default function WallCanvas2D({
  widthMm,
  heightMm,
  product,
  variant,
  groutWidthMm = 2,
  groutColor = "#888888",
  brickOffset = false,
  className = "",
}: WallCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoverTile, setHoverTile] = useState<{ row: number; col: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const tileImgRef = useRef<HTMLImageElement | null>(null);
  const [tileImgLoaded, setTileImgLoaded] = useState(false);

  const tileW = product?.size?.w_mm ?? 600;
  const tileH = product?.size?.h_mm ?? 600;
  const unit = tileW + groutWidthMm;
  const unitV = tileH + groutWidthMm;
  const cols = Math.ceil(widthMm / unit);
  const rows = Math.ceil(heightMm / unitV);
  const totalTiles = cols * rows;

  const imgUrl = product ? getTextureUrl(product) : undefined;

  useEffect(() => {
    if (!imgUrl) {
      setTileImgLoaded(false);
      tileImgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      tileImgRef.current = img;
      setTileImgLoaded(true);
    };
    img.onerror = () => {
      setTileImgLoaded(false);
      tileImgRef.current = null;
    };
    img.src = imgUrl;
  }, [imgUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const cw = rect.width;
    const ch = rect.height;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const totalW = cols * unit;
    const totalH = rows * unitV;
    const scaleToFit = Math.min(cw / totalW, ch / totalH);
    const scale = scaleToFit * zoom;
    const offsetX = (cw - totalW * scale) / 2 + pan.x;
    const offsetY = (ch - totalH * scale) / 2 + pan.y;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.fillStyle = groutColor;
    ctx.fillRect(0, 0, totalW, totalH);

    const img = tileImgRef.current;
    const tilePxW = tileW;
    const tilePxH = tileH;
    const groutPx = groutWidthMm;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = c * unit;
        let y = r * unitV;
        if (brickOffset && r % 2 === 1) {
          x += unit / 2;
        }
        const isHovered = hoverTile && hoverTile.row === r && hoverTile.col === c;

        if (img && tileImgLoaded) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + groutPx / 2, y + groutPx / 2, tilePxW, tilePxH);
          ctx.clip();
          ctx.drawImage(img, x + groutPx / 2, y + groutPx / 2, tilePxW, tilePxH);
          if (variant?.color) {
            ctx.fillStyle = variant.color;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(x + groutPx / 2, y + groutPx / 2, tilePxW, tilePxH);
            ctx.globalAlpha = 1;
          }
          ctx.restore();
        } else {
          ctx.fillStyle = product ? "#ddd" : "#bbb";
          ctx.fillRect(x + groutPx / 2, y + groutPx / 2, tilePxW, tilePxH);
        }

        if (isHovered) {
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 3 / scale;
          ctx.strokeRect(x + groutPx / 2, y + groutPx / 2, tilePxW, tilePxH);
        }
      }
    }

    ctx.restore();

    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#666";
    ctx.fillText(`${cols} × ${rows} = ${totalTiles} tiles`, 8, ch - 8);
  }, [
    widthMm,
    heightMm,
    product,
    variant,
    groutWidthMm,
    groutColor,
    brickOffset,
    cols,
    rows,
    totalTiles,
    zoom,
    pan,
    hoverTile,
    tileImgLoaded,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.max(0.25, Math.min(4, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const totalW = cols * unit;
    const totalH = rows * unitV;
    const scaleToFit = Math.min(rect.width / totalW, rect.height / totalH);
    const scale = scaleToFit * zoom;
    const offsetX = (rect.width - totalW * scale) / 2 + pan.x;
    const offsetY = (rect.height - totalH * scale) / 2 + pan.y;
    const worldX = (mx - offsetX) / scale;
    const worldY = (my - offsetY) / scale;
    if (worldX >= 0 && worldX < totalW && worldY >= 0 && worldY < totalH) {
      const r = Math.floor(worldY / unitV);
      let c = Math.floor(worldX / unit);
      if (brickOffset && r % 2 === 1) {
        const shiftedX = worldX - unit / 2;
        if (shiftedX < 0) {
          setHoverTile(null);
          return;
        }
        c = Math.floor(shiftedX / unit);
      }
      setHoverTile({ row: r, col: c });
    } else {
      setHoverTile(null);
    }
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => {
    setIsPanning(false);
    setHoverTile(null);
  };

  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
        className="w-full h-full block rounded-lg bg-gray-100"
      />
      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <button
          type="button"
          onClick={handleFit}
          className="px-2 py-1 text-xs rounded bg-white/90 shadow border border-gray-200 hover:bg-white"
        >
          Fit
        </button>
        <span className="text-xs text-gray-600 bg-white/90 px-2 py-1 rounded">
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
