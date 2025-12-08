import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { load } from "../store";
import type { Product } from "../types";
import { useFadeIn } from "../utils/useAnimation";

function uniqueTags(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) (p.tags || []).forEach((t) => set.add(t));
  return Array.from(set).sort();
}

export default function PublicCatalog() {
  const state = load();
  const products: Product[] = state.products || [];

  // ✅ Only show published products that ALSO have a valid slug
  const visible = products.filter((p) => !!p.public && !!p.slug);
  const tags = uniqueTags(visible);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag
    ? visible.filter((p) => (p.tags || []).includes(activeTag))
    : visible;

  const catalogTitle =
    state.settings?.site?.catalogTitle || "Architectural Concrete Collection";

  // Animation hooks
  const catalogAnim = useFadeIn();
  const gridAnim = useFadeIn({ threshold: 0.05 });

  return (
    <div className="bg-[#232323] text-white">
      {/* Header block */}
      <section className="border-b border-white/10">
        <div ref={catalogAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32 pb-12 sm:pb-16 ${catalogAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
                Products
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight break-words">
                {catalogTitle}
              </h1>
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Tag filters */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                className={[
                  "px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-bold border border-white/10 transition-colors min-h-[44px] touch-manipulation",
                  !activeTag
                    ? "bg-[#353535] text-white border-white/20"
                    : "bg-[#232323] text-gray-400 hover:bg-[#353535] hover:text-white",
                ].join(" ")}
                onClick={() => setActiveTag(null)}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={[
                    "px-3 sm:px-4 py-2 text-xs uppercase tracking-wider font-bold border border-white/10 transition-colors min-h-[44px] touch-manipulation",
                    activeTag === tag
                      ? "bg-[#353535] text-white border-white/20"
                      : "bg-[#232323] text-gray-400 hover:bg-[#353535] hover:text-white",
                  ].join(" ")}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section ref={gridAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 ${gridAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {filtered.length === 0 ? (
          <div className="border border-white/10 bg-white/[0.02] p-8 sm:p-12 md:p-16 text-center">
            {activeTag ? (
              <p className="text-gray-400 text-sm sm:text-base">
                No products found for{" "}
                <span className="text-white font-medium">{activeTag}</span>.
              </p>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Coming Soon</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-6">
                  Our product catalog is being curated. Check back soon to explore our architectural concrete collection.
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  Contact Us
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <CatalogCard key={p.id} product={p} big={i % 7 === 0} index={i} visible={gridAnim.isVisible} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CatalogCard({
  product,
  big = false,
  index = 0,
  visible = false,
}: {
  product: Product;
  big?: boolean;
  index?: number;
  visible?: boolean;
}) {
  return (
    <Link
      to={`/product/${product.slug}`}
      className={[
        "group relative overflow-hidden hover-lift",
        big ? "sm:col-span-2" : "",
        visible ? `animate-fade-in-up stagger-${Math.min(index + 1, 6)}` : 'opacity-0',
      ].join(" ")}
      style={{ animationDelay: visible ? `${index * 0.1}s` : '0s' }}
    >
      <div className={["w-full bg-black hover-zoom", big ? "aspect-[21/9]" : "aspect-[4/3]"].join(" ")}>
        {product.coverImageUrl ? (
          <img
            src={product.coverImageUrl}
            alt={product.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        ) : (
          <img
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
            alt={product.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}
      </div>

      {/* Overlay title */}
      <div className="pointer-events-none absolute inset-0 flex items-end">
        <div className="w-full p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase break-words">{product.title}</h3>
            {product.categorySlug && (
              <span className="text-xs uppercase tracking-[0.2em] text-gray-400 shrink-0">
                {product.categorySlug}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
