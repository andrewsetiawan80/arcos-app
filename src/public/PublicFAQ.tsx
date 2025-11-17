import React, { useState, useEffect } from "react";
import { useFadeIn } from "../utils/useAnimation";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";
import tile01 from "../assets/images/inspiration/3d-tile-01.png";
import microcement01 from "../assets/images/inspiration/microcement-01.png";
import structuralPanels from "../assets/images/structural-panels.jpg";

interface FAQCategory {
  id: string;
  name: string;
  nameId: string;
  displayOrder: number;
}

interface FAQItem {
  id: number;
  categoryId: string;
  question: string;
  questionId: string;
  answer: string;
  answerId: string;
  displayOrder: number;
}

export default function PublicFAQ() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroAnim = useFadeIn({ delay: 100 });
  const contentAnim = useFadeIn({ delay: 200 });

  // Fetch categories and items on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesRes, itemsRes] = await Promise.all([
          api.getFAQCategories(),
          api.getFAQItems(),
        ]);

        if (categoriesRes.error) {
          throw new Error(categoriesRes.error);
        }
        if (itemsRes.error) {
          throw new Error(itemsRes.error);
        }

        const fetchedCategories = categoriesRes.data || [];
        setCategories(fetchedCategories);
        setItems(itemsRes.data || []);

        // Set first category as default
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch FAQ data:", err);
        setError(err instanceof Error ? err.message : "Failed to load FAQ data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter items by selected category
  const filteredItems = selectedCategory
    ? items.filter((item) => item.categoryId === selectedCategory)
    : items;

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return language === "id" ? category?.nameId || category?.name : category?.name || "";
  };

  const getQuestion = (q: string, qId: string) => (language === "id" ? qId : q);
  const getAnswer = (a: string, aId: string) => (language === "id" ? aId : a);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading FAQ...</p>
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
      <section className="relative border-b border-white/10 overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={tile01}
              alt="FAQ"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/80 via-[#131313]/60 to-[#131313]/80" />
        </div>
        <div ref={heroAnim.ref} className={`relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full ${heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="max-w-3xl space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              {language === "id" ? "Pertanyaan Umum" : "Frequently Asked Questions"}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              {language === "id"
                ? "Pertanyaan yang Sering Diajukan"
                : "Frequently Asked Questions"}
            </h1>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
              {language === "id"
                ? "Temukan jawaban untuk pertanyaan umum tentang produk dan layanan kami."
                : "Find answers to common questions about our products and services."}
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

      {/* FAQ Content */}
      <section className="bg-[#131313]">
        <div ref={contentAnim.ref} className={`max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 transition-opacity duration-500 ${contentAnim.isVisible ? "animate-fade-in-up opacity-100" : "opacity-0"}`}>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">No questions found in this category.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 sm:p-8 hover:border-white/20 transition-all"
                >
                  <h3 className="text-xl sm:text-2xl font-bold mb-4">
                    {getQuestion(item.question, item.questionId)}
                  </h3>
                  <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {getAnswer(item.answer, item.answerId)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
