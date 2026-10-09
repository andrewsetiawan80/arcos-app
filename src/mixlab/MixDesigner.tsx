import React, { useEffect, useRef, useState } from "react";
import {
  BATCH_CHIPS,
  EMPTY_LOCKS,
  EMPTY_PARTS,
  FIBER_DOSES,
  GFRC,
  MESH_COLORS,
  MESHES,
  MICRO_BASE,
  MICRO_FACE,
  PCT_FIELDS,
  SCALE_CHIPS,
  UHPC,
  applyWeights,
  buildTicketRows,
  cementLabel,
  cementPriceId,
  compute,
  fetchPrices,
  fetchRecipes,
  fetchMixProjects,
  fmt,
  formatRecipeDate,
  isProjectRecipe,
  isShopProduction,
  packingScore,
  partsTotal,
  pct,
  persistRecipes,
  pricePerKg,
  recipeFromMix,
  rp,
  sandCurveTargets,
  stampRecipe,
  syncSandBinder,
  toPctDisplay,
  uniqueRecipeName,
  upsertMixProject,
  type Locks,
  type MixProject,
  type MixRecipe,
  type Parts,
  type PriceMap,
} from "./core";
import BatchTicket from "./BatchTicket";
import { downloadBatchTicketPdf, printBatchTicketPdf } from "./ticketPdf";
import {
  computeMixLabDensity,
  densityToKgPerL,
  fmtDensity,
  DEFAULT_DENSITY_ASSUMPTIONS,
} from "./density";
import "./mixlab.css";

export type { MixRecipe } from "./core";

export type MixDesignerProps = {
  shell: "mixlab" | "arcos";
  /** Prefill working project (e.g. from /app/studio?project=…) */
  initialProjectId?: string | null;
};

type DesignerState = MixRecipe & {
  locks: Locks;
  lastLiquidSolid: number;
  batchCount: number;
  activeRecipeId: string;
};

function cementTypeOf(r: { cementType?: string }): "grey" | "white" {
  return r.cementType === "white" ? "white" : "grey";
}

function recipeKind(r: { kind?: string }): "final" | "experiment" {
  return r.kind === "experiment" ? "experiment" : "final";
}

function recipeFingerprint(s: {
  name?: string;
  dryWeight?: number;
  sandShare?: number;
  binderShare?: number;
  sandBinder?: number;
  pozzolanCement?: number;
  waterBinder?: number;
  gaugingOfDry?: number;
  polymerType?: string;
  acrylicSolidContent?: number;
  acrylicSolidTarget?: number;
  plasticizer?: number;
  plasticizerWater?: number;
  defoamer?: number;
  accelerator?: number;
  retarder?: number;
  expander?: number;
  wetting?: number;
  hpmc?: number;
  fiber?: number;
  pigment?: number;
  cementType?: string;
  kind?: string;
  projectId?: string | null;
  notes?: string;
  parts?: Parts;
}) {
  return JSON.stringify({
    name: s.name || "",
    dryWeight: s.dryWeight,
    sandShare: s.sandShare,
    binderShare: s.binderShare,
    sandBinder: s.sandBinder,
    pozzolanCement: s.pozzolanCement,
    waterBinder: s.waterBinder,
    gaugingOfDry: s.gaugingOfDry,
    polymerType: s.polymerType,
    acrylicSolidContent: s.acrylicSolidContent,
    acrylicSolidTarget: s.acrylicSolidTarget,
    plasticizer: s.plasticizer,
    plasticizerWater: s.plasticizerWater,
    defoamer: s.defoamer,
    accelerator: s.accelerator,
    retarder: s.retarder,
    expander: s.expander,
    wetting: s.wetting,
    hpmc: s.hpmc,
    fiber: s.fiber,
    pigment: s.pigment,
    cementType: s.cementType,
    kind: s.kind,
    projectId: s.projectId || null,
    notes: s.notes || "",
    parts: s.parts,
  });
}

function fiberOfBinder(dryFrac: number, sandBinder: number): number {
  return dryFrac * (1 + (Number(sandBinder) || 0));
}

function frClose(a: number[], b: number[], eps = 0.02): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((v, i) => Math.abs(v - (b[i] || 0)) <= eps);
}

function formatDryScale(dryWeight: number, batchCount: number): string {
  const w = dryWeight;
  const single = w >= 1000 ? `${fmt(w / 1000, 2)} kg dry` : `${fmt(w, 0)} g dry`;
  const n = Math.max(1, Math.round(batchCount || 1));
  if (n <= 1) return single;
  const total = w * n;
  const totalStr = total >= 1000
    ? `${fmt(total / 1000, 2)} kg dry total`
    : `${fmt(total, 0)} g dry total`;
  return `${n}× ${single} · ${totalStr}`;
}

function activeSandCurveId(parts: Parts): string {
  const total = partsTotal(parts);
  if (total <= 0) return "";
  const actual = MESHES.map((m) => (Number(parts[m.id]) || 0) / total);
  const { blends, packing } = sandCurveTargets();
  for (const [id, entry] of Object.entries(blends)) {
    const t = partsTotal(entry.parts);
    if (t <= 0) continue;
    const target = MESHES.map((m) => (Number(entry.parts[m.id]) || 0) / t);
    if (frClose(actual, target)) return id;
  }
  for (const [id, entry] of Object.entries(packing)) {
    const weights = entry.weights;
    const sum = weights.reduce((s, n) => s + n, 0) || 1;
    const target = weights.map((n) => n / sum);
    if (target.length === MESHES.length && frClose(actual, target, 0.025)) return id;
  }
  return "";
}

function sandCurveLabel(id: string): string {
  if (!id) return "custom";
  const { blends, packing } = sandCurveTargets();
  return (blends[id as keyof typeof blends] || packing[id as keyof typeof packing] || {}).label || id;
}

function loadLocalState(): Partial<DesignerState> | null {
  try {
    const saved = JSON.parse(localStorage.getItem("mesh-lab") || "null");
    if (saved && saved.parts) return saved;
  } catch {
    /* ignore */
  }
  return null;
}

function persistLocal(state: DesignerState) {
  try {
    localStorage.setItem(
      "mesh-lab",
      JSON.stringify({
        name: state.name,
        dryWeight: state.dryWeight,
        batchCount: Math.max(1, Math.round(state.batchCount || 1)),
        sandShare: state.sandShare,
        binderShare: state.binderShare,
        sandBinder: state.sandBinder,
        pozzolanCement: state.pozzolanCement,
        cementType: cementTypeOf(state),
        waterBinder: state.waterBinder,
        gaugingOfDry: state.gaugingOfDry || 0,
        polymerType: state.polymerType,
        lastLiquidSolid: state.lastLiquidSolid,
        acrylicSolidContent: state.acrylicSolidContent,
        acrylicSolidTarget: state.acrylicSolidTarget,
        plasticizer: state.plasticizer,
        plasticizerWater: state.plasticizerWater,
        defoamer: state.defoamer,
        accelerator: state.accelerator,
        retarder: state.retarder,
        expander: state.expander,
        wetting: state.wetting,
        hpmc: state.hpmc || 0,
        fiber: state.fiber,
        pigment: state.pigment,
        kind: recipeKind(state),
        notes: state.notes || "",
        parts: state.parts,
        locks: state.locks,
        activeRecipeId: state.activeRecipeId,
        densityAirPct: state.densityAirPct,
        densityHydration: state.densityHydration,
        densityBoundWater: state.densityBoundWater,
        densityFreeWaterRetain: state.densityFreeWaterRetain,
        densityCuredMeasuredKgM3: state.densityCuredMeasuredKgM3,
      }),
    );
  } catch {
    /* ignore */
  }
}

function initialState(): DesignerState {
  const base: DesignerState = {
    ...structuredClone(GFRC),
    locks: { ...EMPTY_LOCKS },
    lastLiquidSolid: 0.51,
    batchCount: 1,
    activeRecipeId: "gfrc",
  };
  const saved = loadLocalState();
  if (!saved) return base;
  const merged: DesignerState = {
    ...base,
    ...saved,
    polymerType: saved.polymerType === "rdp" ? "rdp" : "acrylic",
    parts: { ...EMPTY_PARTS, ...(saved.parts || {}) },
    locks: { ...EMPTY_LOCKS, ...(saved.locks || {}) },
    kind: recipeKind(saved),
    notes: saved.notes || "",
    cementType: cementTypeOf(saved),
    hpmc: saved.hpmc ?? 0,
    lastLiquidSolid: saved.lastLiquidSolid ?? 0.51,
    batchCount: Math.max(1, Math.round(Number(saved.batchCount) || 1)),
    activeRecipeId: saved.activeRecipeId || "gfrc",
  };
  return syncSandBinder(merged);
}

function applyRecipeToState(recipe: MixRecipe, prev: DesignerState): DesignerState {
  const next: DesignerState = {
    ...prev,
    name: recipe.name,
    dryWeight: Number(recipe.dryWeight) > 0 ? Number(recipe.dryWeight) : 1000,
    sandShare: recipe.sandShare,
    binderShare: recipe.binderShare,
    sandBinder: recipe.sandBinder,
    pozzolanCement: recipe.pozzolanCement,
    waterBinder: recipe.waterBinder,
    gaugingOfDry: recipe.gaugingOfDry,
    polymerType: recipe.polymerType === "rdp" ? "rdp" : "acrylic",
    acrylicSolidContent: recipe.acrylicSolidContent,
    acrylicSolidTarget: recipe.acrylicSolidTarget,
    plasticizer: recipe.plasticizer,
    plasticizerWater: recipe.plasticizerWater,
    defoamer: recipe.defoamer,
    accelerator: recipe.accelerator,
    retarder: recipe.retarder,
    expander: recipe.expander,
    wetting: recipe.wetting,
    hpmc: recipe.hpmc || 0,
    fiber: recipe.fiber,
    pigment: recipe.pigment,
    cementType: cementTypeOf(recipe),
    kind: recipeKind(recipe),
    projectId: recipe.projectId || null,
    notes: recipe.notes || "",
    parts: { ...EMPTY_PARTS, ...recipe.parts },
    activeRecipeId: recipe.id,
    densityAirPct: recipe.densityAirPct,
    densityHydration: recipe.densityHydration,
    densityBoundWater: recipe.densityBoundWater,
    densityFreeWaterRetain: recipe.densityFreeWaterRetain,
    densityCuredMeasuredKgM3: recipe.densityCuredMeasuredKgM3,
  };
  return syncSandBinder(next);
}

function currentAsRecipe(state: DesignerState, id: string): MixRecipe {
  return recipeFromMix(id, {
    name: state.name,
    dryWeight: state.dryWeight,
    sandShare: state.sandShare,
    binderShare: state.binderShare,
    sandBinder: state.sandBinder,
    pozzolanCement: state.pozzolanCement,
    waterBinder: state.waterBinder,
    gaugingOfDry: state.gaugingOfDry,
    polymerType: state.polymerType,
    acrylicSolidContent: state.acrylicSolidContent,
    acrylicSolidTarget: state.acrylicSolidTarget,
    plasticizer: state.plasticizer,
    plasticizerWater: state.plasticizerWater,
    defoamer: state.defoamer,
    accelerator: state.accelerator,
    retarder: state.retarder,
    expander: state.expander,
    wetting: state.wetting,
    hpmc: state.hpmc,
    fiber: state.fiber,
    pigment: state.pigment,
    cementType: state.cementType,
    kind: recipeKind(state),
    projectId: state.projectId || null,
    notes: state.notes,
    parts: state.parts,
    densityAirPct: state.densityAirPct,
    densityHydration: state.densityHydration,
    densityBoundWater: state.densityBoundWater,
    densityFreeWaterRetain: state.densityFreeWaterRetain,
    densityCuredMeasuredKgM3: state.densityCuredMeasuredKgM3,
  });
}

export default function MixDesigner({
  shell,
  initialProjectId = null,
}: MixDesignerProps) {
  const [state, setState] = useState<DesignerState>(() => {
    const base = initialState();
    if (initialProjectId) return { ...base, projectId: initialProjectId, kind: "experiment" };
    return base;
  });
  const [recipes, setRecipes] = useState<MixRecipe[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("mesh-lab-recipes") || "null");
      if (Array.isArray(stored) && stored.length) {
        return stored.map((r: MixRecipe) => recipeFromMix(r.id, r));
      }
    } catch {
      /* ignore */
    }
    return [GFRC, UHPC, MICRO_BASE, MICRO_FACE].map((r) => recipeFromMix(r.id, r));
  });
  const [projects, setProjects] = useState<MixProject[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [saveStatus, setSaveStatus] = useState<{ msg: string; kind: "" | "ok" | "warn" }>({
    msg: "",
    kind: "",
  });
  const [dialogRecipeId, setDialogRecipeId] = useState("");
  const [saveAsNewPending, setSaveAsNewPending] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [printBusy, setPrintBusy] = useState(false);
  const [printIncludeCost, setPrintIncludeCost] = useState(false);
  const recipeDialogRef = useRef<HTMLDialogElement>(null);
  const saveDialogRef = useRef<HTMLDialogElement>(null);
  const printDialogRef = useRef<HTMLDialogElement>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootstrappedUrl = useRef(false);
  const cleanFingerprint = useRef<string>("");

  const showStatus = (msg: string, kind: "" | "ok" | "warn" = "", ms = 4000) => {
    setSaveStatus({ msg, kind });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    if (msg) {
      statusTimer.current = setTimeout(() => setSaveStatus({ msg: "", kind: "" }), ms);
    }
  };

  useEffect(() => {
    persistLocal(state);
  }, [state]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [remoteRecipes, remotePrices, remoteProjects] = await Promise.all([
        fetchRecipes(),
        fetchPrices(),
        fetchMixProjects(),
      ]);
      if (cancelled) return;
      setRecipes(remoteRecipes);
      setPrices(remotePrices);
      setProjects(remoteProjects);

      if (!bootstrappedUrl.current) {
        bootstrappedUrl.current = true;
        const params = new URLSearchParams(window.location.search);
        const projectQ = initialProjectId || params.get("project") || "";
        const recipeQ = params.get("recipe") || params.get("r") || "";
        if (recipeQ) {
          const found = remoteRecipes.find((r) => r.id === recipeQ);
          if (found) {
            setState((prev) => {
              const next = applyRecipeToState(found, prev);
              cleanFingerprint.current = recipeFingerprint(next);
              return next;
            });
          }
        } else if (projectQ) {
          const linked = remoteRecipes.find((r) => r.projectId === projectQ);
          const proj = remoteProjects.find((p) => p.id === projectQ);
          if (linked) {
            setState((prev) => {
              const next = applyRecipeToState(linked, prev);
              cleanFingerprint.current = recipeFingerprint(next);
              return next;
            });
          } else {
            setState((prev) => {
              const next = {
                ...prev,
                projectId: projectQ,
                kind: "experiment" as const,
                name: proj?.title ? `${proj.title} mix` : prev.name,
                activeRecipeId: "",
              };
              cleanFingerprint.current = recipeFingerprint(next);
              return next;
            });
          }
        }
      }
    })();
    const refresh = () => {
      Promise.all([fetchRecipes(), fetchPrices(), fetchMixProjects()]).then(([r, p, proj]) => {
        if (cancelled) return;
        setRecipes(r);
        setPrices(p);
        setProjects(proj);
      });
    };
    const onFocus = () => refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "mesh-lab-prices") return;
      fetchPrices().then((p) => {
        if (!cancelled) setPrices(p);
      });
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
      if (statusTimer.current) clearTimeout(statusTimer.current);
    };
  }, [initialProjectId]);

  const patch = (partial: Partial<DesignerState>) => {
    setState((prev) => syncSandBinder({ ...prev, ...partial }));
  };

  const setPctField = (key: (typeof PCT_FIELDS)[number], display: number) => {
    setState((prev) => {
      let next = { ...prev, [key]: (Number(display) || 0) / 100 } as DesignerState;
      if (key === "acrylicSolidContent" || prev.polymerType === "rdp") {
        /* polymer sync below */
      }
      if (prev.polymerType === "rdp") {
        if (next.acrylicSolidContent > 0 && next.acrylicSolidContent < 1) {
          next.lastLiquidSolid = next.acrylicSolidContent;
        }
        next.acrylicSolidContent = 1;
      } else if (next.lastLiquidSolid && next.acrylicSolidContent >= 1) {
        next.acrylicSolidContent = next.lastLiquidSolid;
      } else if (next.acrylicSolidContent > 0 && next.acrylicSolidContent < 1) {
        next.lastLiquidSolid = next.acrylicSolidContent;
      }
      return syncSandBinder(next);
    });
  };

  const setPolymerType = (value: "acrylic" | "rdp") => {
    setState((prev) => {
      const next = { ...prev, polymerType: value };
      if (value === "rdp") {
        if (prev.acrylicSolidContent > 0 && prev.acrylicSolidContent < 1) {
          next.lastLiquidSolid = prev.acrylicSolidContent;
        }
        next.acrylicSolidContent = 1;
      } else if (prev.lastLiquidSolid) {
        next.acrylicSolidContent = prev.lastLiquidSolid;
      }
      return next;
    });
  };

  const m = compute(state);
  const dens = computeMixLabDensity(currentAsRecipe(state, state.activeRecipeId || "draft"));
  const batches = Math.max(1, Math.round(state.batchCount || 1));
  const totalParts = partsTotal(state.parts);
  const score = packingScore(m.fr);
  const curveId = activeSandCurveId(state.parts);
  const { blends, packing } = sandCurveTargets();
  const isRdp = state.polymerType === "rdp";
  const active = recipes.find((r) => r.id === state.activeRecipeId);
  const kind = recipeKind(state);

  const ticketRows = buildTicketRows(state, m);

  const cost = (() => {
    const kg = (g: number) => (Number(g) || 0) / 1000;
    const line = (name: string, grams: number, priceId: string) => {
      const g = Number(grams) || 0;
      const perKg = pricePerKg(prices, priceId);
      return { name, grams: g, cost: kg(g) * perKg, priced: perKg > 0 };
    };
    const lines = [
      line(cementLabel(cementTypeOf(state)), m.portland, cementPriceId(cementTypeOf(state))),
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
    const dryKg = (state.dryWeight || 0) / 1000;
    const wetKg = (m.wet || 0) / 1000;
    const priced = lines.some((l) => l.priced) || Object.keys(prices).some((id) => pricePerKg(prices, id) > 0);
    return {
      lines,
      batch,
      perKgDry: dryKg > 0 ? batch / dryKg : 0,
      perKgWet: wetKg > 0 ? batch / wetKg : 0,
      priced,
    };
  })();

  const gauging = Number(state.gaugingOfDry) || 0;
  const gaugingBit = gauging > 0
    ? ` Gauging liquid ${(gauging * 100).toFixed(0)}% of dry${m.isRdp ? " (all as water for RDP)" : ""}.`
    : "";

  const packNote =
    score >= 85
      ? "Close to a dense continuous grading. Good default for UHPC."
      : score >= 65
        ? "Workable workshop blend. A little coarser than the dense-pack curve — typical for GFRC."
        : "Gap or spike in the grading. Fine for a look, weaker for packing.";

  const fiberMatch = FIBER_DOSES.find(
    (d) => Math.abs((state.fiber || 0) - fiberOfBinder(d.dry, state.sandBinder)) < 0.002,
  );
  const dryPct = state.sandBinder >= 0 ? ((state.fiber || 0) / (1 + state.sandBinder)) * 100 : 0;

  const production = recipes.filter((r) => isShopProduction(r));
  const projectRecipes = recipes.filter((r) => isProjectRecipe(r));
  const exp = recipes.filter((r) => recipeKind(r) === "experiment" && !isProjectRecipe(r));
  const workingProject = projects.find((p) => p.id === state.projectId) || null;
  const hasProjectLink = Boolean(state.projectId);

  const saveRecipeList = async (
    nextList: MixRecipe[],
    nextId: string,
    finalName: string,
    renamed: boolean,
  ) => {
    setRecipes(nextList);
    setState((prev) => {
      const next = { ...prev, name: finalName, activeRecipeId: nextId };
      markClean(next);
      return next;
    });
    showStatus("Saving…", "warn", 6000);
    const ok = await persistRecipes(nextList);
    if (!ok) {
      showStatus("Could not reach Mix Lab. Recipe was not saved.", "warn", 6000);
      return false;
    }
    showStatus(
      renamed
        ? `Saved as “${finalName}” — that name already exists.`
        : `Saved “${finalName}”.`,
      renamed ? "warn" : "ok",
      renamed ? 6000 : 3000,
    );
    return true;
  };

  const linkRecipeToProject = async (recipeId: string, projectId: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return false;
    const updated = await upsertMixProject({
      id: proj.id,
      title: proj.title,
      clientName: proj.clientName || null,
      status: proj.status || "trial",
      mixRecipeId: recipeId,
      baseRecipeId: proj.baseRecipeId || null,
      notes: proj.notes || "",
    });
    if (updated) {
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    }
    return Boolean(updated);
  };

  const saveToProject = async () => {
    const projectId = state.projectId;
    if (!projectId) {
      showStatus("Pick a project first.", "warn");
      return;
    }
    const proj = projects.find((p) => p.id === projectId);
    const rawName =
      (state.name || "").trim() ||
      (proj ? `${proj.title} mix` : "Project mix");
    const existingId =
      state.activeRecipeId && recipes.some((r) => r.id === state.activeRecipeId)
        ? state.activeRecipeId
        : null;
    const finalName = uniqueRecipeName(recipes, rawName, existingId);
    const stamped = stampRecipe(
      currentAsRecipe(
        { ...state, name: finalName, kind: "experiment", projectId },
        existingId || `r-${Date.now()}`,
      ),
      !existingId,
    );
    const nextList = existingId
      ? recipes.map((r) => (r.id === existingId ? stamped : r))
      : [...recipes, stamped];
    const ok = await saveRecipeList(nextList, stamped.id, finalName, finalName !== rawName);
    if (!ok) return;
    const linked = await linkRecipeToProject(stamped.id, projectId);
    showStatus(
      linked
        ? `Saved as project recipe for “${proj?.title || projectId}”.`
        : `Recipe saved, but could not update project link.`,
      linked ? "ok" : "warn",
      5000,
    );
  };
  const dialogRecipe = recipes.find((r) => r.id === dialogRecipeId);

  const useRecipe = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) return;
    setState((prev) => {
      const next = applyRecipeToState(recipe, prev);
      cleanFingerprint.current = recipeFingerprint(next);
      return next;
    });
  };

  const markClean = (s: DesignerState) => {
    cleanFingerprint.current = recipeFingerprint(s);
  };

  // Establish clean baseline once helpers exist
  useEffect(() => {
    if (!cleanFingerprint.current) markClean(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = () => {
    if (!cleanFingerprint.current) return false;
    return recipeFingerprint(state) !== cleanFingerprint.current;
  };

  const confirmDiscardIfDirty = (actionLabel: string) => {
    if (!isDirty()) return true;
    return window.confirm(
      `You have unsaved changes. Discard them and ${actionLabel}?`,
    );
  };

  const loadRecipeById = (id: string) => {
    if (!id || !recipes.find((r) => r.id === id)) return;
    if (id === state.activeRecipeId && !isDirty()) return;
    if (!confirmDiscardIfDirty("load this recipe")) return;
    useRecipe(id);
    showStatus(`Loaded “${recipes.find((r) => r.id === id)?.name || id}”.`, "ok", 2000);
  };

  const openRecipeDialog = (id: string) => {
    if (!recipes.find((r) => r.id === id)) return;
    setDialogRecipeId(id);
    recipeDialogRef.current?.showModal();
  };

  const closeRecipeDialog = () => {
    recipeDialogRef.current?.close();
    setDialogRecipeId("");
  };

  const loadPreset = async (id: string, source: MixRecipe) => {
    if (!confirmDiscardIfDirty(`load “${source.name || id}”`)) return;
    // While on a project: use shop base as a starting formula, don't switch to the shop recipe.
    if (state.projectId) {
      const proj = projects.find((p) => p.id === state.projectId);
      setState((prev) => {
        const next = syncSandBinder({
          ...applyRecipeToState(recipeFromMix(`draft-${Date.now()}`, source), prev),
          projectId: prev.projectId,
          kind: "experiment",
          activeRecipeId: "",
          name: `${proj?.title || "Project"} · from ${source.name || id}`,
        });
        markClean(next);
        return next;
      });
      showStatus(`Loaded “${source.name}” as project starting mix. Save to project when ready.`, "ok", 4000);
      return;
    }
    const rec = stampRecipe(recipeFromMix(id, source), !recipes.some((r) => r.id === id));
    let nextList: MixRecipe[];
    if (recipes.some((r) => r.id === id)) {
      nextList = recipes.map((r) =>
        r.id === id ? { ...rec, createdAt: r.createdAt || rec.createdAt } : r,
      );
    } else if (id === "gfrc") {
      nextList = [rec, ...recipes];
    } else {
      nextList = [...recipes, rec];
    }
    setRecipes(nextList);
    setState((prev) => {
      const next = applyRecipeToState(rec, prev);
      markClean(next);
      return next;
    });
    await persistRecipes(nextList);
  };

  const deleteRecipeById = async (id: string) => {
    const r = recipes.find((x) => x.id === id);
    if (!r || !confirm(`Delete “${r.name || "Untitled"}”? This cannot be undone.`)) return;
    const nextList = recipes.filter((x) => x.id !== id);
    setRecipes(nextList);
    if (state.activeRecipeId === id) {
      const next = nextList[0];
      if (next) setState((prev) => applyRecipeToState(next, prev));
      else patch({ activeRecipeId: "", name: "Untitled mix" });
    }
    const ok = await persistRecipes(nextList);
    closeRecipeDialog();
    showStatus(ok ? "Recipe deleted." : "Could not update server.", ok ? "ok" : "warn");
  };

  const openSaveDialog = (asNew: boolean) => {
    setSaveAsNewPending(asNew);
    const defaultName = active?.name || state.name || "Untitled";
    setSaveName(defaultName);
    saveDialogRef.current?.showModal();
    requestAnimationFrame(() => {
      const el = document.getElementById("saveRecipeName") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });
  };

  const confirmSave = async () => {
    const rawName = (saveName || "").trim() || "Untitled";
    saveDialogRef.current?.close();
    const asNew = saveAsNewPending;
    const currentId = asNew ? null : state.activeRecipeId;
    const finalName = uniqueRecipeName(recipes, rawName, currentId);
    const renamed = finalName !== rawName;

    let nextList: MixRecipe[];
    let nextId: string;
    if (!asNew && currentId && recipes.some((r) => r.id === currentId)) {
      const updated = stampRecipe(
        currentAsRecipe({ ...state, name: finalName }, currentId),
        false,
      );
      nextList = recipes.map((r) => (r.id === currentId ? updated : r));
      nextId = currentId;
    } else {
      const created = stampRecipe(
        currentAsRecipe({ ...state, name: finalName }, `r-${Date.now()}`),
        true,
      );
      nextList = [...recipes, created];
      nextId = created.id;
    }
    const ok = await saveRecipeList(nextList, nextId, finalName, renamed);
    if (ok && state.projectId) {
      await linkRecipeToProject(nextId, state.projectId);
    }
  };

  const printMeta = (() => {
    const when = new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    const polymer = state.polymerType === "rdp" ? "Dry VAE RDP" : "Liquid acrylic";
    return `${when} · ${formatDryScale(state.dryWeight, batches)} · Sand : binder ${state.sandShare}:${state.binderShare} · ${cementLabel(cementTypeOf(state))} · ${polymer}`;
  })();

  const ticketPdfOpts = (includeCost: boolean) => ({
    name: state.name || "Untitled mix",
    meta: printMeta,
    rows: ticketRows,
    batches,
    wbLabel: pct(m.effectiveWB),
    portlandLabel: pct(1 / (1 + state.pozzolanCement)),
    pozzolanLabel: pct(state.pozzolanCement / (1 + state.pozzolanCement)),
    waterGrossG: m.waterGross,
    waterFromAcrylicG: m.waterFromAcrylic,
    isRdp: m.isRdp,
    recipeId: state.activeRecipeId || null,
    dryWeight: state.dryWeight,
    includeCost,
    cost,
  });

  const runTicketPdf = async (mode: "print" | "download") => {
    printDialogRef.current?.close();
    setPrintBusy(true);
    try {
      const opts = ticketPdfOpts(printIncludeCost);
      if (mode === "print") await printBatchTicketPdf(opts);
      else await downloadBatchTicketPdf(opts);
      const costBit = printIncludeCost ? " + cost" : "";
      showStatus(mode === "print" ? `Print dialog opened${costBit}.` : `Downloaded ticket${costBit} PDF.`, "ok");
    } catch {
      showStatus("Could not build ticket PDF.", "warn");
    } finally {
      setPrintBusy(false);
    }
  };

  const recipeLabel = (r: MixRecipe) => {
    const when = formatRecipeDate(r.updatedAt || r.createdAt);
    const base = r.name || "Untitled";
    return when ? `${base} · ${when}` : base;
  };

  const numInput = (
    id: string,
    value: number | string,
    onChange: (n: number) => void,
    extra?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <input
      type="number"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      onBlur={(e) => {
        if (e.target.value === "" || e.target.value === "-" || e.target.value === ".") {
          onChange(0);
        }
      }}
      {...extra}
    />
  );

  return (
    <div className="mixlab-root" data-shell={shell}>
      <div className="wrap">
        <header className="no-print">
          <div className="brand">
            <div className="eyebrow">
              {shell === "arcos" ? "Recipes · shop + projects" : "Mix Lab · shop + projects"}
            </div>
            <h1>{shell === "arcos" ? "Mix designer" : "Recipe builder"}</h1>
            <p className="sub">
              Shop bases are Production. Customer work is a Project: start from scratch or a base, then save as the project recipe.
              {shell === "arcos" ? " Promote to an Arcos base only when approved." : ""}
            </p>
          </div>
          <div className="header-actions">
            <button
              className={`btn${state.activeRecipeId === "gfrc" ? " active" : ""}`}
              type="button"
              onClick={() => loadPreset("gfrc", GFRC)}
            >
              GFRC
            </button>
            <button
              className={`btn${state.activeRecipeId === "uhpc" ? " active" : ""}`}
              type="button"
              onClick={() => loadPreset("uhpc", UHPC)}
            >
              UHPC
            </button>
            <button
              className={`btn${state.activeRecipeId === "micro-base" ? " active" : ""}`}
              type="button"
              onClick={() => loadPreset("micro-base", MICRO_BASE)}
            >
              Micro base
            </button>
            <button
              className={`btn${state.activeRecipeId === "micro-face" ? " active" : ""}`}
              type="button"
              onClick={() => loadPreset("micro-face", MICRO_FACE)}
            >
              Micro face
            </button>
            <button
              className="btn ghost"
              type="button"
              disabled={printBusy}
              onClick={() => printDialogRef.current?.showModal()}
            >
              {printBusy ? "Building…" : "Print / download"}
            </button>
          </div>
        </header>

        <div className="grid">
          <section className="card card-recipe no-print">
            <h2>Recipes</h2>
            <p className="notes">
              Pick a recipe to load it. Use <b>Options</b> for promote, copy, or delete. Unsaved edits will ask before switching.
            </p>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Working on project</label>
              <select
                value={state.projectId || ""}
                onChange={(e) => {
                  const id = e.target.value || null;
                  const proj = projects.find((p) => p.id === id);
                  const linked = id ? recipes.find((r) => r.projectId === id) : null;
                  if (linked) {
                    setState((prev) => applyRecipeToState(linked, prev));
                    return;
                  }
                  patch({
                    projectId: id,
                    kind: id ? "experiment" : state.kind,
                    name: id && proj ? `${proj.title} mix` : state.name,
                  });
                }}
              >
                <option value="">— Shop / no project —</option>
                {projects
                  .filter((p) => p.status === "trial" || p.status === "active")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.clientName ? `${p.clientName} · ` : "") + p.title}
                    </option>
                  ))}
              </select>
              {workingProject ? (
                <p className="notes" style={{ marginTop: 8 }}>
                  {workingProject.mixRecipeId
                    ? `Linked recipe: ${workingProject.mixRecipeId}`
                    : "No recipe yet — mix from a base or scratch, then Save to project."}
                  {shell === "arcos" ? (
                    <>
                      {" "}
                      <a href="/app/mix-projects" style={{ color: "inherit" }}>
                        All projects →
                      </a>
                    </>
                  ) : (
                    <>
                      {" "}
                      <a href="projects.html" style={{ color: "inherit" }}>
                        All projects →
                      </a>
                    </>
                  )}
                </p>
              ) : null}
            </div>
            <div className="load-row">
              <div className="field">
                <label>Load a recipe</label>
                <select
                  id="recipeSelect"
                  value={state.activeRecipeId && recipes.some((r) => r.id === state.activeRecipeId) ? state.activeRecipeId : ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) loadRecipeById(id);
                  }}
                >
                  <option value="">Load a recipe…</option>
                  {production.length > 0 && (
                    <optgroup label="Production (shop)">
                      {production.map((r) => (
                        <option key={r.id} value={r.id}>{recipeLabel(r)}</option>
                      ))}
                    </optgroup>
                  )}
                  {projectRecipes.length > 0 && (
                    <optgroup label="Projects">
                      {projectRecipes.map((r) => {
                        const p = projects.find((x) => x.id === r.projectId);
                        const tag = p ? `${p.title} · ` : "";
                        return (
                          <option key={r.id} value={r.id}>{tag}{recipeLabel(r)}</option>
                        );
                      })}
                    </optgroup>
                  )}
                  {exp.length > 0 && (
                    <optgroup label="Experiments">
                      {exp.map((r) => (
                        <option key={r.id} value={r.id}>{recipeLabel(r)}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  const id = state.activeRecipeId;
                  if (!id || !recipes.some((r) => r.id === id)) {
                    showStatus("Load a recipe first, then open Options.", "warn");
                    return;
                  }
                  openRecipeDialog(id);
                }}
              >
                Options
              </button>
            </div>
            <div className="loaded">
              <div>
                <span className={`badge ${hasProjectLink ? "project" : kind}`}>
                  {hasProjectLink ? "Project" : kind === "experiment" ? "Experiment" : "Production"}
                </span>
                <strong>{state.name || "Untitled"}</strong>
                <span className="loaded-date">
                  {(() => {
                    const when = formatRecipeDate(active?.updatedAt || active?.createdAt);
                    return when ? `Saved ${when}` : "";
                  })()}
                </span>
              </div>
            </div>
            <div className="kind-row">
              <button
                className={`chip${kind === "final" && !hasProjectLink ? " on" : ""}`}
                type="button"
                onClick={() => patch({ kind: "final", projectId: null })}
              >
                Production
              </button>
              <button
                className={`chip${kind === "experiment" && !hasProjectLink ? " on" : ""}`}
                type="button"
                onClick={() => patch({ kind: "experiment", projectId: null })}
              >
                Experiment
              </button>
              <button
                className={`chip${hasProjectLink ? " on" : ""}`}
                type="button"
                disabled={!projects.length}
                onClick={() => {
                  if (state.projectId) return;
                  const first = projects.find((p) => p.status === "trial" || p.status === "active");
                  if (first) patch({ kind: "experiment", projectId: first.id });
                }}
              >
                Project
              </button>
            </div>
            <div className="field">
              <label>
                Notes{" "}
                <span>
                  {hasProjectLink
                    ? "trial notes for this job"
                    : kind === "experiment"
                      ? "what you are trying"
                      : "optional for production mixes"}
                </span>
              </label>
              <textarea
                id="recipeNotes"
                value={state.notes || ""}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="What changed, why, and what to watch on the next batch."
              />
            </div>
            <div className="save-row">
              <button className="btn primary" type="button" onClick={() => openSaveDialog(false)}>Save</button>
              <button className="btn" type="button" onClick={() => openSaveDialog(true)}>Save as new</button>
              <button
                className="btn primary"
                type="button"
                hidden={!hasProjectLink}
                onClick={() => saveToProject()}
              >
                Save to project
              </button>
              <button
                className="btn danger"
                type="button"
                hidden={!active}
                onClick={() => {
                  if (state.activeRecipeId) deleteRecipeById(state.activeRecipeId);
                }}
              >
                Delete recipe
              </button>
              <p className={`save-status${saveStatus.kind ? ` ${saveStatus.kind}` : ""}`} aria-live="polite">
                {saveStatus.msg}
              </p>
            </div>

            <h2>Batch size</h2>
            <div className="chips">
              {SCALE_CHIPS.map((s) => (
                <button
                  key={s.g}
                  className={`chip${state.dryWeight === s.g ? " on" : ""}`}
                  type="button"
                  onClick={() => patch({ dryWeight: s.g })}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="row2">
              <div className="field">
                <label>Target dry weight <b>binder + sand</b></label>
                {numInput("dryWeight", state.dryWeight, (n) => patch({ dryWeight: n }), { min: 1, step: 100 })}
              </div>
              <div className="field">
                <label>Number of batches</label>
                {numInput("batchCount", batches, (n) => patch({ batchCount: Math.max(1, Math.round(n || 1)) }), { min: 1, step: 1 })}
              </div>
            </div>
            <div className="chips">
              {BATCH_CHIPS.map((n) => (
                <button
                  key={n}
                  className={`chip${batches === n ? " on" : ""}`}
                  type="button"
                  onClick={() => patch({ batchCount: n })}
                >
                  {n}×
                </button>
              ))}
            </div>
          </section>

          <section className="card card-mix no-print">
            <h2>Mix design</h2>
            <div className="field">
              <label>Portland cement</label>
              <select
                value={cementTypeOf(state)}
                onChange={(e) => patch({ cementType: e.target.value === "white" ? "white" : "grey" })}
              >
                <option value="grey">Grey Portland</option>
                <option value="white">White Portland</option>
              </select>
            </div>
            <div className="field">
              <label>Sand : binder</label>
              <div className="ratio">
                {numInput("sandShare", state.sandShare, (n) => patch({ sandShare: n }), { min: 0, step: 0.1 })}
                <span className="colon">:</span>
                {numInput("binderShare", state.binderShare, (n) => patch({ binderShare: n }), { min: 0, step: 0.1 })}
              </div>
            </div>
            <div className="field">
              <label>Pozzolan / cement <b>%</b></label>
              {numInput("pozzolanCement", toPctDisplay(state.pozzolanCement), (n) => setPctField("pozzolanCement", n), { min: 0, step: 1 })}
            </div>
            <div className="field">
              <label>Polymer</label>
              <select
                value={state.polymerType === "rdp" ? "rdp" : "acrylic"}
                onChange={(e) => setPolymerType(e.target.value === "rdp" ? "rdp" : "acrylic")}
              >
                <option value="acrylic">Liquid acrylic polymer</option>
                <option value="rdp">Dry VAE RDP</option>
              </select>
            </div>
            <div className="row2">
              <div className="field">
                <label>Water / binder <b>%</b></label>
                {numInput("waterBinder", toPctDisplay(state.waterBinder), (n) => setPctField("waterBinder", n), { min: 0, step: 1 })}
              </div>
              <div className="field">
                <label>Gauging liquid / dry <b>%</b></label>
                {numInput("gaugingOfDry", toPctDisplay(state.gaugingOfDry), (n) => setPctField("gaugingOfDry", n), { min: 0, step: 1 })}
              </div>
            </div>
            <p className="notes" style={{ marginTop: -4 }}>
              Microcement: set gauging liquid / dry (e.g. 35 base, 45 face). Same paste wetness for liquid acrylic or RDP. Leave 0 for GFRC / UHPC (uses water / binder only).
            </p>
            <div className="row2">
              <div className="field" style={{ display: isRdp ? "none" : undefined }}>
                <label>Polymer solid content <b>%</b></label>
                {numInput(
                  "acrylicSolidContent",
                  isRdp ? 100 : toPctDisplay(state.acrylicSolidContent),
                  (n) => setPctField("acrylicSolidContent", n),
                  { min: 0, max: 100, step: 1 },
                )}
              </div>
              <div className="field">
                <label>
                  {isRdp ? (
                    <>VAE RDP <b>% of binder</b></>
                  ) : (
                    <>Polymer solid target <b>% of binder</b></>
                  )}
                </label>
                {numInput(
                  "acrylicSolidTarget",
                  toPctDisplay(state.acrylicSolidTarget),
                  (n) => setPctField("acrylicSolidTarget", n),
                  { min: 0, max: 100, step: 0.5 },
                )}
              </div>
            </div>
            <h2 style={{ marginTop: 8 }}>Admixtures · % of binder</h2>
            <div className="row2 admix">
              <div className="field">
                <label>Plasticizer <b>%</b></label>
                {numInput("plasticizer", toPctDisplay(state.plasticizer), (n) => setPctField("plasticizer", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>SP water <b>%</b></label>
                {numInput("plasticizerWater", toPctDisplay(state.plasticizerWater), (n) => setPctField("plasticizerWater", n), { min: 0, max: 100, step: 1 })}
              </div>
              <div className="field">
                <label>Defoamer <b>%</b></label>
                {numInput("defoamer", toPctDisplay(state.defoamer), (n) => setPctField("defoamer", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>Accelerator <b>%</b></label>
                {numInput("accelerator", toPctDisplay(state.accelerator), (n) => setPctField("accelerator", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>Retarder <b>%</b></label>
                {numInput("retarder", toPctDisplay(state.retarder), (n) => setPctField("retarder", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>Expander <b>%</b></label>
                {numInput("expander", toPctDisplay(state.expander), (n) => setPctField("expander", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>Wetting agent <b>%</b></label>
                {numInput("wetting", toPctDisplay(state.wetting), (n) => setPctField("wetting", n), { min: 0, step: 0.1 })}
              </div>
              <div className="field">
                <label>HPMC <b>%</b></label>
                {numInput("hpmc", toPctDisplay(state.hpmc), (n) => setPctField("hpmc", n), { min: 0, step: 0.05 })}
              </div>
            </div>
            <div className="field">
              <label>Pigment <b>% of binder</b></label>
              {numInput("pigment", toPctDisplay(state.pigment), (n) => setPctField("pigment", n), { min: 0, step: 0.5 })}
            </div>
            <div className="field">
              <label>Glass fiber <b>% of binder</b></label>
              {numInput("fiber", toPctDisplay(state.fiber), (n) => setPctField("fiber", n), { min: 0, step: 0.1 })}
              <div className="chips" style={{ margin: "8px 0 0" }}>
                {FIBER_DOSES.map((d) => {
                  const on = Math.abs((state.fiber || 0) - fiberOfBinder(d.dry, state.sandBinder)) < 0.002;
                  return (
                    <button
                      key={d.id}
                      className={`chip${on ? " on" : ""}`}
                      type="button"
                      onClick={() => patch({ fiber: fiberOfBinder(d.dry, state.sandBinder) })}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="notes">
                {fiberMatch
                  ? `${fiberMatch.use} ≈ ${dryPct.toFixed(1)}% of dry mix.`
                  : `Custom dose. ≈ ${dryPct.toFixed(1)}% of dry mix.`}
              </p>
            </div>
          </section>

          <section className="card card-sand no-print">
            <div className="sand-head">
              <div>
                <h2>Sand mesh combo</h2>
                <p>These pills only change sand grading — they do not load the full recipe. Use the recipe buttons / list above for that.</p>
              </div>
            </div>
            <p className="sand-active">
              Current sand: <b>{curveId ? sandCurveLabel(curveId) : "custom"}</b>
            </p>
            <div className="curve-groups">
              {[
                { label: "Blend", items: Object.entries(blends).map(([id, e]) => [id, e.label] as const) },
                { label: "Packing", items: Object.entries(packing).map(([id, e]) => [id, e.label] as const) },
              ].map((g) => (
                <div className="curve-group" key={g.label}>
                  <span className="curve-label">{g.label}</span>
                  <div className="chips">
                    {g.items.map(([id, label]) => (
                      <button
                        key={id}
                        className={`chip${curveId === id ? " on" : ""}`}
                        type="button"
                        onClick={() => {
                          setState((prev) => {
                            const next = { ...prev, parts: { ...prev.parts } };
                            if (blends[id as keyof typeof blends]) {
                              const unlocked = MESHES.filter((mesh) => !next.locks[mesh.id]);
                              if (!unlocked.length) return prev;
                              unlocked.forEach((mesh) => {
                                next.parts[mesh.id] = blends[id as keyof typeof blends].parts[mesh.id] || 0;
                              });
                            } else if (packing[id as keyof typeof packing]) {
                              next.parts = applyWeights(
                                next.parts,
                                next.locks,
                                packing[id as keyof typeof packing].weights,
                              );
                            } else {
                              return prev;
                            }
                            return next;
                          });
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="stack">
              {MESHES.map((x) => (
                <span
                  key={x.id}
                  style={{ width: `${(m.fr[x.id] * 100).toFixed(3)}%`, background: MESH_COLORS[x.id] }}
                />
              ))}
            </div>
            <div className="stack-legend">
              {MESHES.map((x) => (
                <span key={x.id}>
                  <i className="dot" style={{ background: MESH_COLORS[x.id] }} />
                  {x.name} {pct(m.fr[x.id])}
                </span>
              ))}
            </div>
            <div>
              {MESHES.map((mesh) => (
                <div className={`mesh${state.locks[mesh.id] ? " locked" : ""}`} key={mesh.id}>
                  <div className="mesh-name">
                    {mesh.name}
                    <small>{mesh.um}</small>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={state.parts[mesh.id]}
                    disabled={state.locks[mesh.id]}
                    onChange={(e) => {
                      const v = Math.max(0, Number(e.target.value) || 0);
                      setState((prev) => {
                        if (prev.locks[mesh.id]) return prev;
                        return { ...prev, parts: { ...prev.parts, [mesh.id]: v } };
                      });
                    }}
                  />
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={state.parts[mesh.id]}
                    disabled={state.locks[mesh.id]}
                    onChange={(e) => {
                      const raw = e.target.value;
                      const v = raw === "" ? 0 : Math.max(0, Number(raw) || 0);
                      setState((prev) => {
                        if (prev.locks[mesh.id]) return prev;
                        return { ...prev, parts: { ...prev.parts, [mesh.id]: v } };
                      });
                    }}
                    onBlur={(e) => {
                      if (e.target.value === "" || e.target.value === "-" || e.target.value === ".") {
                        setState((prev) => ({
                          ...prev,
                          parts: { ...prev.parts, [mesh.id]: 0 },
                        }));
                      }
                    }}
                  />
                  <div className="pct">{pct(m.fr[mesh.id])}</div>
                  <label className="lock" title="Freeze this mesh">
                    <input
                      type="checkbox"
                      checked={!!state.locks[mesh.id]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setState((prev) => ({
                          ...prev,
                          locks: { ...prev.locks, [mesh.id]: checked },
                        }));
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>
            <div className="profile">
              {MESHES.map((x) => (
                <div className="bar" key={x.id}>
                  <i style={{ height: `${Math.max(8, m.fr[x.id] * 100)}%`, background: MESH_COLORS[x.id] }} />
                  <label>{x.name.split(" ")[0]}</label>
                </div>
              ))}
            </div>
            <div className="hint">
              <div>
                <strong>Packing {score} / 100 vs Andreasen</strong>
                <span>{packNote}</span>
              </div>
              <div>
                <strong>{totalParts} parts</strong>
                <span>Lock a mesh to freeze it. Blend pills = known recipe sands. Packing pills = math curves.</span>
              </div>
            </div>
          </section>

          <section className="card card-density no-print">
            <h2>Density (estimate)</h2>
            <p className="notes">
              Fresh density from absolute volumes. Cured estimate keeps the same cast volume (water loss
              leaves pores), so cured is usually a bit lower than wet — not higher. Enter a measured cured
              density to override.
            </p>
            <div className="row2" style={{ marginBottom: 12 }}>
              <div className="field">
                <label>Air content <b>%</b></label>
                <input
                  type="number"
                  min={0}
                  max={12}
                  step={0.5}
                  value={Math.round(((state.densityAirPct ?? DEFAULT_DENSITY_ASSUMPTIONS.airPct) * 100) * 10) / 10}
                  onChange={(e) =>
                    patch({ densityAirPct: Math.max(0, Number(e.target.value) || 0) / 100 })
                  }
                />
              </div>
              <div className="field">
                <label>Hydration <b>0–1</b></label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.05}
                  value={state.densityHydration ?? DEFAULT_DENSITY_ASSUMPTIONS.hydration}
                  onChange={(e) => patch({ densityHydration: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Bound water factor</label>
                <input
                  type="number"
                  min={0.15}
                  max={0.4}
                  step={0.01}
                  value={state.densityBoundWater ?? DEFAULT_DENSITY_ASSUMPTIONS.boundWaterFactor}
                  onChange={(e) => patch({ densityBoundWater: Number(e.target.value) })}
                />
              </div>
              <div className="field">
                <label>Free water retained <b>%</b></label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(
                    ((state.densityFreeWaterRetain ?? DEFAULT_DENSITY_ASSUMPTIONS.freeWaterRetain) * 100)
                  )}
                  onChange={(e) =>
                    patch({ densityFreeWaterRetain: Math.max(0, Number(e.target.value) || 0) / 100 })
                  }
                />
              </div>
              <div className="field">
                <label>Measured cured <b>kg/m³</b></label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  placeholder="optional"
                  value={state.densityCuredMeasuredKgM3 ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    patch({
                      densityCuredMeasuredKgM3: v === "" ? undefined : Math.max(0, Number(v) || 0),
                    });
                  }}
                />
              </div>
            </div>
            <div className="hint" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
              <div>
                <strong>Fresh (wet)</strong>
                <span>{fmtDensity(dens.wetKgM3)} · {densityToKgPerL(dens.wetKgM3).toFixed(2)} kg/L</span>
              </div>
              <div>
                <strong>Cured (est.)</strong>
                <span>{fmtDensity(dens.curedEstKgM3)} · {densityToKgPerL(dens.curedEstKgM3).toFixed(2)} kg/L</span>
              </div>
              <div>
                <strong>Use for cast</strong>
                <span>
                  {fmtDensity(dens.curedKgM3)}
                  {dens.measuredKgM3 ? " (measured)" : " (estimate)"}
                </span>
              </div>
              <div>
                <strong>Water lost</strong>
                <span>{(dens.freeWaterLostKg * 1000).toFixed(0)} g / batch · bound {(dens.boundWaterKg * 1000).toFixed(0)} g</span>
              </div>
            </div>
          </section>

          <BatchTicket
            name={state.name || "Untitled mix"}
            meta={printMeta}
            scaleLabel={formatDryScale(state.dryWeight, batches)}
            rows={ticketRows}
            batches={batches}
            effectiveWB={m.effectiveWB}
            gaugingBit={gaugingBit}
            portlandShareLabel={pct(1 / (1 + state.pozzolanCement))}
            pozzolanShareLabel={pct(state.pozzolanCement / (1 + state.pozzolanCement))}
            waterGross={m.waterGross}
            waterToAdd={m.waterToAdd}
            waterFromAcrylic={m.waterFromAcrylic}
            isRdp={m.isRdp}
            cost={cost}
            recipeId={state.activeRecipeId || null}
            dryWeight={state.dryWeight}
            densityWetKgM3={dens.wetKgM3}
            densityCuredKgM3={dens.curedKgM3}
          />
        </div>
      </div>

      <dialog className="recipe-dlg" ref={printDialogRef}>
        <div className="dlg">
          <h2>Batch ticket</h2>
          <p className="dlg-meta">
            Same A4 Staff layout — Arcos logo top-right, QR bottom-right.
          </p>
          <fieldset style={{ border: "1px solid var(--line)", margin: "0 0 14px", padding: "12px" }}>
            <legend style={{ padding: "0 6px", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
              Contents
            </legend>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, cursor: "pointer" }}>
              <input
                type="radio"
                name="ticket-contents"
                checked={!printIncludeCost}
                onChange={() => setPrintIncludeCost(false)}
                style={{ marginTop: 3 }}
              />
              <span>
                <b>Weigh sheet only</b>
                <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>Materials and grams for the floor</small>
              </span>
            </label>
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
              <input
                type="radio"
                name="ticket-contents"
                checked={printIncludeCost}
                onChange={() => setPrintIncludeCost(true)}
                style={{ marginTop: 3 }}
              />
              <span>
                <b>Weigh sheet + price breakdown</b>
                <small style={{ display: "block", color: "var(--muted)", marginTop: 2 }}>Adds a second page with material costs</small>
              </span>
            </label>
          </fieldset>
          <div className="dlg-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
            <button className="btn primary" type="button" onClick={() => void runTicketPdf("print")}>
              Print
            </button>
            <button className="btn" type="button" onClick={() => void runTicketPdf("download")}>
              Download PDF
            </button>
            <button className="btn ghost" type="button" onClick={() => printDialogRef.current?.close()}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>

      <dialog className="recipe-dlg" ref={recipeDialogRef} onCancel={() => setDialogRecipeId("")}>
        <div className="dlg">
          {dialogRecipe && (
            <>
              <p className={`dlg-kind ${recipeKind(dialogRecipe)}`}>
                {recipeKind(dialogRecipe) === "experiment" ? "Experiment" : "Production"}
              </p>
              <h2>{dialogRecipe.name || "Untitled"}</h2>
              <p className="dlg-meta">
                {(() => {
                  const when = formatRecipeDate(dialogRecipe.updatedAt || dialogRecipe.createdAt);
                  return when ? `Saved ${when}` : "Not saved yet";
                })()}
              </p>
              <p className="dlg-notes">
                {(dialogRecipe.notes || "").trim() ||
                  (recipeKind(dialogRecipe) === "experiment"
                    ? "No notes yet."
                    : "Production mix. Staff will see this on the weigh-out page.")}
              </p>
              <div className="dlg-actions">
                <button
                  className="btn primary"
                  type="button"
                  onClick={() => {
                    if (!confirmDiscardIfDirty("load this recipe")) return;
                    useRecipe(dialogRecipe.id);
                    closeRecipeDialog();
                  }}
                >
                  Load into builder
                </button>
                {recipeKind(dialogRecipe) === "experiment" && (
                  <button
                    className="btn"
                    type="button"
                    onClick={async () => {
                      const nextList = recipes.map((r) =>
                        r.id === dialogRecipe.id
                          ? { ...r, kind: "final" as const, projectId: null }
                          : r,
                      );
                      setRecipes(nextList);
                      if (state.activeRecipeId === dialogRecipe.id) {
                        patch({ kind: "final", projectId: null });
                      }
                      const ok = await persistRecipes(nextList);
                      closeRecipeDialog();
                      showStatus(ok ? "Promoted to production." : "Could not save.", ok ? "ok" : "warn");
                    }}
                  >
                    Promote to production
                  </button>
                )}
                {recipeKind(dialogRecipe) !== "experiment" && (
                  <button
                    className="btn"
                    type="button"
                    onClick={async () => {
                      const baseName = `${dialogRecipe.name || "Untitled"} trial`;
                      const finalName = uniqueRecipeName(recipes, baseName, null);
                      const created = stampRecipe(
                        recipeFromMix(`r-${Date.now()}`, {
                          ...dialogRecipe,
                          name: finalName,
                          kind: "experiment",
                          notes: dialogRecipe.notes || "",
                        }),
                        true,
                      );
                      const nextList = [...recipes, created];
                      setRecipes(nextList);
                      const ok = await persistRecipes(nextList);
                      closeRecipeDialog();
                      setState((prev) => applyRecipeToState(created, prev));
                      if (!ok) {
                        showStatus("Could not reach Mix Lab. Copy was not saved.", "warn", 5000);
                        return;
                      }
                      if (finalName !== baseName) {
                        showStatus(`Copied as “${finalName}” — that name was already taken.`, "warn", 5000);
                      }
                    }}
                  >
                    Copy as experiment
                  </button>
                )}
                <button className="btn danger" type="button" onClick={() => deleteRecipeById(dialogRecipe.id)}>
                  Delete
                </button>
                <button className="btn ghost" type="button" onClick={closeRecipeDialog}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </dialog>

      <dialog className="recipe-dlg" ref={saveDialogRef}>
        <div className="dlg">
          <h2>{saveAsNewPending ? "Save as new recipe" : "Save recipe"}</h2>
          <p className="dlg-meta">
            {saveAsNewPending
              ? "Name this copy. If the name is taken, -1, -2, … is added automatically."
              : active
                ? "Updates the loaded recipe. Change the name here if you want."
                : "Name this mix before saving."}
          </p>
          <div className="field">
            <label>Recipe name</label>
            <input
              type="text"
              id="saveRecipeName"
              autoComplete="off"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void confirmSave();
                }
              }}
            />
          </div>
          <div className="dlg-actions">
            <button className="btn primary" type="button" onClick={() => void confirmSave()}>
              Save
            </button>
            <button className="btn ghost" type="button" onClick={() => saveDialogRef.current?.close()}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
