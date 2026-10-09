import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Recipe, RecipeLine, Unit, ProductRecipe } from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";
import { syncMixLabBaseRecipes } from "../lib/mixLabBaseRecipes";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search).entries()), [search]);
}

const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function DeriveRecipe() {
  const navigate = useNavigate();
  const q = useQuery();
  const baseId = q.base || "";
  const productId = q.product || "";
  const variantId = q.variant || "";
  const processKey = q.process || "";

  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [name, setName] = useState("Derived Recipe");
  const [version, setVersion] = useState("v0.1");
  const [density, setDensity] = useState<number | "">("");
  const [tags, setTags] = useState("");
  const [selectedProcess, setSelectedProcess] = useState(processKey || "");
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const hydratedBaseId = React.useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void syncMixLabBaseRecipes().then(({ state: synced, changed }) => {
      if (!cancelled && changed) setState(synced);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const recipes = state.recipes || [];
  const materials = state.materials || [];
  const base = recipes.find((r) => r.id === baseId);

  function productVariantTitle(s: AppState, pid: string, vid: string) {
    const products = s.products || [];
    const p = products.find((x) => x.id === pid);
    const v = p?.variants?.find((x) => x.id === vid);
    return p && v ? `${p.title} / ${v.name}` : "";
  }

  // Hydrate form once when base is available (including after Mix Lab sync)
  useEffect(() => {
    if (!base) return;
    if (hydratedBaseId.current === base.id) return;
    hydratedBaseId.current = base.id;
    const pv = productVariantTitle(state, productId, variantId);
    setName(`${base.name} — ${pv || "variant"} (${new Date().toLocaleDateString()})`);
    setDensity(base.densityKgM3 ?? "");
    setSelectedProcess(base.process || processKey || "");
    setLines(base.lines.map((l) => ({ ...l, id: newid() })));
  }, [base?.id, productId, variantId, processKey]);

  async function handleDeleteRecipe(recipeId: string) {
    if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      const updatedState = {
        ...state,
        recipes: (state.recipes || []).filter(recipe => recipe.id !== recipeId)
      };
      setState(updatedState);
      await save(updatedState);
      console.log('Recipe deleted successfully');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  }

  function addLine() {
    const firstMat = materials[0]?.id || "";
    setLines([{ id: newid(), materialId: firstMat, unit: "ratio", amount: 0.01 }, ...lines]);
  }
  function updateLine(lineId: string, patch: Partial<RecipeLine>) {
    setLines(lines.map(l => (l.id === lineId ? { ...l, ...patch } : l)));
  }
  function removeLine(lineId: string) {
    setLines(lines.filter(l => l.id !== lineId));
  }

  function quickAddPigment(name: string, amount: number, unit: Unit = "ratio") {
    // find or create material by name
    let mat = materials.find(m => m.name === name);
    if (!mat) {
      mat = { id: newid(), name };
      const nextS = { ...state, materials: [mat, ...materials] };
      setState(nextS);
    }
    setLines([{ id: newid(), materialId: mat.id, amount, unit }, ...lines]);
  }
  function quickWaterDelta(deltaRatio: number) {
    // append a water ratio delta as a separate line (keeps base intact)
    const waterMat = findOrCreateMaterial("Water");
    setLines([{ id: newid(), materialId: waterMat.id, amount: deltaRatio, unit: "ratio" }, ...lines]);
  }
  function findOrCreateMaterial(name: string) {
    let m = materials.find(mm => mm.name === name);
    if (!m) {
      m = { id: newid(), name };
      const nextS = { ...state, materials: [m, ...materials] };
      setState(nextS);
    }
    return m;
  }

  async function saveDerived() {
    if (!base) {
      return alert("Base recipe not found.");
    }
    if (!name.trim()) {
      return alert("Please enter a name.");
    }

    const recipeId = newid();
    const stamp = now();
    const familyTag = productId ? `${productId}-family` : "product-family";

    // Backend product_recipes.recipe_id FK → recipes.id, so the derived
    // formula must live in recipes (not only in productRecipes).
    const newRecipe: Recipe = {
      id: recipeId,
      name: name.trim(),
      process: selectedProcess || base.process || processKey || "GENERAL",
      version,
      densityKgM3: density === "" ? undefined : Number(density),
      lines,
      tags: [familyTag, "derived"],
      createdAt: stamp,
      updatedAt: stamp,
    };

    const newProductRecipe: ProductRecipe = {
      id: recipeId,
      name: newRecipe.name,
      process: newRecipe.process,
      version,
      densityKgM3: newRecipe.densityKgM3,
      lines,
      productId: productId || "",
      variantId: variantId || "",
      baseRecipeId: base.id,
      createdAt: stamp,
      updatedAt: stamp,
    };

    const next: AppState = {
      ...state,
      recipes: [newRecipe, ...(state.recipes || []).filter((r) => r.id !== recipeId)],
      productRecipes: [
        newProductRecipe,
        ...(state.productRecipes || []).filter((r) => r.id !== recipeId),
      ],
    };

    const assignProcess = processKey || selectedProcess || newRecipe.process;
    if (productId && variantId && assignProcess) {
      const products = next.products || [];
      const pIdx = products.findIndex((p) => p.id === productId);
      if (pIdx >= 0) {
        const prod = { ...products[pIdx] };
        const variants = prod.variants || [];
        const vIdx = variants.findIndex((v) => v.id === variantId);
        if (vIdx >= 0) {
          const v = { ...variants[vIdx] };
          const map = { ...(v.recipeByProcess || {}) };
          map[assignProcess] = recipeId;
          v.recipeByProcess = map;
          prod.variants = variants.map((vv, i) => (i === vIdx ? v : vv));
          prod.updatedAt = stamp;
          next.products = products.map((pp, i) => (i === pIdx ? prod : pp));
        }
      }
    }

    setState(next);
    setHasUnsavedChanges(true);

    try {
      await save(next);
      setHasUnsavedChanges(false);
      alert(`Product recipe “${newRecipe.name}” saved and assigned.`);
      if (productId) {
        navigate(`/app/products/edit?product=${productId}&variant=${variantId}`);
      } else {
        navigate(`/app/recipes/${recipeId}`);
      }
    } catch (error) {
      console.error("DeriveRecipe: Failed to save recipe:", error);
      const detail = error instanceof Error ? error.message : String(error);
      alert(
        detail
          ? `Recipe created locally but failed to save: ${detail}`
          : "Recipe created but failed to save. Please try saving manually."
      );
    }
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Recipe derivation saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save recipe derivation. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
<div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Recipe Development</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Create Recipe
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Create new recipes from scratch or derive them from existing base recipes. These recipes can then be assigned to your products.
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
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Recipe
            </button>
            <button 
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg flex items-center gap-2"
              onClick={()=>navigate(-1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>

      {!base ? (
        <div className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <h2 className="text-lg font-bold text-white">Select Base Recipe</h2>
          </div>
          <p className="text-sm text-gray-300 mb-6">
            Choose an existing recipe to use as the foundation for your new recipe.
          </p>
          
          {recipes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">No recipes available</div>
              <div className="text-sm text-gray-500">Create some recipes first to use as base recipes.</div>
              <button 
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Reset to seed data
                  localStorage.removeItem('arcos_app_state');
                  navigate('/app/derive-recipe');
                }}
              >
                Load Sample Recipes
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <button
                      className="flex-1 text-left"
                      onClick={() => {
                        const url = `/app/derive-recipe?base=${encodeURIComponent(recipe.id)}`;
                        navigate(url);
                      }}
                    >
                      <div>
                        <div className="font-semibold text-white">{recipe.name}</div>
                        <div className="text-sm text-gray-400">
                          {recipe.process} • {recipe.lines.length} materials
                          {recipe.densityKgM3 && ` • ${recipe.densityKgM3} kg/m³`}
                        </div>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id);
                        }}
                        title="Delete recipe"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          From base: <b>{base.name}</b> (key: <span className="font-mono">{base.id}</span>)
        </div>
      )}

      {base && (
        <>
          <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Name</div>
            <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                   value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Process</div>
            <select className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={selectedProcess} onChange={e=>setSelectedProcess(e.target.value)}>
              {getProcesses(state).map(proc => (
                <option key={proc.key} value={proc.key}>
                  {proc.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Version</div>
              <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                     value={version} onChange={e=>setVersion(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Density (kg/m³)</div>
              <input type="number" className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                     value={density as any} onChange={e=>setDensity(e.target.value===""?"":+e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">Tags (comma separated)</div>
          <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                 placeholder="charcoal, high-water, export"
                 value={tags} onChange={e=>setTags(e.target.value)} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Adjustments</div>
          <div className="flex gap-2">
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={()=>quickAddPigment("Pigment — carbon black", 0.01, "ratio")}>
              + Add carbon black (0.01 ratio)
            </button>
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={()=>quickWaterDelta(0.01)}>
              + Extra water (0.01 ratio)
            </button>
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={addLine}>
              + Add line
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/10">
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
              {lines.map(line=>(
                <tr key={line.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 border-b border-white/5">
                    <select className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.materialId}
                      onChange={e=>updateLine(line.id, { materialId: e.target.value })}>
                      {materials.map(m=>(
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <select className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.unit}
                      onChange={e=>updateLine(line.id, { unit: e.target.value as Unit })}>
                      {["ratio","kg","g","L","mL"].map(u=><option value={u} key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <input type="number" step="0.001"
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.amount}
                      onChange={e=>updateLine(line.id, { amount: +e.target.value })} />
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                            onClick={()=>removeLine(line.id)}>Remove</button>
                  </td>
                </tr>
              ))}
              {!lines.length && (
                <tr><td colSpan={4} className="py-6 px-4 text-gray-400">No lines. Use the buttons above to add.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-lg px-4 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                  onClick={()=>navigate(-1)}>Cancel</button>
          <button className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow"
                  onClick={async () => await saveDerived()}>Save Derived Recipe</button>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
