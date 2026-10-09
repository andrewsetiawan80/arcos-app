import React, { useMemo, useState } from "react";
import type { Product, ProductVariant } from "../../types";

export type ProductPickerProps = {
  products: Product[];
  categories?: { id: string; name: string; slug: string }[];
  selectedProduct: Product | null;
  selectedVariant: ProductVariant | null;
  onSelect: (product: Product, variant: ProductVariant) => void;
  compact?: boolean;
  dark?: boolean;
};

function getTextureUrl(p: Product): string | undefined {
  return p.textureUrl || p.coverImageUrl;
}

export default function ProductPicker({
  products,
  categories = [],
  selectedProduct,
  selectedVariant,
  onSelect,
  compact = false,
  dark = false,
}: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = products.filter((p) => !!p.public && !!p.slug);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    if (categorySlug) {
      list = list.filter((p) => p.categorySlug === categorySlug);
    }
    return list;
  }, [products, search, categorySlug]);

  const cls = (s: string) =>
    dark ? s.replace(/text-\[#232323\]/g, "text-white").replace(/bg-white/g, "bg-[#232323]") : s;

  return (
    <div className={`space-y-3 ${compact ? "text-sm" : ""}`}>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm ${
          dark
            ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
            : "bg-white/80 border-gray-200 text-[#232323] placeholder:text-gray-400"
        }`}
      />
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategorySlug(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              !categorySlug
                ? dark
                  ? "bg-white text-[#232323]"
                  : "bg-[#232323] text-white"
                : dark
                ? "bg-white/10 text-white/70 hover:bg-white/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategorySlug(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                categorySlug === c.slug
                  ? dark
                    ? "bg-white text-[#232323]"
                    : "bg-[#232323] text-white"
                  : dark
                  ? "bg-white/10 text-white/70 hover:bg-white/20"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2 max-h-[280px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className={`py-6 text-center text-sm ${dark ? "text-white/50" : "text-gray-500"}`}>
            No products match
          </div>
        )}
        {filtered.map((p) => {
          const isSelected = selectedProduct?.id === p.id;
          const variants = p.variants || [];
          const firstVariant = variants[0];
          const imgUrl = getTextureUrl(p) || p.coverImageUrl;
          const sizeStr = p.size?.w_mm && p.size?.h_mm
            ? `${p.size.w_mm} × ${p.size.h_mm} mm`
            : "";

          return (
            <div
              key={p.id}
              className={`rounded-lg border p-2 transition-colors ${
                isSelected
                  ? dark
                    ? "border-white bg-white/15"
                    : "border-[#232323] bg-[#232323]/5"
                  : dark
                  ? "border-white/10 hover:border-white/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => firstVariant && onSelect(p, firstVariant)}
                className="w-full text-left flex gap-3 items-center"
              >
                <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-gray-200">
                  {imgUrl ? (
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-xs ${dark ? "text-white/40" : "text-gray-400"}`}>
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`font-medium truncate ${dark ? "text-white" : "text-[#232323]"}`}>
                    {p.title}
                  </div>
                  {sizeStr && (
                    <div className={`text-xs ${dark ? "text-white/50" : "text-gray-500"}`}>
                      {sizeStr}
                    </div>
                  )}
                </div>
              </button>
              {isSelected && variants.length > 1 && (
                <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const vSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onSelect(p, v)}
                        title={v.name || v.color || "Variant"}
                        className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                          vSelected
                            ? dark
                              ? "border-white scale-110"
                              : "border-[#232323] scale-110"
                            : dark
                            ? "border-white/30 hover:border-white/50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={
                          v.color
                            ? { backgroundColor: v.color }
                            : { backgroundColor: dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)" }
                        }
                      >
                        {!v.color && (
                          <span className={`text-[10px] font-medium ${dark ? "text-white/90" : "text-gray-700"}`}>
                            {v.name?.slice(0, 1) || "?"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
