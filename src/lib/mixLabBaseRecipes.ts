/**
 * Mix Lab formulas are Arcos base recipes — no separate “Import” step.
 * We convert Mix Lab recipes and upsert them into AppState.recipes
 * so Derive / Product Editor / Recipes can use them as bases.
 */
import { fetchRecipes, type MixRecipe } from "../mixlab/core";
import { computeMixLabDensity } from "../mixlab/density";
import { load, save } from "../store";
import type { AppState, Material, Recipe, RecipeLine } from "../types";

const now = () => new Date().toISOString();

/** Avoid re-fetching / re-saving on every page mount (prevents UI flicker). */
const SYNC_TTL_MS = 60_000;
let lastSyncAt = 0;
let syncInFlight: Promise<{
  state: AppState;
  synced: number;
  changed: boolean;
  error?: string;
}> | null = null;

const MATERIAL_META: Record<string, { name: string; densityKgM3?: number }> = {
  portlandGrey: { name: "Grey Portland cement", densityKgM3: 3150 },
  portlandWhite: { name: "White Portland cement", densityKgM3: 3150 },
  pozzolan: { name: "Silica fume / metakaolin", densityKgM3: 2200 },
  m25: { name: "20–40 mesh", densityKgM3: 2650 },
  m40: { name: "30–60 mesh", densityKgM3: 2650 },
  m60: { name: "60–80 mesh", densityKgM3: 2650 },
  m80: { name: "80–100 mesh", densityKgM3: 2650 },
  m200: { name: "200 mesh", densityKgM3: 2650 },
  m300: { name: "300 mesh", densityKgM3: 2650 },
  acrylic: { name: "Acrylic polymer (liquid)", densityKgM3: 1050 },
  rdp: { name: "VAE RDP (dry)", densityKgM3: 500 },
  plasticizer: { name: "Plasticizer", densityKgM3: 1100 },
  defoamer: { name: "Defoamer", densityKgM3: 1000 },
  accelerator: { name: "Accelerator", densityKgM3: 1200 },
  retarder: { name: "Retarder", densityKgM3: 1100 },
  expander: { name: "Expander / shrinkage", densityKgM3: 1000 },
  wetting: { name: "Wetting agent", densityKgM3: 1000 },
  hpmc: { name: "HPMC", densityKgM3: 400 },
  fiber: { name: "Glass fiber", densityKgM3: 2600 },
  pigment: { name: "Pigment", densityKgM3: 450 },
  water: { name: "Water", densityKgM3: 1000 },
};

export function mixLabRecipeId(mixId: string): string {
  return `ml-${mixId}`.slice(0, 50);
}

function mapProcess(r: MixRecipe): string {
  const id = (r.id || "").toLowerCase();
  const name = (r.name || "").toLowerCase();
  if (id.includes("uhpc") || name.includes("uhpc")) return "UHPC";
  if (id.includes("micro-face") || name.includes("face")) return "MICRO_CEMENT";
  if (id.includes("micro") || name.includes("micro")) return "MICRO_CEMENT";
  if (id.includes("gfrc") || name.includes("gfrc")) return "GFRC_BACK";
  return "GENERAL";
}

/** Stable line ids so re-sync does not remount ingredient rows. */
function lineId(recipeId: string, materialId: string): string {
  return `${recipeId}:${materialId}`.slice(0, 50);
}

/** Convert Mix Lab formula → Arcos ratio lines (1000 g dry basis). */
export function mixLabToArcosRecipe(r: MixRecipe): Recipe {
  const dry = 1000;
  const sb = Number(r.sandBinder) > 0 ? Number(r.sandBinder) : 1;
  const pc = Number(r.pozzolanCement) || 0;
  const sand = (dry * sb) / (sb + 1);
  const binder = dry / (sb + 1);
  const portland = binder / (1 + pc);
  const pozzolan = binder - portland;
  const cementId = r.cementType === "white" ? "portlandWhite" : "portlandGrey";
  const isRdp = r.polymerType === "rdp";
  const solids = binder * (Number(r.acrylicSolidTarget) || 0);
  const polymerId = isRdp ? "rdp" : "acrylic";
  const polymerAmt = isRdp
    ? solids
    : Number(r.acrylicSolidContent) > 0
      ? solids / Number(r.acrylicSolidContent)
      : solids;

  const parts = r.parts || {};
  const partTotal = Object.values(parts).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const recipeId = mixLabRecipeId(r.id);

  const lines: RecipeLine[] = [];
  const push = (materialId: string, amount: number) => {
    if (!(amount > 0.0001)) return;
    lines.push({
      id: lineId(recipeId, materialId),
      materialId,
      amount: Math.round(amount * 1000) / 1000,
      unit: "ratio",
    });
  };

  push(cementId, portland);
  push("pozzolan", pozzolan);
  Object.entries(parts).forEach(([mesh, v]) => {
    push(mesh, sand * ((Number(v) || 0) / partTotal));
  });
  push(polymerId, polymerAmt);
  push("plasticizer", binder * (Number(r.plasticizer) || 0));
  push("defoamer", binder * (Number(r.defoamer) || 0));
  push("accelerator", binder * (Number(r.accelerator) || 0));
  push("retarder", binder * (Number(r.retarder) || 0));
  push("expander", binder * (Number(r.expander) || 0));
  push("wetting", binder * (Number(r.wetting) || 0));
  push("hpmc", binder * (Number(r.hpmc) || 0));
  push("fiber", binder * (Number(r.fiber) || 0));
  push("pigment", binder * (Number(r.pigment) || 0));

  const dens = computeMixLabDensity(r);
  const cured = Math.round(dens.curedKgM3);

  return {
    id: recipeId,
    name: r.name || r.id,
    process: mapProcess(r),
    version: "mix-lab",
    densityKgM3: cured > 0 ? cured : 2200,
    densityWetKgM3: dens.wetKgM3 > 0 ? Math.round(dens.wetKgM3) : undefined,
    densityCuredEstKgM3: dens.curedEstKgM3 > 0 ? Math.round(dens.curedEstKgM3) : undefined,
    densityCuredMeasuredKgM3:
      Number(r.densityCuredMeasuredKgM3) > 0 ? Number(r.densityCuredMeasuredKgM3) : undefined,
    lines,
    createdAt: now(),
    updatedAt: now(),
    tags: ["mix-lab"],
  };
}

function ensureMaterials(state: AppState, recipes: Recipe[]): AppState {
  const have = new Set((state.materials || []).map((m) => m.id));
  const extras: Material[] = [];
  for (const recipe of recipes) {
    for (const line of recipe.lines || []) {
      const id = line.materialId;
      if (!id || have.has(id)) continue;
      have.add(id);
      const meta = MATERIAL_META[id] || { name: id, densityKgM3: 1000 };
      extras.push({
        id,
        name: meta.name,
        densityKgM3: meta.densityKgM3 ?? 1000,
        amount: 0,
        packKg: 1,
        priceCurrency: "IDR",
      });
    }
  }
  if (!extras.length) return state;
  return { ...state, materials: [...(state.materials || []), ...extras] };
}

function recipesFingerprint(recipes: Recipe[]): string {
  return recipes
    .map(
      (r) =>
        `${r.id}:${r.name}:${r.process}:${(r.lines || [])
          .map((l) => `${l.materialId}=${l.amount}`)
          .join(",")}`
    )
    .sort()
    .join("|");
}

async function runSync(): Promise<{
  state: AppState;
  synced: number;
  changed: boolean;
  error?: string;
}> {
  try {
    const mixList = await fetchRecipes();
    const converted = mixList.map(mixLabToArcosRecipe);
    if (!converted.length) {
      return { state: load(), synced: 0, changed: false };
    }

    const current = load();
    const materialCountBefore = current.materials?.length || 0;
    let next = ensureMaterials(current, converted);
    const byId = new Map((next.recipes || []).map((r) => [r.id, r]));
    for (const c of converted) {
      const prev = byId.get(c.id);
      byId.set(c.id, {
        ...c,
        createdAt: prev?.createdAt || c.createdAt,
      });
    }
    const recipes = Array.from(byId.values());
    const beforeFp = recipesFingerprint(
      (next.recipes || []).filter((r) => r.id.startsWith("ml-") || r.version === "mix-lab")
    );
    const afterFp = recipesFingerprint(converted);
    const materialsChanged = (next.materials?.length || 0) !== materialCountBefore;

    if (beforeFp === afterFp && !materialsChanged) {
      lastSyncAt = Date.now();
      return { state: current, synced: converted.length, changed: false };
    }

    next = { ...next, recipes };
    await save(next);
    lastSyncAt = Date.now();
    return { state: next, synced: converted.length, changed: true };
  } catch (e) {
    console.error("syncMixLabBaseRecipes", e);
    return {
      state: load(),
      synced: 0,
      changed: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

/**
 * Fetch Mix Lab formulas and upsert them as Arcos base recipes (id `ml-…`).
 * Throttled; skips store save when nothing changed (avoids layout flicker).
 */
export async function syncMixLabBaseRecipes(opts?: {
  force?: boolean;
}): Promise<{
  state: AppState;
  synced: number;
  changed: boolean;
  error?: string;
}> {
  const force = opts?.force === true;
  if (!force && Date.now() - lastSyncAt < SYNC_TTL_MS) {
    return { state: load(), synced: 0, changed: false };
  }
  if (syncInFlight) return syncInFlight;
  syncInFlight = runSync().finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}
