// src/pages/TilePlanner.tsx
import React, { useMemo, useState } from "react";
import { load } from "../store";
import type { AppState, Recipe } from "../types";
import NumberField from "../components/NumberField";
import Card from "../components/Card";
import SectionHeader from "../components/SectionHeader";

type AreaUnit = "cm2" | "m2";

export default function TilePlanner() {
  // Load persisted app state (read-only here)
  const [state] = useState<AppState>(() => load());

  // --- Local UI state
  const [recipeId, setRecipeId] = useState<string>(state.recipes[0]?.id ?? "");
  const recipe: Recipe | undefined = state.recipes.find((r) => r.id === recipeId);

  const [tileWidthMm, setTileWidthMm] = useState<number | undefined>();
  const [tileHeightMm, setTileHeightMm] = useState<number | undefined>();
  const [tileAreaInput, setTileAreaInput] = useState<number | undefined>();
  const [tileAreaUnit, setTileAreaUnit] = useState<AreaUnit>("cm2");

  const [tileCount, setTileCount] = useState<number | undefined>();
  const [targetAreaM2, setTargetAreaM2] = useState<number | undefined>();
  const [sparePct, setSparePct] = useState<number | undefined>(7);

  // --- Derived values

  // Tile area (m²)
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

  // Needed tile count (incl. spare)
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

  // --- Reusable styles
  const inputClass = "w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm";
  const labelClass = "text-xs text-gray-400 mb-1";
  const groupTitle = "text-[11px] uppercase tracking-wide text-zinc-400";

  const hasRecipes = state.recipes.length > 0;

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

      stage: "planned", // future: cast → demold → cure → finish → ship
    };

    // Persist to localStorage list
    const key = "cretewerkz.batches";
    const existing = safeParseArray(localStorage.getItem(key));
    existing.unshift(batch);
    localStorage.setItem(key, JSON.stringify(existing));

    alert(`Batch saved: ${batch.id}`);
  }

  function handleExportPDF() {
    // Generate a simple, print-ready HTML report
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
    .brand { color: #e11d48; letter-spacing: .08em; font-weight: 600; font-size: 12px; text-transform: uppercase; }
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
      .map(([k, v]) => `<tr><td style="width:40%;font-weight:500">${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`)
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
    <>
      <SectionHeader
        title="Tile Planner"
        subtitle="Plan production by tiles or wall/floor area. Includes spare %."
      />

      {/* Recipe */}
      <Card>
        <div className="flex items-center justify-between">
          <div className={groupTitle}>Recipe</div>
          {recipe?.densityKgM3 ? (
            <div className="text-xs text-zinc-400">
              Density: <span className="text-zinc-200">{fmt(recipe.densityKgM3)} kg/m³</span>
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          {hasRecipes ? (
            <select className={inputClass} value={recipeId} onChange={(e) => setRecipeId(e.target.value)}>
              {state.recipes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-amber-300/90">
              No recipes found. Add one in <span className="underline">Engineering → Recipes</span>.
            </div>
          )}
        </div>
      </Card>

      {/* Tile info */}
      <Card>
        <div className={groupTitle}>Tile size</div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
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

        <div className="mt-4 text-sm text-zinc-400">
          Computed tile area:&nbsp;
          <span className="text-zinc-100">{isFiniteNum(tileAreaM2) ? fmt(tileAreaM2) : "—"} m²</span>
        </div>
      </Card>

      {/* Production target */}
      <Card>
        <div className={groupTitle}>Target</div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className={labelClass}>Tiles (pcs)</div>
            <NumberField className={inputClass} value={tileCount} onChange={setTileCount} step="1" />
          </div>
          <div>
            <div className={labelClass}>Or Area (m²)</div>
            <NumberField className={inputClass} value={targetAreaM2} onChange={setTargetAreaM2} step="0.01" />
          </div>
        </div>

        <div className="mt-3">
          <div className={labelClass}>Spare (%)</div>
          <NumberField className={inputClass} value={sparePct} onChange={setSparePct} step="1" />
        </div>

        <p className="mt-3 text-xs text-zinc-500">
          If both “Tiles” and “Area” are filled, the planner prefers <b>Area</b>.
        </p>
      </Card>

      {/* Results + Actions */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Tile area" value={isFiniteNum(tileAreaM2) ? `${fmt(tileAreaM2)} m²` : "—"} />
          <Stat label="Tiles needed (incl. spare)" value={isFiniteNum(neededTileCount) ? String(neededTileCount) : "—"} />
          <Stat label="Estimated total mass" value={isFiniteNum(totalMassKg) ? `${fmt(totalMassKg)} kg` : "—"} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleSaveBatch}
            disabled={!canSave}
          >
            Save Batch
          </button>
          <button
            className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            onClick={handleExportPDF}
            disabled={!recipe || (!isFiniteNum(neededTileCount) && !isFiniteNum(tileAreaM2))}
          >
            Export PDF
          </button>
        </div>
      </Card>
    </>
  );
}

/* ---------- helpers ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
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
