import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, LabEntry, Unit } from "../types";

const newid = () => Math.random().toString(36).slice(2, 10);
const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function LabEntryEditor() {
  const { id = "" } = useParams();
  const isNew = id === "new";
  const [state, setState] = useState<AppState>(() => {
    const s = load();
    if (!s.labEntries) s.labEntries = [];
    return s;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // No auto-save - only manual saves

  const navigate = useNavigate();

  // For new entries, create a temporary entry
  const [newEntry, setNewEntry] = useState<LabEntry | null>(null);
  
  const idx = isNew ? -1 : (state.labEntries || []).findIndex((e) => e.id === id);
  const entry = isNew ? newEntry : (idx >= 0 ? state.labEntries![idx] : undefined);

  // Initialize new entry if needed
  useEffect(() => {
    if (isNew && !newEntry) {
      const now = new Date().toISOString();
      const entry: LabEntry = {
        id: newid(),
        title: "New Experiment",
        status: "draft",
        notes: "",
        images: [],
        videos: [],
        lines: [],
        createdAt: now,
        updatedAt: now,
      };
      setNewEntry(entry);
    }
  }, [isNew, newEntry]);

  // derive
  const materials = state.materials || [];

  // computed totals
  const { totalMassKg, ratioSum } = useMemo(() => {
    let totalKg = 0;
    let sumRatio = 0;
    for (const line of entry?.lines || []) {
      const amt = Number(line.amount || 0);
      if (line.unit === "ratio") sumRatio += amt;
      if (line.unit === "kg") totalKg += amt;
      if (line.unit === "g") totalKg += amt / 1000;
      // Liquids (L/mL) not included in mass unless you want density support later
    }
    return { totalMassKg: totalKg, ratioSum: sumRatio };
  }, [entry]);

  function updateEntry(patch: Partial<LabEntry>) {
    if (isNew && newEntry) {
      setNewEntry({ ...newEntry, ...patch, updatedAt: new Date().toISOString() });
    } else {
      setState((s) => {
        const list = (s.labEntries || []).slice();
        if (idx < 0) return s;
        list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
        return { ...s, labEntries: list };
      });
    }
    setHasUnsavedChanges(true);
  }

  function saveNewEntry() {
    if (!isNew || !newEntry) return;
    setState((s) => {
      const list = (s.labEntries || []).slice();
      list.unshift(newEntry);
      return { ...s, labEntries: list };
    });
    setHasUnsavedChanges(true);
    navigate(`/app/lab/${newEntry.id}`);
  }

  function removeEntry() {
    if (!entry) return;
    if (!confirm("Delete this lab entry?")) return;
    setState((s) => ({ ...s, labEntries: (s.labEntries || []).filter((e) => e.id !== entry.id) }));
    setHasUnsavedChanges(true);
    navigate("/app/lab");
  }

  function addLine() {
    if (!entry) return;
    const firstMaterial = materials[0];
    const newLine = {
      id: newid(),
      materialId: firstMaterial ? firstMaterial.id : "",
      unit: "ratio" as Unit,
      amount: 1,
    };
    updateEntry({ lines: [...(entry.lines || []), newLine] });
  }

  function updateLine(lineId: string, patch: Partial<LabEntry["lines"][number]>) {
    if (!entry) return;
    const lines = (entry.lines || []).map((l) => (l.id === lineId ? { ...l, ...patch } : l));
    updateEntry({ lines });
  }

  function removeLine(lineId: string) {
    if (!entry) return;
    const lines = (entry.lines || []).filter((l) => l.id !== lineId);
    updateEntry({ lines });
  }

  function addImage() {
    if (!entry) return;
    const url = prompt("Image URL:");
    if (!url) return;
    updateEntry({ images: [...(entry.images || []), url.trim()] });
  }

  function removeImage(i: number) {
    if (!entry) return;
    const arr = (entry.images || []).slice();
    arr.splice(i, 1);
    updateEntry({ images: arr });
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Lab entry saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save lab entry. Please try again.");
    }
  };

  if (!entry) {
    return (
      <div className="space-y-8 animate-in fade-in-0 duration-700">
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Entry Not Found</h1>
            <p className="text-sm text-gray-400 mb-6">The lab entry you're looking for doesn't exist or has been deleted.</p>
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              onClick={() => navigate("/app/lab")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Lab Entry Editor</p>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                {entry.title || "Untitled"}
              </h1>
              <span className="text-xs rounded-full px-3 py-1.5 bg-white/10 border border-white/20 text-white font-semibold">
                {entry.status}
              </span>
            </div>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Document your concrete experiment details, test results, and observations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            <button 
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Lab Entry
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              onClick={() => navigate("/app/lab")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lab
            </button>
            {!isNew && (
              <button
                className="px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-all duration-300 hover:border-red-400/50 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                onClick={removeEntry}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Main card */}
        <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-6">
          {/* Meta */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-stone-400 mb-1">Title</div>
              <input
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={entry.title || ""}
                onChange={(e) => updateEntry({ title: e.target.value })}
              />
            </div>
            <div>
              <div className="text-xs text-stone-400 mb-1">Status</div>
              <select
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={entry.status || "draft"}
                onChange={(e) => updateEntry({ status: e.target.value as LabEntry["status"] })}
              >
                <option value="draft">Draft</option>
                <option value="running">Running</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-xs text-stone-400 mb-1">Notes</div>
            <textarea
              rows={6}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={entry.notes || ""}
              onChange={(e) => updateEntry({ notes: e.target.value })}
            />
          </div>

          {/* Materials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Materials</div>
              <button
                className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                onClick={addLine}
                type="button"
              >
                + Add Line
              </button>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-stone-300">
                  <tr>
                    <th className="text-left px-3 py-2 w-[40%]">Material</th>
                    <th className="text-left px-3 py-2">Unit</th>
                    <th className="text-left px-3 py-2">Amount</th>
                    <th className="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {(entry.lines || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-stone-500">
                        No lines yet. Click “Add Line”.
                      </td>
                    </tr>
                  ) : (
                    (entry.lines || []).map((line) => (
                      <tr key={line.id} className="border-t border-white/10">
                        <td className="px-3 py-2">
                          <select
                            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                            value={line.materialId}
                            onChange={(e) => updateLine(line.id, { materialId: e.target.value })}
                          >
                            {materials.length === 0 && <option value="">(no materials)</option>}
                            {materials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                            value={line.unit}
                            onChange={(e) => updateLine(line.id, { unit: e.target.value as Unit })}
                          >
                            {UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            step="any"
                            className="w-36 rounded-lg bg-black/30 border border-white/10 px-3 py-2"
                            value={line.amount ?? ""}
                            onChange={(e) => updateLine(line.id, { amount: e.target.value === "" ? undefined : Number(e.target.value) })}
                          />
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            className="rounded-md px-2 py-1 border border-white/10 hover:bg-white/10"
                            onClick={() => removeLine(line.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-stone-400">
              Ratio sum: <span className="text-stone-200">{ratioSum.toFixed(3)}</span> •
              Total mass: <span className="text-stone-200">{totalMassKg.toFixed(3)} kg</span>
            </div>
          </div>
        </section>

        {/* Side card */}
        <aside className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
          <div>
            <div className="text-xs text-stone-400 mb-1">Images</div>
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10" onClick={addImage}>
              + Add Image
            </button>
            {(entry.images || []).length === 0 ? (
              <div className="mt-3 text-sm text-stone-500">No images yet.</div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {entry.images!.map((url, i) => (
                  <div key={i} className="space-y-2">
                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-white/10">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <button
                      className="w-full rounded-md px-2 py-1 text-xs border border-white/10 hover:bg-white/10"
                      onClick={() => removeImage(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promote to recipe/product (stubs) */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-stone-400 mb-2">Actions</div>
            <button
              className="w-full rounded-lg px-3 py-2 text-sm border border-white/10 hover:bg-white/10 mb-2"
              onClick={() => alert("Stub: convert to base recipe mix")}
            >
              Convert to Base Recipe…
            </button>
            <button
              className="w-full rounded-lg px-3 py-2 text-sm border border-white/10 hover:bg-white/10"
              onClick={() => alert("Stub: convert to product recipe")}
            >
              Convert to Product Recipe…
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
