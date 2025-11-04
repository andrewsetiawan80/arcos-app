// src/pages/Products.tsx
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    .map((l) => kgFromUnit(l.unit, l.amount || 0, materialsById[l.materialId]))
    .filter((v) => !Number.isNaN(v))
    .reduce((a, b) => (a || 0) + (b || 0), 0);

  const ratioSum = recipe.lines
    .map((l) => (l.unit === "ratio" ? (l.amount || 0) : 0))
    .reduce((a, b) => (a || 0) + (b || 0), 0);

  const kgPerRatio = (ratioSum || 0) > 0 ? Math.max(0, (batchMassKg - (fixedKg || 0)) / (ratioSum || 1)) : 0;

  return recipe.lines.map((l) => {
    const m = materialsById[l.materialId];
    const direct = kgFromUnit(l.unit, l.amount || 0, m);
    const kg = Number.isNaN(direct) ? (l.amount || 0) * kgPerRatio : direct;
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

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const products = state.products;
  const categories = state.categories || [];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          product.title.toLowerCase().includes(query) ||
          product.slug.toLowerCase().includes(query) ||
          (product.tags || []).some(tag => tag.toLowerCase().includes(query)) ||
          (product.blurb || "").toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory) {
        if (selectedCategory === "unassigned") {
          if (product.categorySlug) return false;
        } else {
          if (product.categorySlug !== selectedCategory) return false;
        }
      }

      // Status filter
      if (selectedStatus) {
        if (selectedStatus === "public" && !product.public) return false;
        if (selectedStatus === "private" && product.public) return false;
        if (selectedStatus === "featured" && !product.featured) return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.title.localeCompare(b.title);
          break;
        case "date":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "category":
          const aCategory = categories.find(c => c.slug === a.categorySlug)?.name || "Unassigned";
          const bCategory = categories.find(c => c.slug === b.categorySlug)?.name || "Unassigned";
          comparison = aCategory.localeCompare(bCategory);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, selectedStatus, sortBy, sortOrder, categories]);

  const firstProductId = filteredProducts[0]?.id ?? "";
  const [selectedId, setSelectedId] = useState<string>(firstProductId);
  const product = products.find((p) => p.id === selectedId) as Product | undefined;

  // Repair selection when catalog changes
  useEffect(() => {
    if (!filteredProducts.length) { setSelectedId(""); return; }
    if (!selectedId || !filteredProducts.find(p => p.id === selectedId)) {
      setSelectedId(filteredProducts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts.length]);

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
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Product Catalog</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Product Catalog
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Browse your product catalog, view detailed specifications, and edit individual products. Click "Edit" on any product to modify it, or "Add Product" to create new ones.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button
              onClick={reloadState}
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              title="Reload saved data"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Data
            </button>
            <Link
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
              to="/app/products/edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Product
            </Link>
          </div>
        </div>
      </header>

      {/* Search & Filter Controls */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <h2 className="text-lg font-bold text-white">Search & Filter</h2>
              <div className="text-sm text-gray-400">
                {filteredProducts.length} of {products.length} products
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="">All Categories</option>
                  <option value="unassigned">Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="">All Status</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="featured">Featured</option>
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "name" | "date" | "category")}
                    className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  >
                    <option value="name">Name</option>
                    <option value="date">Date Updated</option>
                    <option value="category">Category</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 py-2 rounded-lg bg-black/30 border border-white/10 hover:bg-white/10 transition-colors"
                    title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                  >
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedCategory || selectedStatus) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedStatus("");
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-600/20 border border-gray-500/20 text-sm text-gray-300 hover:bg-gray-600/30 hover:border-gray-500/30 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Product Selection & Actions */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <label className="text-sm font-semibold text-white">Product Selection</label>
              </div>
              <div className="text-sm text-gray-300">Choose a product to view and edit:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(p => (
                  <div
                    key={p.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      selectedId === p.id 
                        ? 'border-blue-400 bg-blue-400/10 shadow-lg ring-2 ring-blue-400/20' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{p.title}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {p.size && `${p.size.w_mm}×${p.size.h_mm}×${p.size.t_mm}mm`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {p.variants?.length || 0} variant{(p.variants?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <button
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/app/products/edit?product=${p.id}`;
                        }}
                      >
                        Edit
                      </button>
                    </div>
                    <div 
                      className="w-full text-left cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
                      onClick={() => { setSelectedId(p.id); setOpenKey(null); }}
                    >
                      <div className="text-xs text-gray-400">Click to view details</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {product && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <h3 className="text-sm font-bold text-white">Product Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span>Area: {tileArea_m2.toFixed(4)} m²</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>Thickness: {product.size?.t_mm ?? "—"} mm</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Variants: {product.variants.length}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Category: {product.categorySlug || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Status: {product.public ? "Public" : "Private"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {product.variants.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-white">Variants:</div>
                      <div className="space-y-1">
                        {product.variants.slice(0, 3).map((variant, idx) => (
                          <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-gray-400" />
                            <span>{variant.name}</span>
                            {variant.color && <span className="text-gray-500">• {variant.color}</span>}
                          </div>
                        ))}
                        {product.variants.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{product.variants.length - 3} more variants
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
            )}
            {!filteredProducts.length && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    {products.length === 0 
                      ? "No products yet — go to Edit Catalog to add one, then click 'Reload data'."
                      : "No products match your current filters. Try adjusting your search criteria."
                    }
                  </div>
                </div>
            )}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <label className="text-sm font-semibold text-white">Quick Actions</label>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="px-4 py-3 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  to="/app/planner/production"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Production Planner
                </Link>
                <Link
                  className="px-4 py-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
                  to="/app/recipes"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Recipe Book
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {product ? (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/2 via-transparent to-gray-600/2 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
                <h2 className="text-lg font-black text-white">Product Variants & Specifications</h2>
              </div>
              <p className="text-sm text-gray-400 mt-1">Detailed breakdown of all product variants, processes, and material calculations</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Variant</th>
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Process</th>
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Recipe</th>
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Density (kg/m³)</th>
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Tile mass (kg)</th>
                    <th className="text-xs uppercase tracking-wider text-gray-400 font-bold py-4 px-6 border-b border-white/10">Per 1 m² mass (kg)</th>
                    <th className="py-4 px-6 border-b border-white/10"></th>
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
                      <tr key={v.id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="py-4 px-6 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="font-semibold text-white">{v.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5 text-gray-400" colSpan={6}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            No processes linked
                          </div>
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
                      <tr key={rowKey} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="py-4 px-6 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="font-semibold text-white">{v.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <span className="px-2 py-1 rounded-lg bg-white/10 text-xs font-medium text-gray-300">{pk}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <span className="font-medium text-white">{recipe ? recipe.name : "—"}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <span className="font-mono text-sm text-gray-300">{density}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <span className="font-mono text-sm font-bold text-white">{perTileKg}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <span className="font-mono text-sm font-bold text-white">{perM2Kg}</span>
                        </td>
                        <td className="py-4 px-6 border-b border-white/5">
                          <div className="flex gap-2 justify-end">
                            {recipe ? (
                              <>
                                <button
                                  className="px-3 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-md hover:scale-105"
                                  onClick={() => setOpenKey(openKey === rowKey ? null : rowKey)}
                                >
                                  {openKey === rowKey ? "Hide recipe" : "View recipe"}
                                </button>
                                <Link
                                  className="px-3 py-2 rounded-lg bg-white text-gray-900 text-xs font-bold shadow-lg hover:bg-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105"
                                  to={priceUrl.replace('/cost?', '/app/cost?')}
                                  title="Open Cost & Profit with this recipe/product preselected"
                                >
                                  Price this
                                </Link>
                              </>
                            ) : null}
                          </div>
                        </td>
                      </tr>,
                      openKey === rowKey ? (
                        <tr key={rowKey + "-detail"} className="bg-white/5">
                          <td className="py-6 px-6 border-b border-white/10 text-gray-300" colSpan={7}>
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-2 h-2 rounded-full bg-green-400" />
                              <div className="text-sm font-bold text-white">Recipe Details</div>
                            </div>
                            <div className="text-xs font-medium tracking-widest uppercase mb-3 text-gray-400">
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
                  <td className="py-8 px-6 text-center" colSpan={7}>
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-400">
                        This product has no variants yet. Add one in <span className="font-semibold text-white">Edit Catalog</span>.
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
      ) : (
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-500/2 via-transparent to-gray-600/2 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-8 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">No Product Selected</h3>
                <p className="text-sm text-gray-400">Select a product from the dropdown above to view its variants and specifications.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
