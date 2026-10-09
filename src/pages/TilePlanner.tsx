import React, { useMemo, useState } from "react";
import { load } from "../store";
import type { AppState, Recipe } from "../types";
import NumberField from "../components/NumberField";
import SectionHeader from "../components/SectionHeader";

type AreaUnit = "cm2" | "m2";

export default function TilePlanner() {
  // Load persisted app state (read-only here)
  const [state] = useState<AppState>(() => load());

  // --- Local UI state
  const recipes = state.recipes || [];
  const firstRecipeId = recipes[0]?.id ?? "";
  const [recipeId, setRecipeId] = useState<string>(firstRecipeId);
  const recipe: Recipe | undefined = recipes.find((r) => r.id === recipeId);

  const [tileWidthMm, setTileWidthMm] = useState<number | undefined>();
  const [tileHeightMm, setTileHeightMm] = useState<number | undefined>();
  const [tileAreaInput, setTileAreaInput] = useState<number | undefined>();
  const [tileAreaUnit, setTileAreaUnit] = useState<AreaUnit>("cm2");

  const [tileCount, setTileCount] = useState<number | undefined>();
  const [targetAreaM2, setTargetAreaM2] = useState<number | undefined>();
  const [sparePct, setSparePct] = useState<number | undefined>(
    state.settings?.defaultSparePct ?? 7
  );

  // --- Derived values
  const tileAreaM2 = useMemo(() => {
    if (isFiniteNum(tileWidthMm) && isFiniteNum(tileHeightMm)) {
      return (toNum(tileWidthMm) / 1000) * (toNum(tileHeightMm) / 1000);
    }
    if (isFiniteNum(tileAreaInput)) {
      const v = toNum(tileAreaInput);
      return tileAreaUnit === "cm2" ? v / 10_000 : v;
    }
    return undefined;
  }, [tileWidthMm, tileHeightMm, tileAreaInput, tileAreaUnit]);

  const neededTileCount = useMemo(() => {
    if (!isFiniteNum(sparePct)) return undefined;

    if (isFiniteNum(targetAreaM2) && isFiniteNum(tileAreaM2) && tileAreaM2! > 0) {
      const baseTiles = toNum(targetAreaM2) / toNum(tileAreaM2);
      return Math.ceil(baseTiles * (1 + toNum(sparePct) / 100));
    }
    if (isFiniteNum(tileCount)) {
      return Math.ceil(toNum(tileCount) * (1 + toNum(sparePct) / 100));
    }
    return undefined;
  }, [tileAreaM2, targetAreaM2, tileCount, sparePct]);

  // Estimated total mass (kg), with default thickness 10 mm if recipe lacks one
  const totalMassKg = useMemo(() => {
    if (!isFiniteNum(neededTileCount) || !isFiniteNum(tileAreaM2) || !recipe?.densityKgM3) return undefined;
    const thicknessMm: number = (recipe as any).thicknessMm ?? 10;
    const volumeM3 = toNum(neededTileCount) * toNum(tileAreaM2) * (thicknessMm / 1000);
    return volumeM3 * recipe.densityKgM3;
  }, [neededTileCount, tileAreaM2, recipe]);

  // --- Reusable styles (match ProductionPlanner)
  const inputClass = "w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm";
  const labelClass = "text-xs text-gray-400 mb-1";
  const groupTitle = "text-xs font-medium tracking-widest uppercase text-gray-400";

  const hasRecipes = recipes.length > 0;

  // --- Actions
  const canSave = Boolean(
    recipe &&
      isFiniteNum(neededTileCount) &&
      isFiniteNum(tileAreaM2) &&
      (isFiniteNum(tileCount) || isFiniteNum(targetAreaM2))
  );

  function handleSaveBatch() {
    if (!canSave || !recipe) return;

    const batch = {
      id: `B-${Date.now()}-${rand4()}`,
      createdAt: new Date().toISOString(),
      type: "tile",
      recipeId: recipe.id,
      recipeName: recipe.name,
      densityKgM3: recipe.densityKgM3 ?? null,
      thicknessMm: (recipe as any).thicknessMm ?? 10,

      // inputs
      tileWidthMm: isFiniteNum(tileWidthMm) ? toNum(tileWidthMm) : null,
      tileHeightMm: isFiniteNum(tileHeightMm) ? toNum(tileHeightMm) : null,
      tileAreaInput: isFiniteNum(tileAreaInput) ? toNum(tileAreaInput) : null,
      tileAreaUnit,

      targetTiles: isFiniteNum(tileCount) ? toNum(tileCount) : null,
      targetAreaM2: isFiniteNum(targetAreaM2) ? toNum(targetAreaM2) : null,
      sparePct: isFiniteNum(sparePct) ? toNum(sparePct) : 0,

      // derived
      tileAreaM2: isFiniteNum(tileAreaM2) ? toNum(tileAreaM2) : null,
      neededTileCount: isFiniteNum(neededTileCount) ? toNum(neededTileCount) : null,
      totalMassKg: isFiniteNum(totalMassKg) ? toNum(totalMassKg) : null,

      stage: "planned",
    };

    const key = "cretewerkz.batches";
    const existing = safeParseArray(localStorage.getItem(key));
    existing.unshift(batch);
    localStorage.setItem(key, JSON.stringify(existing));

    alert(`Batch saved: ${batch.id}`);
  }

  function handleExportPDF() {
    const w = window.open("", "_blank");
    if (!w) return;

    const company = "CRETEWERKZ";
    const title = "Tile Planner Summary";

    const rows: Array<[string, string]> = [
      ["Recipe", recipe?.name ?? "—"],
      ["Density (kg/m³)", recipe?.densityKgM3 ? fmt(recipe.densityKgM3, 0) : "—"],
      ["Thickness (mm)", String((recipe as any)?.thicknessMm ?? 10)],
      ["Tile width (mm)", isFiniteNum(tileWidthMm) ? fmt(tileWidthMm, 0) : "—"],
      ["Tile height (mm)", isFiniteNum(tileHeightMm) ? fmt(tileHeightMm, 0) : "—"],
      ["Tile area input", isFiniteNum(tileAreaInput) ? `${fmt(tileAreaInput)} ${tileAreaUnit}` : "—"],
      ["Computed tile area (m²)", isFiniteNum(tileAreaM2) ? fmt(tileAreaM2, 4) : "—"],
      ["Target tiles (pcs)", isFiniteNum(tileCount) ? fmt(tileCount, 0) : "—"],
      ["Target area (m²)", isFiniteNum(targetAreaM2) ? fmt(targetAreaM2, 2) : "—"],
      ["Spare (%)", isFiniteNum(sparePct) ? fmt(sparePct, 0) : "—"],
      ["Tiles needed (incl. spare)", isFiniteNum(neededTileCount) ? fmt(neededTileCount, 0) : "—"],
      ["Estimated total mass (kg)", isFiniteNum(totalMassKg) ? fmt(totalMassKg, 1) : "—"],
      ["Generated at", new Date().toLocaleString()],
    ];

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 32px; }
    h1 { margin: 0 0 4px 0; font-size: 22px; }
    .brand { color: #e2e8f0; letter-spacing: .12em; font-weight: 700; font-size: 12px; text-transform: uppercase; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,0,0,.08); }
    tr:nth-child(even) td { background: rgba(0,0,0,.03); }
    .muted { color: #6b7280; font-size: 12px; margin-top: 24px; }
    @media (prefers-color-scheme: dark) {
      body { background: #0b0b0c; color: #e5e7eb; }
      td { border-color: rgba(255,255,255,.08); }
      tr:nth-child(even) td { background: rgba(255,255,255,.04); }
      .muted { color: #9ca3af; }
    }
    @page { size: A4 portrait; margin: 16mm; }
  </style>
</head>
<body>
  <div class="brand">${company}</div>
  <h1>${title}</h1>
  <table>
    ${rows
      .map(([k, v]) => `<tr><td style="width:40%;font-weight:600">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
      .join("")}
  </table>
  <div class="muted">This is a planning summary. Values are estimates and should be verified before production.</div>
  <script>window.onload = () => setTimeout(() => window.print(), 80);</script>
</body>
</html>`.trim();

    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
<div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Production Planning</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Tile Planner
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Plan concrete tile production by dimensions or area, calculate quantities, and include spare percentages.
            </p>
          </div>
        </div>
      </header>

      {/* Recipe */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className={groupTitle}>Recipe</div>

        <div>
          {hasRecipes ? (
            <select className={inputClass} value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
              {recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-stone-300/90">
              No recipes found. Add one in <span className="underline">Engineering → Recipes</span>.
            </div>
          )}
        </div>

        {recipe?.densityKgM3 ? (
          <div className="text-xs text-stone-400">
            Density: <span className="text-stone-200">{fmt(recipe.densityKgM3)} kg/m³</span>
          </div>
        ) : null}
      </section>

      {/* Tile info */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className={groupTitle}>Tile size</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className={labelClass}>Width (mm)</div>
            <NumberField className={inputClass} value={tileWidthMm} onChange={setTileWidthMm} step="1" />
          </div>
          <div>
            <div className={labelClass}>Height (mm)</div>
            <NumberField className={inputClass} value={tileHeightMm} onChange={setTileHeightMm} step="1" />
          </div>
        </div>

        <div className="text-xs text-gray-500 my-2 text-center">— OR —</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className={labelClass}>Tile area</div>
            <NumberField className={inputClass} value={tileAreaInput} onChange={setTileAreaInput} step="0.01" />
          </div>
          <div>
            <div className={labelClass}>Unit</div>
            <select className={inputClass} value={tileAreaUnit} onChange={(e) => setTileAreaUnit(e.target.value as AreaUnit)}>
              <option value="cm2">cm²</option>
              <option value="m2">m²</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-stone-400">
          Computed tile area:&nbsp;
          <span className="text-stone-200">{isFiniteNum(tileAreaM2) ? fmt(tileAreaM2) : "—"} m²</span>
        </div>
      </section>

      {/* Production target */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-3">
        <div className={groupTitle}>Target</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className={labelClass}>Tiles (pcs)</div>
            <NumberField className={inputClass} value={tileCount} onChange={setTileCount} step="1" />
          </div>
          <div>
            <div className={labelClass}>Or Area (m²)</div>
            <NumberField className={inputClass} value={targetAreaM2} onChange={setTargetAreaM2} step="0.01" />
          </div>
        </div>

        <div>
          <div className={labelClass}>Spare (%)</div>
          <NumberField className={inputClass} value={sparePct} onChange={setSparePct} step="1" />
        </div>

        <p className="text-xs text-stone-500">
          If both “Tiles” and “Area” are filled, the planner prefers <b>Area</b>.
        </p>
      </section>

      {/* Results + Actions */}
      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Tile area" value={isFiniteNum(tileAreaM2) ? `${fmt(tileAreaM2)} m²` : "—"} />
          <Stat label="Tiles needed (incl. spare)" value={isFiniteNum(neededTileCount) ? String(neededTileCount) : "—"} />
          <Stat label="Estimated total mass" value={isFiniteNum(totalMassKg) ? `${fmt(totalMassKg)} kg` : "—"} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-lg px-5 py-3 text-sm font-medium bg-white text-black hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleSaveBatch}
            disabled={!canSave}
          >
            Save Batch
          </button>
          <button
            className="rounded-lg px-5 py-3 text-sm font-medium border border-white/15 hover:bg-white/10 disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleExportPDF}
            disabled={!recipe || (!isFiniteNum(neededTileCount) && !isFiniteNum(tileAreaM2))}
          >
            Export PDF
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------- helpers ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 p-3">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function toNum(v: number | undefined): number {
  return typeof v === "number" ? v : 0;
}

function fmt(n: number | undefined, digits = 2): string {
  return typeof n === "number" ? n.toFixed(digits) : "—";
}

function safeParseArray(s: string | null): any[] {
  try {
    const val = s ? JSON.parse(s) : [];
    return Array.isArray(val) ? val : [];
  } catch {
    return [];
  }
}

function rand4() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
