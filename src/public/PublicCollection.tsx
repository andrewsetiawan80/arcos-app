import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { load } from "../store";
import type { Product } from "../types";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";

// Import images - high quality hero
import heroImage from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";

function uniqueTags(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) (p.tags || []).forEach((t) => set.add(t));
  return Array.from(set).sort();
}

export default function PublicCollection() {
  const { isDark } = usePublicTheme();
  const state = load();
  const products: Product[] = state.products || [];

  // Only show published products that have a valid slug
  const visible = products.filter((p) => !!p.public && !!p.slug);
  const tags = uniqueTags(visible);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag
    ? visible.filter((p) => (p.tags || []).includes(activeTag))
    : visible;

  // Animation hooks
  const heroAnim = useFadeIn({ delay: 100 });
  const filterAnim = useFadeIn({ delay: 150 });
  const gridAnim = useFadeIn({ delay: 200 });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-[#1B1B1B]"
      }`}
    >
      {/* ===== PAGE HEADER / HERO ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern concrete interior"
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-b from-[#1B1B1B]/80 via-[#1B1B1B]/60 to-[#1B1B1B]"
                : "bg-gradient-to-b from-white/80 via-white/60 to-white"
            }`}
          />
        </div>

        <div
          ref={heroAnim.ref}
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-24 text-center ${
            heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Title */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-8 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Collection
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            Explore our curated range of architectural concrete surfaces — each piece crafted with
            precision and designed for timeless spaces.
          </p>
        </div>
      </section>

      {/* ===== FILTER SECTION ===== */}
      {tags.length > 0 && (
        <section
          className={`border-b transition-colors duration-300 ${
            isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
          }`}
        >
          <div
            ref={filterAnim.ref}
            className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-6 ${
              filterAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`text-xs uppercase tracking-wider mr-4 ${
                  isDark ? "text-white/40" : "text-[#AFAFAF]"
                }`}
              >
                Filter by
              </span>
              <button
                className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                  !activeTag
                    ? isDark
                      ? "bg-white text-[#1B1B1B] border-white"
                      : "bg-[#1B1B1B] text-white border-[#1B1B1B]"
                    : isDark
                    ? "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    : "bg-transparent text-[#6F6F6F] border-[#E0E0E0] hover:border-[#AFAFAF]"
                }`}
                onClick={() => setActiveTag(null)}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                    activeTag === tag
                      ? isDark
                        ? "bg-white text-[#1B1B1B] border-white"
                        : "bg-[#1B1B1B] text-white border-[#1B1B1B]"
                      : isDark
                      ? "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                      : "bg-transparent text-[#6F6F6F] border-[#E0E0E0] hover:border-[#AFAFAF]"
                  }`}
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== COLLECTION GRID ===== */}
      <section
        className={`py-16 sm:py-20 transition-colors duration-300 ${
          isDark ? "bg-[#1B1B1B]" : "bg-white"
        }`}
      >
        <div
          ref={gridAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            gridAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Results count */}
          <div className="flex items-center justify-between mb-10">
            <p
              className={`text-sm font-light ${
                isDark ? "text-white/50" : "text-[#AFAFAF]"
              }`}
            >
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
              {activeTag && (
                <span>
                  {" "}
                  in <span className={isDark ? "text-white" : "text-[#1B1B1B]"}>{activeTag}</span>
                </span>
              )}
            </p>
          </div>

          {filtered.length === 0 ? (
            <EmptyState activeTag={activeTag} isDark={isDark} />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((product, index) => (
                <CollectionCard
                  key={product.id}
                  product={product}
                  index={index}
                  isDark={isDark}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        className={`py-20 sm:py-24 border-t transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center">
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Looking for something specific?
          </h2>
          <p
            className={`text-lg font-light leading-relaxed mb-10 ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            We create bespoke surfaces tailored to your project. Share your requirements and we'll
            guide you to the right solution.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "bg-white text-[#1B1B1B] hover:bg-white/90"
                  : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
              }`}
            >
              Contact Us
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <Link
              to="/surfaces"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "border-white/30 text-white hover:bg-white hover:text-[#1B1B1B]"
                  : "border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white"
              }`}
            >
              Explore Materials
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Empty State Component
function EmptyState({ activeTag, isDark }: { activeTag: string | null; isDark: boolean }) {
  return (
    <div
      className={`border p-12 sm:p-16 text-center ${
        isDark ? "border-white/10 bg-white/5" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}
    >
      {activeTag ? (
        <div>
          <p className={`text-lg font-light mb-4 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}>
            No pieces found for{" "}
            <span className={isDark ? "text-white" : "text-[#1B1B1B]"}>"{activeTag}"</span>
          </p>
          <p className={`text-sm ${isDark ? "text-white/50" : "text-[#AFAFAF]"}`}>
            Try selecting a different category or view all pieces.
          </p>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <div
            className={`w-16 h-16 mx-auto mb-8 flex items-center justify-center ${
              isDark ? "text-white/20" : "text-[#E0E0E0]"
            }`}
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3
            className={`text-xl font-light mb-4 ${isDark ? "text-white" : "text-[#1B1B1B]"}`}
          >
            Collection coming soon
          </h3>
          <p
            className={`text-base font-light leading-relaxed mb-8 ${
              isDark ? "text-white/60" : "text-[#6F6F6F]"
            }`}
          >
            Our curated collection of architectural concrete surfaces is being prepared. Contact us
            to discuss your project requirements.
          </p>
          <Link
            to="/contact"
            className={`inline-flex items-center gap-3 px-6 py-3 text-sm font-medium tracking-wider transition-all duration-300 ${
              isDark
                ? "bg-white text-[#1B1B1B] hover:bg-white/90"
                : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
            }`}
          >
            Get in Touch
          </Link>
        </div>
      )}
    </div>
  );
}

// Collection Card Component
function CollectionCard({
  product,
  index,
  isDark,
}: {
  product: Product;
  index: number;
  isDark: boolean;
}) {
  const defaultImage =
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop";

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div
        className={`aspect-[4/3] overflow-hidden mb-5 ${
          isDark ? "bg-white/5" : "bg-[#F0F0F0]"
        }`}
      >
        <img
          src={product.coverImageUrl || defaultImage}
          alt={product.title}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isDark
              ? "opacity-80 group-hover:opacity-100 group-hover:scale-105"
              : "grayscale group-hover:grayscale-0 group-hover:scale-105"
          }`}
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3
          className={`text-base font-medium transition-colors ${
            isDark ? "text-white group-hover:text-white/80" : "text-[#1B1B1B] group-hover:text-[#6F6F6F]"
          }`}
        >
          {product.title}
        </h3>
        {product.categorySlug && (
          <p
            className={`text-xs uppercase tracking-wider ${
              isDark ? "text-white/40" : "text-[#AFAFAF]"
            }`}
          >
            {product.categorySlug}
          </p>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 ${
                  isDark ? "bg-white/10 text-white/50" : "bg-[#F0F0F0] text-[#AFAFAF]"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

