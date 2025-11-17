import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Material, Recipe, RecipeLine, Unit } from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function RecipeEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const recipes = state.recipes || [];
  const idx = recipes.findIndex(r => r.id === id);
  const recipe = idx >= 0 ? recipes[idx] : undefined;

  const materials = state.materials || [];
  const matsById = useMemo(() => {
    const m: Record<string, Material> = {};
    materials.forEach(x => (m[x.id] = x));
    return m;
  }, [materials]);

  const PROC_LIST = getProcesses(state);

  // No auto-save - only manual saves

  if (!recipe) {
    return (
      <div className="space-y-8 animate-in fade-in-0 duration-700">
        <div className="flex flex-col items-center gap-6 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Recipe Not Found</h1>
            <p className="text-sm text-gray-400 mb-6">The recipe you're looking for doesn't exist or has been deleted.</p>
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              onClick={() => navigate("/app/recipes")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  function updateRecipe(patch: Partial<Recipe>) {
    setState(s => {
      const list = [...s.recipes];
      list[idx] = { ...list[idx], ...patch, updatedAt: now() };
      return { ...s, recipes: list };
    });
    setHasUnsavedChanges(true);
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Recipe saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save recipe. Please try again.");
    }
  };

  function addLine() {
    const firstMat = materials[0]?.id || "";
    const line: RecipeLine = { id: newid(), materialId: firstMat, amount: 1, unit: "ratio" };
    updateRecipe({ lines: [line, ...recipe.lines] });
  }

  function updateLine(lineId: string, patch: Partial<RecipeLine>) {
    const lines = recipe.lines.map(l => (l.id === lineId ? { ...l, ...patch } : l));
    updateRecipe({ lines });
  }

  function removeLine(lineId: string) {
    updateRecipe({ lines: recipe.lines.filter(l => l.id !== lineId) });
  }

  const [customProcess, setCustomProcess] = useState<string>("");
  const currentLabel = getProcessLabel(state, recipe.process);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Recipe Editor</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Edit Recipe
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Modify recipe ingredients, ratios, and specifications for your concrete formulations.
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
              Save Recipe
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              onClick={() => navigate("/app/recipes")}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Recipes
            </button>
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-black text-white">Recipe Details</h2>
          </div>
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Recipe Name</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={recipe.name}
                  onChange={e => updateRecipe({ name: e.target.value })}
                  placeholder="Enter recipe name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Process / Category</label>
                <select
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={PROC_LIST.find(p => p.key === recipe.process) ? recipe.process : ""}
                  onChange={e => {
                    const key = e.target.value;
                    if (!key) return;
                    updateRecipe({ process: key });
                    setCustomProcess("");
                  }}
                >
                  <option value="">— Choose existing —</option>
                  {PROC_LIST.map(p => (
                    <option key={p.key} value={p.key} className="bg-gray-800 text-white">
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-400">Or create a new category:</div>
                <div className="flex gap-2">
                  <input
                    placeholder="e.g., ECC"
                    className="flex-1 rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                    value={customProcess}
                    onChange={e => setCustomProcess(e.target.value)}
                  />
                  <button
                    className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105"
                    onClick={() => {
                  if (!customProcess.trim()) return;
                  updateRecipe({ process: customProcess.trim() });
                }}
              >
                Use
              </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Current: <span className="font-mono text-white">{recipe.process}</span>{" "}
                  {currentLabel !== recipe.process ? `(${currentLabel})` : ""}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Version</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={recipe.version || ""}
                  onChange={e => updateRecipe({ version: e.target.value })}
                  placeholder="e.g., v1.0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Density (kg/m³)</label>
                <NumberField
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={recipe.densityKgM3}
                  onChange={(v)=>updateRecipe({ densityKgM3: v })}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h2 className="text-lg font-black text-white">Ingredients</h2>
              </div>
              <button
                className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                onClick={addLine}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Ingredient
              </button>
            </div>
          </div>

        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Material</th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10 w-28">Unit</th>
              <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10 w-32">Amount</th>
              <th className="py-3 px-4 border-b border-white/10 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {recipe.lines.map(line => (
              <tr key={line.id} className="hover:bg-white/5">
                <td className="py-3 px-4 border-b border-white/5">
                  <select
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={line.materialId}
                    onChange={e => updateLine(line.id, { materialId: e.target.value })}
                  >
                    {materials.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <select
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={line.unit}
                    onChange={e => updateLine(line.id, { unit: e.target.value as Unit })}
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <NumberField
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={line.amount}
                    onChange={(v)=>updateLine(line.id, { amount: v ?? 0 })}
                  />
                </td>
                <td className="py-3 px-4 border-b border-white/5">
                  <button
                    className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={() => removeLine(line.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!recipe.lines.length && (
              <tr>
                <td colSpan={4} className="py-8 px-6 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-400">
                      No ingredients yet. Click <span className="font-semibold text-white">"Add Ingredient"</span> to get started.
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </section>
    </div>
  );
}
