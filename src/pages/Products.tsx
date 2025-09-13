// src/pages/Products.tsx
import React, { useMemo, useState, useEffect } from "react";
import { load } from "../store";
import type { AppState, Product, ProductVariant, Recipe, Material } from "../types";

const mm2ToM2 = (mm2: number) => mm2 / 1_000_000;

function kgFromUnit(unit: string, amount: number, mat?: Material): number {
  if (!isFinite(amount)) return 0;
  switch (unit) {
    case "kg": return amount;
    case "g": return amount / 1000;
    case "L": return (amount / 1000) * (mat?.densityKgM3 ?? 1000);
    case "mL": return (amount / 1_000_000) * (mat?.densityKgM3 ?? 1000);
    case "ratio": return NaN;
    default: return 0;
  }
}

function computeBatchWithRatios(
  recipe: Recipe,
  materialsById: Record<string, Material>,
  batchMassKg: number
) {
  const fixedKg = recipe.lines
    .map((l) => kgFromUnit(l.unit, l.amount, materialsById[l.materialId]))
    .filter((v) => !Number.isNaN(v))
    .reduce((a, b) => a + b, 0);

  const ratioSum = recipe.lines
    .map((l) => (l.unit === "ratio" ? l.amount : 0))
    .reduce((a, b) => a + b, 0);

  const kgPerRatio = ratioSum > 0 ? Math.max(0, (batchMassKg - fixedKg) / ratioSum) : 0;

  return recipe.lines.map((l) => {
    const m = materialsById[l.materialId];
    const direct = kgFromUnit(l.unit, l.amount, m);
    const kg = Number.isNaN(direct) ? l.amount * kgPerRatio : direct;
    return { line: l, material: m, kg: +kg.toFixed(3) };
  });
}

export default function ProductsPage() {
  // Live state: reload when localStorage changes, and on demand
  const [state, setState] = useState<AppState>(() => load());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cw_app_state") setState(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const reloadState = () => setState(load());

  const products = state.products;
  const firstProductId = products[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState<string>(firstProductId);
  const product = products.find((p) => p.id === selectedId) as Product | undefined;

  // Repair selection when catalog changes
  useEffect(() => {
    if (!products.length) { setSelectedId(""); return; }
    if (!selectedId || !products.find(p => p.id === selectedId)) {
      setSelectedId(products[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  const matsById = useMemo(() => {
    const m: Record<string, Material> = {};
    state.materials.forEach((x) => (m[x.id] = x));
    return m;
  }, [state.materials]);

  const tileArea_m2 = useMemo(() => {
    if (!product) return 0;
    if (product.tileArea_m2 && product.tileArea_m2 > 0) return product.tileArea_m2;
    const { w_mm = 0, h_mm = 0 } = product.size || {};
    return mm2ToM2(w_mm * h_mm);
  }, [product]);

  const thickness_m = (product?.size?.t_mm ?? 10) / 1000;

  const [openKey, setOpenKey] = useState<string | null>(null);

  function calcFor(
    variant: ProductVariant,
    proc: keyof NonNullable<ProductVariant["recipeByProcess"]>
  ) {
    const recipeId = variant.recipeByProcess?.[proc];
    const recipe = state.recipes.find((r) => r.id === recipeId) as Recipe | undefined;
    const density = recipe?.densityKgM3 ?? 2200;
    const perTileKg = +(tileArea_m2 * thickness_m * density).toFixed(3);
    const perM2Kg = +(1 * thickness_m * density).toFixed(3);
    return { recipe, recipeId, density, perTileKg, perM2Kg };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Product Catalog</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={reloadState}
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            title="Reload saved data"
          >
            Reload data
          </button>
          <a
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
            href="/products/edit"
          >
            Edit Catalog
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 p-6 bg-black/20 grid md:grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-gray-400 mb-1">Product</div>
          <select
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
            value={products.find(p => p.id === selectedId)?.id ?? ""}
            onChange={(e) => { setSelectedId(e.target.value || ""); setOpenKey(null); }}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {product && (
            <div className="text-xs text-gray-400 mt-1">
              Tile area: {tileArea_m2.toFixed(4)} m² · Thickness: {product.size?.t_mm ?? "—"} mm
            </div>
          )}
          {!products.length && (
            <div className="text-xs text-amber-300 mt-2">
              No products yet — go to <span className="font-semibold">Edit Catalog</span> to add one, then click “Reload data”.
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-gray-400 mb-1">Actions</div>
          <div className="flex flex-wrap gap-2">
            <a
              className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow-lg"
              href="/planner/production"
            >
              Open Production Planner
            </a>
            <a
              className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
              href="/recipes"
            >
              Recipe Book
            </a>
          </div>
        </div>
      </div>

      {product ? (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Variant</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Process</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Recipe</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Density (kg/m³)</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Tile mass (kg)</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Per 1 m² mass (kg)</th>
                <th className="py-3 px-4 border-b border-white/10"></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.length ? (
                product.variants.flatMap((v) => {
                  const procs = Object.keys(v.recipeByProcess || {}) as Array<
                    keyof NonNullable<ProductVariant["recipeByProcess"]>
                  >;
                  if (!procs.length) {
                    return (
                      <tr key={v.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 border-b border-white/5">{v.name}</td>
                        <td className="py-3 px-4 border-b border-white/5 text-gray-400" colSpan={6}>
                          No processes linked
                        </td>
                      </tr>
                    );
                  }
                  return procs.flatMap((pk) => {
                    const rowKey = `${v.id}-${pk}`;
                    const { recipe, recipeId, density, perTileKg, perM2Kg } = calcFor(v, pk);
                    const priceUrl = `/cost?recipeId=${encodeURIComponent(
                      recipeId || ""
                    )}&productId=${encodeURIComponent(product.id)}&variantId=${encodeURIComponent(
                      v.id
                    )}&t=${encodeURIComponent(product.size?.t_mm ?? 0)}&batchKg=${encodeURIComponent(
                      perTileKg
                    )}&margin=35`;
                    const detail = recipe
                      ? computeBatchWithRatios(recipe, matsById, perTileKg)
                      : [];

                    // For per m² detail, reuse the same splitter with perM2 mass
                    const perM2detail = recipe
                      ? computeBatchWithRatios(recipe, matsById, perM2Kg)
                      : [];

                    return [
                      <tr key={rowKey} className="hover:bg-white/5">
                        <td className="py-3 px-4 border-b border-white/5">{v.name}</td>
                        <td className="py-3 px-4 border-b border-white/5">{pk}</td>
                        <td className="py-3 px-4 border-b border-white/5">{recipe ? recipe.name : "—"}</td>
                        <td className="py-3 px-4 border-b border-white/5">{density}</td>
                        <td className="py-3 px-4 border-b border-white/5 font-medium">{perTileKg}</td>
                        <td className="py-3 px-4 border-b border-white/5 font-medium">{perM2Kg}</td>
                        <td className="py-3 px-4 border-b border-white/5">
                          <div className="flex gap-2 justify-end">
                            {recipe ? (
                              <>
                                <button
                                  className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                                  onClick={() => setOpenKey(openKey === rowKey ? null : rowKey)}
                                >
                                  {openKey === rowKey ? "Hide recipe" : "View recipe"}
                                </button>
                                <a
                                  className="rounded-lg px-3 py-2 text-sm font-semibold bg-white text-black shadow-lg hover:brightness-95"
                                  href={priceUrl}
                                  title="Open Cost & Profit with this recipe/product preselected"
                                >
                                  Price this
                                </a>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>,
                      openKey === rowKey ? (
                        <tr key={rowKey + "-detail"} className="bg-black/20">
                          <td className="py-3 px-4 border-b border-white/10 text-gray-300" colSpan={7}>
                            <div className="text-xs font-medium tracking-widest uppercase mb-2">
                              Recipe (per tile) & per m²
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead>
                                  <tr>
                                    <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-2 px-3 border-b border-white/10">
                                      Ingredient
                                    </th>
                                    <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-2 px-3 border-b border-white/10">
                                      Unit
                                    </th>
                                    <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-2 px-3 border-b border-white/10">
                                      Input
                                    </th>
                                    <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-2 px-3 border-b border-white/10">
                                      → per tile (kg)
                                    </th>
                                    <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-2 px-3 border-b border-white/10">
                                      → per 1 m² (kg)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {detail.map(({ line, material, kg }) => {
                                    const perM2kg =
                                      perM2detail.find((d) => d.line.id === line.id)?.kg ?? 0;
                                    return (
                                      <tr key={line.id} className="hover:bg-white/5">
                                        <td className="py-2 px-3 border-b border-white/5">
                                          {material?.name ?? "—"}
                                        </td>
                                        <td className="py-2 px-3 border-b border-white/5">{line.unit}</td>
                                        <td className="py-2 px-3 border-b border-white/5">{line.amount}</td>
                                        <td className="py-2 px-3 border-b border-white/5 font-medium">{kg}</td>
                                        <td className="py-2 px-3 border-b border-white/5">{perM2kg}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      ) : null,
                    ];
                  });
                })
              ) : (
                <tr>
                  <td className="py-3 px-4 text-gray-400" colSpan={7}>
                    This product has no variants yet. Add one in <span className="font-semibold">Edit Catalog</span>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 p-6 bg-black/20">
          No product selected.
        </div>
      )}
    </div>
  );
}
