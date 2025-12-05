// src/pages/CatalogSettings.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Category, Product, SiteConfig } from "../types";

const newid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function CatalogSettings() {
  const [state, setState] = useState<AppState>(() => {
    const s = load();
    (s as any).categories ||= [];
    (s.settings as any).site ||= {};
    return s;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  // No auto-save - only manual saves

  const categories = state.categories || [];
  const products = (state.products || []) as Product[];

  // ---------- Site Config ----------
  const site = (state.settings?.site || {}) as SiteConfig;
  function updateSite(patch: Partial<SiteConfig>) {
    setState((s) => ({ ...s, settings: { ...s.settings, site: { ...(s.settings?.site || {}), ...patch } } }));
    setHasUnsavedChanges(true);
  }

  // ---------- Category CRUD ----------
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    setNewSlug(slugify(newName));
  }, [newName]);

  const slugInUse = (slug: string, ignoreId?: string) =>
    categories.some((c) => c.slug === slug && c.id !== ignoreId);

  function addCategory() {
    const name = newName.trim();
    const slug = slugify(newSlug || name);
    if (!name) return alert("Category name is required.");
    if (!slug) return alert("Category slug is required.");
    if (slugInUse(slug)) return alert("Slug already in use. Please choose another.");

    const next: Category = { id: newid(), name, slug };
    setState((s) => ({ ...s, categories: [...(s.categories || []), next] }));
    setHasUnsavedChanges(true);
    setNewName("");
    setNewSlug("");
  }

  function updateCategory(id: string, patch: Partial<Category>) {
    setState((s) => {
      const list = [...(s.categories || [])];
      const idx = list.findIndex((c) => c.id === id);
      if (idx < 0) return s;

      // Validate slug uniqueness if being changed
      if (patch.slug) {
        const nextSlug = slugify(patch.slug);
        if (slugInUse(nextSlug, id)) {
          alert("Slug already in use. Please choose another.");
          return s;
        }
        patch.slug = nextSlug;
      }

      list[idx] = { ...list[idx], ...patch };
      return { ...s, categories: list };
    });
    setHasUnsavedChanges(true);
  }

  function removeCategory(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    const usedBy = products.filter((p) => p.categorySlug === cat.slug);
    if (usedBy.length > 0) {
      alert(
        `Cannot delete "${cat.name}" because ${usedBy.length} product(s) are using it.\n` +
          `Please reassign or clear the category on those products first.`
      );
      return;
    }

    if (!confirm(`Delete category “${cat.name}”?`)) return;

    setState((s) => ({
      ...s,
      categories: (s.categories || []).filter((c) => c.id !== id),
    }));
    setHasUnsavedChanges(true);
  }

  function moveCategory(id: string, delta: number) {
    setState((s) => {
      const list = [...(s.categories || [])];
      const idx = list.findIndex((c) => c.id === id);
      if (idx < 0) return s;
      const newIdx = Math.max(0, Math.min(list.length - 1, idx + delta));
      if (newIdx === idx) return s;
      const [item] = list.splice(idx, 1);
      list.splice(newIdx, 0, item);
      return { ...s, categories: list };
    });
    setHasUnsavedChanges(true);
  }

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert("Catalog settings saved successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save catalog settings. Please try again.");
    }
  };

  const catUsageMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      if (p.categorySlug) {
        m.set(p.categorySlug, (m.get(p.categorySlug) || 0) + 1);
      }
    }
    return m;
  }, [products]);

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Catalog Settings</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Catalog Settings
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Configure your public catalog, categories, and site settings for the best customer experience.
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
              Save Settings
            </button>
            <Link
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:scale-105 flex items-center gap-2"
              to="/app/products/edit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Catalog Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Site / Hero configuration */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <h2 className="text-lg font-black text-white">Public Site Configuration</h2>
          </div>
          <div className="space-y-6">

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Homepage Hero Title</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={site.heroTitle || ""}
                  onChange={(e) => updateSite({ heroTitle: e.target.value })}
                  placeholder="e.g., Arcos"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Homepage Hero Subtitle</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={site.heroSubtitle || ""}
                  onChange={(e) => updateSite({ heroSubtitle: e.target.value })}
                  placeholder="Short line under the title"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Catalog Title</label>
                <input
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={site.catalogTitle || ""}
                  onChange={(e) => updateSite({ catalogTitle: e.target.value })}
                  placeholder="e.g., Architectural Concrete Collection"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Contact Email</label>
                <input
                  type="email"
                  className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-300"
                  value={site.contactEmail || ""}
                  onChange={(e) => updateSite({ contactEmail: e.target.value })}
                  placeholder="hello@arcos.com"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Manager */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/3 via-transparent to-gray-600/3 rounded-2xl blur-2xl" />
        <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 p-6 hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <h2 className="text-lg font-black text-white">Category Manager</h2>
            </div>
          <Link
            to="/catalog"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-400 hover:underline"
          >
            View public catalog ↗
          </Link>
        </div>

        {/* New category */}
        <div className="grid md:grid-cols-[1fr_280px_auto] gap-3">
          <input
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
            placeholder="New category name (e.g., Facade Panels)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
            placeholder="slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
          />
          <button
            className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-white text-black"
            onClick={addCategory}
          >
            + Add
          </button>
        </div>
        {newSlug && slugInUse(slugify(newSlug)) && (
          <div className="text-xs text-amber-300">Slug already exists.</div>
        )}

        {/* List */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <div className="text-sm text-stone-400">No categories yet.</div>
          ) : (
            categories.map((c, idx) => {
              const used = catUsageMap.get(c.slug) || 0;
              return (
                <div
                  key={c.id}
                  className="rounded-lg border border-white/10 p-3 bg-black/10 grid md:grid-cols-[1fr_260px_auto_auto_auto] gap-3 items-center"
                >
                  <input
                    className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={c.name}
                    onChange={(e) => updateCategory(c.id, { name: e.target.value })}
                  />
                  <input
                    className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={c.slug}
                    onChange={(e) => updateCategory(c.id, { slug: e.target.value })}
                  />
                  <div className="text-xs text-stone-400">
                    {used} product{used !== 1 ? "s" : ""}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-40"
                      onClick={() => moveCategory(c.id, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-40"
                      onClick={() => moveCategory(c.id, +1)}
                      disabled={idx === categories.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={() => removeCategory(c.id)}
                  >
                    Delete
                  </button>
                </div>
              );
            })
          )}
          </div>
        </div>
      </section>
    </div>
  );
}
