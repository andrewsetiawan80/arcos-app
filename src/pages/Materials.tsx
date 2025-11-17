import { useMemo, useState, useEffect } from "react";
import { load, save } from "../store";
import type { AppState, Material, Currency } from "../types";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);

export default function Materials() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const appState = await load();
        setState(appState);
      } catch (error) {
        console.error('Failed to load state:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading || !state) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  const add = () => {
    const m: Material = {
      id: newid(),
      name: "New Material",
      densityKgM3: undefined,
      pricePerKg: undefined,
      priceCurrency: "IDR",
    };
    const next = { ...state, materials: [m, ...state.materials] };
    setState(next);
    setHasUnsavedChanges(true);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this material?")) return;
    const materials = state.materials || [];
    const next = { ...state, materials: materials.filter(m => m.id !== id) };
    setState(next);
    setHasUnsavedChanges(true);
  };

  const update = (id: string, patch: Partial<Material>) => {
    const materials = state.materials || [];
    const list = materials.map(m => m.id === id ? { ...m, ...patch } : m);
    const next = { ...state, materials: list };
    setState(next);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Materials saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save materials. Please try again.");
    }
  };

  const mats = state.materials;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="border-b border-white/10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Material Management</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Materials
            </h1>
            <p className="text-base text-gray-300 max-w-xl leading-relaxed">
              Manage your concrete materials, their properties, and pricing information.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400 uppercase tracking-wider font-bold">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            <button 
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Materials
            </button>
            <button 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A2A2A] border border-white/10 text-white text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors"
              onClick={add}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Material
            </button>
          </div>
        </div>
      </header>

      <section>
        <div className="border border-white/10 bg-[#2A2A2A]">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-black uppercase text-white">Material Database</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1A1A1A]">
                <tr>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Material Name</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Density (kg/m³)</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Price / kg</th>
                  <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Currency</th>
                  <th className="py-4 px-6 border-b border-white/10"></th>
                </tr>
              </thead>
          <tbody>
              {mats.map(m => (
                <tr key={m.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="py-4 px-6 border-b border-white/10">
                    <input
                      className="w-full bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-[#2A2A2A] transition-colors"
                      value={m.name}
                      onChange={e => update(m.id, { name: e.target.value })}
                      placeholder="Material name"
                    />
                  </td>
                  <td className="py-4 px-6 border-b border-white/10">
                    <NumberField
                      className="w-40 bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-[#2A2A2A] transition-colors"
                      value={m.densityKgM3}
                      onChange={(v) => update(m.id, { densityKgM3: v ?? undefined })}
                      step="1"
                      placeholder="Density"
                    />
                  </td>
                  <td className="py-4 px-6 border-b border-white/10">
                    <NumberField
                      className="w-40 bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:bg-[#2A2A2A] transition-colors"
                      value={m.pricePerKg}
                      onChange={(v) => update(m.id, { pricePerKg: v ?? undefined })}
                      step="0.01"
                      placeholder="Price"
                    />
                  </td>
                  <td className="py-4 px-6 border-b border-white/10">
                    <select
                      className="w-32 bg-[#1A1A1A] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 focus:bg-[#2A2A2A] transition-colors"
                      value={m.priceCurrency || "IDR"}
                    onChange={e => update(m.id, { priceCurrency: e.target.value as Currency })}
                  >
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </td>
                  <td className="py-4 px-6 border-b border-white/10">
                    <button 
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 text-xs uppercase tracking-wider font-bold transition-colors flex items-center gap-1"
                      onClick={() => remove(m.id)}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {!mats.length && (
                <tr>
                  <td className="py-12 px-6 text-center" colSpan={5}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-sm text-gray-400">
                        No materials yet. Click <span className="font-bold text-white uppercase">"Add Material"</span> to get started.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
    </div>
  );
}
