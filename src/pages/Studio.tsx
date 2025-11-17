import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Material, Recipe, RecipeLine, Unit } from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";
import NumberField from "../components/NumberField";

const now = () => new Date().toISOString();

function computeVolumeFromArea(area_m2?: number, thickness_mm?: number): number | undefined {
  if (area_m2 && thickness_mm !== undefined) {
    return area_m2 * (thickness_mm / 1000); // m² * m -> m³
  }
  return undefined;
}

function lineMassKg(
  line: RecipeLine,
  ratioMassPoolKg: number,
  ratioSum: number,
  matsById: Record<string, Material>
): number | undefined {
  const amt = line.amount ?? 0;
  const unit = line.unit as Unit;

  if (unit === "ratio") {
    if (ratioSum <= 0) return 0;
    return ratioMassPoolKg * (amt / ratioSum);
  }
  if (unit === "kg") return amt;
  if (unit === "g") return amt / 1000;

  // Volume units depend on density
  const mat = matsById[line.materialId];
  const rho = mat?.densityKgM3; // kg/m³
  if (!rho) {
    if (unit === "L" || unit === "mL") return undefined; // needs density
  }
  if (unit === "L") return rho! * 0.001 * amt;
  if (unit === "mL") return rho! * 1e-6 * amt;

  return undefined;
}

export default function Studio(){
  const [state, setState] = useState<AppState>(()=>load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const PROC_LIST = getProcesses(state);

  // Inputs
  const recipes = state.recipes || [];
  const [procKey, setProcKey] = useState<string>(()=> PROC_LIST[0]?.key || "");
  const recipesForProc = useMemo(()=> recipes.filter(r => r.process === procKey), [recipes, procKey]);
  const [recipeId, setRecipeId] = useState<string>(()=> recipesForProc[0]?.id || "");
  useEffect(()=>{ if (!recipesForProc.find(r=>r.id===recipeId)) setRecipeId(recipesForProc[0]?.id || ""); }, [procKey]); // keep selection valid

  const recipe = useMemo<Recipe|undefined>(()=> recipes.find(r => r.id===recipeId), [recipes, recipeId]);

  const [area_m2, setArea] = useState<number|undefined>();
  const [thickness_mm, setThickness] = useState<number|undefined>();
  const [volume_m3_input, setVolumeInput] = useState<number|undefined>();
  const [sparePct, setSparePct] = useState<number|undefined>(state.settings.defaultSparePct ?? 7);
  const [densityOverride, setDensityOverride] = useState<number|undefined>();
  const [batchSizeKg, setBatchSizeKg] = useState<number|undefined>(5);

  // No auto-save - only manual saves

  const materials = state.materials;
  const matsById = useMemo(()=>{
    const m: Record<string, Material> = {};
    materials.forEach(x => m[x.id] = x);
    return m;
  },[materials]);

  const autoVolume_m3 = computeVolumeFromArea(area_m2, thickness_mm);
  const baseVolume_m3 = volume_m3_input ?? autoVolume_m3;
  const spare = (sparePct ?? 0)/100;
  const totalVolume_m3 = baseVolume_m3 ? baseVolume_m3 * (1 + spare) : undefined;

  const densityUsed = densityOverride ?? recipe?.densityKgM3;
  const totalMassKg = (totalVolume_m3 && densityUsed) ? totalVolume_m3 * densityUsed : undefined;

  const calc = useMemo(()=>{
    if (!recipe || !totalMassKg || totalMassKg <= 0) return null;

    const ratioLines = recipe.lines.filter(l => l.unit === "ratio");
    const ratioSum = ratioLines.reduce((a,l)=> a + (l.amount || 0), 0);

    const absoluteKgSum = recipe.lines
      .filter(l => l.unit !== "ratio")
      .map(l => lineMassKg(l, 0, 0, matsById) || 0)
      .reduce((a,b)=>a+b, 0);

    const ratioPool = Math.max(0, totalMassKg - absoluteKgSum);

    const rows = recipe.lines.map(l => {
      const massKg = lineMassKg(l, ratioPool, ratioSum, matsById);
      const needsDensity = (l.unit === "L" || l.unit === "mL") && !matsById[l.materialId]?.densityKgM3;
      return {
        id: l.id,
        name: matsById[l.materialId]?.name || l.materialId,
        unit: l.unit,
        amount: l.amount,
        massKg,
        needsDensity,
      };
    });

    return {
      rows,
      ratioPool,
      absoluteKgSum,
    };
  }, [recipe, totalMassKg, matsById]);

  const batchesNeeded = useMemo(()=>{
    if (!totalMassKg || !batchSizeKg || batchSizeKg <= 0) return undefined;
    return Math.ceil(totalMassKg / batchSizeKg);
  }, [totalMassKg, batchSizeKg]);

  function setRecipeDensityFromOverride(){
    if (!recipe || densityOverride === undefined) return;
    const recipes = state.recipes || [];
    const idx = recipes.findIndex(r=>r.id===recipe.id);
    if (idx<0) return;
    const list = [...recipes];
    list[idx] = { ...list[idx], densityKgM3: densityOverride, updatedAt: now() };
    const next = { ...state, recipes: list };
    setState(next);
    setHasUnsavedChanges(true);
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Studio settings saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save studio settings. Please try again.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Mix Studio</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Mix Studio
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Plan concrete mixes by area or volume, apply spare ratios, and get detailed ingredient breakdowns and batch calculations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            <button 
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Settings
            </button>
          </div>
        </div>
      </header>

      {/* Process & Recipe */}
      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Process / Category</div>
            <select
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={procKey}
              onChange={e=>setProcKey(e.target.value)}
            >
              {PROC_LIST.map(p => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">Recipe</div>
                <select
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                  value={recipeId}
                  onChange={e=>setRecipeId(e.target.value)}
                >
                  {recipesForProc.length ? (
                    recipesForProc.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                  ) : (
                    <option value="">— No recipes for this process —</option>
                  )}
                </select>
              </div>
              <Link
                className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                to="/app/recipes"
                title="Manage recipes"
              >
                Manage
              </Link>
            </div>
            {recipe && (
              <div className="text-xs text-gray-500 mt-2">
                Selected: <span className="font-medium">{recipe.name}</span> • Process key: <span className="font-mono">{recipe.process}</span> ({getProcessLabel(state, recipe.process)})
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Targets */}
      <section className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Targets</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Area (m²)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={area_m2} onChange={setArea} step="0.01" />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Thickness (mm)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={thickness_mm} onChange={setThickness} />
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400 mb-1">Or direct volume (m³)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={volume_m3_input} onChange={setVolumeInput} step="0.001" />
              <div className="text-xs text-gray-500 mt-1">
                Auto volume from area/thickness: {autoVolume_m3 !== undefined ? autoVolume_m3.toFixed(3) : "—"} m³
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Spare (%)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={sparePct} onChange={setSparePct} step="1" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Density & Totals</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Recipe density (kg/m³)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={densityOverride ?? recipe?.densityKgM3}
                onChange={setDensityOverride}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  className="rounded-lg px-3 py-2 text-xs border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-40"
                  disabled={densityOverride === undefined || !recipe}
                  onClick={setRecipeDensityFromOverride}
                  title="Save this density into the recipe"
                >
                  Save to recipe
                </button>
                <button
                  className="rounded-lg px-3 py-2 text-xs border border-white/10 bg-black/20 hover:bg-white/10"
                  onClick={()=>setDensityOverride(undefined)}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Total volume (incl. spare)</div>
              <div className="text-xl font-semibold mt-1">
                {totalVolume_m3 !== undefined ? totalVolume_m3.toFixed(3) : "—"} m³
              </div>
              <div className="text-xs text-gray-400 mt-2">Total mass</div>
              <div className="text-xl font-semibold mt-1">
                {totalMassKg !== undefined ? totalMassKg.toFixed(1) : "—"} kg
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Batch size (kg)</div>
              <NumberField className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={batchSizeKg} onChange={setBatchSizeKg} step="0.1" />
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <div className="text-xs text-gray-400">Batches needed</div>
              <div className="text-2xl font-semibold mt-1">
                {batchesNeeded ?? "—"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ingredients */}
      <section className="rounded-2xl border border-white/10 overflow-x-auto">
        <div className="flex items-center justify-between p-4">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Ingredients breakdown</div>
          {recipe && (
            <div className="text-xs text-gray-400">
              Recipe: <span className="font-medium">{recipe.name}</span>
            </div>
          )}
        </div>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 border-b border-white/10">Material</th>
              <th className="py-3 px-4 border-b border-white/10">Unit</th>
              <th className="py-3 px-4 border-b border-white/10">Amount</th>
              <th className="py-3 px-4 border-b border-white/10">Mass (kg)</th>
            </tr>
          </thead>
          <tbody>
            {calc && calc.rows.map(r=>(
              <tr key={r.id} className="hover:bg-white/5">
                <td className="py-3 px-4 border-b border-white/5">
                  {r.name}
                  {r.needsDensity && (
                    <div className="text-xs text-amber-300 mt-1">Set material density to convert L/mL to kg.</div>
                  )}
                </td>
                <td className="py-3 px-4 border-b border-white/5">{r.unit}</td>
                <td className="py-3 px-4 border-b border-white/5">{r.amount}</td>
                <td className="py-3 px-4 border-b border-white/5">{r.massKg !== undefined ? r.massKg.toFixed(3) : "—"}</td>
              </tr>
            ))}
            {(!calc || !recipe) && (
              <tr>
                <td colSpan={4} className="py-6 px-4 text-gray-400">
                  Select a process & recipe, then enter area/thickness or volume and density to see the breakdown.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
