import { useState, useEffect } from "react";
import { load, save } from "../store";
import type { AppState, Material } from "../types";
import NumberField from "../components/NumberField";

const SHOP = "/api/shop-prices";

function perKg(m: Material): number {
  const pack = m.packKg && m.packKg > 0 ? m.packKg : 1;
  if (m.amount != null) return m.amount / pack;
  return m.pricePerKg ?? 0;
}

function slugify(name: string, kind: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "material";
  return (kind === "pigment" ? `pigment-${base}` : base).slice(0, 50);
}

export default function Materials() {
  const [state, setState] = useState<AppState>(() => load());
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [busy, setBusy] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    kind: "pigment",
    brand: "",
    color: "",
    amount: 0,
    packKg: 1,
    densityKgM3: 450,
  });

  const reload = async () => {
    const appState = load();
    setState(appState);
  };

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, []);

  if (!state) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const update = (id: string, patch: Partial<Material>) => {
    const materials = (state.materials || []).map((m) => {
      if (m.id !== id) return m;
      const next = { ...m, ...patch };
      const pack = next.packKg && next.packKg > 0 ? next.packKg : 1;
      if (patch.amount != null || patch.packKg != null) {
        next.pricePerKg = (next.amount ?? 0) / pack;
      }
      next.priceCurrency = "IDR";
      return next;
    });
    setState({ ...state, materials });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      setBusy(true);
      // Push full catalog to shared shop_prices
      const body: Record<string, unknown> = {};
      for (const m of state.materials || []) {
        body[m.id] = {
          name: m.name,
          amount: m.amount ?? 0,
          packKg: m.packKg ?? 1,
          densityKgM3: m.densityKgM3,
          kind: m.kind || "other",
          brand: m.brand ?? null,
          color: m.color ?? null,
        };
      }
      const res = await fetch(SHOP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("shop-prices save failed");
      await save(state);
      setHasUnsavedChanges(false);
      await reload();
      alert("Saved — Mix Lab will see the same materials.");
    } catch (error) {
      console.error(error);
      alert("Failed to save materials.");
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`${SHOP}/item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          kind: form.kind,
          brand: form.brand.trim() || null,
          color: form.color.trim() || null,
          amount: form.amount,
          packKg: form.packKg > 0 ? form.packKg : 1,
          densityKgM3: form.densityKgM3,
          id: slugify(form.name, form.kind),
        }),
      });
      if (!res.ok) throw new Error("add failed");
      setAddOpen(false);
      setForm({ name: "", kind: "pigment", brand: "", color: "", amount: 0, packKg: 1, densityKgM3: 450 });
      await reload();
    } catch (e) {
      console.error(e);
      alert("Could not add material.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Remove “${name}” from Mix Lab and Arcos?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${SHOP}/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error("delete failed");
      if (data.restoredCore) {
        alert("Core material was re-seeded (required for Mix Lab). Clear the price instead if unused.");
      }
      await reload();
    } catch (e) {
      console.error(e);
      alert("Could not remove material.");
    } finally {
      setBusy(false);
    }
  };

  const mats = state.materials || [];
  const pigments = mats.filter((m) => m.kind === "pigment" || m.id.startsWith("pigment"));
  const others = mats.filter((m) => !(m.kind === "pigment" || m.id.startsWith("pigment")));
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);

  const renderCard = (m: Material) => (
    <div key={m.id} className="p-4 space-y-3 border-b border-white/10 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className="w-full bg-[#232323] border border-white/10 px-3 py-2 text-sm text-white font-semibold"
            value={m.name}
            onChange={(e) => update(m.id, { name: e.target.value })}
            placeholder="Material name"
          />
          <div className="text-xs text-gray-500 font-mono">{m.id}</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="w-full bg-[#232323] border border-white/10 px-3 py-2 text-xs text-white"
              value={m.brand ?? ""}
              onChange={(e) => update(m.id, { brand: e.target.value || null })}
              placeholder="Brand"
            />
            <input
              className="w-full bg-[#232323] border border-white/10 px-3 py-2 text-xs text-white"
              value={m.color ?? ""}
              onChange={(e) => update(m.id, { color: e.target.value || null })}
              placeholder="Color"
            />
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => handleRemove(m.id, m.name)}
          className="text-xs uppercase tracking-wider text-red-400 hover:bg-red-500/10 px-2 py-1 shrink-0"
        >
          Remove
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Density</label>
          <NumberField
            className="w-full bg-[#232323] border border-white/10 px-3 py-2.5 text-sm text-white"
            value={m.densityKgM3}
            onChange={(v) => update(m.id, { densityKgM3: v ?? undefined })}
            step="1"
          />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Pack (kg)</label>
          <NumberField
            className="w-full bg-[#232323] border border-white/10 px-3 py-2.5 text-sm text-white"
            value={m.packKg ?? 1}
            onChange={(v) => update(m.id, { packKg: v && v > 0 ? v : 1 })}
            step="1"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 block">Rp</label>
          <NumberField
            className="w-full bg-[#232323] border border-white/10 px-3 py-2.5 text-sm text-white"
            value={m.amount}
            onChange={(v) => update(m.id, { amount: v ?? 0 })}
            step="1000"
          />
        </div>
      </div>
      <div className="text-xs text-gray-400 font-mono">= Rp {fmt(perKg(m))}/kg</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="border-b border-white/10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Shared with Mix Lab</p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase leading-tight">Materials</h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed">
              Same catalog as Mix Lab. Add pigment SKUs per color/brand — each has its own price.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400 uppercase tracking-wider font-bold">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Unsaved changes</span>
              </div>
            )}
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#353535] border border-white/10 text-white text-sm font-bold uppercase tracking-wider hover:bg-[#232323]"
              onClick={() => setAddOpen((v) => !v)}
            >
              Add material
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 disabled:opacity-50"
              onClick={handleSave}
              disabled={!hasUnsavedChanges || busy}
            >
              Save Materials
            </button>
          </div>
        </div>
      </header>

      {addOpen && (
        <section className="border border-white/10 bg-[#353535] p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-black uppercase text-white">New material / pigment</h2>
          <p className="text-xs text-gray-400">
            For pigments: set kind = Pigment, fill brand + color (e.g. Bayferrox · Black). Creates id like{" "}
            <span className="font-mono text-gray-300">pigment-bayferrox-black</span>.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              className="w-full px-3 py-2.5 bg-[#232323] border border-white/10 text-sm"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="w-full px-3 py-2.5 bg-[#232323] border border-white/10 text-sm"
              value={form.kind}
              onChange={(e) =>
                setForm({
                  ...form,
                  kind: e.target.value,
                  densityKgM3: e.target.value === "pigment" ? 450 : form.densityKgM3,
                })
              }
            >
              {["pigment", "cement", "sand", "polymer", "admix", "fiber", "pozzolan", "water", "other"].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              className="w-full px-3 py-2.5 bg-[#232323] border border-white/10 text-sm"
              placeholder="Brand (optional)"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
            <input
              className="w-full px-3 py-2.5 bg-[#232323] border border-white/10 text-sm"
              placeholder="Color (optional)"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
            <NumberField
              className="w-full bg-[#232323] border border-white/10 px-3 py-2.5 text-sm"
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v ?? 0 })}
              step="1000"
              placeholder="Rp"
            />
            <NumberField
              className="w-full bg-[#232323] border border-white/10 px-3 py-2.5 text-sm"
              value={form.packKg}
              onChange={(v) => setForm({ ...form, packKg: v && v > 0 ? v : 1 })}
              step="1"
              placeholder="Pack kg"
            />
          </div>
          <button
            type="button"
            disabled={busy || !form.name.trim()}
            onClick={handleAdd}
            className="px-5 py-2.5 bg-white text-black text-sm font-bold uppercase tracking-wider disabled:opacity-50"
          >
            Create
          </button>
        </section>
      )}

      <section className="border border-white/10 bg-[#353535]">
        <div className="p-4 sm:p-6 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black uppercase text-white">
            Pigments <span className="text-gray-500 font-mono text-xs">({pigments.length})</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            One row per color/brand. Mix Lab ticket still uses “pigment (generic)” unless you point a recipe at a SKU later.
          </p>
        </div>
        <div className="divide-y divide-white/10">{pigments.map(renderCard)}</div>
        {!pigments.length && <div className="p-6 text-sm text-gray-400">No pigment SKUs yet — add Bayferrox Black, etc.</div>}
      </section>

      <section className="border border-white/10 bg-[#353535]">
        <div className="p-4 sm:p-6 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-black uppercase text-white">
            Other materials <span className="text-gray-500 font-mono text-xs">({others.length})</span>
          </h2>
        </div>
        <div className="divide-y divide-white/10">{others.map(renderCard)}</div>
      </section>
    </div>
  );
}
