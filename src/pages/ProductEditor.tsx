import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Product, ProductVariant, Recipe, ProductRecipe } from "../types";
import { getProcesses } from "../lib/process";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function ProductEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<AppState>(() => load());
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Get product ID from URL parameter
  const productIdFromUrl = searchParams.get('product');
  const [selectedId, setSelectedId] = useState(() => {
    if (productIdFromUrl) {
      return productIdFromUrl;
    }
    // For new product creation, don't select any product
    return "";
  });

  const products = state.products;
  const pIdx = products.findIndex((p) => p.id === selectedId);
  const product = pIdx >= 0 ? products[pIdx] : undefined;

  const PROC_LIST = getProcesses(state);

  const recipesByProcess = useMemo(() => {
    const map: Record<string, (Recipe | ProductRecipe)[]> = {};
    for (const p of PROC_LIST) map[p.key] = [];
    
    // Add main recipes (available to all products)
    for (const r of state.recipes) (map[r.process] ||= []).push(r);
    
    // Add product-specific recipes (only for this product)
    if (product) {
      for (const pr of (state.productRecipes || [])) {
        if (pr.productId === product.id) {
          (map[pr.process] ||= []).push(pr);
        }
      }
    }
    
    return map;
  }, [state.recipes, state.productRecipes, product?.id, PROC_LIST.map((p) => p.key).join("|")]);

  const visibleProcesses = useMemo(
    () => PROC_LIST.filter((p) => (recipesByProcess[p.key]?.length ?? 0) > 0),
    [recipesByProcess, PROC_LIST]
  );

  /* -------------------- CRUD -------------------- */
  function addProduct() {
    const title = prompt("Product name (e.g., Wave):", "Wave");
    if (!title) return;
    const now = new Date().toISOString();
    const p: Product = {
      id: newid(),
      title,
      slug: slugify(title),
      public: false,
      featured: false,
      coverImageUrl: "",
      categorySlug: undefined, // choose from managed list
      tags: [],
      blurb: "",
      galleryImages: [],
      size: { w_mm: 300, h_mm: 300, t_mm: 12 },
      tileArea_m2: undefined,
      variants: [{ id: newid(), name: "Default", color: "", recipeByProcess: {} }],
      createdAt: now,
      updatedAt: now,
    };
    const next = { ...state, products: [p, ...state.products] };
    setState(next);
    setSelectedId(p.id);
    setSaveStatus('unsaved');
  }


  function updateProduct(patch: Partial<Product>) {
    setState((s) => {
      if (pIdx < 0) return s;
      const copy = { ...s };
      const list = [...copy.products];
      const updated = { ...list[pIdx], ...patch, updatedAt: new Date().toISOString() };
      list[pIdx] = updated;
      copy.products = list;
      return copy;
    });
    setSaveStatus('unsaved');
  }

  /* -------------------- Variant helpers -------------------- */
  function addVariant() {
    if (!product) return;
    const name = prompt("Variant name (e.g., Charcoal)", "New Variant");
    if (!name) return;
    setState((s) => {
      const list = [...s.products];
      const cur = { ...list[pIdx] };
      const v: ProductVariant = { id: newid(), name, color: "", recipeByProcess: {} };
      cur.variants = [v, ...cur.variants];
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return { ...s, products: list };
    });
    setSaveStatus('unsaved');
  }

  function updateVariant(vid: string, patch: Partial<ProductVariant>) {
    setState((s) => {
      const list = [...s.products];
      const cur = { ...list[pIdx] };
      cur.variants = cur.variants.map((v) => (v.id === vid ? { ...v, ...patch } : v));
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return { ...s, products: list };
    });
    setSaveStatus('unsaved');
  }

  function removeVariant(vid: string) {
    if (!confirm("Delete this variant?")) return;
    setState((s) => {
      const list = [...s.products];
      const cur = { ...list[pIdx] };
      cur.variants = cur.variants.filter((v) => v.id !== vid);
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return { ...s, products: list };
    });
    setSaveStatus('unsaved');
  }

  function toggleProcess(vid: string, procKey: string, enabled: boolean) {
    const v = product?.variants.find((x) => x.id === vid);
    if (!v) return;
    const nextMap = { ...(v.recipeByProcess || {}) };
    if (!enabled) {
      delete nextMap[procKey];
    } else {
      const first = (recipesByProcess[procKey] || [])[0];
      nextMap[procKey] = first?.id || "";
    }
    updateVariant(vid, { recipeByProcess: nextMap });
    setSaveStatus('unsaved');
  }

  function setRecipeFor(vid: string, procKey: string, recipeId: string) {
    const v = product?.variants.find((x) => x.id === vid);
    if (!v) return;
    const nextMap = { ...(v.recipeByProcess || {}), [procKey]: recipeId };
    updateVariant(vid, { recipeByProcess: nextMap });
    setSaveStatus('unsaved');
  }

  /* -------------------- Tags & Gallery helpers -------------------- */
  const [tagInput, setTagInput] = useState<string>("");

  function addTagFromInput() {
    if (!product) return;
    const raw = tagInput.trim();
    if (!raw) return;
    const split = raw.split(/[, ]+/).map((t) => t.trim()).filter(Boolean);
    const current = product.tags || [];
    const next = Array.from(new Set([...current, ...split]));
    updateProduct({ tags: next });
    setTagInput("");
  }
  function removeTag(tag: string) {
    if (!product) return;
    const next = (product.tags || []).filter((t) => t !== tag);
    updateProduct({ tags: next });
  }
  function addGalleryUrl() {
    if (!product) return;
    const url = prompt("Image URL:");
    if (!url) return;
    const next = [...(product.galleryImages || []), url.trim()];
    updateProduct({ galleryImages: next });
  }
  function updateGalleryUrl(idx: number, url: string) {
    if (!product) return;
    const arr = [...(product.galleryImages || [])];
    arr[idx] = url;
    updateProduct({ galleryImages: arr });
  }
  function removeGalleryUrl(idx: number) {
    if (!product) return;
    const arr = [...(product.galleryImages || [])];
    arr.splice(idx, 1);
    updateProduct({ galleryImages: arr });
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Catalog Admin</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              {product ? "Product Editor" : "Create New Product"}
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              {product 
                ? "Create and manage your concrete product catalog with variants, recipes, and specifications. Each product variant can use different recipes for different processes (UHPC, GFRC, etc.)."
                : "Create a new concrete product with variants, recipes, and specifications. Each product variant can use different recipes for different processes (UHPC, GFRC, etc.)."
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <Link
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              to="/app/products"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Products
            </Link>
            
            
            <button
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              onClick={addProduct}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </button>
          </div>
        </div>
      </header>

      {/* Product Editor */}
      <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            {product ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <h2 className="text-lg font-black text-white">Product Editor</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{product.title}</div>
                    <div className="text-xs text-gray-400">{product.variants.length} variants</div>
                  </div>
                </div>
              {/* Title + Slug */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Product name</div>
                  <input
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.title}
                    onChange={(e) => updateProduct({ title: e.target.value })}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Public URL slug</div>
                  <input
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.slug}
                    onChange={(e) => updateProduct({ slug: slugify(e.target.value) })}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    /product/{product.slug}
                  </div>
                </div>
              </div>

              {/* Cover + Category (dropdown) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Cover image URL</div>
                  <input
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.coverImageUrl || ""}
                    onChange={(e) => updateProduct({ coverImageUrl: e.target.value })}
                  />
                </div>

                <div>
                  <div className="text-xs text-gray-400 mb-1">Category</div>
                  <div className="flex gap-2">
                    <select
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={product.categorySlug || ""}
                      onChange={(e) =>
                        updateProduct({
                          categorySlug: e.target.value || undefined,
                        })
                      }
                    >
                      <option value="">— Unassigned —</option>
                      {(state.categories || []).map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <Link
                      className="shrink-0 rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                      to="/app/settings/catalog"
                      title="Manage categories"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!product.public}
                    onChange={(e) => updateProduct({ public: e.target.checked })}
                  />
                  <span className="text-sm">Published</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!product.featured}
                    disabled={!product.public}
                    onChange={(e) => updateProduct({ featured: e.target.checked })}
                  />
                  <span className="text-sm">Featured</span>
                </label>
                {product.public && product.slug && (
                  <Link
                    to={`/product/${product.slug}`}
                    target="_blank"
                    className="text-xs text-blue-400 hover:underline"
                    rel="noreferrer"
                  >
                    View public page ↗
                  </Link>
                )}
              </div>

              {/* Dimensions */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Width (mm)</div>
                  <NumberField
                    className="w-full"
                    value={product.size?.w_mm}
                    onChange={(v) =>
                      updateProduct({
                        size: { ...(product.size || {}), w_mm: v as number },
                      })
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Height (mm)</div>
                  <NumberField
                    className="w-full"
                    value={product.size?.h_mm}
                    onChange={(v) =>
                      updateProduct({
                        size: { ...(product.size || {}), h_mm: v as number },
                      })
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Thickness (mm)</div>
                  <NumberField
                    className="w-full"
                    value={product.size?.t_mm}
                    onChange={(v) =>
                      updateProduct({
                        size: { ...(product.size || {}), t_mm: v as number },
                      })
                    }
                  />
                </div>
              </div>

              {/* Area */}
              <div>
                <div className="text-xs text-gray-400 mb-1">
                  Custom tile area (m²)
                </div>
                <NumberField
                  className="w-60"
                  value={product.tileArea_m2}
                  onChange={(v) => updateProduct({ tileArea_m2: v as number })}
                  step="0.0001"
                />
                <div className="text-xs text-gray-500 mt-1">
                  For non-rectangular tiles, enter the area directly.
                </div>
              </div>

              {/* Blurb */}
              <div>
                <div className="text-xs text-gray-400 mb-1">
                  Short description (blurb)
                </div>
                <textarea
                  rows={3}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                  placeholder="One or two sentences that appear on the product page."
                  value={product.blurb || ""}
                  onChange={(e) => updateProduct({ blurb: e.target.value })}
                />
              </div>

              {/* Tags */}
              <section className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-3">
                <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
                  Tags
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    placeholder="Add tags, separated by comma or space then press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTagFromInput();
                      }
                      if (e.key === "," || e.key === " ") addTagFromInput();
                    }}
                  />
                  <button
                    className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={addTagFromInput}
                    type="button"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product.tags || []).length === 0 && (
                    <span className="text-sm text-gray-400">No tags yet.</span>
                  )}
                  {(product.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs"
                    >
                      {t}
                      <button
                        className="text-stone-300 hover:text-white"
                        onClick={() => removeTag(t)}
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </section>

              {/* Gallery */}
              <section className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
                    Gallery Images
                  </div>
                  <button
                    className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={addGalleryUrl}
                    type="button"
                  >
                    + Add Image
                  </button>
                </div>

                {(product.galleryImages || []).length === 0 ? (
                  <div className="text-sm text-gray-400">
                    No images yet. Click “+ Add Image”.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(product.galleryImages || []).map((url, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-white/10 p-3 bg-black/10 space-y-2"
                      >
                        <div className="aspect-[4/3] rounded-md overflow-hidden bg-white/10">
                          {url ? (
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-stone-400 text-sm">
                              No image
                            </div>
                          )}
                        </div>
                        <input
                          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-xs"
                          value={url}
                          onChange={(e) => updateGalleryUrl(idx, e.target.value)}
                          placeholder="https://…"
                        />
                        <div className="flex justify-end">
                          <button
                            className="text-xs rounded-lg px-3 py-2 border border-white/10 bg-black/20 hover:bg-white/10"
                            onClick={() => removeGalleryUrl(idx)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Variants */}
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium tracking-widest uppercase text-gray-400">
                  Variants
                </div>
                <button
                  className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                  onClick={addVariant}
                >
                  + Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-4"
                  >
                    <div className="grid md:grid-cols-[1fr_200px_100px] gap-3">
                      <input
                        className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        placeholder="Variant name"
                        value={variant.name || ""}
                        onChange={(e) =>
                          updateVariant(variant.id, { name: e.target.value })
                        }
                      />
                      <input
                        className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                        placeholder="Color (optional)"
                        value={variant.color || ""}
                        onChange={(e) =>
                          updateVariant(variant.id, { color: e.target.value })
                        }
                      />
                      <div className="flex items-center justify-end">
                        <button
                          className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                          onClick={() => removeVariant(variant.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Process mapping */}
                    <div className="rounded-lg border border-white/10 p-3">
                      <div className="text-xs text-gray-400 mb-2">
                        Processes for this variant
                      </div>
                      {visibleProcesses.length === 0 ? (
                        <div className="text-sm text-gray-400">
                          No processes available — add recipes first.
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {visibleProcesses.map((proc) => {
                            const enabled = !!(variant.recipeByProcess || {})[
                              proc.key
                            ];
                            const list = recipesByProcess[proc.key] || [];
                            const currentId =
                              (variant.recipeByProcess || {})[proc.key] || "";
                            return (
                              <div
                                key={proc.key}
                                className="rounded-lg border border-white/10 p-3 bg-black/10"
                              >
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={(e) =>
                                      toggleProcess(
                                        variant.id,
                                        proc.key,
                                        e.target.checked
                                      )
                                    }
                                  />
                                  <span className="text-sm">{proc.label}</span>
                                </label>

                                <div className="mt-2 flex items-end gap-2">
                                  <div className="flex-1">
                                    <select
                                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
                                      disabled={!enabled}
                                      value={currentId}
                                      onChange={(e) =>
                                        setRecipeFor(
                                          variant.id,
                                          proc.key,
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">
                                        — Select recipe —
                                      </option>
                                      {list.map((r) => {
                                        const isProductRecipe = 'productId' in r;
                                        return (
                                          <option key={r.id} value={r.id}>
                                            {r.name} {isProductRecipe ? '(Product-specific)' : '(Main recipe)'}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  </div>
                                  <button
                                    className="shrink-0 rounded-lg px-3 py-2 text-xs border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-40"
                                    disabled={!enabled || !currentId}
                                    onClick={() => {
                                      const url = `/app/derive-recipe?base=${encodeURIComponent(
                                        currentId
                                      )}&product=${encodeURIComponent(
                                        product!.id
                                      )}&variant=${encodeURIComponent(
                                        variant.id
                                      )}&process=${encodeURIComponent(
                                        proc.key
                                      )}`;
                                      console.log('ProductEditor: Navigating to derive recipe with URL:', url);
                                      console.log('ProductEditor: Selected recipe ID:', currentId);
                                      console.log('ProductEditor: Product ID:', product!.id);
                                      console.log('ProductEditor: Variant ID:', variant.id);
                                      console.log('ProductEditor: Process Key:', proc.key);
                                      navigate(url);
                                    }}
                                  >
                                    Derive…
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!product.variants.length && (
                  <div className="text-gray-400 text-sm">No variants yet.</div>
                )}
              </div>
              
              {/* Save Section */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      {showSuccessMessage && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-green-400 font-semibold">✓ Product saved successfully!</span>
                        </>
                      )}
                      {!showSuccessMessage && saveStatus === 'saved' && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          <span className="text-green-400">All changes saved</span>
                        </>
                      )}
                      {!showSuccessMessage && saveStatus === 'saving' && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                          <span className="text-yellow-400">Saving changes...</span>
                        </>
                      )}
                      {!showSuccessMessage && saveStatus === 'unsaved' && (
                        <>
                          <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                          <span className="text-orange-400">You have unsaved changes</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (saveStatus === 'saving') return; // Prevent multiple saves
                      
                      setSaveStatus('saving');
                      setShowSuccessMessage(false);
                      
                      try {
                        await save(state);
                        setSaveStatus('saved');
                        setShowSuccessMessage(true);
                        
                        // Hide success message after 3 seconds
                        setTimeout(() => {
                          setShowSuccessMessage(false);
                        }, 3000);
                      } catch (error) {
                        console.error('Save failed:', error);
                        setSaveStatus('unsaved');
                        setShowSuccessMessage(false);
                      }
                    }}
                    disabled={saveStatus === 'saving'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Create New Product</h3>
                  <p className="text-sm text-gray-400">Select a product from the list to edit, or add a new one to get started.</p>
                </div>
              </div>
            )}
          </div>
        </section>
    </div>
  );
}
