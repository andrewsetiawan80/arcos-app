import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, RefreshCw, Trash2, Beaker, FileText } from "lucide-react";

const API = "/api/mix-projects";
const BATCHES = "/api/mix-batches";

type MixProject = {
  id: string;
  title: string;
  clientId?: string | null;
  clientName?: string | null;
  status: string;
  mixRecipeId?: string | null;
  baseRecipeId?: string | null;
  quoteId?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  batches?: MixBatch[];
};

type MixBatch = {
  id: string;
  projectId?: string | null;
  recipeId?: string;
  recipeName?: string;
  dryWeight?: number;
  weighedBy?: string;
  source?: string;
  at?: string;
};

const STATUSES = [
  { id: "trial", label: "Trial" },
  { id: "active", label: "Active" },
  { id: "done", label: "Done" },
  { id: "cancelled", label: "Cancelled" },
];

function fmtWhen(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function fmtDry(g?: number) {
  const n = Number(g) || 0;
  return n >= 1000
    ? `${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`
    : `${Math.round(n).toLocaleString()} g`;
}

function StatusPill({ status }: { status: string }) {
  const label = STATUSES.find((s) => s.id === status)?.label || status;
  return (
    <span className="inline-flex items-center px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider leading-normal border border-white/15 bg-[#232323] text-white">
      {label}
    </span>
  );
}

export default function MixProjects() {
  const [searchParams] = useSearchParams();
  const [list, setList] = useState<MixProject[]>([]);
  const [selected, setSelected] = useState<MixProject | null>(null);
  const [batches, setBatches] = useState<MixBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    title: "",
    clientName: "",
    status: "trial",
    mixRecipeId: "",
    quoteId: "",
    notes: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load projects");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Load failed");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openProject = async (p: MixProject) => {
    setSelected(p);
    try {
      const res = await fetch(`${API}/${p.id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
        setBatches(Array.isArray(data.batches) ? data.batches : []);
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      const res = await fetch(`${BATCHES}?projectId=${encodeURIComponent(p.id)}`, { cache: "no-store" });
      const data = await res.json();
      setBatches(Array.isArray(data) ? data : []);
    } catch {
      setBatches([]);
    }
  };

  // Deep-link from quote: /app/mix-projects?id=mp_…
  useEffect(() => {
    const deepId = searchParams.get("id");
    if (!deepId || !list.length) return;
    const found = list.find((p) => p.id === deepId);
    if (found) void openProject(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, searchParams]);

  const startNew = () => {
    setForm({
      id: "",
      title: "",
      clientName: "",
      status: "trial",
      mixRecipeId: "",
      quoteId: "",
      notes: "",
    });
    setFormOpen(true);
  };

  const editSelected = () => {
    if (!selected) return;
    setForm({
      id: selected.id,
      title: selected.title || "",
      clientName: selected.clientName || "",
      status: selected.status || "trial",
      mixRecipeId: selected.mixRecipeId || "",
      quoteId: selected.quoteId || "",
      notes: selected.notes || "",
    });
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (!form.title.trim()) {
      setMsg("Title required");
      return;
    }
    setMsg("Saving…");
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id || undefined,
          title: form.title.trim(),
          clientName: form.clientName.trim() || null,
          status: form.status,
          mixRecipeId: form.mixRecipeId.trim() || null,
          quoteId: form.quoteId.trim() || null,
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setFormOpen(false);
      setMsg(`Saved “${data.title}”`);
      await refresh();
      await openProject(data);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this project? Batches stay in the mix log but lose the link.")) return;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    if (selected?.id === id) {
      setSelected(null);
      setBatches([]);
    }
    await refresh();
  };

  const designerHref = (p: MixProject) =>
    `/app/studio?project=${encodeURIComponent(p.id)}${
      p.mixRecipeId ? `&recipe=${encodeURIComponent(p.mixRecipeId)}` : ""
    }`;

  return (
    <div className="space-y-6 min-w-0">
      <header className="border-b border-white/10 pb-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold leading-normal">
          Mixes · shared with Mix Lab
        </p>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-black uppercase leading-tight">Projects</h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              Create a project → open Mix designer (scratch or from a shop base) →{" "}
              <b className="text-white font-semibold">Save to project</b>. That mix is the project recipe,
              not a shop base.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/10 text-xs font-bold uppercase tracking-wider leading-normal hover:bg-white/5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button
              type="button"
              onClick={startNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider leading-normal hover:bg-gray-100"
            >
              <Plus className="w-3.5 h-3.5" /> New project
            </button>
          </div>
        </div>
      </header>

      {msg && (
        <div className="px-4 py-3 text-sm text-gray-300 border border-white/10 bg-white/5">{msg}</div>
      )}

      {formOpen && (
        <section className="border border-white/10 bg-[#353535] p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-wider leading-normal">
            {form.id ? "Edit project" : "New project"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-normal">Title</span>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Meja bulat Ø100 · [client]"
                className="h-11 px-3 bg-[#232323] border border-white/10 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-normal">Client</span>
              <input
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Customer name"
                className="h-11 px-3 bg-[#232323] border border-white/10 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-normal">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="h-11 px-3 bg-[#232323] border border-white/10 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold leading-normal">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="px-3 py-2 bg-[#232323] border border-white/10 text-sm"
                placeholder="Mold, coat, what to watch…"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={saveForm}
              className="px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider leading-normal"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2.5 border border-white/10 text-xs font-bold uppercase tracking-wider leading-normal"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-5 gap-4 min-w-0">
        <section className="lg:col-span-2 border border-white/10 bg-[#353535] divide-y divide-white/10 max-h-[70vh] overflow-y-auto">
          {loading && <div className="p-6 text-sm text-gray-400">Loading…</div>}
          {!loading && !list.length && (
            <div className="p-6 text-sm text-gray-400">No projects yet. Create one for the customer trial.</div>
          )}
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => openProject(p)}
              className={`w-full text-left p-4 hover:bg-white/5 ${selected?.id === p.id ? "bg-white/10" : ""}`}
            >
              <div className="font-semibold text-white leading-snug overflow-x-hidden text-ellipsis whitespace-nowrap">
                {p.title}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPill status={p.status} />
                {p.clientName ? <span className="text-xs text-gray-500 leading-normal">{p.clientName}</span> : null}
              </div>
            </button>
          ))}
        </section>

        <section className="lg:col-span-3 border border-white/10 bg-[#353535] min-h-[280px]">
          {!selected ? (
            <div className="p-6 text-sm text-gray-400">Select a project to design its mix and see batches.</div>
          ) : (
            <div className="p-4 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <h2 className="text-xl font-black uppercase text-white leading-snug overflow-x-hidden text-ellipsis whitespace-nowrap">
                    {selected.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={selected.status} />
                    {selected.clientName ? (
                      <span className="text-sm text-gray-300 leading-normal">{selected.clientName}</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500 font-mono leading-normal">{selected.id}</p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={editSelected}
                    className="px-3 py-2 border border-white/10 text-xs font-bold uppercase tracking-wider leading-normal hover:bg-white/5"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(selected.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider leading-normal hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {selected.notes ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap border border-white/10 p-3 bg-[#232323] leading-relaxed">
                  {selected.notes}
                </p>
              ) : null}

              {selected.quoteId ? (
                <div className="border border-white/10 bg-[#232323] p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold leading-normal">
                      Linked quote
                    </h3>
                    <p className="text-sm text-gray-300 mt-1 font-mono">{selected.quoteId}</p>
                  </div>
                  <Link
                    to={`/app/quotes/${encodeURIComponent(selected.quoteId)}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/15 text-xs font-bold uppercase tracking-wider hover:bg-white/5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Open quote
                  </Link>
                </div>
              ) : null}

              <div className="border border-white/10 bg-[#232323] p-4 space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold leading-normal">
                  Project recipe
                </h3>
                {selected.mixRecipeId ? (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Linked mix — opens in Mix designer (same data as Mix Lab).
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    No recipe yet. Open Mix designer, start from a shop base or blank, then Save to project.
                  </p>
                )}
                <Link
                  to={designerHref(selected)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider leading-normal hover:bg-gray-100"
                >
                  <Beaker className="w-3.5 h-3.5" />
                  {selected.mixRecipeId ? "Open mix" : "Design mix"}
                </Link>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3 leading-normal">
                  Batches
                </h3>
                {!batches.length ? (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    No batches yet. Weigh from Mix Lab Staff with this project selected.
                  </p>
                ) : (
                  <div className="divide-y divide-white/10 border border-white/10">
                    {batches.map((b) => (
                      <div key={b.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-medium text-white leading-snug">{b.recipeName || "Untitled"}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5 leading-normal">{fmtWhen(b.at)}</div>
                        </div>
                        <div className="text-sm text-gray-300 leading-normal">
                          {b.weighedBy || "—"} · {fmtDry(b.dryWeight)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
