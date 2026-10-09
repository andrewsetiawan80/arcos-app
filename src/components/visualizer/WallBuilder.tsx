import React, { useState } from "react";
import type { Product, ProductVariant } from "../../types";
import WallCanvas2D from "./WallCanvas2D";
import RoomScene from "./RoomScene";
import ProductPicker from "./ProductPicker";
import PlanView2D from "./PlanView2D";
import {
  type WallSegment,
  type FloorConfig,
  type CeilingConfig,
  type WallPaintConfig,
  type TileFinish,
  createSegment,
  DEFAULT_WALL_PAINT,
  DEFAULT_CEILING_STYLE,
  TILE_FINISH_PBR,
} from "./visualizerTypes";
import { SHAPE_PRESETS, applyPreset } from "./shapePresets";
import { computeSegmentPositions } from "./visualizerUtils";

export type WallBuilderProps = {
  products: Product[];
  categories?: { id: string; name: string; slug: string }[];
  dark?: boolean;
};

const TILE_FINISHES: { id: TileFinish; label: string }[] = [
  { id: "matte", label: "Matte" },
  { id: "satin", label: "Satin" },
  { id: "gloss", label: "Gloss" },
  { id: "polished", label: "Polished" },
];

function getTileCount(
  widthMm: number,
  heightMm: number,
  tileW: number,
  tileH: number,
  groutW: number
): { cols: number; rows: number; total: number } {
  const unit = tileW + groutW;
  const unitV = tileH + groutW;
  const cols = Math.ceil(widthMm / unit);
  const rows = Math.ceil(heightMm / unitV);
  return { cols, rows, total: cols * rows };
}

export default function WallBuilder({ products, categories = [], dark = false }: WallBuilderProps) {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [segments, setSegments] = useState<WallSegment[]>(() =>
    applyPreset(SHAPE_PRESETS[1]).segments
  );
  const [floor, setFloor] = useState<FloorConfig>(() => ({
    enabled: true,
    material: { product: null, finish: "satin" },
  }));
  const [ceiling, setCeiling] = useState<CeilingConfig>(() => ({
    enabled: true,
    style: { ...DEFAULT_CEILING_STYLE },
  }));
  const [wallPaint, setWallPaint] = useState<WallPaintConfig>({ ...DEFAULT_WALL_PAINT });
  const [wallHeight, setWallHeight] = useState(2.7);
  const [groutWidthMm, setGroutWidthMm] = useState(2);
  const [groutColor, setGroutColor] = useState("#888888");
  const [mirrorH, setMirrorH] = useState(false);
  const [mirrorV, setMirrorV] = useState(false);
  const [brickOffset, setBrickOffset] = useState(false);
  const [selectedId, setSelectedId] = useState<string | "floor" | "ceiling">(
    segments[0]?.id ?? "floor"
  );

  const applyPresetToState = (preset: (typeof SHAPE_PRESETS)[0]) => {
    const { segments: s, floorEnabled, ceilingEnabled } = applyPreset(preset);
    setSegments(s);
    setFloor((f) => ({ ...f, enabled: floorEnabled }));
    setCeiling((c) => ({ ...c, enabled: ceilingEnabled }));
    setSelectedId(s[0]?.id ?? "floor");
  };

  const addSegment = (turn: 0 | 90 | -90) => {
    const last = segments[segments.length - 1];
    const newSeg = createSegment({
      length: last?.length ?? 2,
      height: last?.height ?? wallHeight,
      turn,
      material: { product: null, finish: "satin" },
    });
    setSegments((prev) => [...prev, newSeg]);
    setSelectedId(newSeg.id);
  };

  const removeSegment = (id: string) => {
    setSegments((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? "floor");
      return next;
    });
  };

  const updateSegment = (id: string, upd: Partial<WallSegment>) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...upd } : s))
    );
  };

  const assignProduct = (product: Product, variant: ProductVariant) => {
    if (selectedId === "floor") {
      setFloor((f) => ({
        ...f,
        material: { ...f.material, product: { product, variant } },
      }));
    } else if (selectedId === "ceiling") {
      // Ceiling has no tiles
    } else {
      const seg = segments.find((s) => s.id === selectedId);
      if (seg)
        updateSegment(selectedId, {
          material: { ...seg.material, product: { product, variant } },
        });
    }
  };

  const activeSegment = segments.find((s) => s.id === selectedId);
  const activeMaterial =
    selectedId === "floor"
      ? floor.material
      : selectedId === "ceiling"
        ? null
        : activeSegment?.material;

  const positions = computeSegmentPositions(segments, wallHeight);
  const selectedPos = positions.find((p) => p.id === selectedId);
  const dims = selectedPos
    ? { widthMm: selectedPos.width * 1000, heightMm: selectedPos.height * 1000 }
    : floor.enabled && selectedId === "floor"
      ? (() => {
          const poly = positions.reduce(
            (acc, p) => {
              acc.minX = Math.min(acc.minX, p.pathStart[0], p.pathEnd[0]);
              acc.maxX = Math.max(acc.maxX, p.pathStart[0], p.pathEnd[0]);
              acc.minZ = Math.min(acc.minZ, p.pathStart[1], p.pathEnd[1]);
              acc.maxZ = Math.max(acc.maxZ, p.pathStart[1], p.pathEnd[1]);
              return acc;
            },
            { minX: 0, maxX: 0, minZ: 0, maxZ: 0 }
          );
          return {
            widthMm: (poly.maxX - poly.minX) * 1000,
            heightMm: (poly.maxZ - poly.minZ) * 1000,
          };
        })()
      : { widthMm: 3000, heightMm: 3000 };

  const tileW = activeMaterial?.product?.product?.size?.w_mm ?? 600;
  const tileH = activeMaterial?.product?.product?.size?.h_mm ?? 600;
  const { cols, rows, total } = getTileCount(
    dims.widthMm,
    dims.heightMm,
    tileW,
    tileH,
    groutWidthMm
  );
  const areaM2 = (dims.widthMm / 1000) * (dims.heightMm / 1000);
  const priceEst =
    activeMaterial?.product?.product?.pricePerSqmIDR && areaM2 > 0
      ? Math.round(activeMaterial.product.product.pricePerSqmIDR * areaM2)
      : null;

  const theme = dark ? "dark" : "light";
  const inputCls =
    theme === "dark"
      ? "bg-white/10 border-white/20 text-white"
      : "bg-white border-gray-200 text-[#232323]";

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside
        className={`w-full lg:w-80 shrink-0 space-y-4 ${
          dark ? "text-white" : "text-[#232323]"
        }`}
      >
        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Shape presets
          </div>
          <div className="flex flex-wrap gap-2">
            {SHAPE_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPresetToState(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  dark
                    ? "bg-white/10 hover:bg-white/20 border border-white/10"
                    : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Room height (m)
          </div>
          <input
            type="number"
            min={0.5}
            max={8}
            step={0.1}
            value={wallHeight}
            onChange={(e) => setWallHeight(Number(e.target.value) || 2.7)}
            className={`w-full rounded-lg border px-2 py-1.5 text-sm ${inputCls}`}
          />
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Plan view
          </div>
          <PlanView2D
            segments={segments}
            defaultHeight={wallHeight}
            selectedSegmentId={selectedId !== "floor" && selectedId !== "ceiling" ? selectedId : null}
            onSegmentClick={(id) => setSelectedId(id)}
            className={dark ? "border-white/20" : ""}
          />
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Select surface
          </div>
          <div className="flex flex-wrap gap-2">
            {segments.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  selectedId === s.id
                    ? dark
                      ? "bg-white text-[#232323]"
                      : "bg-[#232323] text-white"
                    : dark
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Wall {segments.indexOf(s) + 1}
              </button>
            ))}
            {floor.enabled && (
              <button
                onClick={() => setSelectedId("floor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  selectedId === "floor"
                    ? dark
                      ? "bg-white text-[#232323]"
                      : "bg-[#232323] text-white"
                    : dark
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Floor
              </button>
            )}
            {ceiling.enabled && (
              <button
                onClick={() => setSelectedId("ceiling")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  selectedId === "ceiling"
                    ? dark
                      ? "bg-white text-[#232323]"
                      : "bg-[#232323] text-white"
                    : dark
                      ? "bg-white/10 hover:bg-white/20"
                      : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Ceiling
              </button>
            )}
          </div>
        </div>

        {selectedId !== "ceiling" && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
              {selectedId === "floor" ? "Floor" : "Wall"} tiles
            </div>
            <ProductPicker
              products={products}
              categories={categories}
              selectedProduct={activeMaterial?.product?.product ?? null}
              selectedVariant={activeMaterial?.product?.variant ?? null}
              onSelect={assignProduct}
              dark={dark}
            />
          </div>
        )}

        {selectedId !== "ceiling" && activeMaterial && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
              Tile finish
            </div>
            <div className="flex flex-wrap gap-2">
              {TILE_FINISHES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    if (selectedId === "floor")
                      setFloor((fl) => ({
                        ...fl,
                        material: { ...fl.material, finish: f.id },
                      }));
                    else if (activeSegment)
                      updateSegment(activeSegment.id, {
                        material: { ...activeSegment.material, finish: f.id },
                      });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    activeMaterial.finish === f.id
                      ? dark
                        ? "bg-white text-[#232323]"
                        : "bg-[#232323] text-white"
                      : dark
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedId === "ceiling" && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
              Ceiling color
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={ceiling.style.color}
                onChange={(e) =>
                  setCeiling((c) => ({
                    ...c,
                    style: { ...c.style, color: e.target.value },
                  }))
                }
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex-1">
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.05}
                  value={ceiling.style.roughness}
                  onChange={(e) =>
                    setCeiling((c) => ({
                      ...c,
                      style: {
                        ...c.style,
                        roughness: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full"
                />
                <div className="text-xs opacity-70">Roughness</div>
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Wall paint (untiled)
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={wallPaint.color}
              onChange={(e) =>
                setWallPaint((w) => ({ ...w, color: e.target.value }))
              }
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={floor.enabled}
              onChange={(e) =>
                setFloor((f) => ({ ...f, enabled: e.target.checked }))
              }
            />
            <span className="text-sm">Floor</span>
          </label>
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ceiling.enabled}
              onChange={(e) =>
                setCeiling((c) => ({ ...c, enabled: e.target.checked }))
              }
            />
            <span className="text-sm">Ceiling</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setMirrorH((h) => !h)}
            className={`px-3 py-1.5 rounded text-xs ${mirrorH ? "ring-2 ring-amber-400" : ""} ${dark ? "bg-white/10" : "bg-gray-100"}`}
          >
            Mirror H
          </button>
          <button
            onClick={() => setMirrorV((v) => !v)}
            className={`px-3 py-1.5 rounded text-xs ${mirrorV ? "ring-2 ring-amber-400" : ""} ${dark ? "bg-white/10" : "bg-gray-100"}`}
          >
            Mirror V
          </button>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Grout
          </div>
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={10}
                value={groutWidthMm}
                onChange={(e) => setGroutWidthMm(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs opacity-70">{groutWidthMm} mm</div>
            </div>
            <input
              type="color"
              value={groutColor}
              onChange={(e) => setGroutColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
            Segments
          </div>
          <div className="space-y-2">
            {segments.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2 rounded ${
                  selectedId === s.id
                    ? dark
                      ? "bg-white/20"
                      : "bg-gray-200"
                    : dark
                      ? "bg-white/5"
                      : "bg-gray-100"
                }`}
              >
                <span className="text-xs flex-1">
                  #{i + 1}: {s.length}m × {s.height}m
                </span>
                <button
                  onClick={() => setSelectedId(s.id)}
                  className="text-xs underline"
                >
                  Select
                </button>
                {segments.length > 1 && (
                  <button
                    onClick={() => removeSegment(s.id)}
                    className="text-xs text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => addSegment(0)}
                className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-white/10"
              >
                + Straight
              </button>
              <button
                onClick={() => addSegment(90)}
                className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-white/10"
              >
                + Turn L
              </button>
              <button
                onClick={() => addSegment(-90)}
                className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-white/10"
              >
                + Turn R
              </button>
            </div>
          </div>
        </div>

        {activeSegment && (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
              Segment dimensions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs opacity-70 block mb-1">Length (m)</label>
                <input
                  type="number"
                  min={0.3}
                  max={20}
                  step={0.1}
                  value={activeSegment.length}
                  onChange={(e) =>
                    updateSegment(activeSegment.id, {
                      length: Number(e.target.value) || 1,
                    })
                  }
                  className={`w-full rounded border px-2 py-1.5 text-sm ${inputCls}`}
                />
              </div>
              <div>
                <label className="text-xs opacity-70 block mb-1">Height (m)</label>
                <input
                  type="number"
                  min={0.3}
                  max={8}
                  step={0.1}
                  value={activeSegment.height}
                  onChange={(e) =>
                    updateSegment(activeSegment.id, {
                      height: Number(e.target.value) || 2.7,
                    })
                  }
                  className={`w-full rounded border px-2 py-1.5 text-sm ${inputCls}`}
                />
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode("2d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === "2d"
                ? dark
                  ? "bg-white text-[#232323]"
                  : "bg-[#232323] text-white"
                : dark
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            2D Front View
          </button>
          <button
            onClick={() => setViewMode("3d")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              viewMode === "3d"
                ? dark
                  ? "bg-white text-[#232323]"
                  : "bg-[#232323] text-white"
                : dark
                  ? "bg-white/10 hover:bg-white/20"
                  : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            3D Room View
          </button>
        </div>

        <div className="flex-1 min-h-[400px]">
          {viewMode === "2d" ? (
            <WallCanvas2D
              widthMm={dims.widthMm}
              heightMm={dims.heightMm}
              product={activeMaterial?.product?.product ?? null}
              variant={activeMaterial?.product?.variant ?? null}
              groutWidthMm={groutWidthMm}
              groutColor={groutColor}
              brickOffset={brickOffset}
              className="h-full min-h-[400px]"
            />
          ) : (
            <RoomScene
              segments={segments}
              floor={floor}
              ceiling={ceiling}
              wallPaint={wallPaint}
              wallHeight={wallHeight}
              groutWidthMm={groutWidthMm}
              groutColor={groutColor}
              mirrorH={mirrorH}
              mirrorV={mirrorV}
              selectedSegmentId={selectedId}
              onSegmentClick={setSelectedId}
            />
          )}
        </div>

        <div
          className={`mt-3 flex flex-wrap gap-4 text-sm ${
            dark ? "text-white/80" : "text-gray-600"
          }`}
        >
          <span>
            {cols} × {rows} = {total} tiles
          </span>
          <span>{areaM2.toFixed(2)} m²</span>
          {activeMaterial?.product && (
            <span>
              Tile: {tileW} × {tileH} mm
            </span>
          )}
          {priceEst != null && <span>Est. IDR {priceEst.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
}
