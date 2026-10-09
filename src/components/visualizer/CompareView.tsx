import React from "react";
import type { Product } from "../../types";
import WallBuilder from "./WallBuilder";

export type CompareViewProps = {
  products: Product[];
  categories?: { id: string; name: string; slug: string }[];
  dark?: boolean;
};

export default function CompareView({
  products,
  categories = [],
  dark = false,
}: CompareViewProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="border border-white/10 rounded-xl p-4">
        <div className="text-sm font-medium mb-3 opacity-70">Option A</div>
        <WallBuilder products={products} categories={categories} dark={dark} />
      </div>
      <div className="border border-white/10 rounded-xl p-4">
        <div className="text-sm font-medium mb-3 opacity-70">Option B</div>
        <WallBuilder products={products} categories={categories} dark={dark} />
      </div>
    </div>
  );
}
