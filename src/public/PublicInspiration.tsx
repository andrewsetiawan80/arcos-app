import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePublicTheme } from "./PublicThemeContext";
import { api } from "../lib/api";

// Hero image
import heroImage from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";

interface InspirationCategory {
  id: string;
  name: string;
  nameId: string;
  displayOrder: number;
}

interface InspirationImage {
  id: number;
  categoryId: string;
  imageUrl: string;
  fullImageUrl?: string;
  title: string;
  titleId: string;
  displayOrder: number;
}

export default function PublicInspiration() {
  const { isDark } = usePublicTheme();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<InspirationImage | null>(null);
  const [categories, setCategories] = useState<InspirationCategory[]>([]);
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, imagesRes] = await Promise.all([
          api.getInspirationCategories(),
          api.getInspirationImages(),
        ]);

        if (categoriesRes.error) throw new Error(categoriesRes.error);
        if (imagesRes.error) throw new Error(imagesRes.error);

        setCategories(categoriesRes.data || []);
        setImages(imagesRes.data || []);
      } catch (err) {
        console.error("Failed to fetch inspiration data:", err);
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter images based on selected category
  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.categoryId === selectedCategory);

  // Helper to get proper image URL
  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-[#232323]" : "bg-white"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-12 h-12 border-2 rounded-full animate-spin mx-auto mb-4 ${
              isDark ? "border-white/20 border-t-white" : "border-[#E0E0E0] border-t-[#232323]"
            }`}
          />
          <p className={isDark ? "text-white/50" : "text-[#AFAFAF]"}>Loading inspiration...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
          isDark ? "bg-[#232323]" : "bg-white"
        }`}
      >
        <div className="text-center max-w-md px-6">
          <p className={`mb-6 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 text-sm font-medium tracking-wider transition-all duration-300 ${
              isDark
                ? "bg-white text-[#232323] hover:bg-white/90"
                : "bg-[#232323] text-white hover:bg-[#353535]"
            }`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"
      }`}
    >
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Design inspiration" 
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-b from-[#232323]/80 via-[#232323]/60 to-[#232323]"
                : "bg-gradient-to-b from-white/80 via-white/60 to-white"
            }`}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-24 text-center">
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-tight mb-6 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Inspiration
          </h1>
          <p
            className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}
          >
            Explore patterns, textures, and applications of architectural concrete surfaces 
            to inspire your next project.
          </p>
        </div>
      </section>

      {/* ===== CATEGORY FILTER ===== */}
      {categories.length > 0 && (
        <section
          className={`sticky top-16 sm:top-20 z-20 border-b transition-colors duration-300 ${
            isDark
              ? "border-white/10 bg-[#232323]/95 backdrop-blur"
              : "border-[#E0E0E0] bg-white/95 backdrop-blur"
          }`}
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 py-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                  selectedCategory === "all"
                    ? isDark
                      ? "bg-white text-[#232323] border-white"
                      : "bg-[#232323] text-white border-[#232323]"
                    : isDark
                    ? "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                    : "bg-transparent text-[#6F6F6F] border-[#E0E0E0] hover:border-[#AFAFAF]"
                }`}
              >
                All
              </button>
              {categories
                .filter((cat) => cat.id !== "all")
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-medium border transition-all duration-300 ${
                      selectedCategory === category.id
                        ? isDark
                          ? "bg-white text-[#232323] border-white"
                          : "bg-[#232323] text-white border-[#232323]"
                        : isDark
                        ? "bg-transparent text-white/60 border-white/20 hover:border-white/40"
                        : "bg-transparent text-[#6F6F6F] border-[#E0E0E0] hover:border-[#AFAFAF]"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== GALLERY GRID ===== */}
      <section
        className={`py-12 sm:py-16 transition-colors duration-300 ${
          isDark ? "bg-[#232323]" : "bg-white"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-20">
          {/* Results count */}
          <div className="mb-8">
            <p className={`text-sm font-light ${isDark ? "text-white/50" : "text-[#AFAFAF]"}`}>
              {filteredImages.length} {filteredImages.length === 1 ? "image" : "images"}
            </p>
          </div>

          {/* Gallery */}
          {filteredImages.length === 0 ? (
            <div
              className={`border p-12 sm:p-16 text-center ${
                isDark ? "border-white/10 bg-white/5" : "border-[#E0E0E0] bg-[#F8F8F8]"
              }`}
            >
              <p className={`text-lg font-light ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}>
                No images found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filteredImages.map((image, index) => (
                <div
                  key={`${image.id}-${index}`}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <div
                    className={`aspect-square overflow-hidden mb-2 ${
                      isDark ? "bg-white/5" : "bg-[#F0F0F0]"
                    }`}
                  >
                    <img
                      src={getImageUrl(image.imageUrl)}
                      alt={image.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading={index < 12 ? "eager" : "lazy"}
                    />
                  </div>
                  <p
                    className={`text-xs font-light truncate ${
                      isDark ? "text-white/50" : "text-[#AFAFAF]"
                    }`}
                  >
                    {image.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        className={`py-16 sm:py-20 border-t transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div className="max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center">
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-4 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Ready to bring your vision to life?
          </h2>
          <p
            className={`text-base sm:text-lg font-light leading-relaxed mb-8 ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            Let's discuss how ARCOS surfaces can transform your space.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "bg-white text-[#232323] hover:bg-white/90"
                  : "bg-[#232323] text-white hover:bg-[#353535]"
              }`}
            >
              Start a Project
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/surfaces"
              className={`inline-flex items-center gap-2 px-6 py-3 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "border-white/30 text-white hover:bg-white hover:text-[#232323]"
                  : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
              }`}
            >
              Explore Surfaces
            </Link>
          </div>
        </div>
      </section>

      {/* ===== IMAGE MODAL ===== */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="bg-[#232323] overflow-hidden">
              <img
                src={getImageUrl(selectedImage.fullImageUrl || selectedImage.imageUrl)}
                alt={selectedImage.title}
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="p-4 border-t border-white/10">
                <h3 className="text-lg font-light text-white">{selectedImage.title}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
