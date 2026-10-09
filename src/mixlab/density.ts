/**
 * Theoretical fresh (wet) + estimated cured density from Mix Lab / Arcos recipes.
 *
 * Uses absolute (particle) densities — not bulk bag densities — for volume.
 * Cured estimate is an engineering approximation (hydration + free-water loss + air).
 */
import { compute, MESHES, type ComputeResult, type MixRecipe } from "./core";
import type { Material, Recipe, RecipeLine } from "../types";

/** Particle / solid densities for absolute-volume method (kg/m³). */
export const SOLID_DENSITY_KG_M3: Record<string, number> = {
  portlandGrey: 3150,
  portlandWhite: 3150,
  portland: 3150,
  pozzolan: 2200,
  m25: 2650,
  m40: 2650,
  m60: 2650,
  m80: 2650,
  m200: 2650,
  m300: 2650,
  acrylic: 1050,
  rdp: 500,
  water: 1000,
  plasticizer: 1100,
  defoamer: 1000,
  accelerator: 1200,
  retarder: 1100,
  expander: 1000,
  wetting: 1000,
  hpmc: 400,
  fiber: 2600,
  pigment: 450,
};

export type DensityAssumptions = {
  /** Entrapped / entrained air as fraction of total volume (0–0.1). Default 2%. */
  airPct: number;
  /** Degree of cementitious hydration 0–1. Default 0.70. */
  hydration: number;
  /** Chemically bound water ≈ factor × hydrated cement mass. Default 0.23. */
  boundWaterFactor: number;
  /** Fraction of free (non-bound) water retained in pores after cure. Default 0.15. */
  freeWaterRetain: number;
};

export const DEFAULT_DENSITY_ASSUMPTIONS: DensityAssumptions = {
  airPct: 0.02,
  hydration: 0.7,
  boundWaterFactor: 0.23,
  freeWaterRetain: 0.15,
};

export type DensityLine = {
  id: string;
  name: string;
  massKg: number;
  densityKgM3: number;
  volumeM3: number;
};

export type MixDensityResult = {
  assumptions: DensityAssumptions;
  lines: DensityLine[];
  massWetKg: number;
  volumeSolidsM3: number;
  volumeWetM3: number;
  /** Theoretical fresh density (kg/m³). */
  wetKgM3: number;
  massCuredKg: number;
  volumeCuredM3: number;
  /** Estimated hardened density (kg/m³). */
  curedEstKgM3: number;
  /** Prefer measured when set. */
  curedKgM3: number;
  measuredKgM3?: number;
  cementMassKg: number;
  waterMassKg: number;
  boundWaterKg: number;
  freeWaterLostKg: number;
};

export function densityAssumptionsFrom(
  partial?: Partial<DensityAssumptions> | null
): DensityAssumptions {
  const d = DEFAULT_DENSITY_ASSUMPTIONS;
  return {
    airPct: clamp(Number(partial?.airPct ?? d.airPct), 0, 0.12),
    hydration: clamp(Number(partial?.hydration ?? d.hydration), 0, 1),
    boundWaterFactor: clamp(Number(partial?.boundWaterFactor ?? d.boundWaterFactor), 0.15, 0.4),
    freeWaterRetain: clamp(Number(partial?.freeWaterRetain ?? d.freeWaterRetain), 0, 1),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function solidRho(id: string, override?: number): number {
  if (override != null && override > 0) return override;
  return SOLID_DENSITY_KG_M3[id] || 1000;
}

function pushLine(
  lines: DensityLine[],
  id: string,
  name: string,
  grams: number,
  rho: number
) {
  const massKg = (Number(grams) || 0) / 1000;
  if (!(massKg > 1e-12) || !(rho > 0)) return;
  lines.push({
    id,
    name,
    massKg,
    densityKgM3: rho,
    volumeM3: massKg / rho,
  });
}

/** Density from Mix Lab formula + compute() masses (grams). */
export function computeMixLabDensity(
  recipe: MixRecipe,
  opts?: {
    assumptions?: Partial<DensityAssumptions>;
    measuredKgM3?: number;
    /** Optional density overrides by material id (kg/m³). */
    densities?: Record<string, number>;
  }
): MixDensityResult {
  const m = compute(recipe);
  const assumptions = densityAssumptionsFrom({
    airPct: opts?.assumptions?.airPct ?? recipe.densityAirPct,
    hydration: opts?.assumptions?.hydration ?? recipe.densityHydration,
    boundWaterFactor: opts?.assumptions?.boundWaterFactor ?? recipe.densityBoundWater,
    freeWaterRetain: opts?.assumptions?.freeWaterRetain ?? recipe.densityFreeWaterRetain,
  });
  const measured =
    opts?.measuredKgM3 ??
    (Number(recipe.densityCuredMeasuredKgM3) > 0
      ? Number(recipe.densityCuredMeasuredKgM3)
      : undefined);
  const d = opts?.densities || {};
  const cementId = recipe.cementType === "white" ? "portlandWhite" : "portlandGrey";
  const polymerId = m.isRdp ? "rdp" : "acrylic";

  const lines: DensityLine[] = [];
  pushLine(lines, cementId, "Portland cement", m.portland, solidRho(cementId, d[cementId]));
  pushLine(lines, "pozzolan", "Pozzolan", m.pozzolan, solidRho("pozzolan", d.pozzolan));
  MESHES.forEach((mesh) => {
    pushLine(lines, mesh.id, mesh.name, m.sands[mesh.id], solidRho(mesh.id, d[mesh.id]));
  });
  pushLine(
    lines,
    polymerId,
    m.isRdp ? "VAE RDP" : "Acrylic polymer",
    m.acrylic,
    solidRho(polymerId, d[polymerId])
  );
  pushLine(lines, "water", "Water (added + from polymer)", m.waterGross, solidRho("water", d.water));
  pushLine(lines, "plasticizer", "Plasticizer", m.admix.plasticizer, solidRho("plasticizer", d.plasticizer));
  pushLine(lines, "defoamer", "Defoamer", m.admix.defoamer, solidRho("defoamer", d.defoamer));
  pushLine(lines, "accelerator", "Accelerator", m.admix.accelerator, solidRho("accelerator", d.accelerator));
  pushLine(lines, "retarder", "Retarder", m.admix.retarder, solidRho("retarder", d.retarder));
  pushLine(lines, "expander", "Expander", m.admix.expander, solidRho("expander", d.expander));
  pushLine(lines, "wetting", "Wetting", m.admix.wetting, solidRho("wetting", d.wetting));
  pushLine(lines, "hpmc", "HPMC", m.admix.hpmc, solidRho("hpmc", d.hpmc));
  pushLine(lines, "fiber", "Glass fiber", m.admix.fiber, solidRho("fiber", d.fiber));
  pushLine(lines, "pigment", "Pigment", m.admix.pigment, solidRho("pigment", d.pigment));

  return finishDensity(lines, assumptions, measured, {
    cementMassKg: m.portland / 1000,
    // Treat pozzolan as partially cementitious for bound-water estimate (conservative half weight)
    cementitiousKg: (m.portland + 0.5 * m.pozzolan) / 1000,
    waterMassKg: m.waterGross / 1000,
  });
}

/** Density from Arcos ratio/absolute recipe lines + materials catalog. */
export function computeArcosRecipeDensity(
  recipe: Recipe,
  materials: Material[],
  opts?: {
    assumptions?: Partial<DensityAssumptions>;
    measuredKgM3?: number;
    /** Dry basis for ratio lines (g). Default 1000. */
    basisGrams?: number;
  }
): MixDensityResult | null {
  const linesIn = recipe.lines || [];
  if (!linesIn.length) return null;

  const byId = new Map(materials.map((m) => [m.id, m]));
  const assumptions = densityAssumptionsFrom(opts?.assumptions);
  const measured =
    opts?.measuredKgM3 ??
    (Number((recipe as any).densityCuredMeasuredKgM3) > 0
      ? Number((recipe as any).densityCuredMeasuredKgM3)
      : undefined);

  const ratioLines = linesIn.filter((l) => l.unit === "ratio");
  const absLines = linesIn.filter((l) => l.unit !== "ratio");
  const ratioSum = ratioLines.reduce((s, l) => s + (Number(l.amount) || 0), 0) || 1;
  const basis = opts?.basisGrams && opts.basisGrams > 0 ? opts.basisGrams : 1000;

  const lines: DensityLine[] = [];
  let cementMassKg = 0;
  let waterMassKg = 0;

  const add = (line: RecipeLine, grams: number) => {
    const mat = byId.get(line.materialId);
    const rho = solidRho(
      line.materialId,
      mat?.densityKgM3 && mat.densityKgM3 > 1200 ? mat.densityKgM3 : undefined
      // Prefer solid table when catalog has bulk (~1500) densities
    );
    // If catalog density looks like particle density (>2000) or known solid, use catalog when better
    const catalog = mat?.densityKgM3;
    const useRho =
      catalog != null && catalog >= 2000
        ? catalog
        : SOLID_DENSITY_KG_M3[line.materialId]
          ? SOLID_DENSITY_KG_M3[line.materialId]
          : catalog && catalog > 0
            ? catalog
            : rho;

    pushLine(lines, line.materialId, mat?.name || line.materialId, grams, useRho);

    const id = line.materialId.toLowerCase();
    if (id.includes("portland") || id === "cement") cementMassKg += grams / 1000;
    if (id === "water") waterMassKg += grams / 1000;
  };

  for (const line of ratioLines) {
    add(line, ((Number(line.amount) || 0) / ratioSum) * basis);
  }
  for (const line of absLines) {
    const amt = Number(line.amount) || 0;
    let grams = 0;
    if (line.unit === "kg") grams = amt * 1000;
    else if (line.unit === "g") grams = amt;
    else if (line.unit === "L") {
      const mat = byId.get(line.materialId);
      const rho = SOLID_DENSITY_KG_M3[line.materialId] || mat?.densityKgM3 || 1000;
      grams = amt * rho;
    } else if (line.unit === "mL") {
      const mat = byId.get(line.materialId);
      const rho = SOLID_DENSITY_KG_M3[line.materialId] || mat?.densityKgM3 || 1000;
      grams = (amt / 1000) * rho;
    }
    add(line, grams);
  }

  if (!lines.length) return null;

  // If no explicit water line, leave waterMassKg 0 — cured model still runs on cement
  return finishDensity(lines, assumptions, measured, {
    cementMassKg,
    cementitiousKg: cementMassKg,
    waterMassKg,
  });
}

function finishDensity(
  lines: DensityLine[],
  assumptions: DensityAssumptions,
  measuredKgM3: number | undefined,
  meta: { cementMassKg: number; cementitiousKg: number; waterMassKg: number }
): MixDensityResult {
  const massWetKg = lines.reduce((s, l) => s + l.massKg, 0);
  const volumeSolidsM3 = lines.reduce((s, l) => s + l.volumeM3, 0);
  const air = assumptions.airPct;
  // Fresh bulk volume (absolute solids + entrapped air)
  const volumeWetM3 = volumeSolidsM3 > 0 ? volumeSolidsM3 / (1 - air) : 0;
  const wetKgM3 = volumeWetM3 > 0 ? massWetKg / volumeWetM3 : 0;

  const cementitious = Math.max(0, meta.cementitiousKg);
  const water = Math.max(0, meta.waterMassKg);
  const boundWaterKg = Math.min(
    water,
    assumptions.hydration * assumptions.boundWaterFactor * cementitious
  );
  const freeWater = Math.max(0, water - boundWaterKg);
  const freeWaterLostKg = freeWater * (1 - assumptions.freeWaterRetain);

  // Cast pieces keep roughly the fresh external volume; evaporated water
  // leaves capillary pores (voids). So mass drops, volume stays → cured ≤ wet.
  const massCuredKg = Math.max(0, massWetKg - freeWaterLostKg);
  const volumeCuredM3 = volumeWetM3;
  const curedEstKgM3 = volumeCuredM3 > 0 ? massCuredKg / volumeCuredM3 : 0;

  const measured =
    measuredKgM3 != null && measuredKgM3 > 0 ? measuredKgM3 : undefined;

  return {
    assumptions,
    lines,
    massWetKg,
    volumeSolidsM3,
    volumeWetM3,
    wetKgM3,
    massCuredKg,
    volumeCuredM3,
    curedEstKgM3,
    curedKgM3: measured ?? curedEstKgM3,
    measuredKgM3: measured,
    cementMassKg: meta.cementMassKg,
    waterMassKg: water,
    boundWaterKg,
    freeWaterLostKg,
  };
}

export function fmtDensity(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `${Math.round(n).toLocaleString()} kg/m³`;
}

export function densityToKgPerL(kgM3: number): number {
  return kgM3 > 0 ? kgM3 / 1000 : 0;
}
