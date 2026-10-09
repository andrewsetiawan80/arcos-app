/** Shared Mix Lab recipe engine — used by Arcos Mix designer and Mix Lab standalone. */

export const MIX_LAB_RECIPES_URL =
  (typeof window !== "undefined" && window.location.hostname === "192.168.2.103"
    ? "/api/recipes"
    : "http://192.168.2.103/api/recipes");

export const MIX_LAB_LOG_URL =
  (typeof window !== "undefined" && window.location.hostname === "192.168.2.103"
    ? "/api/mix-log"
    : "http://192.168.2.103/api/mix-log");

export const MIX_PROJECTS_URL =
  (typeof window !== "undefined" &&
  (window.location.hostname === "192.168.2.103" || window.location.hostname === "192.168.2.189")
    ? "/api/mix-projects"
    : "http://192.168.2.189/api/mix-projects");

export type MixLogEntry = {
  id?: string;
  at?: string;
  recipeId?: string;
  recipeName?: string;
  dryWeight?: number;
  weighedBy?: string;
  source?: string;
  projectId?: string | null;
};

export type MixProject = {
  id: string;
  title: string;
  clientId?: string | null;
  clientName?: string | null;
  status?: string;
  mixRecipeId?: string | null;
  quoteId?: string | null;
  notes?: string;
};

export const MESHES = [
  { id: "m25", name: "20–40 mesh", um: "841–595 μm" },
  { id: "m40", name: "30–60 mesh", um: "595–250 μm" },
  { id: "m60", name: "60–80 mesh", um: "250–180 μm" },
  { id: "m80", name: "80–100 mesh", um: "180–150 μm" },
  { id: "m200", name: "200 mesh", um: "150–75 μm" },
  { id: "m300", name: "300 mesh", um: "75–50 μm" },
] as const;

export type MeshId = (typeof MESHES)[number]["id"];
export type Parts = Record<MeshId, number>;
export type Locks = Record<MeshId, boolean>;

export const EMPTY_PARTS: Parts = { m25: 0, m40: 0, m60: 0, m80: 0, m200: 0, m300: 0 };
export const EMPTY_LOCKS: Locks = {
  m25: false, m40: false, m60: false, m80: false, m200: false, m300: false,
};
/** Successive cutoffs for Andreasen/Fuller (μm). 20–40 / 30–60 bags overlap commercially; bins split at 30-mesh. */
export const BOUNDS = [841, 595, 250, 180, 150, 75, 50];

export const FORMULA_KEYS = [
  "name", "sandShare", "binderShare", "sandBinder", "pozzolanCement", "waterBinder",
  "gaugingOfDry", "polymerType", "acrylicSolidContent", "acrylicSolidTarget",
  "plasticizer", "plasticizerWater", "defoamer", "accelerator", "retarder",
  "expander", "wetting", "hpmc", "fiber", "pigment", "cementType",
] as const;

export type MixRecipe = {
  id: string;
  name: string;
  dryWeight: number;
  sandShare: number;
  binderShare: number;
  sandBinder: number;
  pozzolanCement: number;
  waterBinder: number;
  gaugingOfDry: number;
  polymerType: "acrylic" | "rdp";
  acrylicSolidContent: number;
  acrylicSolidTarget: number;
  plasticizer: number;
  plasticizerWater: number;
  defoamer: number;
  accelerator: number;
  retarder: number;
  expander: number;
  wetting: number;
  hpmc: number;
  fiber: number;
  pigment: number;
  cementType: "grey" | "white";
  kind: "final" | "experiment";
  /** When set, this mix belongs to a shared Arcos/Mix Lab project (not a shop base). */
  projectId?: string | null;
  notes: string;
  parts: Parts;
  createdAt?: string;
  updatedAt?: string;
  /** Density model — entrapped air fraction (0–0.12). */
  densityAirPct?: number;
  /** Degree of hydration 0–1. */
  densityHydration?: number;
  /** Bound water factor × hydrated cement. */
  densityBoundWater?: number;
  /** Fraction of free water retained after cure. */
  densityFreeWaterRetain?: number;
  /** Lab-measured cured density (kg/m³); overrides estimate when set. */
  densityCuredMeasuredKgM3?: number;
};

export const GFRC: MixRecipe = {
  id: "gfrc",
  name: "Workshop GFRC",
  dryWeight: 1000,
  sandShare: 1,
  binderShare: 1,
  sandBinder: 1,
  pozzolanCement: 0.1,
  waterBinder: 0.26,
  gaugingOfDry: 0,
  polymerType: "acrylic",
  acrylicSolidContent: 0.51,
  acrylicSolidTarget: 0.06,
  plasticizer: 0.03,
  plasticizerWater: 0.65,
  defoamer: 0,
  accelerator: 0.01,
  retarder: 0,
  expander: 0,
  wetting: 0.02,
  hpmc: 0.002,
  fiber: 0.06,
  pigment: 0.08,
  cementType: "grey",
  kind: "final",
  notes: "",
  parts: { ...EMPTY_PARTS, m40: 100 },
};

export const UHPC: MixRecipe = {
  ...GFRC,
  id: "uhpc",
  name: "Workshop UHPC",
  sandShare: 1.4,
  binderShare: 1,
  sandBinder: 1.4,
  pozzolanCement: 0.15,
  waterBinder: 0.2,
  acrylicSolidTarget: 0,
  plasticizer: 0.04,
  defoamer: 0.01,
  accelerator: 0.005,
  wetting: 0,
  hpmc: 0,
  fiber: 0.03,
  pigment: 0.06,
  notes: "Dense-pack sand on Andreasen q=0.23 (20–40 … 300 mesh).",
  // Rounded Andreasen(0.23) parts on current BOUNDS (sum 200).
  parts: { ...EMPTY_PARTS, m25: 32, m40: 70, m60: 23, m80: 12, m200: 42, m300: 21 },
};

export const MICRO_BASE: MixRecipe = {
  ...GFRC,
  id: "micro-base",
  name: "Microcement · base",
  sandShare: 1.2,
  binderShare: 1,
  sandBinder: 1.2,
  pozzolanCement: 0.08,
  gaugingOfDry: 0.35,
  waterBinder: 0.377,
  acrylicSolidTarget: 0.393,
  plasticizer: 0.01,
  defoamer: 0.005,
  accelerator: 0,
  wetting: 0,
  hpmc: 0.003,
  fiber: 0,
  pigment: 0.02,
  cementType: "white",
  notes: "Leveling coat. Gauging ~35% of dry.",
  parts: { ...EMPTY_PARTS, m40: 40, m60: 35, m80: 25 },
};

export const MICRO_FACE: MixRecipe = {
  ...MICRO_BASE,
  id: "micro-face",
  name: "Microcement · face",
  sandShare: 1,
  binderShare: 1,
  sandBinder: 1,
  gaugingOfDry: 0.45,
  waterBinder: 0.441,
  acrylicSolidTarget: 0.459,
  hpmc: 0.004,
  pigment: 0.03,
  notes: "Smooth face over base. Gauging ~45% of dry.",
  parts: { ...EMPTY_PARTS, m80: 40, m200: 45, m300: 15 },
};

export function syncSandBinder<T extends { sandShare: number; binderShare: number; sandBinder: number }>(t: T): T {
  const sand = Number(t.sandShare) || 0;
  const binder = Number(t.binderShare) || 0;
  t.sandBinder = binder > 0 ? sand / binder : 0;
  return t;
}

export function hydrateShares(source: Partial<MixRecipe>, target: MixRecipe): MixRecipe {
  if (source.sandShare != null && source.binderShare != null) {
    target.sandShare = Number(source.sandShare);
    target.binderShare = Number(source.binderShare);
  } else {
    target.sandShare = Number(source.sandBinder) || 0;
    target.binderShare = 1;
  }
  return syncSandBinder(target);
}

export function normalizeRecipe(r: Partial<MixRecipe> & { id: string }): MixRecipe {
  const out: MixRecipe = {
    ...GFRC,
    ...r,
    id: r.id,
    parts: { ...EMPTY_PARTS, ...(r.parts || {}) },
    polymerType: r.polymerType === "rdp" ? "rdp" : "acrylic",
    cementType: r.cementType === "white" ? "white" : "grey",
    kind: r.kind === "experiment" ? "experiment" : "final",
    projectId: r.projectId ? String(r.projectId) : null,
    notes: String(r.notes || ""),
    dryWeight: Number(r.dryWeight) > 0 ? Number(r.dryWeight) : 1000,
    gaugingOfDry: Number(r.gaugingOfDry) > 0 ? Number(r.gaugingOfDry) : 0,
  };
  return hydrateShares(out, out);
}

export function defaultRecipes(): MixRecipe[] {
  return [GFRC, UHPC, MICRO_BASE, MICRO_FACE].map((r) => normalizeRecipe({ ...r }));
}

export function partsTotal(parts: Parts): number {
  return MESHES.reduce((s, m) => s + Number(parts[m.id] || 0), 0);
}

export function fractions(parts: Parts): Record<MeshId, number> {
  const total = partsTotal(parts);
  const out = {} as Record<MeshId, number>;
  MESHES.forEach((m) => {
    out[m.id] = total > 0 ? (parts[m.id] || 0) / total : 0;
  });
  return out;
}

export function andreasen(q = 0.23): number[] {
  const dmax = BOUNDS[0];
  const dmin = BOUNDS[BOUNDS.length - 1];
  const cpft = (d: number) => (d ** q - dmin ** q) / (dmax ** q - dmin ** q);
  return MESHES.map((_, i) => Math.max(0, cpft(BOUNDS[i]) - cpft(BOUNDS[i + 1])));
}

export function fuller(n = 0.45): number[] {
  const D = BOUNDS[0];
  const P = (d: number) => (d / D) ** n;
  return MESHES.map((_, i) => Math.max(0, P(BOUNDS[i]) - P(BOUNDS[i + 1])));
}

export type ComputeResult = {
  binder: number;
  portland: number;
  pozzolan: number;
  sand: number;
  sands: Record<MeshId, number>;
  acrylic: number;
  waterFromAcrylic: number;
  waterGross: number;
  waterToAdd: number;
  admix: Record<string, number>;
  effectiveWB: number;
  wet: number;
  fr: Record<MeshId, number>;
  isRdp: boolean;
  gaugingOfDry: number;
};

export function compute(s: MixRecipe): ComputeResult {
  const fr = fractions(s.parts);
  const binder = (1 / (1 + s.sandBinder)) * s.dryWeight;
  const portland = binder / (1 + s.pozzolanCement);
  const pozzolan = s.pozzolanCement * portland;
  const sand = (s.sandBinder / (1 + s.sandBinder)) * s.dryWeight;
  const sands = Object.fromEntries(MESHES.map((m) => [m.id, fr[m.id] * sand])) as Record<MeshId, number>;
  const isRdp = s.polymerType === "rdp";
  const solidContent = isRdp ? 1 : s.acrylicSolidContent;
  const acrylic = solidContent > 0 ? (s.acrylicSolidTarget * binder) / solidContent : 0;
  const waterFromAcrylic = isRdp ? 0 : (1 - solidContent) * acrylic;
  const gaugingOfDry = Number(s.gaugingOfDry) || 0;
  let waterGross: number;
  let waterToAdd: number;
  if (gaugingOfDry > 0) {
    const gauging = gaugingOfDry * (binder + sand);
    waterToAdd = isRdp ? gauging : Math.max(0, gauging - acrylic);
    waterGross = waterToAdd + waterFromAcrylic;
  } else {
    waterGross = s.waterBinder * binder;
    waterToAdd = waterGross - waterFromAcrylic;
  }
  const admix = {
    plasticizer: s.plasticizer * binder,
    defoamer: s.defoamer * binder,
    accelerator: s.accelerator * binder,
    retarder: s.retarder * binder,
    expander: s.expander * binder,
    wetting: s.wetting * binder,
    hpmc: (s.hpmc || 0) * binder,
    fiber: s.fiber * binder,
    pigment: s.pigment * binder,
  };
  const waterOfBinder = binder > 0 ? waterGross / binder : 0;
  const effectiveWB = waterOfBinder + s.plasticizer * s.plasticizerWater + s.wetting;
  const wet =
    binder + sand + acrylic + waterToAdd +
    admix.plasticizer + admix.defoamer + admix.accelerator + admix.retarder +
    admix.expander + admix.wetting + admix.hpmc + admix.fiber + admix.pigment;
  return {
    binder, portland, pozzolan, sand, sands, acrylic, waterFromAcrylic,
    waterGross, waterToAdd, admix, effectiveWB, wet, fr, isRdp, gaugingOfDry,
  };
}

export function applyWeights(parts: Parts, locks: Locks, weights: number[]): Parts {
  const total = partsTotal(parts) || 200;
  const lockedSum = MESHES.reduce((s, m) => s + (locks[m.id] ? parts[m.id] : 0), 0);
  const unlocked = MESHES.filter((m) => !locks[m.id]);
  if (!unlocked.length) return { ...parts };
  const unlockedWeight = unlocked.reduce((s, m) => {
    const idx = MESHES.findIndex((x) => x.id === m.id);
    return s + weights[idx];
  }, 0);
  const remain = Math.max(0, total - lockedSum);
  const next = { ...parts };
  unlocked.forEach((m) => {
    const idx = MESHES.findIndex((x) => x.id === m.id);
    const w = unlockedWeight > 0 ? weights[idx] / unlockedWeight : 1 / unlocked.length;
    next[m.id] = Math.round(remain * w);
  });
  const drift = total - partsTotal(next);
  if (drift && unlocked.length) next[unlocked[0].id] += drift;
  return next;
}

export function fmt(n: number, d = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });
}

export function pct(n: number): string {
  return (n * 100).toFixed(1) + "%";
}

export async function fetchRecipes(): Promise<MixRecipe[]> {
  const urls = [MIX_LAB_RECIPES_URL, "http://192.168.2.103/api/recipes", "/api/recipes"];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data) && data.length) return data.map((r) => normalizeRecipe(r));
    } catch {
      /* try next */
    }
  }
  return defaultRecipes();
}

export async function fetchMixLog(): Promise<MixLogEntry[]> {
  const urls = [
    MIX_LAB_LOG_URL,
    "http://192.168.2.189/api/mix-log",
    "http://192.168.2.103/api/mix-log",
    "/api/mix-log",
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
      }
    } catch {
      /* try next */
    }
  }
  return [];
}

export async function fetchMixProjects(): Promise<MixProject[]> {
  const urls = [MIX_PROJECTS_URL, "http://192.168.2.189/api/mix-projects", "/api/mix-projects"];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data)) return data;
    } catch {
      /* try next */
    }
  }
  return [];
}

export async function upsertMixProject(
  project: Partial<MixProject> & { title: string; id?: string },
): Promise<MixProject | null> {
  const urls = [MIX_PROJECTS_URL, "http://192.168.2.189/api/mix-projects", "/api/mix-projects"];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
      });
      if (!res.ok) continue;
      return (await res.json()) as MixProject;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function isProjectRecipe(r: { projectId?: string | null }): boolean {
  return Boolean(r.projectId);
}

export function isShopProduction(r: { kind?: string; projectId?: string | null }): boolean {
  return r.kind !== "experiment" && !r.projectId;
}

export async function persistRecipes(list: MixRecipe[]): Promise<boolean> {
  const urls = [MIX_LAB_RECIPES_URL, "http://192.168.2.103/api/recipes", "/api/recipes"];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(list),
      });
      if (res.ok) {
        try {
          localStorage.setItem("mesh-lab-recipes", JSON.stringify(list));
        } catch {
          /* ignore */
        }
        return true;
      }
    } catch {
      /* try next */
    }
  }
  return false;
}

export function sandCurveTargets(presets?: { gfrc: Parts; uhpc: Parts; microBase: Parts; microFace: Parts }) {
  const p = presets || {
    gfrc: GFRC.parts,
    uhpc: UHPC.parts,
    microBase: MICRO_BASE.parts,
    microFace: MICRO_FACE.parts,
  };
  return {
    blends: {
      gfrc: { label: "GFRC", parts: p.gfrc },
      "micro-base": { label: "Micro base", parts: p.microBase },
      "micro-face": { label: "Micro face", parts: p.microFace },
      uhpc: { label: "UHPC", parts: p.uhpc },
    },
    packing: {
      workshop: { label: "Workshop", weights: [56, 52, 52, 40, 0, 0] },
      andreasen: { label: "Andreasen", weights: andreasen(0.23) },
      fuller: { label: "Fuller", weights: fuller(0.45) },
      even: { label: "Even", weights: [1, 1, 1, 1, 1, 1] },
      fine: { label: "Fine", weights: [0.08, 0.1, 0.14, 0.16, 0.24, 0.28] },
      coarse: { label: "Coarse", weights: [0.32, 0.24, 0.18, 0.14, 0.08, 0.04] },
    },
  };
}

export const MESH_COLORS: Record<MeshId, string> = {
  m25: "var(--sand-0)",
  m40: "var(--sand-1)",
  m60: "var(--sand-2)",
  m80: "var(--sand-3)",
  m200: "var(--sand-4)",
  m300: "var(--sand-5)",
};

export const PCT_FIELDS = [
  "pozzolanCement", "waterBinder", "gaugingOfDry", "acrylicSolidContent", "acrylicSolidTarget",
  "plasticizer", "plasticizerWater", "defoamer", "accelerator", "retarder",
  "expander", "wetting", "hpmc", "fiber", "pigment",
] as const;

export type PctField = (typeof PCT_FIELDS)[number];

export const FIBER_DOSES = [
  { id: "light", label: "Light · anti-crack", dry: 0.015, use: "Shrinkage and hairline cracks. Not structural." },
  { id: "medium", label: "Medium · premix", dry: 0.03, use: "Panels, furniture, planters. Usual workshop GFRC." },
  { id: "high", label: "High · structural", dry: 0.05, use: "Thin skins, spray-up, load-bearing GFRC. Harder to mix." },
] as const;

/** Match Mix Lab floor scales (incl. 18 kg shop bag). */
export const SCALE_CHIPS = [
  { g: 500, label: "500 g" },
  { g: 1000, label: "1000 g" },
  { g: 1500, label: "1500 g" },
  { g: 18000, label: "18 kg bag" },
] as const;

export const BATCH_CHIPS = [1, 2, 3, 5, 10] as const;

export type PriceEntry = { amount: number; packKg: number };
export type PriceMap = Record<string, PriceEntry>;

export function hydratePrice(raw: unknown): PriceEntry {
  if (typeof raw === "number") return { amount: raw, packKg: 1 };
  if (raw && typeof raw === "object") {
    const o = raw as { amount?: number; perKg?: number; packKg?: number };
    if (o.amount == null && o.perKg != null && o.packKg == null) {
      return { amount: Number(o.perKg) || 0, packKg: 1 };
    }
    return {
      amount: Number(o.amount) || 0,
      packKg: Number(o.packKg) > 0 ? Number(o.packKg) : 1,
    };
  }
  return { amount: 0, packKg: 1 };
}

export function hydratePriceMap(obj: unknown): PriceMap {
  const out: PriceMap = {};
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;
  Object.keys(obj as object).forEach((id) => {
    out[id] = hydratePrice((obj as Record<string, unknown>)[id]);
  });
  if (!out.portlandGrey && out.portland) out.portlandGrey = hydratePrice(out.portland);
  return out;
}

export function pricePerKg(prices: PriceMap, id: string): number {
  const e = hydratePrice(prices[id]);
  return e.packKg > 0 ? e.amount / e.packKg : 0;
}

/** Material cost for a Mix Lab recipe at its dryWeight scale (same math as Mix Designer). */
export function mixMaterialCost(
  recipe: MixRecipe,
  prices: PriceMap,
): {
  batch: number;
  perKgDry: number;
  perKgWet: number;
  dryKg: number;
  wetKg: number;
  priced: boolean;
  lines: { name: string; grams: number; cost: number; priced: boolean }[];
} {
  const m = compute(recipe);
  const kg = (g: number) => (Number(g) || 0) / 1000;
  const cementType = recipe.cementType === "white" ? "white" : "grey";
  const line = (name: string, grams: number, priceId: string) => {
    const g = Number(grams) || 0;
    const perKg = pricePerKg(prices, priceId);
    return { name, grams: g, cost: kg(g) * perKg, priced: perKg > 0 };
  };
  const lines = [
    line(cementLabel(cementType), m.portland, cementPriceId(cementType)),
    line("Silica fume / metakaolin", m.pozzolan, "pozzolan"),
    ...MESHES.map((x) => line(x.name, m.sands[x.id], x.id)),
    line(m.isRdp ? "VAE RDP" : "Acrylic polymer (liquid)", m.acrylic, m.isRdp ? "rdp" : "acrylic"),
    line("Water", m.waterToAdd, "water"),
    line("Plasticizer", m.admix.plasticizer, "plasticizer"),
    line("Defoamer", m.admix.defoamer, "defoamer"),
    line("Accelerator", m.admix.accelerator, "accelerator"),
    line("Retarder", m.admix.retarder, "retarder"),
    line("Expander / shrinkage", m.admix.expander, "expander"),
    line("Wetting agent", m.admix.wetting, "wetting"),
    line("HPMC", m.admix.hpmc, "hpmc"),
    line("Glass fiber", m.admix.fiber, "fiber"),
    line("Pigment", m.admix.pigment, "pigment"),
  ].filter((row) => row.grams > 1e-9);
  const batch = lines.reduce((s, row) => s + row.cost, 0);
  const dryKg = (recipe.dryWeight || 0) / 1000;
  const wetKg = (m.wet || 0) / 1000;
  const priced = lines.some((l) => l.priced) || Object.keys(prices).some((id) => pricePerKg(prices, id) > 0);
  return {
    lines,
    batch,
    perKgDry: dryKg > 0 ? batch / dryKg : 0,
    perKgWet: wetKg > 0 ? batch / wetKg : 0,
    dryKg,
    wetKg,
    priced,
  };
}

export async function fetchPrices(): Promise<PriceMap> {
  const urls = ["/api/prices", "http://192.168.2.103/api/prices"];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      if (data && typeof data === "object" && !Array.isArray(data)) {
        const map = hydratePriceMap(data);
        try {
          localStorage.setItem("mesh-lab-prices", JSON.stringify(map));
        } catch {
          /* ignore */
        }
        return map;
      }
    } catch {
      /* try next */
    }
  }
  try {
    const stored = JSON.parse(localStorage.getItem("mesh-lab-prices") || "{}");
    return hydratePriceMap(stored);
  } catch {
    return {};
  }
}

export function packingScore(fr: Record<MeshId, number>): number {
  const target = andreasen(0.23);
  const actual = MESHES.map((m) => fr[m.id]);
  const mad = target.reduce((s, t, i) => s + Math.abs(t - actual[i]), 0) / 2;
  return Math.max(0, Math.round((1 - mad) * 100));
}

export function cementLabel(type: "grey" | "white"): string {
  return type === "white" ? "White Portland cement" : "Grey Portland cement";
}

export function cementPriceId(type: "grey" | "white"): string {
  return type === "white" ? "portlandWhite" : "portlandGrey";
}

export type TicketRow =
  | [string, string | number]
  | ["group", string]
  | ["total", string, number];

export function polymerWaterTicketRows(m: ComputeResult): TicketRow[] {
  const rows: TicketRow[] = [];
  if (m.acrylic > 1e-9) {
    rows.push(["group", "Polymer"]);
    rows.push([m.isRdp ? "VAE RDP" : "Acrylic polymer (liquid)", m.acrylic]);
  }
  if (m.waterToAdd > 1e-9) {
    rows.push(["group", "Water"]);
    rows.push(["Water", m.waterToAdd]);
  }
  return rows;
}

/** Shared batch-ticket material rows — Mix designer + Staff both use this. */
export function buildTicketRows(
  state: Pick<MixRecipe, "cementType" | "pozzolanCement">,
  m: ComputeResult,
): TicketRow[] {
  const cementType = state.cementType === "white" ? "white" : "grey";
  const totals = new Set(["Binder total", "Sand total", "Total dry weight"]);
  const rows: TicketRow[] = [
    ["group", "Binder"],
    [cementLabel(cementType), m.portland],
    ["Silica fume / metakaolin", m.pozzolan],
    ["Binder total", m.binder],
    ["group", "Sand"],
    ...MESHES.map((x) => [x.name, m.sands[x.id]] as TicketRow),
    ["Sand total", m.sand],
    ["Total dry weight", m.binder + m.sand],
    ...polymerWaterTicketRows(m),
    ["group", "Admixtures"],
    ["Plasticizer", m.admix.plasticizer],
    ["Defoamer", m.admix.defoamer],
    ["Accelerator", m.admix.accelerator],
    ["Retarder", m.admix.retarder],
    ["Expander / shrinkage", m.admix.expander],
    ["Wetting agent", m.admix.wetting],
    ["HPMC", m.admix.hpmc],
    ["Glass fiber", m.admix.fiber],
    ["Pigment", m.admix.pigment],
    ["total", "Wet batch", m.wet],
  ];
  return rows.filter((row, i, all) => {
    if (row[0] === "total") return true;
    if (row[0] === "group") {
      for (const next of all.slice(i + 1)) {
        if (next[0] === "group" || next[0] === "total") break;
        if (totals.has(String(next[0])) || Number(next[1]) > 1e-9) return true;
      }
      return false;
    }
    return totals.has(String(row[0])) || Number(row[1]) > 1e-9;
  });
}

export function ticketDeepLink(
  recipeId: string,
  dryWeight: number,
  opts?: { label?: string },
): string {
  const grams = Math.max(1, Math.round(Number(dryWeight) || 1000));
  // Hosted on Arcos so Job Production → Staff works even when Mix Lab static pages are stale.
  const url = new URL("http://192.168.2.103/staff.html");
  url.searchParams.set("r", recipeId);
  url.searchParams.set("d", String(grams));
  const label = String(opts?.label || "").trim();
  if (label) url.searchParams.set("n", label);
  return url.toString();
}

/** Print the floor ticket via a hidden iframe (no about:blank tab, no LAN IP page). */
export function printMixTicket(): void {
  const sheet = document.querySelector(".mix-print-sheet");
  if (!sheet) {
    window.print();
    return;
  }

  const existing = document.getElementById("mix-ticket-print-frame");
  if (existing) existing.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "mix-ticket-print-frame";
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    window.print();
    return;
  }

  doc.open();
  // Empty title avoids a second "Batch ticket" in browser print headers.
  doc.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title></title></head><body class="mix-ticket-print-root"></body></html>`,
  );
  doc.close();

  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    doc.head.appendChild(link.cloneNode(true));
  });
  document.querySelectorAll("style").forEach((style) => {
    doc.head.appendChild(style.cloneNode(true));
  });

  const clone = sheet.cloneNode(true) as HTMLElement;
  clone.removeAttribute("hidden");
  clone.removeAttribute("aria-hidden");
  const srcCanvas = sheet.querySelector("canvas.print-qr") as HTMLCanvasElement | null;
  const dstCanvas = clone.querySelector("canvas.print-qr") as HTMLCanvasElement | null;
  if (srcCanvas && dstCanvas) {
    dstCanvas.width = srcCanvas.width;
    dstCanvas.height = srcCanvas.height;
    const ctx = dstCanvas.getContext("2d");
    if (ctx) ctx.drawImage(srcCanvas, 0, 0);
  }
  doc.body.appendChild(clone);

  const cleanup = () => {
    try {
      iframe.remove();
    } catch {
      /* ignore */
    }
  };

  const run = () => {
    try {
      win.focus();
      win.print();
    } finally {
      setTimeout(cleanup, 800);
    }
  };

  if (doc.fonts?.ready) {
    doc.fonts.ready.then(() => setTimeout(run, 40)).catch(() => setTimeout(run, 120));
  } else {
    setTimeout(run, 120);
  }
}

export function recipeFromMix(id: string, source: Partial<MixRecipe> & { parts?: Parts }): MixRecipe {
  return normalizeRecipe({
    ...GFRC,
    ...source,
    id,
    parts: { ...EMPTY_PARTS, ...(source.parts || {}) },
  });
}

export function stampRecipe(rec: MixRecipe, isNew: boolean): MixRecipe {
  const now = new Date().toISOString();
  return {
    ...rec,
    createdAt: isNew || !rec.createdAt ? now : rec.createdAt,
    updatedAt: now,
  };
}

export function formatRecipeDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
}

export function uniqueRecipeName(list: MixRecipe[], name: string, exceptId?: string | null): string {
  const norm = (n: string) => String(n || "").trim().toLowerCase();
  const taken = (n: string) =>
    list.some((r) => r.id !== exceptId && norm(r.name) === norm(n));
  const base = String(name || "").trim() || "Untitled";
  if (!taken(base)) return base;
  let i = 1;
  while (taken(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function rp(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function toPctDisplay(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Number((n * 100).toFixed(3));
}
