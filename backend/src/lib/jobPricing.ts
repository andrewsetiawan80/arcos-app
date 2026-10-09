/** Shared sell-price math: (material + labour) → waste → overhead → markup. */

export function num(v: any, fallback = 0): number {
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

export function calcLineEconomics(item: {
  qty?: any;
  material_cost?: any;
  labour_cost?: any;
  unit_cost?: any;
  waste_pct?: any;
  overhead_pct?: any;
  markup_pct?: any;
  unit_price?: any;
  price_override?: boolean;
}) {
  const qty = Math.max(0, num(item.qty, 1));
  const materialCost =
    item.material_cost != null && item.material_cost !== ""
      ? Math.max(0, num(item.material_cost))
      : Math.max(0, num(item.unit_cost));
  const labourCost = Math.max(0, num(item.labour_cost));
  const unitCost = combinedUnitCost(materialCost, labourCost);
  const wastePct = Math.max(0, num(item.waste_pct));
  const overheadPct = Math.max(0, num(item.overhead_pct));
  const markupPct = Math.max(0, num(item.markup_pct));
  const computedSell = calcUnitSellPrice(unitCost, wastePct, overheadPct, markupPct);
  const unitPrice = item.price_override ? Math.max(0, num(item.unit_price, computedSell)) : computedSell;
  const costPerUnit = unitCost * (1 + wastePct / 100) * (1 + overheadPct / 100);
  const lineCost = costPerUnit * qty;
  const lineSell = unitPrice * qty;
  const profit = lineSell - lineCost;
  const marginPct = lineSell > 0 ? (profit / lineSell) * 100 : 0;
  return {
    qty,
    materialCost,
    labourCost,
    unitCost,
    wastePct,
    overheadPct,
    markupPct,
    computedSell,
    unitPrice,
    costPerUnit,
    lineCost,
    lineSell,
    profit,
    marginPct,
  };
}

export function defaultUnitForKind(kind: string): string {
  if (kind === "area") return "m2";
  if (kind === "manual") return "pcs";
  return "pcs";
}

export const LABOUR_COMPLEXITIES = ["none", "simple", "medium", "complex", "custom"] as const;
export type LabourComplexity = (typeof LABOUR_COMPLEXITIES)[number];
