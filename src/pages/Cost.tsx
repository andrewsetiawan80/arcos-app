import React from "react";
import { load } from "../store";
import type { AppState, Material, Recipe, RecipeLine, Unit } from "../types";
import NumberField from "../components/NumberField";
import { getFx, fetchFx, idrFrom, setManualFx, type FxBundle } from "../lib/fx";

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
  if (n === undefined || Number.isNaN(n)) return "—";
  return Number(n).toFixed(digits);
}

export default function Cost() {
  const [state] = React.useState<AppState>(() => load());

  // FX state
  const [fx, setFx] = React.useState<FxBundle | null>(null);
  const [fxErr, setFxErr] = React.useState<string | null>(null);
  const [loadingFx, setLoadingFx] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    setLoadingFx(true);
    getFx()
      .then((bundle) => { if (alive) { setFx(bundle); setFxErr(null); } })
      .catch((e) => { if (alive) setFxErr(String(e)); })
      .finally(() => { if (alive) setLoadingFx(false); });
    return () => { alive = false; };
  }, []);

  const matsById = React.useMemo(() => {
    const m: Record<string, Material> = {};
    state.materials.forEach(x => m[x.id] = x);
    return m;
  }, [state.materials]);

  const firstRecipeId = state.recipes[0]?.id ?? "";
  const [recipeId, setRecipeId] = React.useState<string>(firstRecipeId);
  const recipe: Recipe | undefined = state.recipes.find(r => r.id === recipeId);

  const [batchKg, setBatchKg] = React.useState<number | undefined>(10);

  // Business knobs
  const [overheadPct, setOverheadPct] = React.useState<number | undefined>(10);
  const [wastePct, setWastePct] = React.useState<number | undefined>(3);
  const [markupPct, setMarkupPct] = React.useState<number | undefined>(20);

  // Manual FX UI state
  const [manualUSD, setManualUSD] = React.useState<number | undefined>(undefined); // USD→IDR
  const [manualEUR, setManualEUR] = React.useState<number | undefined>(undefined); // EUR→IDR
  const canSaveManual = isFinite(manualUSD as number) && (manualUSD as number)! > 0
                     && isFinite(manualEUR as number) && (manualEUR as number)! > 0;

  const costRows = React.useMemo(() => {
    if (!recipe || !batchKg || batchKg <= 0) return null;

    const ratioLines = recipe.lines.filter(l => l.unit === "ratio");
    const ratioSum = ratioLines.reduce((a, l) => a + (l.amount || 0), 0);

    const absoluteKgSum = recipe.lines
      .filter(l => l.unit !== "ratio")
      .map(l => lineMassKg(l, 0, 0, matsById) || 0)
      .reduce((a, b) => a + b, 0);

    const ratioPool = Math.max(0, batchKg - absoluteKgSum);

    const rows = recipe.lines.map((l) => {
      const mat = matsById[l.materialId];
      const massKg = lineMassKg(l, ratioPool, ratioSum, matsById);

      const pricePerKg = mat?.pricePerKg ?? 0;
      const cur = (mat?.priceCurrency || "IDR") as "IDR" | "USD" | "EUR";

      const pricePerKgIDR = idrFrom(pricePerKg, cur, fx); // returns NaN if fx missing for USD/EUR
      const lineCostIDR = (massKg !== undefined && !Number.isNaN(pricePerKgIDR))
        ? pricePerKgIDR * massKg
        : undefined;

      return {
        id: l.id,
        name: mat?.name || l.materialId,
        massKg,
        pricePerKgIDR: Number.isNaN(pricePerKgIDR) ? undefined : pricePerKgIDR,
        lineCostIDR,
        unit: l.unit,
        amount: l.amount,
        currency: cur,
        rawPricePerKg: pricePerKg,
      };
    });

    const total = rows
      .map(r => r.lineCostIDR ?? 0)
      .reduce((a, b) => a + b, 0);

    const perKg = batchKg > 0 ? total / batchKg : undefined;

    return { rows, total, perKg, ratioPool, absoluteKgSum, ratioSum };
  }, [recipe, batchKg, matsById, fx]);

  const totals = React.useMemo(() => {
    if (!costRows || !batchKg) return null;

    const base = costRows.total;
    const waste = base * ((wastePct ?? 0) / 100);
    const withWaste = base + waste;

    const overhead = withWaste * ((overheadPct ?? 0) / 100);
    const subtotal = withWaste + overhead;

    const markup = subtotal * ((markupPct ?? 0) / 100);
    const grand = subtotal + markup;

    const perKgBase = base / batchKg;
    const perKgSubtotal = subtotal / batchKg;
    const perKgGrand = grand / batchKg;

    return {
      base, waste, overhead, subtotal, markup, grand,
      perKgBase, perKgSubtotal, perKgGrand,
    };
  }, [costRows, batchKg, overheadPct, wastePct, markupPct]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Cost Analysis</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Cost & Profit
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Calculate material costs, profit margins, and pricing for your concrete products.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2 disabled:opacity-40"
              onClick={() => {
                setLoadingFx(true);
                fetchFx()
                  .then((bundle) => { setFx(bundle); setFxErr(null); })
                  .catch(e => setFxErr(String(e)))
                  .finally(() => setLoadingFx(false));
              }}
              disabled={loadingFx}
              title="Fetch FX (with fallbacks)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loadingFx ? "Refreshing FX…" : "Refresh FX"}
            </button>
          </div>
        </div>
      </header>

      {/* Controls + FX panel */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-black text-white">Cost Calculator</h2>
          </div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Recipe</label>
                <select
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
              value={recipeId}
              onChange={(e) => setRecipeId(e.target.value)}
            >
              {state.recipes.length ? (
                state.recipes.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.process}</option>
                ))
              ) : (
                <option value="">— No recipes —</option>
              )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Batch size (kg)</label>
                <NumberField
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={batchKg}
                  onChange={setBatchKg}
                  step="0.1"
                  placeholder="Enter batch size"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Cost Parameters</label>
                <div className="text-xs text-gray-400">
                  {fx
                    ? <>FX: {fx.source} — {new Date(fx.fetchedAt).toLocaleString()} (USD→IDR {fx.idrPer.USD.toLocaleString("id-ID")}, EUR→IDR {fx.idrPer.EUR.toLocaleString("id-ID")})</>
                    : <>FX: not loaded</>}
                  {fxErr && <div className="text-red-300 mt-1">Error: {fxErr}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Manual FX override */}
        <div className="rounded-xl border border-white/10 p-4 bg-black/10">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-3">Manual FX (fallback)</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">USD → IDR</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={manualUSD}
                onChange={setManualUSD}
                step="50"
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">EUR → IDR</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={manualEUR}
                onChange={setManualEUR}
                step="50"
              />
            </div>
            <div className="flex items-end">
              <button
                className="rounded-lg px-3 py-2 text-sm font-semibold bg-white text-black shadow disabled:opacity-40"
                disabled={!canSaveManual}
                onClick={() => {
                  if (!canSaveManual) return;
                  const fxb = setManualFx(Number(manualUSD), Number(manualEUR));
                  setFx(fxb);
                  setFxErr(null);
                }}
              >
                Use manual FX
              </button>
            </div>
          </div>
        </div>

      {/* Table */}
      {recipe && costRows ? (
        <>
          <section className="rounded-2xl border border-white/10 overflow-x-auto">
            <div className="p-4 text-xs font-medium tracking-widest uppercase text-gray-400">
              Materials cost (IDR) — Batch {fmt(batchKg, 2)} kg
            </div>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-b border-white/10">Material</th>
                  <th className="py-3 px-4 border-b border-white/10">Amount</th>
                  <th className="py-3 px-4 border-b border-white/10">Mass (kg)</th>
                  <th className="py-3 px-4 border-b border-white/10">Price/kg (IDR)</th>
                  <th className="py-3 px-4 border-b border-white/10">Line cost (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {costRows.rows.map(r => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 border-b border-white/5">{r.name}</td>
                    <td className="py-3 px-4 border-b border-white/5">
                      {r.unit === "ratio" ? `${r.amount ?? 0} (ratio)` : `${r.amount ?? 0} ${r.unit}`}
                    </td>
                    <td className="py-3 px-4 border-b border-white/5">{fmt(r.massKg, 3)}</td>
                    <td className="py-3 px-4 border-b border-white/5">
                      {r.pricePerKgIDR !== undefined
                        ? r.pricePerKgIDR.toLocaleString("id-ID")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 border-b border-white/5">
                      {r.lineCostIDR !== undefined
                        ? r.lineCostIDR.toLocaleString("id-ID")
                        : "— (load FX)"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals & per-kg */}
          <section className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 p-4 bg-black/30 space-y-2 md:col-span-1">
              <div className="flex justify-between text-sm">
                <div>Materials (IDR)</div>
                <div className="font-semibold">{costRows.total.toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div>Per kg (materials)</div>
                <div className="font-semibold">{(costRows.perKg ?? 0).toLocaleString("id-ID")}</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 p-4 bg-black/30 space-y-2 md:col-span-2">
              <div className="flex justify-between text-sm">
                <div>+ Waste ({wastePct ?? 0}%)</div>
                <div className="font-semibold">{((totals?.waste ?? 0)).toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div>+ Overhead ({overheadPct ?? 0}%)</div>
                <div className="font-semibold">{((totals?.overhead ?? 0)).toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                <div>Subtotal</div>
                <div className="font-semibold">{(totals?.subtotal ?? 0).toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div>+ Markup ({markupPct ?? 0}%)</div>
                <div className="font-semibold">{(totals?.markup ?? 0).toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                <div>Grand total (batch)</div>
                <div className="font-semibold text-base">{(totals?.grand ?? 0).toLocaleString("id-ID")}</div>
              </div>
              <div className="flex justify-between text-sm">
                <div>Grand per kg</div>
                <div className="font-semibold">{(totals?.perKgGrand ?? 0).toLocaleString("id-ID")}</div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 text-gray-400">
          {state.recipes.length === 0
            ? "No recipes yet. Add one in Recipes."
            : "Select a recipe, set batch size. FX is optional unless any material uses USD/EUR."}
        </section>
      )}
    </div>
  );
}
