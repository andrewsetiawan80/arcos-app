import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Recipe, RecipeLine, Unit } from "../types";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

/**
 * Edits the underlying Recipe for a product assignment.
 * API productRecipes rows are links (recipeId); full formulas live in recipes.
 */
export default function ProductRecipeEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const link = useMemo(() => {
    const links = state.productRecipes || [];
    return links.find((r: any) => r.id === id || r.recipeId === id);
  }, [state.productRecipes, id]);

  const recipeId = (link as any)?.recipeId || (link as any)?.id || id || "";
  const recipe = (state.recipes || []).find((r) => r.id === recipeId);

  const products = state.products || [];
  const product = link
    ? products.find((p) => p.id === (link as any).productId)
    : undefined;
  const variant =
    product && link
      ? product.variants?.find((v) => v.id === (link as any).variantId)
      : undefined;

  const materials = state.materials || [];

  const [name, setName] = useState(recipe?.name || (link as any)?.name || "");
  const [version, setVersion] = useState(recipe?.version || "v0.1");
  const [density, setDensity] = useState<number | "">(recipe?.densityKgM3 ?? "");
  const [lines, setLines] = useState<RecipeLine[]>(() =>
    Array.isArray(recipe?.lines)
      ? recipe!.lines
      : Array.isArray((link as any)?.lines)
        ? (link as any).lines
        : []
  );

  // Hydrate once when recipe loads
  React.useEffect(() => {
    if (!recipe || hasUnsavedChanges) return;
    setName(recipe.name || "");
    setVersion(recipe.version || "v0.1");
    setDensity(recipe.densityKgM3 ?? "");
    setLines(Array.isArray(recipe.lines) ? recipe.lines : []);
  }, [recipe?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!recipeId) return;
    try {
      const stamp = now();
      const updated: Recipe = {
        id: recipeId,
        name: name.trim() || recipeId,
        process: recipe?.process || (link as any)?.process || "GENERAL",
        version,
        densityKgM3: density === "" ? undefined : Number(density),
        lines,
        tags: recipe?.tags,
        createdAt: recipe?.createdAt || stamp,
        updatedAt: stamp,
      };

      const next: AppState = {
        ...state,
        recipes: recipe
          ? (state.recipes || []).map((r) => (r.id === recipeId ? updated : r))
          : [updated, ...(state.recipes || [])],
      };

      setState(next);
      await save(next);
      setHasUnsavedChanges(false);
      alert("Recipe saved successfully!");
      navigate("/app/product-recipes");
    } catch (error) {
      console.error("Save failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      alert(detail ? `Failed to save: ${detail}` : "Failed to save product recipe.");
    }
  };

  if (!recipe && !link) {
    return (
      <div className="space-y-8 text-center py-12">
        <h3 className="text-lg font-bold text-white mb-2">Product Recipe Not Found</h3>
        <p className="text-gray-400 mb-6">
          This assignment or recipe no longer exists.
        </p>
        <button
          type="button"
          onClick={() => navigate("/app/product-recipes")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold"
        >
          Back to Product Recipes
        </button>
      </div>
    );
  }

  // Prefer the main recipe editor when we have a full recipe id
  if (recipe && !hasUnsavedChanges) {
    // stay here so users landing on old /product-recipes/edit/:id links still work
  }

  const productLabel =
    (product as any)?.title || (product as any)?.name || (link as any)?.productId || "Product";

  return (
    <div className="space-y-8">
      <header className="relative">
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">
              Product Recipe Editor
            </p>
            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Edit Assigned Recipe
            </h1>
            <p className="text-sm text-gray-300 max-w-xl">
              {productLabel}
              {variant?.name ? ` / ${variant.name}` : ""}
              {(link as any)?.process ? ` · ${(link as any).process}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              Save Recipe
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-sm font-semibold"
              onClick={() => navigate("/app/product-recipes")}
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <label className="block space-y-1 text-sm">
            <span className="text-gray-400">Name</span>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setHasUnsavedChanges(true);
              }}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-gray-400">Version</span>
            <input
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
              value={version}
              onChange={(e) => {
                setVersion(e.target.value);
                setHasUnsavedChanges(true);
              }}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-gray-400">Density (kg/m³)</span>
            <NumberField
              className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
              value={density === "" ? undefined : Number(density)}
              onChange={(v) => {
                setDensity(v === undefined ? "" : v);
                setHasUnsavedChanges(true);
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-bold text-white">Ingredients ({lines.length})</h2>
          <button
            type="button"
            className="px-3 py-2 rounded-lg border border-white/20 text-sm"
            onClick={() => {
              const first = materials[0]?.id || "";
              if (!first) {
                alert("Create materials first.");
                return;
              }
              setLines([{ id: newid(), materialId: first, amount: 1, unit: "ratio" }, ...lines]);
              setHasUnsavedChanges(true);
            }}
          >
            Add ingredient
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-gray-400">
              <th className="py-3 px-4">Material</th>
              <th className="py-3 px-4 w-28">Unit</th>
              <th className="py-3 px-4 w-32">Amount</th>
              <th className="py-3 px-4 w-24" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-white/5">
                <td className="py-2 px-4">
                  <select
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2"
                    value={line.materialId}
                    onChange={(e) => {
                      setLines(
                        lines.map((l) =>
                          l.id === line.id ? { ...l, materialId: e.target.value } : l
                        )
                      );
                      setHasUnsavedChanges(true);
                    }}
                  >
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4">
                  <select
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2"
                    value={line.unit}
                    onChange={(e) => {
                      setLines(
                        lines.map((l) =>
                          l.id === line.id ? { ...l, unit: e.target.value as Unit } : l
                        )
                      );
                      setHasUnsavedChanges(true);
                    }}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4">
                  <NumberField
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2"
                    value={line.amount}
                    onChange={(v) => {
                      setLines(
                        lines.map((l) => (l.id === line.id ? { ...l, amount: v } : l))
                      );
                      setHasUnsavedChanges(true);
                    }}
                  />
                </td>
                <td className="py-2 px-4">
                  <button
                    type="button"
                    className="text-red-400 text-xs"
                    onClick={() => {
                      setLines(lines.filter((l) => l.id !== line.id));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No ingredients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
