import React, { useMemo, useState } from "react";
import { load } from "../store";
import type { AppState, Recipe } from "../types";
import NumberField from "../components/NumberField";

export default function TilePlanner() {
  const [state] = useState<AppState>(() => load());

  const [tileWidthMm, setTileWidthMm] = useState<number | undefined>();
  const [tileHeightMm, setTileHeightMm] = useState<number | undefined>();
  const [tileAreaInput, setTileAreaInput] = useState<number | undefined>();
  const [tileAreaUnit, setTileAreaUnit] = useState<"cm2" | "m2">("cm2");

  const [tileCount, setTileCount] = useState<number | undefined>();
  const [targetAreaM2, setTargetAreaM2] = useState<number | undefined>();
  const [sparePct, setSparePct] = useState<number | undefined>(7);

  const [recipeId, setRecipeId] = useState<string>(state.recipes[0]?.id || "");
  const recipe: Recipe | undefined = state.recipes.find(r => r.id === recipeId);

  // Tile area
  const tileAreaM2 = useMemo(() => {
    if (tileWidthMm && tileHeightMm) {
      return (tileWidthMm / 1000) * (tileHeightMm / 1000);
    }
    if (tileAreaInput) {
      if (tileAreaUnit === "cm2") return tileAreaInput / 10000;
      if (tileAreaUnit === "m2") return tileAreaInput;
    }
    return undefined;
  }, [tileWidthMm, tileHeightMm, tileAreaInput, tileAreaUnit]);

  // Needed tile count
  const neededTileCount = useMemo(() => {
    if (!tileAreaM2) return undefined;
    let baseTiles: number | undefined;
    if (targetAreaM2) {
      baseTiles = targetAreaM2 / tileAreaM2;
    } else if (tileCount) {
      baseTiles = tileCount;
    }
    if (baseTiles === undefined) return undefined;
    return Math.ceil(baseTiles * (1 + (sparePct ?? 0) / 100));
  }, [tileAreaM2, targetAreaM2, tileCount, sparePct]);

  // Total mass if recipe has density
  const totalMassKg = useMemo(() => {
    if (!tileAreaM2 || !neededTileCount || !recipe?.densityKgM3) return undefined;
    const totalArea = neededTileCount * tileAreaM2;
    return totalArea * recipe.densityKgM3 * 0.01; // assume avg 1cm thickness
  }, [tileAreaM2, neededTileCount, recipe]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-wide">Tile Planner</h1>
      <div className="text-sm text-gray-400">
        Plan production by tiles or wall/floor area. Includes spare %.
      </div>

      {/* Recipe */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className="text-xs text-gray-400">Recipe</div>
        <select
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
          value={recipeId}
          onChange={e => setRecipeId(e.target.value)}
        >
          {state.recipes.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </section>

      {/* Tile info */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Tile size</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Width (mm)</div>
            <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileWidthMm} onChange={setTileWidthMm} step="1" />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Height (mm)</div>
            <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileHeightMm} onChange={setTileHeightMm} step="1" />
          </div>
        </div>

        <div className="text-xs text-gray-400 my-2 text-center">— OR —</div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Tile area</div>
            <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileAreaInput} onChange={setTileAreaInput} step="0.01" />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Unit</div>
            <select
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileAreaUnit}
              onChange={e=>setTileAreaUnit(e.target.value as any)}
            >
              <option value="cm2">cm²</option>
              <option value="m2">m²</option>
            </select>
          </div>
        </div>
      </section>

      {/* Production target */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Target</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Tiles (pcs)</div>
            <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileCount} onChange={setTileCount} step="1" />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Or Area (m²)</div>
            <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={targetAreaM2} onChange={setTargetAreaM2} step="0.01" />
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">Spare (%)</div>
          <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
            value={sparePct} onChange={setSparePct} step="1" />
        </div>
      </section>

      {/* Results */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className="text-xs text-gray-400">Tile area</div>
        <div className="text-lg font-semibold">{tileAreaM2?.toFixed(4) ?? "—"} m²</div>

        <div className="text-xs text-gray-400">Tiles needed (incl. spare)</div>
        <div className="text-lg font-semibold">{neededTileCount ?? "—"}</div>

        <div className="text-xs text-gray-400">Estimated total mass</div>
        <div className="text-lg font-semibold">{totalMassKg ? totalMassKg.toFixed(1) + " kg" : "—"}</div>
      </section>
    </div>
  );
}
