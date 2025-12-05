import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";

// High-quality hero image for inspiration page
import heroImage from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
// Fallback image
import tile01 from "../assets/images/inspiration/3d-tile-01.webp";

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
  const { t, language } = useLanguage();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [categories, setCategories] = useState<InspirationCategory[]>([]);
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const galleryAnim = useFadeIn({ delay: 200 });

  // Fetch categories and images on mount with retry logic
  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, imagesRes] = await Promise.all([
          api.getInspirationCategories(),
          api.getInspirationImages(),
        ]);

        if (categoriesRes.error) {
          throw new Error(categoriesRes.error);
        }
        if (imagesRes.error) {
          throw new Error(imagesRes.error);
        }

        const fetchedCategories = categoriesRes.data || [];
        const fetchedImages = imagesRes.data || [];

        // Validate that we got data
        if (fetchedCategories.length === 0) {
          throw new Error("No categories found");
        }
        if (fetchedImages.length === 0) {
          throw new Error("No images found");
        }

        setCategories(fetchedCategories);
        setImages(fetchedImages);
        setInitialLoadComplete(true);
      } catch (err) {
        console.error("Failed to fetch inspiration data:", err);
        
        // Retry up to 2 times with exponential backoff
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
          console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/2)`);
          setTimeout(() => fetchData(retryCount + 1), delay);
        } else {
          setError(err instanceof Error ? err.message : "Failed to load inspiration data");
          setLoading(false);
        }
      } finally {
        if (retryCount === 0 || retryCount >= 2) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  // Fetch images when category changes (only after initial load to avoid race condition)
  useEffect(() => {
    // Skip if initial load hasn't completed yet
    if (!initialLoadComplete) return;
    
    // Skip if category is "all" and we already have images (avoid duplicate fetch)
    if (selectedCategory === "all" && images.length > 0) return;

    const fetchCategoryImages = async () => {
      try {
        setLoading(true);
        const res = selectedCategory === "all" 
          ? await api.getInspirationImages()
          : await api.getInspirationImages(selectedCategory);
        
        if (!res.error && res.data) {
          setImages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch category images:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryImages();
  }, [selectedCategory, initialLoadComplete]); // Only refetch when category changes after initial load

  // Handle hash navigation from home page links
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Check if there's a hash in the URL
    const hash = location.hash.replace("#", "");
    if (hash && categories.length > 0) {
      // Check if the hash matches a valid category
      const validCategory = categories.find(cat => cat.id === hash);
      if (validCategory) {
        setSelectedCategory(hash);
      }
    }
  }, [location.hash, categories]);

  // Ensure images are visible on mobile - check if gallery is already in viewport on mount
  useEffect(() => {
    const checkInitialVisibility = () => {
      if (galleryAnim.ref.current && !galleryAnim.isVisible) {
        const rect = galleryAnim.ref.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 1.5 && rect.bottom > -100;
        if (isInViewport) {
          // If already in viewport, make visible immediately (common on mobile)
          setTimeout(() => {
            if (galleryAnim.ref.current) {
              galleryAnim.ref.current.classList.remove("opacity-0");
              galleryAnim.ref.current.classList.add("opacity-100");
            }
          }, 300);
        }
      }
    };
    
    // Check after a short delay to allow IntersectionObserver to work first
    const timeout = setTimeout(checkInitialVisibility, 500);
    return () => clearTimeout(timeout);
  }, [galleryAnim.isVisible, galleryAnim.ref]);

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return language === "id" ? category?.nameId || category?.name : category?.name || "";
  };

  const selectedImageData = images.find((img) => img.id === selectedImage);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading inspiration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A1A] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Design inspiration"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/60 via-[#131313]/40 to-[#131313]/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full animate-fade-in-up">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              {language === "id" ? "Inspirasi Desain" : "Design Inspiration"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              {language === "id"
                ? "Koleksi inspirasi untuk proyek Anda"
                : "Inspiration collection for your projects"}
            </h1>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
              {language === "id"
                ? "Jelajahi berbagai pola, tekstur, dan aplikasi microcement dan ubin 3D untuk menginspirasi proyek arsitektur Anda."
                : "Explore diverse patterns, textures, and applications of microcement and 3D tiles to inspire your architectural projects."}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b border-white/10 bg-[#131313] sticky top-16 sm:top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                  selectedCategory === category.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                {getCategoryName(category.id)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="bg-[#131313]">
        <div ref={galleryAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 transition-opacity duration-500 ${galleryAnim.isVisible || images.length > 0 ? "animate-fade-in-up opacity-100" : "opacity-0"}`}>
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              {language === "id" ? `${images.length} Gambar` : `${images.length} Images`}
            </p>
          </div>
          {images.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No images found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {images.map((image, index) => {
                // Ensure imageUrl is absolute if it's relative
                const imageSrc = image.imageUrl.startsWith('http') 
                  ? image.imageUrl 
                  : image.imageUrl.startsWith('/') 
                    ? image.imageUrl 
                    : `/${image.imageUrl}`;
                
                return (
                  <div
                    key={`image-${image.id}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] cursor-pointer hover:border-white/30 transition-all hover:-translate-y-1"
                    onClick={() => setSelectedImage(image.id)}
                  >
                    <div className="aspect-square overflow-hidden bg-white/5 relative">
                      <img
                        key={`img-${image.id}-${image.imageUrl}`}
                        src={imageSrc}
                        alt={language === "id" ? image.titleId : image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading={index < 16 ? "eager" : "lazy"}
                        decoding={index < 16 ? "sync" : "async"}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                          target.style.visibility = 'visible';
                        }}
                        onError={(e) => {
                          console.error('Image failed to load:', imageSrc, image.id);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm font-semibold text-white">
                        {language === "id" ? image.titleId : image.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage !== null && selectedImageData && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/10">
              <div className="aspect-square max-h-[80vh] overflow-hidden">
                <img
                  src={selectedImageData.fullImageUrl || selectedImageData.imageUrl}
                  alt={language === "id" ? selectedImageData.titleId : selectedImageData.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // If full image failed, try thumbnail
                    if (selectedImageData.fullImageUrl && target.src === selectedImageData.fullImageUrl) {
                      target.src = selectedImageData.imageUrl;
                    } else {
                      // Fallback to hero image
                      console.error('Modal image failed to load:', target.src);
                      target.src = tile01;
                    }
                  }}
                />
              </div>
              <div className="p-6 border-t border-white/10">
                <h3 className="text-xl font-bold uppercase mb-2">
                  {language === "id" ? selectedImageData.titleId : selectedImageData.title}
                </h3>
                <p className="text-sm text-gray-400">
                  {language === "id"
                    ? "Klik di luar gambar untuk menutup"
                    : "Click outside image to close"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
