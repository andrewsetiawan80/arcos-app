// src/pages/ProductionPlanner.tsx
import React, { useMemo, useState, useEffect } from "react";
import { load } from "../store";
import type {
  AppState,
  Material,
  Product,
  ProductVariant,
  Recipe,
  RecipeLine,
  Unit,
} from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";
import NumberField from "../components/NumberField";

function mm2ToM2(w_mm?: number, h_mm?: number): number | undefined {
  if (!w_mm || !h_mm) return undefined;
  return (w_mm / 1000) * (h_mm / 1000);
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

  const mat = matsById[line.materialId];
  const rho = mat?.densityKgM3;

  if (unit === "L") { if (!rho) return undefined; return rho * 0.001 * amt; }
  if (unit === "mL") { if (!rho) return undefined; return rho * 1e-6 * amt; }
  return undefined;
}

function fmt(n?: number, digits = 3) {
  if (n === undefined) return "—";
  return Number(n).toFixed(digits);
}
function todayISO() {
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ProductionPlanner() {
  // ---- Live state (reloadable) ----
  const [state, setState] = useState<AppState>(() => load());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cw_app_state") setState(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const reloadState = () => setState(load());

  const PROCESSES = getProcesses(state);

  const matsById = useMemo(() => {
    const m: Record<string, Material> = {};
    state.materials.forEach((x) => (m[x.id] = x));
    return m;
  }, [state.materials]);

  // ------- Product & Variant -------
  const [productId, setProductId] = useState<string>(state.products[0]?.id ?? "");
  const product: Product | undefined = state.products.find((p) => p.id === productId);
  const variants: ProductVariant[] = product?.variants ?? [];

  const [variantId, setVariantId] = useState<string>(variants[0]?.id ?? "");
  const variant: ProductVariant | undefined = variants.find((v) => v.id === variantId);

  // Initialize/repair selection when products change
  useEffect(() => {
    if (!state.products.length) { setProductId(""); return; }
    if (!productId || !state.products.find(p => p.id === productId)) {
      setProductId(state.products[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.products.length]);

  // Initialize/repair variant when product changes
  useEffect(() => {
    const vs = product?.variants ?? [];
    if (!vs.length) { setVariantId(""); return; }
    if (!variantId || !vs.find(v => v.id === variantId)) {
      setVariantId(vs[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, product?.variants?.length]);

  // ------- Availability & defaults (cascade: variant → product) -------
  const variantMap = (variant?.recipeByProcess || {}) as Record<string, string | undefined>;
  const productMap = (product?.recipeByProcess || {}) as Record<string, string | undefined>;

  const variantEnabled = Object.keys(variantMap).filter((k) => !!variantMap[k]);
  const productEnabled = Object.keys(productMap).filter((k) => !!productMap[k]);
  const usingVariant = variantEnabled.length > 0;
  const effectiveMap: Record<string, string | undefined> = usingVariant ? variantMap : productMap;

  const availableProcessKeys = useMemo(
    () => new Set(Object.keys(effectiveMap).filter((k) => !!effectiveMap[k])),
    [effectiveMap]
  );

  const firstEnabledProcKey = useMemo(() => {
    for (const p of PROCESSES) if (availableProcessKeys.has(p.key)) return p.key;
    return "";
  }, [PROCESSES, availableProcessKeys]);

  const [procKey, setProcKey] = useState<string>(firstEnabledProcKey || PROCESSES[0]?.key || "");
  // force valid process on product/variant switch
  useEffect(() => {
    if (!availableProcessKeys.size) return;
    if (!procKey || !availableProcessKeys.has(procKey)) setProcKey(firstEnabledProcKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, variantId, availableProcessKeys, firstEnabledProcKey]);

  // ------- Recipes for selected process (with cascade default) -------
  const recipeCandidates = useMemo(
    () => state.recipes.filter((r) => r.process === procKey),
    [state.recipes, procKey]
  );

  const assignedRecipeId =
    (variant?.recipeByProcess?.[procKey] as string) ||
    (product?.recipeByProcess?.[procKey] as string) ||
    "";

  const [recipeId, setRecipeId] = useState<string>(assignedRecipeId || recipeCandidates[0]?.id || "");
  const recipe: Recipe | undefined = state.recipes.find((r) => r.id === recipeId);

  useEffect(() => {
    const assigned =
      (variant?.recipeByProcess?.[procKey] as string) ||
      (product?.recipeByProcess?.[procKey] as string) ||
      "";
    const first = recipeCandidates[0]?.id || "";
    const next = assigned || first || "";
    if (next && next !== recipeId) setRecipeId(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, variantId, procKey, recipeCandidates.length]);

  // ------- Targets -------
  const [mode, setMode] = useState<"tiles" | "area">("tiles");
  const [tileCount, setTileCount] = useState<number | undefined>();
  const [targetArea_m2, setTargetAreaM2] = useState<number | undefined>();
  const [sparePct, setSparePct] = useState<number | undefined>(state.settings.defaultSparePct ?? 7);

  const productTileArea_m2 =
    product?.tileArea_m2 ?? mm2ToM2(product?.size?.w_mm, product?.size?.h_mm);
  const [tileAreaOverride_m2, setTileAreaOverride] = useState<number | undefined>();
  const tileArea_m2 = tileAreaOverride_m2 ?? productTileArea_m2;

  // Per-tile mass (no thickness influence)
  const [kgPerTileOverride, setKgPerTileOverride] = useState<number | undefined>();
  const perTileMassKg = useMemo(() => {
    if (kgPerTileOverride) return kgPerTileOverride;
    const variantPerTile = (variant as any)?.perTileKg as number | undefined;
    const productPerTile = (product as any)?.perTileKg as number | undefined;
    return variantPerTile ?? productPerTile ?? undefined;
  }, [kgPerTileOverride, variant, product]);

  // Density only for converting L/mL recipe lines
  const [densityOverride, setDensityOverride] = useState<number | undefined>();
  const densityUsed = densityOverride ?? recipe?.densityKgM3;

  // Batch planning
  const [batchSizeKg, setBatchSizeKg] = useState<number | undefined>(5);
  const [produceMode, setProduceMode] = useState<"all" | "batch">("batch");

  // Derived
  const tilesNeeded = useMemo(() => {
    const spare = 1 + (sparePct ?? 0) / 100;
    if (mode === "tiles") {
      if (!tileCount) return undefined;
      return Math.ceil(tileCount * spare);
    }
    if (!tileArea_m2 || !targetArea_m2) return undefined;
    const base = targetArea_m2 / tileArea_m2;
    return Math.ceil(base * spare);
  }, [mode, tileCount, tileArea_m2, targetArea_m2, sparePct]);

  const totalMassKg = useMemo(() => {
    if (!tilesNeeded || !perTileMassKg) return undefined;
    return tilesNeeded * perTileMassKg;
  }, [tilesNeeded, perTileMassKg]);

  const lineTotals = useMemo(() => {
    if (!recipe || !totalMassKg || totalMassKg <= 0) return null;

    const ratioLines = recipe.lines.filter((l) => l.unit === "ratio");
    const ratioSum = ratioLines.reduce((a, l) => a + (l.amount || 0), 0);

    const absoluteKgSum = recipe.lines
      .filter((l) => l.unit !== "ratio")
      .map((l) => lineMassKg(l, 0, 0, matsById) || 0)
      .reduce((a, b) => a + b, 0);

    const ratioPool = Math.max(0, totalMassKg - absoluteKgSum);

    const rows = recipe.lines.map((l) => {
      const massKg = lineMassKg(l, ratioPool, ratioSum, matsById);
      const needsDensity =
        (l.unit === "L" || l.unit === "mL") && !matsById[l.materialId]?.densityKgM3;
      return {
        id: l.id,
        name: matsById[l.materialId]?.name || l.materialId,
        unit: l.unit,
        amount: l.amount,
        totalKg: massKg,
        needsDensity,
      };
    });

    return { rows, ratioPool, absoluteKgSum };
  }, [recipe, totalMassKg, matsById]);

  const perBatch = useMemo(() => {
    if (!lineTotals || !batchSizeKg || !totalMassKg || totalMassKg <= 0) return null;
    const batches = Math.ceil(totalMassKg / batchSizeKg);
    const scale = batchSizeKg / totalMassKg;

    const rows = lineTotals.rows.map((r) => ({
      id: r.id,
      name: r.name,
      perBatchKg: r.totalKg !== undefined ? r.totalKg * scale : undefined,
      totalKg: r.totalKg,
      unit: r.unit,
      amount: r.amount,
      needsDensity: r.needsDensity,
    }));

    return { batches, rows, scale };
  }, [lineTotals, batchSizeKg, totalMassKg]);

  function handlePrint() { window.print(); }

  // ---- Empty state if no products yet ----
  if (!state.products.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-semibold tracking-wide">Production Planner</h1>
          <button
            onClick={reloadState}
            className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow"
          >
            Reload data
          </button>
        </div>
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 text-gray-300">
          No products found. Go to <span className="font-semibold">Catalog Admin</span> to add products & variants,
          assign processes/recipes, then return here (or click Reload after saving).
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative print:hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Production Planning</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Production Planner
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Plan concrete production runs with material calculations, batch sizing, and cost analysis.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button
              onClick={reloadState}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Data
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-40"
              disabled={!recipe || !lineTotals || (produceMode === "batch" && !perBatch)}
              title="Print a clean recipe sheet"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Sheet
            </button>
          </div>
        </div>
      </header>

      {/* Selection */}
      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-4 print:hidden">
        {/* Product Selection Grid */}
        <div className="space-y-4">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Product Selection</div>
          <div className="text-sm text-gray-300">Choose a product:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.products.map(p => (
              <button
                key={p.id}
                className={`p-4 rounded-xl border transition-all duration-300 text-left hover:scale-[1.02] ${
                  productId === p.id 
                    ? 'border-blue-400 bg-blue-400/10 shadow-lg ring-2 ring-blue-400/20' 
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
                onClick={() => setProductId(p.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white truncate">{p.title}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {p.size && `${p.size.w_mm}×${p.size.h_mm}×${p.size.t_mm}mm`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {p.variants?.length || 0} variant{(p.variants?.length || 0) !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Variant Selection */}
        {product && variants.length > 0 && (
          <div className="space-y-4">
            <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Variant Selection</div>
            <div className="text-sm text-gray-300">Choose a variant:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {variants.map(v => (
                <button
                  key={v.id}
                  className={`p-3 rounded-lg border transition-all duration-300 text-left hover:scale-[1.01] ${
                    variantId === v.id 
                      ? 'border-blue-400 bg-blue-400/10 ring-2 ring-blue-400/20' 
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => setVariantId(v.id)}
                >
                  <div className="font-medium text-white">{v.name}</div>
                  {v.color && (
                    <div className="text-xs text-gray-400 mt-1">
                      Color: {v.color}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">

          <div>
            <div className="text-xs text-gray-400 mb-1">Process / Category</div>
            <select
              key={productId + ":" + variantId}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={availableProcessKeys.has(procKey) ? procKey : firstEnabledProcKey}
              onChange={(e) => {
                const next = e.target.value;
                if (!availableProcessKeys.has(next)) return;
                setProcKey(next);
              }}
            >
              {PROCESSES.map((p) => {
                const enabled = availableProcessKeys.has(p.key);
                return (
                  <option key={p.key} value={p.key} disabled={!enabled} className={!enabled ? "text-gray-500" : ""}>
                    {getProcessLabel(state, p.key)} {enabled ? "" : " (unavailable for this product)"}
                  </option>
                );
              })}
            </select>
            {!availableProcessKeys.size && (
              <div className="text-xs text-amber-300 mt-1">
                This product/variant has no predefined processes. Assign recipes in the Product editor.
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Using <span className="font-medium">{usingVariant ? "variant" : "product"}</span> process map.
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Recipe</div>
            <select
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={recipeId || ""}
              onChange={(e) => setRecipeId(e.target.value || "")}
            >
              {recipeCandidates.length ? (
                recipeCandidates.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))
              ) : (
                <option value="">— No recipes —</option>
              )}
            </select>
            {assignedRecipeId && recipeId !== assignedRecipeId && (
              <div className="text-xs text-gray-500 mt-1">
                Default assigned: <span className="font-medium">{assignedRecipeId}</span>
              </div>
            )}
          </div>
        </div>

        {recipe && (
          <div className="text-xs text-gray-500">
            Selected: <span className="font-medium">{recipe.name}</span> • Process key:{" "}
            <span className="font-mono">{recipe.process}</span> ({getProcessLabel(state, recipe.process)})
          </div>
        )}
      </section>

      {/* Tile & targets */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3 print:hidden">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Tile & Target</div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Tile area override (m²)</div>
            <NumberField
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={tileAreaOverride_m2}
              onChange={setTileAreaOverride}
              step="0.0001"
            />
            <div className="text-xs text-gray-500 mt-1">
              From product: {productTileArea_m2 !== undefined ? productTileArea_m2.toFixed(4) : "—"} m²
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Mass per tile (kg)</div>
            <NumberField
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={kgPerTileOverride}
              onChange={setKgPerTileOverride}
              step="0.01"
            />
            <div className="text-xs text-gray-500 mt-1">
              If unset, uses product/variant’s stored per-tile mass (if any).
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-400 mb-1">Mode</div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === "tiles"} onChange={() => setMode("tiles")} />
                Tiles
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" checked={mode === "area"} onChange={() => setMode("area")} />
                Area (m²)
              </label>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {mode === "tiles" ? (
            <div>
              <div className="text-xs text-gray-400 mb-1">Tile count</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={tileCount}
                onChange={setTileCount}
                step="1"
              />
            </div>
          ) : (
            <div>
              <div className="text-xs text-gray-400 mb-1">Target area (m²)</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={targetArea_m2}
                onChange={setTargetAreaM2}
                step="0.01"
              />
            </div>
          )}

          <div>
            <div className="text-xs text-gray-400 mb-1">Spare (%)</div>
            <NumberField
              className="w-40 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={sparePct}
              onChange={setSparePct}
              step="1"
            />
          </div>

          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-gray-400">Tiles needed (incl. spare)</div>
            <div className="text-xl font-semibold mt-1">{tilesNeeded ?? "—"}</div>
            <div className="text-xs text-gray-500 mt-1">
              Tile area used: {tileArea_m2 !== undefined ? tileArea_m2.toFixed(4) : "—"} m²
            </div>
          </div>
        </div>
      </section>

      {/* Totals & batches */}
      <section className="grid md:grid-cols-2 gap-4 print:hidden">
        <div className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Totals</div>
          <div className="rounded-lg border border-white/10 p-3">
            <div className="text-xs text-gray-400">Total mass</div>
            <div className="text-xl font-semibold mt-1">
              {totalMassKg !== undefined ? totalMassKg.toFixed(1) : "—"} kg
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per tile: {perTileMassKg !== undefined ? perTileMassKg.toFixed(2) : "—"} kg
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Batches & density</div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Recipe density (kg/m³)</div>
            <NumberField
              className="w-60 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={densityOverride ?? recipe?.densityKgM3}
              onChange={setDensityOverride}
            />
            <div className="text-xs text-gray-500 mt-1">Used only for converting L/mL recipe lines to kg.</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Batch size (kg)</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={batchSizeKg}
                onChange={setBatchSizeKg}
                step="0.1"
              />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="produce"
                  checked={produceMode === "batch"}
                  onChange={() => setProduceMode("batch")}
                />
                Plan by batch
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="produce"
                  checked={produceMode === "all"}
                  onChange={() => setProduceMode("all")}
                />
                All at once
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Calculation Preview */}
      {recipe && !lineTotals && (
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4 print:hidden">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Calculation Preview</div>
          <div className="text-sm text-gray-300">
            <p className="mb-2">To see the production plan, please set your targets above:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Set tile count or target area</li>
              <li>Adjust spare percentage if needed</li>
              <li>The system will calculate total mass and material requirements</li>
            </ul>
          </div>
          {!tilesNeeded && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <div className="text-sm text-amber-300">
                <strong>Next step:</strong> Set tile count or target area to see calculations
              </div>
            </div>
          )}
        </section>
      )}

      {/* Production Summary */}
      {recipe && totalMassKg && totalMassKg > 0 && (
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4 print:hidden">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Production Summary</div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-xs text-gray-400">Total Tiles</div>
              <div className="text-2xl font-bold text-white mt-1">{tilesNeeded ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">Including {sparePct}% spare</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-xs text-gray-400">Total Mass</div>
              <div className="text-2xl font-bold text-white mt-1">{fmt(totalMassKg, 1)} kg</div>
              <div className="text-xs text-gray-500 mt-1">Total concrete needed</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-xs text-gray-400">Per Tile Mass</div>
              <div className="text-2xl font-bold text-white mt-1">{fmt(perTileMassKg, 2)} kg</div>
              <div className="text-xs text-gray-500 mt-1">Mass per individual tile</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-xs text-gray-400">Total Area</div>
              <div className="text-2xl font-bold text-white mt-1">{fmt(tileArea_m2 && tilesNeeded ? tileArea_m2 * tilesNeeded : undefined, 2)} m²</div>
              <div className="text-xs text-gray-500 mt-1">Total coverage area</div>
            </div>
          </div>
        </section>
      )}

      {/* Materials summary */}
      {recipe && lineTotals ? (
        <>
          {produceMode === "batch" && batchSizeKg && totalMassKg && totalMassKg > 0 ? (
            (() => {
              const batches = Math.ceil(totalMassKg / (batchSizeKg as number));
              const scale = (batchSizeKg as number) / (totalMassKg as number);
              const rows = lineTotals.rows.map((r) => ({
                ...r,
                perBatchKg: r.totalKg !== undefined ? r.totalKg * scale : undefined,
              }));
              return (
                <section className="rounded-2xl border border-white/10 overflow-x-auto print:hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
                      Per-batch materials
                    </div>
                    <div className="text-xs text-gray-400">
                      Batches: <span className="font-semibold">{batches}</span>
                    </div>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 border-b border-white/10">Material</th>
                        <th className="py-3 px-4 border-b border-white/10">Per batch (kg)</th>
                        <th className="py-3 px-4 border-b border-white/10">Total (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.id} className="hover:bg-white/5">
                          <td className="py-3 px-4 border-b border-white/5">
                            {r.name}
                            {r.needsDensity && (
                              <div className="text-xs text-amber-300 mt-1">
                                Set density to convert L/mL → kg.
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 border-b border-white/5">{fmt(r.perBatchKg)}</td>
                          <td className="py-3 px-4 border-b border-white/5">{fmt(r.totalKg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              );
            })()
          ) : (
            <section className="rounded-2xl border border-white/10 overflow-x-auto print:hidden">
              <div className="flex items-center justify-between p-4">
                <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
                  All-at-once materials
                </div>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-3 px-4 border-b border-white/10">Material</th>
                    <th className="py-3 px-4 border-b border-white/10">Total (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  {lineTotals.rows.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-3 px-4 border-b border-white/5">
                        {r.name}
                        {r.needsDensity && (
                          <div className="text-xs text-amber-300 mt-1">
                            Set density to convert L/mL → kg.
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 border-b border-white/5">{fmt(r.totalKg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      ) : (
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 text-gray-400 print:hidden">
          Select product/variant (with predefined process) + recipe, then set targets to see the plan.
        </section>
      )}

      {/* ---------- Printable sheet ---------- */}
      {recipe && lineTotals && (
        <section className="hidden print:block bg-white text-black p-8 rounded-none">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-semibold">Cretewerkz — Production Recipe Sheet</div>
              <div className="text-sm mt-1">Date: {todayISO()}</div>
            </div>
            <div className="text-right text-sm">
              <div><strong>Product:</strong> {product?.title || "—"}</div>
              <div><strong>Variant:</strong> {variant?.name || "—"}</div>
              <div>
                <strong>Process:</strong> {getProcessLabel(state, recipe.process)} ({recipe.process})
              </div>
              <div><strong>Recipe:</strong> {recipe.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6 text-sm">
            <div className="border border-black/20 rounded p-3">
              <div><strong>Mode:</strong> {mode === "tiles" ? "Tiles" : "Area"}</div>
              <div><strong>Tiles needed (incl. spare):</strong> {tilesNeeded ?? "—"}</div>
              <div><strong>Spare:</strong> {(sparePct ?? 0)}%</div>
              <div>
                <strong>Tile area used:</strong> {tileArea_m2 !== undefined ? tileArea_m2.toFixed(4) : "—"} m²
              </div>
              <div><strong>Mass per tile (kg):</strong> {perTileMassKg !== undefined ? perTileMassKg.toFixed(2) : "—"}</div>
              <div><strong>Total mass (kg):</strong> {totalMassKg !== undefined ? totalMassKg.toFixed(1) : "—"}</div>
            </div>
            <div className="border border-black/20 rounded p-3">
              <div><strong>Density (kg/m³):</strong> {densityUsed ?? "—"}</div>
              <div><strong>Batch size (kg):</strong> {batchSizeKg ?? "—"}</div>
              <div><strong>Mode:</strong> {produceMode === "batch" ? "Plan by batch" : "All at once"}</div>
              {produceMode === "batch" && batchSizeKg && totalMassKg && (
                <div><strong>Batches:</strong> {Math.ceil(totalMassKg / (batchSizeKg as number))}</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-base font-semibold mb-2">Materials — Totals</div>
            <table className="w-full text-sm border border-black/20">
              <thead className="bg-black/5">
                <tr>
                  <th className="text-left p-2 border-b border-black/20">Material</th>
                  <th className="text-left p-2 border-b border-black/20">Total (kg)</th>
                  <th className="text-left p-2 border-b border-black/20">Notes</th>
                </tr>
              </thead>
              <tbody>
                {lineTotals.rows.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="p-2 border-b border-black/10">{r.name}</td>
                    <td className="p-2 border-b border-black/10">{fmt(r.totalKg)}</td>
                    <td className="p-2 border-b border-black/10">
                      {r.needsDensity ? "Set density for volume → kg conversion." : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {produceMode === "batch" && batchSizeKg && totalMassKg && (
            <div className="mt-6">
              <div className="text-base font-semibold mb-2">
                Materials — Per Batch (x{Math.ceil(totalMassKg / (batchSizeKg as number))})
              </div>
              <table className="w-full text-sm border border-black/20">
                <thead className="bg-black/5">
                  <tr>
                    <th className="text-left p-2 border-b border-black/20">Material</th>
                    <th className="text-left p-2 border-b border-black/20">Per batch (kg)</th>
                    <th className="text-left p-2 border-b border-black/20">Total (kg)</th>
                    <th className="text-left p-2 border-b border-black/20">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {lineTotals.rows.map((r) => {
                    const perBatchKg =
                      r.totalKg !== undefined && totalMassKg > 0
                        ? (r.totalKg * (batchSizeKg as number)) / (totalMassKg as number)
                        : undefined;
                    return (
                      <tr key={r.id} className="align-top">
                        <td className="p-2 border-b border-black/10">{r.name}</td>
                        <td className="p-2 border-b border-black/10">{fmt(perBatchKg)}</td>
                        <td className="p-2 border-b border-black/10">{fmt(r.totalKg)}</td>
                        <td className="p-2 border-b border-black/10">
                          {r.needsDensity ? "Set density for volume → kg conversion." : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 text-xs text-black/70">
            Generated on {new Date().toLocaleString()} • Cretewerkz Mix Planner
          </div>
        </section>
      )}
    </div>
  );
}
