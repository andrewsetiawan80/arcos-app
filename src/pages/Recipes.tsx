import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Recipe } from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export default function Recipes() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(() => load());
  const PROC_LIST = getProcesses(state);

  function addRecipe() {
    const name = prompt("Recipe name:", "New Recipe");
    if (!name) return;
    const proc = PROC_LIST[0]?.key || "GENERAL";
    const r: Recipe = {
      id: newid(),
      name,
      process: proc,
      version: "v0.1",
      densityKgM3: undefined,
      lines: [],
      createdAt: now(),
      updatedAt: now(),
    };
    const next = { ...state, recipes: [r, ...state.recipes] };
    setState(next); save(next);
    navigate(`/recipes/${r.id}`);
  }

  function cloneRecipe(id: string) {
    const src = state.recipes.find(r => r.id === id);
    if (!src) return;
    const name = prompt("Clone name:", src.name + " (copy)");
    if (!name) return;
    const r: Recipe = {
      ...src,
      id: newid(),
      name,
      version: src.version,
      createdAt: now(),
      updatedAt: now(),
    };
    const next = { ...state, recipes: [r, ...state.recipes] };
    setState(next); save(next);
  }

  function deleteRecipe(id: string) {
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;
    const ok = confirm(`Delete recipe "${recipe.name}"? This cannot be undone.`);
    if (!ok) return;
    const next = { ...state, recipes: state.recipes.filter(r => r.id !== id) };
    setState(next); save(next);
  }

  const grouped = useMemo(() => {
    const g: Record<string, Recipe[]> = {};
    for (const r of state.recipes) (g[r.process] ||= []).push(r);
    for (const k of Object.keys(g)) g[k].sort((a, b) => a.name.localeCompare(b.name));
    return g;
  }, [state.recipes]);

  const keysSorted = useMemo(() => {
    const order = PROC_LIST.map(p => p.key);
    const others = Object.keys(grouped).filter(k => !order.includes(k)).sort();
    return [...order, ...others].filter(k => grouped[k]?.length);
  }, [grouped, PROC_LIST]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Recipes</h1>
        <button
          className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow"
          onClick={addRecipe}
        >
          + Add Recipe
        </button>
      </div>

      <div className="space-y-8">
        {keysSorted.map(procKey => (
          <section key={procKey} className="space-y-3">
            <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
              {getProcessLabel(state, procKey)}
              <span className="text-gray-500 font-normal"> — key: {procKey}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 divide-y divide-white/10">
              {grouped[procKey].map(r => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-white/5">
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-gray-400">
                      v{r.version || "—"} · Density {r.densityKgM3 ?? "—"} kg/m³ · {r.lines.length} ingredients
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                      to={`/recipes/${r.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                      onClick={() => cloneRecipe(r.id)}
                    >
                      Clone
                    </button>
                    <button
                      className="rounded-lg px-3 py-2 text-sm border border-red-500/50 text-red-300 hover:bg-red-500/10"
                      onClick={() => deleteRecipe(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {!keysSorted.length && (
          <div className="text-gray-400 text-sm">No recipes yet. Click “Add Recipe”.</div>
        )}
      </div>
    </div>
  );
}
