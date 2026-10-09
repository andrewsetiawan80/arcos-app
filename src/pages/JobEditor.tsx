import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Beaker, ExternalLink, FileText, Plus, Save, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import {
  areaLabourPerM2,
  defaultUnitForKind,
  dryKgFromVolume,
  emptyJobItem,
  fmtIdr,
  hourlyRateForComplexity,
  lineEconomics,
  litersFromCm,
  num,
  syncUnitCost,
  type CastAddon,
  type CastMeta,
  type JobItemDraft,
  type LabourComplexity,
  type LabourPreset,
} from "../lib/jobPricing";
import {
  buildTicketRows,
  compute,
  fetchPrices,
  fetchRecipes,
  mixMaterialCost,
  ticketDeepLink,
  type MixRecipe,
  type PriceMap,
} from "../mixlab/core";
import { computeMixLabDensity, densityToKgPerL } from "../mixlab/density";

const field =
  "w-full px-3 py-2.5 bg-[#2a2a2a] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-white/30 outline-none";

const DEFAULT_DENSITY = 2.1;
const DEFAULT_SPARE = 10;

function fmtGrams(g: number): string {
  const n = Number(g) || 0;
  if (n >= 1000) return `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
  return `${Math.round(n).toLocaleString()} g`;
}

function parseCastMeta(raw: unknown): CastMeta | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as CastMeta;
}

export default function JobEditor() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const nav = useNavigate();
  const isNew = !id || id === "new";

  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState(search.get("client") || "");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [wasteDef, setWasteDef] = useState(3);
  const [overheadDef, setOverheadDef] = useState(10);
  const [markupDef, setMarkupDef] = useState(40);
  const [items, setItems] = useState<JobItemDraft[]>([
    emptyJobItem({ waste: 3, overhead: 10, markup: 40 }),
  ]);
  const [clients, setClients] = useState<any[]>([]);
  const [presets, setPresets] = useState<LabourPreset[]>([]);
  const [mixRecipes, setMixRecipes] = useState<MixRecipe[]>([]);
  const [mixPrices, setMixPrices] = useState<PriceMap>({});
  const [mixBusy, setMixBusy] = useState(false);
  const [mixForLine, setMixForLine] = useState<number | null>(null);
  const [mixRecipeId, setMixRecipeId] = useState("");
  const [mixMassKg, setMixMassKg] = useState(1);
  const [mixUseDims, setMixUseDims] = useState(false);
  const [mixL, setMixL] = useState(0);
  const [mixW, setMixW] = useState(0);
  const [mixH, setMixH] = useState(0);
  const [mixLiters, setMixLiters] = useState(1);
  const [mixSpare, setMixSpare] = useState(DEFAULT_SPARE);
  const [mixDensity, setMixDensity] = useState(DEFAULT_DENSITY);
  const [mixAddons, setMixAddons] = useState<CastAddon[]>([]);
  const [tab, setTab] = useState<"price" | "production">("price");
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.getClients().then((r) => {
      if (r.data) setClients(r.data as any[]);
    });
    api.getJobLabourPresets().then((r) => {
      if (r.data) setPresets(r.data as LabourPreset[]);
    });
    setMixBusy(true);
    Promise.all([fetchRecipes(), fetchPrices()])
      .then(([recipes, prices]) => {
        setMixRecipes(recipes || []);
        setMixPrices(prices || {});
      })
      .finally(() => setMixBusy(false));
  }, []);

  useEffect(() => {
    if (!presets.length) return;
    setItems((prev) => prev.map((it) => syncUnitCost(it, presets)));
  }, [presets]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api.getJob(id!).then((r) => {
      if (cancelled) return;
      if (r.error || !r.data) {
        setLoadError(r.error || "Could not load job");
        setLoading(false);
        return;
      }
      const j = r.data as any;
      setTitle(j.title || "");
      setClientId(j.client_id || "");
      setNotes(j.notes || "");
      setStatus(j.status || "draft");
      setQuoteId(j.quote_id || null);
      setWasteDef(num(j.default_waste_pct, 3));
      setOverheadDef(num(j.default_overhead_pct, 10));
      setMarkupDef(num(j.default_markup_pct, 40));
      if (Array.isArray(j.items) && j.items.length) {
        setItems(
          j.items.map((it: any) =>
            syncUnitCost(
              {
                description: it.description || "",
                kind: (it.kind || "piece") as JobItemDraft["kind"],
                qty: num(it.qty, 1),
                unit: it.unit || "pcs",
                material_cost: num(it.material_cost, num(it.unit_cost)),
                labour_complexity: (it.labour_complexity || "none") as LabourComplexity,
                labour_hours: num(it.labour_hours),
                labour_cost: num(it.labour_cost),
                unit_cost: num(it.unit_cost),
                waste_pct: num(it.waste_pct, 3),
                overhead_pct: num(it.overhead_pct, 10),
                markup_pct: num(it.markup_pct, 40),
                unit_price: num(it.unit_price),
                price_override: Boolean(it.price_override),
                notes: it.notes || "",
                mix_recipe_id: it.mix_recipe_id || null,
                mix_recipe_title: it.mix_recipe_id || null,
                mix_dry_kg: it.mix_dry_kg == null ? null : num(it.mix_dry_kg),
                cast_meta: parseCastMeta(it.cast_meta),
              },
              [],
            ),
          ),
        );
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, isNew]);

  // Resolve recipe titles once recipes load
  useEffect(() => {
    if (!mixRecipes.length) return;
    setItems((prev) =>
      prev.map((it) => {
        if (!it.mix_recipe_id) return it;
        const r = mixRecipes.find((x) => x.id === it.mix_recipe_id);
        if (!r) return it;
        const titleHint = r.name || r.id;
        if (it.mix_recipe_title === titleHint) return it;
        return { ...it, mix_recipe_title: titleHint };
      }),
    );
  }, [mixRecipes]);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        const e = lineEconomics(it, presets);
        acc.cost += e.lineCost;
        acc.sell += e.lineSell;
        acc.profit += e.profit;
        return acc;
      },
      { cost: 0, sell: 0, profit: 0 },
    );
  }, [items, presets]);
  const marginPct = totals.sell > 0 ? (totals.profit / totals.sell) * 100 : 0;

  const updateItem = (i: number, patch: Partial<JobItemDraft>) => {
    setItems((prev) => {
      const copy = [...prev];
      let next = { ...copy[i], ...patch };
      if (patch.kind && !patch.unit) {
        next.unit = defaultUnitForKind(patch.kind);
      }
      if (patch.kind === "manual") {
        next.price_override = true;
      }
      if (patch.labour_complexity === "none") {
        next.labour_hours = 0;
        next.labour_cost = 0;
      }
      next = syncUnitCost(next, presets);
      if (!next.price_override && patch.unit_price == null) {
        const e = lineEconomics(next, presets);
        next.unit_price = Math.round(e.computedSell);
      }
      copy[i] = next;
      return copy;
    });
  };

  const addItem = (kind: JobItemDraft["kind"] = "piece") => {
    const base = emptyJobItem({ waste: wasteDef, overhead: overheadDef, markup: markupDef });
    base.kind = kind;
    base.unit = defaultUnitForKind(kind);
    if (kind === "manual") base.price_override = true;
    setItems([...items, base]);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const openMixPicker = (lineIdx: number) => {
    const it = items[lineIdx];
    setMixForLine(lineIdx);
    const first = mixRecipes[0];
    const selected =
      (it.mix_recipe_id && mixRecipes.find((r) => r.id === it.mix_recipe_id)) || first;
    setMixRecipeId(selected?.id || "");
    const meta = it.cast_meta;
    if (it.kind === "area") {
      setMixMassKg(it.mix_dry_kg != null && it.mix_dry_kg > 0 ? it.mix_dry_kg : 1.5);
      setMixAddons(meta?.addons?.length ? meta.addons.map((a) => ({ ...a })) : []);
      return;
    }
    const hasDims =
      meta &&
      num(meta.length_cm) > 0 &&
      num(meta.width_cm) > 0 &&
      num(meta.height_cm) > 0;
    setMixUseDims(Boolean(hasDims));
    setMixL(num(meta?.length_cm));
    setMixW(num(meta?.width_cm));
    setMixH(num(meta?.height_cm));
    setMixLiters(num(meta?.liters, 1) || 1);
    setMixSpare(num(meta?.spare_pct, DEFAULT_SPARE));
    const fromMeta = num(meta?.density, 0);
    if (fromMeta > 0) {
      setMixDensity(fromMeta);
    } else if (selected) {
      const dens = computeMixLabDensity(selected);
      const kgL = densityToKgPerL(dens.curedKgM3);
      setMixDensity(kgL > 0 ? Number(kgL.toFixed(3)) : DEFAULT_DENSITY);
    } else {
      setMixDensity(DEFAULT_DENSITY);
    }
    setMixAddons(meta?.addons?.length ? meta.addons.map((a) => ({ ...a })) : []);
    if (it.mix_dry_kg != null && it.mix_dry_kg > 0) setMixMassKg(it.mix_dry_kg);
    else if (selected) {
      const cost = mixMaterialCost(selected, mixPrices);
      setMixMassKg(cost.dryKg > 0 ? Number(cost.dryKg.toFixed(3)) : 1);
    } else setMixMassKg(1);
  };

  const effectiveLiters = mixUseDims ? litersFromCm(mixL, mixW, mixH) : Math.max(0, num(mixLiters));

  const castPreview = useMemo(() => {
    if (mixForLine == null || !mixRecipeId) return null;
    const recipe = mixRecipes.find((r) => r.id === mixRecipeId);
    if (!recipe) return null;
    const cost = mixMaterialCost(recipe, mixPrices);
    const line = items[mixForLine];
    const isArea = line?.kind === "area";
    let dryKg = Math.max(0, num(mixMassKg));
    if (!isArea) {
      dryKg = dryKgFromVolume({
        liters: effectiveLiters,
        densityKgPerL: mixDensity,
        sparePct: mixSpare,
        recipeDryKg: cost.dryKg,
        recipeWetKg: cost.wetKg,
      });
    }
    const addonSum = mixAddons.reduce((s, a) => s + Math.max(0, num(a.amount)), 0);
    const mixRp = cost.perKgDry > 0 ? Math.round(cost.perKgDry * dryKg) : Math.round(cost.batch);
    const wetKg =
      !isArea
        ? Math.max(0, num(effectiveLiters)) *
          Math.max(0, num(mixDensity)) *
          (1 + Math.max(0, num(mixSpare)) / 100)
        : cost.dryKg > 0
          ? dryKg * (cost.wetKg / cost.dryKg)
          : dryKg;
    return {
      cost,
      dryKg,
      wetKg,
      mixRp,
      addonSum,
      material: mixRp + Math.round(addonSum),
      isArea,
    };
  }, [
    mixForLine,
    mixRecipeId,
    mixRecipes,
    mixPrices,
    items,
    mixMassKg,
    effectiveLiters,
    mixDensity,
    mixSpare,
    mixAddons,
  ]);

  const applyMixCost = () => {
    if (mixForLine == null || !mixRecipeId || !castPreview) return;
    const recipe = mixRecipes.find((r) => r.id === mixRecipeId);
    if (!recipe) {
      setMsg("Recipe not found");
      return;
    }
    const titleHint = recipe.name || recipe.id;
    const addons = mixAddons
      .filter((a) => String(a.name || "").trim() || num(a.amount) > 0)
      .map((a) => ({ name: String(a.name || "").trim() || "Add-on", amount: Math.max(0, num(a.amount)) }));
    const line = items[mixForLine];
    const dryKg = Number(castPreview.dryKg.toFixed(4));
    const meta: CastMeta = castPreview.isArea
      ? { addons }
      : {
          liters: Number(effectiveLiters.toFixed(4)),
          spare_pct: mixSpare,
          density: mixDensity,
          length_cm: mixUseDims ? mixL : undefined,
          width_cm: mixUseDims ? mixW : undefined,
          height_cm: mixUseDims ? mixH : undefined,
          addons,
        };
    updateItem(mixForLine, {
      material_cost: castPreview.material,
      mix_recipe_id: recipe.id,
      mix_recipe_title: titleHint,
      mix_dry_kg: dryKg,
      cast_meta: meta,
      description: line.description || titleHint,
    });
    setMixForLine(null);
    setMsg(
      castPreview.cost.priced
        ? `Material from mix: ${fmtIdr(castPreview.material)}`
        : `Material set ${fmtIdr(castPreview.material)} — shop prices may be incomplete`,
    );
    setTimeout(() => setMsg(""), 3500);
  };

  const payload = () => ({
    title: title.trim(),
    client_id: clientId || null,
    notes,
    status,
    default_waste_pct: wasteDef,
    default_overhead_pct: overheadDef,
    default_markup_pct: markupDef,
    items: items.map((it) => {
      const synced = syncUnitCost(it, presets);
      const e = lineEconomics(synced, presets);
      return {
        ...synced,
        unit_price: synced.price_override ? e.unitPrice : Math.round(e.computedSell),
      };
    }),
  });

  const save = async () => {
    if (!title.trim()) {
      setMsg("Title is required");
      return;
    }
    setSaving(true);
    setMsg("");
    if (isNew) {
      const r = await api.createJob(payload());
      setSaving(false);
      if (r.error || !r.data) {
        setMsg(r.error || "Save failed");
        return;
      }
      nav(`/app/jobs/${(r.data as any).id}`, { replace: true });
      return;
    }
    const r = await api.updateJob(id!, payload());
    setSaving(false);
    if (r.error) {
      setMsg(r.error);
      return;
    }
    setMsg("Saved");
    setTimeout(() => setMsg(""), 2500);
  };

  const createQuote = async (replace = false) => {
    if (isNew) {
      setMsg("Save the job first, then create a quote.");
      return;
    }
    setQuoting(true);
    setMsg("");
    const saveRes = await api.updateJob(id!, payload());
    if (saveRes.error) {
      setQuoting(false);
      setMsg(saveRes.error);
      return;
    }
    const r = await api.createQuoteFromJob(id!, { replace });
    setQuoting(false);
    if (r.error || !r.data) {
      setMsg(r.error || "Could not create quote");
      return;
    }
    const qid = (r.data as any).quote_id || (r.data as any).id;
    setQuoteId(qid);
    setStatus("quoted");
    nav(`/app/quotes/${qid}`);
  };

  if (loading) return <p className="text-sm text-gray-400 py-12">Loading job…</p>;
  if (loadError) {
    return (
      <div className="space-y-4 py-8">
        <p className="text-sm text-red-300">{loadError}</p>
        <Link to="/app/jobs" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white">
          ← Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2 min-w-0">
          <Link
            to="/app/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Jobs
          </Link>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            {isNew ? "New job" : "Edit job"}
          </h1>
          <p className="text-sm text-gray-400 max-w-xl">
            Price custom pieces and area work with cost + markup. Production tab shows ingredients for Staff.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {msg ? <span className="text-xs text-gray-400 mr-1">{msg}</span> : null}
          {quoteId ? (
            <Link
              to={`/app/quotes/${quoteId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/20 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white"
            >
              <FileText className="w-4 h-4" /> Open quote
            </Link>
          ) : null}
          <button
            type="button"
            disabled={quoting || isNew}
            onClick={() => void createQuote(Boolean(quoteId))}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/20 text-xs font-bold uppercase tracking-wider hover:bg-white/5 disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {quoting ? "Creating…" : quoteId ? "Update quote" : "Create quote"}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !title.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className="flex gap-2 border-b border-white/10 pb-0">
        {(["price", "production"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t === "price" ? "Price" : "Production"}
          </button>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1fr_280px] gap-6 items-start">
        <div className="space-y-5 min-w-0">
          <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Job details</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Job title *  e.g. Pak Teja — meja Ø100 + dapur microcement"
              className={field}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Client</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={field}>
                  <option value="">No client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.company ? ` (${c.company})` : ""}
                    </option>
                  ))}
                </select>
                <Link to="/app/clients" className="text-[10px] text-gray-500 hover:text-white mt-1 inline-block">
                  Manage clients →
                </Link>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
                  {["draft", "quoted", "won", "lost"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Site notes, finish, timeline…"
              rows={2}
              className={`${field} resize-none`}
            />
            {tab === "price" ? (
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Default waste %</label>
                  <input
                    type="number"
                    value={wasteDef}
                    onChange={(e) => setWasteDef(num(e.target.value))}
                    className={`${field} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Default OH %</label>
                  <input
                    type="number"
                    value={overheadDef}
                    onChange={(e) => setOverheadDef(num(e.target.value))}
                    className={`${field} tabular-nums`}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Default markup %</label>
                  <input
                    type="number"
                    value={markupDef}
                    onChange={(e) => setMarkupDef(num(e.target.value))}
                    className={`${field} tabular-nums`}
                  />
                </div>
              </div>
            ) : null}
          </section>

          {tab === "production" ? (
            <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">
                Production sheet
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Ingredients and batch sizes for Staff. Set mix on each line via Price → From mix, then Save.
              </p>
              <div className="space-y-4">
                {items.map((it, i) => {
                  const recipe = it.mix_recipe_id
                    ? mixRecipes.find((r) => r.id === it.mix_recipe_id)
                    : null;
                  const dryPer = num(it.mix_dry_kg);
                  const qty = Math.max(0, num(it.qty, 1));
                  const batchDryKg = dryPer * qty;
                  const dryGrams = Math.round(batchDryKg * 1000);
                  const hasMix = Boolean(it.mix_recipe_id && dryPer > 0);
                  const costSnap = recipe ? mixMaterialCost(recipe, mixPrices) : null;
                  const wetRatio =
                    costSnap && costSnap.dryKg > 0
                      ? costSnap.wetKg / costSnap.dryKg
                      : null;
                  const batchWetKg =
                    it.cast_meta?.liters != null && it.cast_meta?.density != null
                      ? num(it.cast_meta.liters) *
                        num(it.cast_meta.density) *
                        (1 + num(it.cast_meta.spare_pct) / 100) *
                        qty
                      : wetRatio != null
                        ? batchDryKg * wetRatio
                        : null;
                  let ticket: ReturnType<typeof buildTicketRows> = [];
                  if (recipe && dryGrams > 0) {
                    const scaled = { ...recipe, dryWeight: dryGrams };
                    ticket = buildTicketRows(scaled, compute(scaled));
                  }
                  const addons = it.cast_meta?.addons || [];
                  const weighHref = hasMix
                    ? ticketDeepLink(it.mix_recipe_id!, dryGrams, {
                        label: it.description || it.mix_recipe_title || undefined,
                      })
                    : null;
                  return (
                    <div key={i} className="border border-white/10 bg-[#2a2a2a] p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {it.description || `Line ${i + 1}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {it.qty} {it.unit}
                            {recipe
                              ? ` · mix ${recipe.name || recipe.id}`
                              : it.mix_recipe_id
                                ? ` · mix ${it.mix_recipe_title || it.mix_recipe_id}`
                                : ""}
                            {dryPer > 0
                              ? ` · ${dryPer.toFixed(3)} kg dry / unit · batch ${batchDryKg.toFixed(3)} kg dry`
                              : ""}
                            {batchWetKg != null && batchWetKg > 0
                              ? ` · ~${batchWetKg.toFixed(3)} kg wet`
                              : ""}
                          </p>
                        </div>
                        {weighHref ? (
                          <a
                            href={weighHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider"
                          >
                            <ExternalLink className="w-3 h-3" /> Weigh in Staff
                          </a>
                        ) : null}
                      </div>
                      {!hasMix ? (
                        <p className="text-xs text-amber-300/90">
                          No mix linked — open Price tab → Cast from mix on this line, then Save.
                        </p>
                      ) : !recipe ? (
                        <p className="text-xs text-gray-400">
                          Mix id <span className="text-white">{it.mix_recipe_id}</span> · batch{" "}
                          {batchDryKg.toFixed(3)} kg dry. Ticket preview needs Mix Lab recipes loaded;
                          Weigh in Staff still opens the floor page.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <tbody>
                              {ticket.map((row, ri) => {
                                if (row[0] === "group") {
                                  return (
                                    <tr key={ri}>
                                      <td
                                        colSpan={2}
                                        className="pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500"
                                      >
                                        {row[1]}
                                      </td>
                                    </tr>
                                  );
                                }
                                if (row[0] === "total") {
                                  return (
                                    <tr key={ri} className="border-t border-white/10">
                                      <td className="py-1.5 font-semibold text-white">{row[1]}</td>
                                      <td className="py-1.5 text-right tabular-nums text-white font-semibold">
                                        {fmtGrams(Number(row[2]))}
                                      </td>
                                    </tr>
                                  );
                                }
                                const label = String(row[0]);
                                const grams = Number(row[1]) || 0;
                                return (
                                  <tr key={ri} className="border-t border-white/5">
                                    <td className="py-1 text-gray-300">{label}</td>
                                    <td className="py-1 text-right tabular-nums text-gray-200">
                                      {fmtGrams(grams)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {addons.length ? (
                        <div className="pt-2 border-t border-white/10">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Supporting materials
                          </p>
                          <ul className="text-xs text-gray-300 space-y-0.5">
                            {addons.map((a, ai) => (
                              <li key={ai} className="flex justify-between gap-2">
                                <span>{a.name}</span>
                                <span className="tabular-nums text-gray-400">{fmtIdr(a.amount)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {it.kind !== "area" &&
                      it.cast_meta &&
                      (it.cast_meta.liters || it.cast_meta.spare_pct) ? (
                        <p className="text-[10px] text-gray-500">
                          Cast: {it.cast_meta.liters != null ? `${it.cast_meta.liters} L` : ""}
                          {it.cast_meta.spare_pct != null ? ` · spare ${it.cast_meta.spare_pct}%` : ""}
                          {it.cast_meta.density != null ? ` · ${it.cast_meta.density} kg/L` : ""}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ) : (
            <section className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Priced items</h2>
                <div className="flex flex-wrap gap-2 items-center">
                  <Link
                    to="/app/jobs/labour-presets"
                    className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white mr-1"
                  >
                    Labour presets →
                  </Link>
                  <button
                    type="button"
                    onClick={() => addItem("piece")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-white/20 hover:bg-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Piece
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem("area")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-white/20 hover:bg-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Area (m²)
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem("manual")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border border-white/20 hover:bg-white/5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Manual sell
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {items.map((it, i) => {
                  const eco = lineEconomics(it, presets);
                  const sellUnit = it.price_override ? eco.unitPrice : Math.round(eco.computedSell);
                  const rate = hourlyRateForComplexity(presets, it.labour_complexity);
                  const areaRate = areaLabourPerM2(presets, it.labour_complexity);
                  const isArea = it.kind === "area";
                  return (
                    <div key={i} className="border border-white/10 bg-[#2a2a2a] p-3 sm:p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={it.kind}
                          onChange={(e) =>
                            updateItem(i, { kind: e.target.value as JobItemDraft["kind"] })
                          }
                          className={`${field} max-w-[140px]`}
                        >
                          <option value="piece">Piece</option>
                          <option value="area">Area</option>
                          <option value="manual">Manual</option>
                        </select>
                        <input
                          value={it.description}
                          onChange={(e) => updateItem(i, { description: e.target.value })}
                          placeholder={
                            it.kind === "area"
                              ? "e.g. Microcement floor — dapur"
                              : "e.g. UHPC round table Ø100 cm"
                          }
                          className={`${field} flex-1 min-w-[180px]`}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="p-2 text-red-400 hover:bg-red-500/10"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Qty</label>
                          <input
                            type="number"
                            value={it.qty}
                            onChange={(e) => updateItem(i, { qty: num(e.target.value, 1) })}
                            className={`${field} text-right tabular-nums`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Unit</label>
                          <input
                            value={it.unit}
                            onChange={(e) => updateItem(i, { unit: e.target.value })}
                            className={`${field} text-center`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                            Material cost {it.kind === "area" ? "/ m²" : "/ pc"}
                          </label>
                          <input
                            type="number"
                            value={it.material_cost}
                            onChange={(e) =>
                              updateItem(i, {
                                material_cost: num(e.target.value),
                                mix_recipe_id: null,
                                mix_recipe_title: null,
                                mix_dry_kg: null,
                                cast_meta: null,
                              })
                            }
                            className={`${field} text-right tabular-nums`}
                            placeholder="From mix"
                          />
                          <button
                            type="button"
                            onClick={() => openMixPicker(i)}
                            disabled={mixBusy || it.kind === "manual"}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white disabled:opacity-40"
                          >
                            <Beaker className="w-3 h-3" />
                            {mixBusy ? "Loading mix…" : it.kind === "area" ? "From mix" : "Cast from mix"}
                          </button>
                          {it.mix_recipe_title ? (
                            <p className="text-[10px] text-amber-200/80 mt-0.5 truncate">
                              Mix recipe: {it.mix_recipe_title}
                              {it.mix_dry_kg != null ? ` · ${Number(it.mix_dry_kg).toFixed(3)} kg dry` : ""}
                            </p>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                            Sell / unit
                          </label>
                          <input
                            type="number"
                            value={it.price_override ? it.unit_price : sellUnit}
                            onChange={(e) =>
                              updateItem(i, {
                                unit_price: num(e.target.value),
                                price_override: true,
                              })
                            }
                            className={`${field} text-right tabular-nums font-semibold`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                            Labour complexity
                          </label>
                          <select
                            value={it.labour_complexity}
                            onChange={(e) =>
                              updateItem(i, {
                                labour_complexity: e.target.value as LabourComplexity,
                              })
                            }
                            className={field}
                          >
                            <option value="none">None</option>
                            <option value="simple">Simple</option>
                            <option value="medium">Medium</option>
                            <option value="complex">Complex</option>
                            <option value="custom">Custom Rp</option>
                          </select>
                        </div>
                        {it.labour_complexity === "custom" ? (
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                              Labour {isArea ? "Rp / m²" : "Rp"}
                            </label>
                            <input
                              type="number"
                              value={it.labour_cost}
                              onChange={(e) => updateItem(i, { labour_cost: num(e.target.value) })}
                              className={`${field} text-right tabular-nums`}
                            />
                          </div>
                        ) : isArea ? (
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                              Labour / m² (preset)
                            </label>
                            <input
                              type="number"
                              value={areaRate != null ? areaRate : it.labour_cost}
                              readOnly={areaRate != null}
                              onChange={(e) => updateItem(i, { labour_cost: num(e.target.value) })}
                              className={`${field} text-right tabular-nums ${areaRate != null ? "opacity-70" : ""}`}
                              placeholder={areaRate == null ? "Preset empty — type Rp/m²" : undefined}
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                              Labour hours
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={it.labour_hours}
                              onChange={(e) => updateItem(i, { labour_hours: num(e.target.value) })}
                              disabled={it.labour_complexity === "none"}
                              className={`${field} text-right tabular-nums disabled:opacity-40`}
                              placeholder="e.g. 2 or 8"
                            />
                          </div>
                        )}
                        <div className="sm:col-span-2 flex items-end">
                          <p className="text-xs text-gray-400 pb-2 leading-relaxed">
                            Labour {fmtIdr(eco.labourCost)}
                            {it.labour_complexity !== "none" && it.labour_complexity !== "custom" ? (
                              <span className="text-gray-600">
                                {isArea
                                  ? ` (${areaRate == null ? "preset empty" : `${fmtIdr(areaRate)}/m²`})`
                                  : ` (${it.labour_hours || 0} h × ${rate == null ? "rate empty" : fmtIdr(rate)})`}
                              </span>
                            ) : null}
                            <br />
                            Unit COGS {fmtIdr(eco.unitCost)}
                            <span className="text-gray-600">
                              {" "}
                              (mat {fmtIdr(eco.materialCost)} + labour {fmtIdr(eco.labourCost)})
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Waste %</label>
                          <input
                            type="number"
                            value={it.waste_pct}
                            onChange={(e) => updateItem(i, { waste_pct: num(e.target.value), price_override: false })}
                            className={`${field} tabular-nums`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">OH %</label>
                          <input
                            type="number"
                            value={it.overhead_pct}
                            onChange={(e) =>
                              updateItem(i, { overhead_pct: num(e.target.value), price_override: false })
                            }
                            className={`${field} tabular-nums`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                            Markup %
                          </label>
                          <input
                            type="number"
                            value={it.markup_pct}
                            onChange={(e) =>
                              updateItem(i, { markup_pct: num(e.target.value), price_override: false })
                            }
                            className={`${field} tabular-nums`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 pt-1 border-t border-white/5">
                        <span>
                          Cost {fmtIdr(eco.lineCost)} · Sell {fmtIdr(eco.lineSell)} · Profit{" "}
                          <span className="text-white font-semibold">{fmtIdr(eco.profit)}</span>
                        </span>
                        <span className="tabular-nums">
                          Margin {eco.marginPct.toFixed(1)}%
                          {it.price_override ? " · overridden" : ""}
                        </span>
                      </div>
                      {it.price_override && it.kind !== "manual" ? (
                        <button
                          type="button"
                          className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-white"
                          onClick={() =>
                            updateItem(i, {
                              price_override: false,
                              unit_price: Math.round(eco.computedSell),
                            })
                          }
                        >
                          Reset sell from cost + markup
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="border border-white/10 bg-[#353535] p-4 sm:p-5 space-y-3 xl:sticky xl:top-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-500">Totals</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Cost (w/ waste+OH)</span>
              <span className="tabular-nums text-white">{fmtIdr(totals.cost)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Sell (ex-PPN)</span>
              <span className="tabular-nums text-white font-semibold">{fmtIdr(totals.sell)}</span>
            </div>
            <div className="flex justify-between text-gray-400 border-t border-white/10 pt-2">
              <span>Profit</span>
              <span className="tabular-nums text-white font-bold">{fmtIdr(totals.profit)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Gross margin</span>
              <span className="tabular-nums text-white">{marginPct.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed pt-2">
            Piece: cast volume → dry kg → mix cost. Area: dry kg/m². Production tab = Staff ingredients × qty.
          </p>
        </aside>
      </div>

      {mixForLine != null && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setMixForLine(null)}
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#2a2a2a] border border-white/10 p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              {items[mixForLine]?.kind === "area" ? "Material from mix" : "Cast from mix"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {items[mixForLine]?.kind === "area"
                ? "Dry kg per m² × recipe cost. Add-ons (mesh, adhesive) optional."
                : "Mold volume + spare → dry kg (same Mix Designer prices). Add supporting materials as Rp lines."}
            </p>
            {!mixRecipes.length ? (
              <p className="text-sm text-amber-300/90">
                No mix recipes found. Save a recipe in Mix Designer first.
              </p>
            ) : (
              <>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Recipe</label>
                  <select
                    value={mixRecipeId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setMixRecipeId(id);
                      const r = mixRecipes.find((x) => x.id === id);
                      if (!r || items[mixForLine!]?.kind === "area") return;
                      const dens = computeMixLabDensity(r);
                      const kgL = densityToKgPerL(dens.curedKgM3);
                      if (kgL > 0) setMixDensity(Number(kgL.toFixed(3)));
                    }}
                    className={field}
                  >
                    {mixRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || r.id}
                      </option>
                    ))}
                  </select>
                </div>

                {items[mixForLine]?.kind === "area" ? (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                      Dry kg per m²
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={mixMassKg}
                      onChange={(e) => setMixMassKg(num(e.target.value))}
                      className={`${field} tabular-nums`}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMixUseDims(false)}
                        className={`flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border ${
                          !mixUseDims ? "border-white bg-white/10 text-white" : "border-white/20 text-gray-400"
                        }`}
                      >
                        Liters
                      </button>
                      <button
                        type="button"
                        onClick={() => setMixUseDims(true)}
                        className={`flex-1 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border ${
                          mixUseDims ? "border-white bg-white/10 text-white" : "border-white/20 text-gray-400"
                        }`}
                      >
                        L × W × H (cm)
                      </button>
                    </div>
                    {mixUseDims ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ["L", mixL, setMixL],
                          ["W", mixW, setMixW],
                          ["H", mixH, setMixH],
                        ].map(([label, val, set]) => (
                          <div key={String(label)}>
                            <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                              {label} cm
                            </label>
                            <input
                              type="number"
                              min={0}
                              step={0.1}
                              value={val as number}
                              onChange={(e) => (set as (n: number) => void)(num(e.target.value))}
                              className={`${field} tabular-nums`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                          Volume (liters)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={mixLiters}
                          onChange={(e) => setMixLiters(num(e.target.value))}
                          className={`${field} tabular-nums`}
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                          Spare %
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={mixSpare}
                          onChange={(e) => setMixSpare(num(e.target.value))}
                          className={`${field} tabular-nums`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">
                          Density kg/L (cured est.)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.05}
                          value={mixDensity}
                          onChange={(e) => setMixDensity(num(e.target.value))}
                          className={`${field} tabular-nums`}
                        />
                      </div>
                    </div>
                    {mixUseDims ? (
                      <p className="text-[10px] text-gray-500">≈ {effectiveLiters.toFixed(3)} L from dimensions</p>
                    ) : null}
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-wider text-gray-500">
                      Add-ons (mesh, adhesive…)
                    </label>
                    <button
                      type="button"
                      onClick={() => setMixAddons([...mixAddons, { name: "", amount: 0 }])}
                      className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-white"
                    >
                      + Add
                    </button>
                  </div>
                  {mixAddons.map((a, ai) => (
                    <div key={ai} className="flex gap-2">
                      <input
                        value={a.name}
                        onChange={(e) => {
                          const next = [...mixAddons];
                          next[ai] = { ...next[ai], name: e.target.value };
                          setMixAddons(next);
                        }}
                        placeholder="e.g. Fiber mesh"
                        className={`${field} flex-1`}
                      />
                      <input
                        type="number"
                        value={a.amount}
                        onChange={(e) => {
                          const next = [...mixAddons];
                          next[ai] = { ...next[ai], amount: num(e.target.value) };
                          setMixAddons(next);
                        }}
                        placeholder="Rp"
                        className={`${field} w-28 text-right tabular-nums`}
                      />
                      <button
                        type="button"
                        onClick={() => setMixAddons(mixAddons.filter((_, j) => j !== ai))}
                        className="p-2 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {castPreview ? (
                  <div className="text-[10px] text-gray-500 leading-relaxed space-y-1">
                    <p>
                      Dry mass{" "}
                      <span className="text-white font-semibold tabular-nums">
                        {castPreview.dryKg.toFixed(3)} kg
                      </span>
                      {" · "}
                      Wet mass{" "}
                      <span className="text-white font-semibold tabular-nums">
                        {castPreview.wetKg.toFixed(3)} kg
                      </span>
                    </p>
                    <p>
                      ≈ {fmtIdr(castPreview.cost.perKgDry)}/kg dry
                      {castPreview.addonSum > 0 ? ` · add-ons ${fmtIdr(castPreview.addonSum)}` : ""} · material{" "}
                      <span className="text-white">{fmtIdr(castPreview.material)}</span>
                      {!castPreview.cost.priced ? " · prices incomplete" : ""}
                    </p>
                  </div>
                ) : null}
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMixForLine(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!mixRecipes.length || !mixRecipeId || !castPreview}
                onClick={applyMixCost}
                className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Apply material cost
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
