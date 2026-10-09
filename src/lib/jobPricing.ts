/** Client-side job line pricing (mirrors backend labour rules). */

export function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function combinedUnitCost(materialCost: number, labourCost: number): number {
  return Math.max(0, num(materialCost)) + Math.max(0, num(labourCost));
}

export function calcUnitSellPrice(
  unitCost: number,
  wastePct: number,
  overheadPct: number,
  markupPct: number,
): number {
  const base = Math.max(0, num(unitCost));
  const withWaste = base * (1 + Math.max(0, num(wastePct)) / 100);
  const withOverhead = withWaste * (1 + Math.max(0, num(overheadPct)) / 100);
  return withOverhead * (1 + Math.max(0, num(markupPct)) / 100);
}

export type LabourComplexity = "none" | "simple" | "medium" | "complex" | "custom";

export type CastAddon = { name: string; amount: number };

export type CastMeta = {
  liters?: number;
  spare_pct?: number;
  density?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  addons?: CastAddon[];
};

export type JobItemDraft = {
  description: string;
  kind: "piece" | "area" | "manual";
  qty: number;
  unit: string;
  material_cost: number;
  labour_complexity: LabourComplexity;
  labour_hours: number;
  labour_cost: number;
  unit_cost: number;
  waste_pct: number;
  overhead_pct: number;
  markup_pct: number;
  unit_price: number;
  price_override: boolean;
  notes: string;
  mix_recipe_id?: string | null;
  mix_recipe_title?: string | null;
  mix_dry_kg?: number | null;
  cast_meta?: CastMeta | null;
};

export type LabourPreset = {
  id: string;
  scope: string;
  complexity: "simple" | "medium" | "complex";
  label: string;
  /** Area (m²): fixed Rp per m² */
  amount_idr: number | null;
  /** Shop / piece: Rp per hour */
  hourly_rate_idr: number | null;
  sort_order: number;
};

export function defaultUnitForKind(kind: JobItemDraft["kind"]): string {
  if (kind === "area") return "m2";
  return "pcs";
}

export function emptyJobItem(defaults?: {
  waste?: number;
  overhead?: number;
  markup?: number;
}): JobItemDraft {
  return {
    description: "",
    kind: "piece",
    qty: 1,
    unit: "pcs",
    material_cost: 0,
    labour_complexity: "none",
    labour_hours: 0,
    labour_cost: 0,
    unit_cost: 0,
    waste_pct: defaults?.waste ?? 3,
    overhead_pct: defaults?.overhead ?? 10,
    markup_pct: defaults?.markup ?? 40,
    unit_price: 0,
    price_override: false,
    notes: "",
    mix_recipe_id: null,
    mix_recipe_title: null,
    mix_dry_kg: null,
    cast_meta: null,
  };
}

/** Liters from L×W×H in cm (cm³ / 1000). */
export function litersFromCm(l: number, w: number, h: number): number {
  return (Math.max(0, num(l)) * Math.max(0, num(w)) * Math.max(0, num(h))) / 1000;
}

/** Wet pour volume → dry kg using recipe dry/wet ratio. */
export function dryKgFromVolume(opts: {
  liters: number;
  densityKgPerL: number;
  sparePct: number;
  recipeDryKg: number;
  recipeWetKg: number;
}): number {
  const wetKg =
    Math.max(0, num(opts.liters)) *
    Math.max(0, num(opts.densityKgPerL)) *
    (1 + Math.max(0, num(opts.sparePct)) / 100);
  const ratio =
    opts.recipeWetKg > 0 && opts.recipeDryKg > 0 ? opts.recipeDryKg / opts.recipeWetKg : 1;
  return wetKg * ratio;
}

export function hourlyRateForComplexity(
  presets: LabourPreset[],
  complexity: LabourComplexity,
): number | null {
  if (complexity === "none" || complexity === "custom") return null;
  const row = presets.find((p) => p.scope === "shop" && p.complexity === complexity);
  const rate = row?.hourly_rate_idr;
  if (rate == null || !Number.isFinite(Number(rate))) return null;
  return Number(rate);
}

/** Microcement / area: Rp per m² by complexity. */
export function areaLabourPerM2(
  presets: LabourPreset[],
  complexity: LabourComplexity,
): number | null {
  if (complexity === "none" || complexity === "custom") return null;
  const row = presets.find((p) => p.scope === "area" && p.complexity === complexity);
  if (!row || row.amount_idr == null || !Number.isFinite(Number(row.amount_idr))) return null;
  return Number(row.amount_idr);
}

export function resolveLabourCost(item: JobItemDraft, presets: LabourPreset[]): number {
  const c = item.labour_complexity;
  if (c === "none") return 0;
  if (c === "custom") return Math.max(0, num(item.labour_cost));

  if (item.kind === "area") {
    const perM2 = areaLabourPerM2(presets, c);
    if (perM2 != null) return perM2;
    return Math.max(0, num(item.labour_cost));
  }

  // piece / manual: hours × shop hourly rate
  const rate = hourlyRateForComplexity(presets, c);
  if (rate == null) return Math.max(0, num(item.labour_cost));
  return Math.max(0, num(item.labour_hours)) * rate;
}

export function syncUnitCost(item: JobItemDraft, presets: LabourPreset[] = []): JobItemDraft {
  const labour_cost = resolveLabourCost(item, presets);
  const unit_cost = combinedUnitCost(item.material_cost, labour_cost);
  return { ...item, labour_cost, unit_cost };
}

export function lineEconomics(item: JobItemDraft, presets: LabourPreset[] = []) {
  const synced = syncUnitCost(item, presets);
  const qty = Math.max(0, num(synced.qty, 1));
  const materialCost = Math.max(0, num(synced.material_cost));
  const labourCost = Math.max(0, num(synced.labour_cost));
  const unitCost = synced.unit_cost;
  const wastePct = Math.max(0, num(synced.waste_pct));
  const overheadPct = Math.max(0, num(synced.overhead_pct));
  const markupPct = Math.max(0, num(synced.markup_pct));
  const computedSell = calcUnitSellPrice(unitCost, wastePct, overheadPct, markupPct);
  const unitPrice = synced.price_override
    ? Math.max(0, num(synced.unit_price, computedSell))
    : computedSell;
  const costPerUnit = unitCost * (1 + wastePct / 100) * (1 + overheadPct / 100);
  const lineCost = costPerUnit * qty;
  const lineSell = unitPrice * qty;
  const profit = lineSell - lineCost;
  const marginPct = lineSell > 0 ? (profit / lineSell) * 100 : 0;
  return {
    qty,
    materialCost,
    labourCost,
    labourHours: Math.max(0, num(synced.labour_hours)),
    unitCost,
    computedSell,
    unitPrice,
    costPerUnit,
    lineCost,
    lineSell,
    profit,
    marginPct,
  };
}

export function fmtIdr(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}
