import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Product, Recipe } from "../types";

type ProductRecipeLink = {
  id: string;
  productId?: string;
  variantId?: string;
  process?: string;
  recipeId?: string;
  /** Present on richer client-side ProductRecipe objects */
  name?: string;
  baseRecipeId?: string;
  lines?: { id: string }[];
  densityKgM3?: number;
  createdAt?: string;
  updatedAt?: string;
};

type Row = {
  linkId: string;
  productId: string;
  variantId: string;
  process: string;
  recipeId: string;
  product?: Product;
  recipe?: Recipe;
  variantName?: string;
};

function productTitle(p?: Product): string {
  if (!p) return "Unknown Product";
  return (p as any).title || (p as any).name || "Unknown Product";
}

export default function ProductRecipes() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const products = state.products || [];
  const recipes = state.recipes || [];
  const links = (state.productRecipes || []) as ProductRecipeLink[];

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];

    // Prefer explicit productRecipes entries (API links or full ProductRecipe objects)
    for (const link of links) {
      const productId = link.productId || "";
      const variantId = link.variantId || "";
      const process = link.process || "";
      const recipeId = link.recipeId || link.id || "";
      if (!productId && !recipeId) continue;

      const product = products.find((p) => p.id === productId);
      const recipe =
        recipes.find((r) => r.id === recipeId) ||
        recipes.find((r) => r.id === link.baseRecipeId);
      const variant = product?.variants?.find((v) => v.id === variantId);

      out.push({
        linkId: link.id || `${productId}-${variantId}-${process}`,
        productId,
        variantId,
        process,
        recipeId,
        product,
        recipe,
        variantName: variant?.name,
      });
    }

    // Also surface assignments stored only on variant.recipeByProcess
    for (const product of products) {
      for (const variant of product.variants || []) {
        const map = variant.recipeByProcess || {};
        for (const [process, recipeId] of Object.entries(map)) {
          if (!recipeId) continue;
          const already = out.some(
            (r) =>
              r.productId === product.id &&
              r.variantId === variant.id &&
              r.process === process
          );
          if (already) continue;
          out.push({
            linkId: `${variant.id}-${process}`,
            productId: product.id,
            variantId: variant.id,
            process,
            recipeId,
            product,
            recipe: recipes.find((r) => r.id === recipeId),
            variantName: variant.name,
          });
        }
      }
    }

    return out;
  }, [links, products, recipes]);

  const byProduct = useMemo(() => {
    const g: Record<string, Row[]> = {};
    for (const row of rows) {
      const key = productTitle(row.product);
      (g[key] ||= []).push(row);
    }
    return g;
  }, [rows]);

  const handleDelete = async (row: Row) => {
    if (!confirm("Remove this product ↔ recipe assignment?")) return;

    const nextProducts = (state.products || []).map((p) => {
      if (p.id !== row.productId) return p;
      return {
        ...p,
        variants: (p.variants || []).map((v) => {
          if (v.id !== row.variantId) return v;
          const map = { ...(v.recipeByProcess || {}) };
          delete map[row.process];
          return { ...v, recipeByProcess: map };
        }),
      };
    });

    const next: AppState = {
      ...state,
      products: nextProducts,
      productRecipes: (state.productRecipes || []).filter((r: any) => {
        if (r.id === row.linkId) return false;
        if (
          r.productId === row.productId &&
          r.variantId === row.variantId &&
          r.process === row.process
        ) {
          return false;
        }
        return true;
      }),
    };

    setState(next);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Product recipes saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      const detail = error instanceof Error ? error.message : String(error);
      alert(detail ? `Failed to save: ${detail}` : "Failed to save product recipes.");
    }
  };

  return (
    <div className="space-y-8">
      <header className="relative">
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">
                Product Recipe Management
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Product Recipes
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Recipes assigned to product variants (from Derive / Product Editor).
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Unsaved changes</span>
              </div>
            )}
            <button
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all disabled:opacity-50"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              type="button"
            >
              Save Changes
            </button>
            <button
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold"
              onClick={() => navigate(-1)}
              type="button"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {Object.keys(byProduct).length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-bold text-white mb-2">No Product Recipes Yet</h3>
            <p className="text-gray-400 mb-6">
              Derive a recipe from a product variant, or assign one in Product Editor.
            </p>
            <Link
              to="/app/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Go to Products
            </Link>
          </div>
        ) : (
          Object.entries(byProduct).map(([productName, list]) => (
            <section key={productName} className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <h2 className="text-lg font-black text-white">{productName}</h2>
                <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg">
                  {list.length}
                </span>
              </div>
              <div className="grid gap-4">
                {list.map((row) => {
                  const title =
                    row.recipe?.name ||
                    links.find((l) => l.id === row.linkId)?.name ||
                    row.recipeId ||
                    "Untitled recipe";
                  const lineCount = row.recipe?.lines?.length ?? 0;
                  return (
                    <div
                      key={row.linkId}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-bold text-white text-lg truncate">{title}</h3>
                            <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold">
                              Assigned
                            </span>
                          </div>
                          <div className="text-sm text-gray-300 space-y-1">
                            <div>
                              <span className="font-medium text-gray-400">Variant: </span>
                              {row.variantName || row.variantId || "—"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-400">Process: </span>
                              {row.process || "—"}
                            </div>
                            <div>
                              <span className="font-medium text-gray-400">Recipe id: </span>
                              <span className="font-mono text-xs">{row.recipeId}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-400">Materials: </span>
                              {lineCount} ingredients
                              {row.recipe?.densityKgM3 != null && (
                                <> · {row.recipe.densityKgM3} kg/m³</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
                            onClick={() => navigate(`/app/recipes/${row.recipeId}`)}
                            disabled={!row.recipeId}
                          >
                            Edit recipe
                          </button>
                          <button
                            type="button"
                            className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold"
                            onClick={() => handleDelete(row)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
