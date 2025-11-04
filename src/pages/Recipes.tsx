import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Recipe, RecipeLine, Unit } from "../types";
import { getProcesses, getProcessLabel } from "../lib/process";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function Recipes() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(() => load());
  const PROC_LIST = getProcesses(state);

  // Refresh data when component mounts or becomes visible
  useEffect(() => {
    const refreshData = () => {
      const freshState = load();
      setState(freshState);
      console.log('Recipes page refreshed - recipes count:', freshState.recipes?.length || 0);
    };
    
    // Refresh immediately
    refreshData();
    
    // Also refresh when page becomes visible (user navigates back to this page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Recipe derivation state
  const [showDeriveModal, setShowDeriveModal] = useState(false);
  const [selectedBaseRecipe, setSelectedBaseRecipe] = useState<Recipe | null>(null);
  const [deriveName, setDeriveName] = useState("");
  const [deriveVersion, setDeriveVersion] = useState("v0.1");
  const [deriveDensity, setDeriveDensity] = useState<number | "">("");
  const [deriveTags, setDeriveTags] = useState("");
  const [deriveLines, setDeriveLines] = useState<RecipeLine[]>([]);
  const [deriveProcess, setDeriveProcess] = useState("");

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
    setState(next);
    save(next);
    navigate(`/app/recipes/${r.id}`); // 👈 fixed path
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
    setState(next);
    save(next);
  }

  function deleteRecipe(id: string) {
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;
    const ok = confirm(`Delete recipe "${recipe.name}"? This cannot be undone.`);
    if (!ok) return;
    const next = { ...state, recipes: state.recipes.filter(r => r.id !== id) };
    setState(next);
    save(next);
  }


  // Recipe derivation functions
  function startDerivation(baseRecipe: Recipe) {
    setSelectedBaseRecipe(baseRecipe);
    setDeriveName(`${baseRecipe.name} — derived (${new Date().toLocaleDateString()})`);
    setDeriveVersion("v0.1");
    setDeriveDensity(baseRecipe.densityKgM3 ?? "");
    setDeriveProcess(baseRecipe.process);
    setDeriveLines(baseRecipe.lines.map(l => ({ ...l, id: newid() })));
    setDeriveTags("");
    setShowDeriveModal(true);
  }

  function saveDerivedRecipe() {
    if (!selectedBaseRecipe) return;
    if (!deriveName.trim()) return alert("Please enter a recipe name.");

    const newRecipe: Recipe = {
      id: newid(),
      name: deriveName.trim(),
      process: deriveProcess,
      version: deriveVersion,
      densityKgM3: deriveDensity === "" ? undefined : Number(deriveDensity),
      lines: deriveLines,
      parentId: selectedBaseRecipe.id,
      tags: deriveTags.split(",").map(s => s.trim()).filter(Boolean),
      createdAt: now(),
      updatedAt: now(),
    };

    const next = { ...state, recipes: [newRecipe, ...state.recipes] };
    setState(next);
    setHasUnsavedChanges(true);
    setShowDeriveModal(false);
    alert("Derived recipe created successfully!");
    navigate(`/app/recipes/${newRecipe.id}`);
  }

  function addDeriveLine() {
    if (state.materials.length === 0) {
      alert("Please create materials first");
      return;
    }
    const firstMaterial = state.materials[0];
    const newLine: RecipeLine = {
      id: newid(),
      materialId: firstMaterial.id,
      amount: 0.01,
      unit: "ratio",
    };
    setDeriveLines([newLine, ...deriveLines]);
  }

  function updateDeriveLine(lineId: string, patch: Partial<RecipeLine>) {
    setDeriveLines(deriveLines.map(l => (l.id === lineId ? { ...l, ...patch } : l)));
  }

  function removeDeriveLine(lineId: string) {
    setDeriveLines(deriveLines.filter(l => l.id !== lineId));
  }

  // Separate main recipes from product recipes
  const { mainRecipes, productRecipes, productGrouped } = useMemo(() => {
    const main: Recipe[] = [];
    const product: Recipe[] = [];
    
    state.recipes.forEach(recipe => {
      // Check if it's a product recipe (has family tag)
      const isProductRecipe = recipe.tags?.some(tag => tag.includes('-family'));
      if (isProductRecipe) {
        product.push(recipe);
      } else {
        main.push(recipe);
      }
    });
    
    // Group product recipes by family
    const grouped: Record<string, Recipe[]> = {};
    product.forEach(recipe => {
      const familyTag = recipe.tags?.find(tag => tag.includes('-family'));
      if (familyTag) {
        const familyName = familyTag.replace('-family', '');
        if (!grouped[familyName]) grouped[familyName] = [];
        grouped[familyName].push(recipe);
      }
    });
    
    return { mainRecipes: main, productRecipes: product, productGrouped: grouped };
  }, [state.recipes]);

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
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Recipe Management</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Recipe Book
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Manage your concrete formulations, ingredients, and specifications for different processes.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              onClick={addRecipe}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Recipe
            </button>
          </div>
        </div>
      </header>

      {/* Recipe System Explanation */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">How Recipe System Works</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">🏗️ Base Recipes</h4>
                <p>Create fundamental recipes (UHPC, GFRC, etc.) that serve as foundations for all your products.</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-2">🏭 Product Recipes</h4>
                <p>Derive specific recipes for each product variant by modifying base recipes.</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">📦 Product Assignment</h4>
                <p>Assign recipes to products in the Product Editor for production planning.</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">🗂️ Recipe Families</h4>
                <p>Organize related recipes into families for better management and discovery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Main Recipes Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-blue-600/3 rounded-2xl blur-2xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-lg font-black text-white">Main Recipes</h2>
              <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg">{mainRecipes.length}</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture divide-y divide-white/10">
              {mainRecipes.map(r => (
                  <div key={r.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-200 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-125 transition-transform duration-200" />
                        <h3 className="font-bold text-white text-lg">{r.name}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          v{r.version || "—"}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {r.densityKgM3 ?? "—"} kg/m³
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          {r.lines.length} ingredients
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        to={`/app/recipes/${r.id}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        className="px-3 py-2 rounded-lg border border-green-500/50 text-green-400 hover:bg-green-500/10 text-xs font-semibold transition-all duration-300 hover:border-green-400/50 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        onClick={() => startDerivation(r)}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Derive
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        onClick={() => cloneRecipe(r.id)}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Clone
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-all duration-300 hover:border-red-400/50 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        onClick={() => deleteRecipe(r.id)}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </section>

        {/* Product Recipes Section */}
        {productRecipes.length > 0 && (
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/3 via-transparent to-green-600/3 rounded-2xl blur-2xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <h2 className="text-lg font-black text-white">Product Recipes</h2>
                <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg">{productRecipes.length}</span>
              </div>
              <div className="space-y-6">
                {Object.entries(productGrouped).map(([familyName, recipes]) => (
                  <div key={familyName} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
                    <div className="relative space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <h3 className="text-lg font-black text-white">{familyName} Family</h3>
                        <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg">{recipes.length}</span>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture divide-y divide-white/10">
                        {recipes.map(r => (
                  <div key={r.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all duration-200 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 group-hover:scale-125 transition-transform duration-200" />
                        <h3 className="font-bold text-white text-lg">{r.name}</h3>
                        <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
                          {r.tags?.find(tag => tag.includes('-family'))?.replace('-family', '') || 'Product'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          v{r.version || "—"}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          {r.densityKgM3 ?? "—"} kg/m³
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          {r.lines.length} ingredients
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        to={`/app/recipes/${r.id}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-md hover:scale-105 flex items-center gap-1"
                        onClick={() => deleteRecipe(r.id)}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {mainRecipes.length === 0 && productRecipes.length === 0 && (
          <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">No Recipes Yet</h3>
                  <p className="text-sm text-gray-400">Create your first recipe to get started with concrete formulations.</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Recipe Derivation Modal */}
      {showDeriveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Derive Recipe</h2>
              <button
                onClick={() => setShowDeriveModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!selectedBaseRecipe ? (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Select a base recipe to derive from:</p>
                <div className="grid gap-3 max-h-60 overflow-y-auto">
                  {state.recipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => startDerivation(recipe)}
                      className="p-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture text-left"
                    >
                      <div className="font-semibold text-white">{recipe.name}</div>
                      <div className="text-sm text-gray-400">
                        {getProcessLabel(state, recipe.process)} • {recipe.lines.length} materials
                        {recipe.densityKgM3 && ` • ${recipe.densityKgM3} kg/m³`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">Base Recipe</div>
                  <div className="font-semibold text-white">{selectedBaseRecipe.name}</div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Recipe Name</label>
                    <input
                      type="text"
                      value={deriveName}
                      onChange={(e) => setDeriveName(e.target.value)}
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                      placeholder="Enter recipe name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                    <input
                      type="text"
                      value={deriveVersion}
                      onChange={(e) => setDeriveVersion(e.target.value)}
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                      placeholder="v0.1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Process</label>
                    <select
                      value={deriveProcess}
                      onChange={(e) => setDeriveProcess(e.target.value)}
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    >
                      {PROC_LIST.map((proc) => (
                        <option key={proc.key} value={proc.key}>
                          {proc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Density (kg/m³)</label>
                    <NumberField
                      value={deriveDensity === "" ? 0 : Number(deriveDensity)}
                      onChange={(num) => setDeriveDensity(num === 0 ? "" : num)}
                      placeholder="2400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={deriveTags}
                    onChange={(e) => setDeriveTags(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    placeholder="concrete, precast, decorative"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Materials ({deriveLines.length})</h3>
                    <button
                      onClick={addDeriveLine}
                      className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Add Material
                    </button>
                  </div>
                  
                  {deriveLines.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No materials added yet. Click "Add Material" to get started.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deriveLines.map((line) => {
                        const material = state.materials.find(m => m.id === line.materialId);
                        return (
                          <div key={line.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                            <div className="flex items-center justify-between mb-3">
                              <div className="font-medium text-white">
                                {material?.name || "Unknown Material"}
                              </div>
                              <button
                                onClick={() => removeDeriveLine(line.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Amount</label>
                                <NumberField
                                  value={line.amount}
                                  onChange={(amount) => updateDeriveLine(line.id, { amount })}
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-400 mb-1">Unit</label>
                                <select
                                  value={line.unit}
                                  onChange={(e) => updateDeriveLine(line.id, { unit: e.target.value as Unit })}
                                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white text-sm"
                                >
                                  {UNITS.map((unit) => (
                                    <option key={unit} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveDerivedRecipe}
                    className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                  >
                    Create Derived Recipe
                  </button>
                  <button
                    onClick={() => setShowDeriveModal(false)}
                    className="px-6 py-3 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
