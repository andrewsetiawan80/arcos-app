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

  const idx = state.recipes.findIndex(r => r.id === id);
  const recipe = state.recipes[idx];

  const materials = state.materials;
  const matsById = useMemo(() => {
    const m: Record<string, Material> = {};
    materials.forEach(x => (m[x.id] = x));
    return m;
  }, [materials]);

  const PROC_LIST = getProcesses(state);

  useEffect(() => save(state), [state]);

  if (!recipe) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Recipe not found</h1>
        <button
          className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
          onClick={() => navigate("/recipes")}
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  function updateRecipe(patch: Partial<Recipe>) {
    setState(s => {
      const list = [...s.recipes];
      list[idx] = { ...list[idx], ...patch, updatedAt: now() };
      return { ...s, recipes: list };
    });
  }

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Edit Recipe</h1>
        <div className="flex gap-2">
          <button
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            onClick={() => navigate("/recipes")}
          >
            Back
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Name</div>
            <input
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
              value={recipe.name}
              onChange={e => updateRecipe({ name: e.target.value })}
            />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Process / Category</div>
            <select
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm mb-2"
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
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mb-1">Or type a new category key (e.g., ECC):</div>
            <div className="flex gap-2">
              <input
                placeholder="ECC"
                className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={customProcess}
                onChange={e => setCustomProcess(e.target.value)}
              />
              <button
                className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                onClick={() => {
                  if (!customProcess.trim()) return;
                  updateRecipe({ process: customProcess.trim() });
                }}
              >
                Use
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Current: <span className="font-mono">{recipe.process}</span> {currentLabel !== recipe.process ? `(${currentLabel})` : ""}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Version</div>
              <input
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={recipe.version || ""}
                onChange={e => updateRecipe({ version: e.target.value })}
              />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Density (kg/m³)</div>
              <NumberField
                className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                value={recipe.densityKgM3}
                onChange={(v)=>updateRecipe({ densityKgM3: v })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 overflow-x-auto">
        <div className="flex items-center justify-between p-4">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Ingredients</div>
          <button
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            onClick={addLine}
          >
            + Add Line
          </button>
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
                <td colSpan={4} className="py-6 px-4 text-gray-400">
                  No ingredients yet. Click “Add Line”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
