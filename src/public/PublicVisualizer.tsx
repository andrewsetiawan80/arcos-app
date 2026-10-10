import PublicPageIntro from "./PublicPageIntro";
import { useState } from "react";
import usePublicData from "./usePublicData";
import type { Product, ProductVariant } from "../types";
import { usePublicTheme } from "./PublicThemeContext";
import WallBuilder from "../components/visualizer/WallBuilder";
import PhotoOverlay from "../components/visualizer/PhotoOverlay";
import CompareView from "../components/visualizer/CompareView";
import AIDemoOverlay from "../components/visualizer/AIDemoOverlay";
type Tab = "room" | "photo" | "compare" | "ai-demo";
export default function PublicVisualizer() {
    const { isDark } = usePublicTheme();
    const state = usePublicData();
    const products: Product[] = (state.products || []).filter(p => p.public && p.slug);
    const categories = state.categories || [];
    const [activeTab, setActiveTab] = useState<Tab>("photo");
    const [photoProduct, setPhotoProduct] = useState<Product | null>(null);
    const [photoVariant, setPhotoVariant] = useState<ProductVariant | null>(null);
    const dark = isDark;
    return (<div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PublicPageIntro label="Visualizer" title="See it in your space." description="Explore a room, place surfaces in a photograph, or compare your material choices."/>

        <div className="public-visualizer-tabs flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {[
            { id: "room" as const, label: "Room Builder" },
            { id: "photo" as const, label: "Your Space" },
            { id: "ai-demo" as const, label: "AI Demo" },
            { id: "compare" as const, label: "Compare" },
        ].map((tab) => (<button key={tab.id} aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? dark
                    ? "bg-white text-[#232323]"
                    : "bg-[#232323] text-white"
                : dark
                    ? "bg-white/10 hover:bg-white/20 text-white/80"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"}`}>
              {tab.label}
            </button>))}
        </div>

        {activeTab === "room" && (<WallBuilder products={products} categories={categories} dark={dark}/>)}

        {activeTab === "ai-demo" && (<AIDemoOverlay dark={dark}/>)}

        {activeTab === "photo" && (<PhotoOverlay product={photoProduct} variant={photoVariant} onProductSelect={(p, v) => {
                setPhotoProduct(p);
                setPhotoVariant(v);
            }} products={products} categories={categories} dark={dark}/>)}

        {activeTab === "compare" && (<CompareView products={products} categories={categories} dark={dark}/>)}
      </div>
    </div>);
}
