import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { load } from "../store";
import { useFadeIn } from "../utils/useAnimation";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";
import { ArcosSectionOne, ArcosSectionTwo, ArcosSectionThree } from "../components/brand";

import heroFacade from "../assets/images/hero-facade.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import mosaicInterior from "../assets/images/mosaic-interior.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import qualityReview from "../assets/images/quality-review.webp";
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import concreteFinish from "../assets/images/concrete-finish.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
import microcementStairs from "../assets/images/grey-microcement-stairs-stairs-viewed-from-modern-design-innovative-material-metal-railing.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import concreteInstallation from "../assets/images/concrete-installation.webp";
import mixDesign from "../assets/images/mix-design.webp";
// Inspiration images for showcase
import tile01 from "../assets/images/inspiration/3d-tile-01.webp";
import tile02 from "../assets/images/inspiration/3d-tile-02.webp";
import tile03 from "../assets/images/inspiration/3d-tile-03.webp";
import tile04 from "../assets/images/inspiration/3d-tile-04.webp";
import tile05 from "../assets/images/inspiration/3d-tile-05.webp";
import tile07 from "../assets/images/inspiration/3d-tile-07.webp";
import tile10 from "../assets/images/inspiration/3d-tile-10.webp";
import tile15 from "../assets/images/inspiration/3d-tile-15.webp";
import tile20 from "../assets/images/inspiration/3d-tile-20.webp";
import tile25 from "../assets/images/inspiration/3d-tile-25.webp";
import tile30 from "../assets/images/inspiration/3d-tile-30.webp";
import tile35 from "../assets/images/inspiration/3d-tile-35.webp";
import tile40 from "../assets/images/inspiration/3d-tile-40.webp";
import tile45 from "../assets/images/inspiration/3d-tile-45.webp";
import tile50 from "../assets/images/inspiration/3d-tile-50.webp";
import tile55 from "../assets/images/inspiration/3d-tile-55.webp";
import tile60 from "../assets/images/inspiration/3d-tile-60.webp";
import tile65 from "../assets/images/inspiration/3d-tile-65.webp";
import tile70 from "../assets/images/inspiration/3d-tile-70.webp";
import tile75 from "../assets/images/inspiration/3d-tile-75.webp";
import tile80 from "../assets/images/inspiration/3d-tile-80.webp";
import tile85 from "../assets/images/inspiration/3d-tile-85.webp";
import tile90 from "../assets/images/inspiration/3d-tile-90.webp";
import tile95 from "../assets/images/inspiration/3d-tile-95.webp";
import tile100 from "../assets/images/inspiration/3d-tile-100.webp";
import microcementInsp01 from "../assets/images/inspiration/microcement-01.webp";
import microcementInsp02 from "../assets/images/inspiration/microcement-02.webp";
import microcementInsp03 from "../assets/images/inspiration/microcement-03.webp";
import concretePanelInsp01 from "../assets/images/inspiration/concrete-panel-01.webp";
import concretePanelInsp02 from "../assets/images/inspiration/concrete-panel-02.webp";
import concretePanelInsp03 from "../assets/images/inspiration/concrete-panel-03.webp";
import bespokeInsp01 from "../assets/images/inspiration/bespoke-01.webp";
import bespokeInsp02 from "../assets/images/inspiration/bespoke-02.webp";
import bespokeInsp03 from "../assets/images/inspiration/bespoke-03.webp";
import texturedMicrocement01 from "../assets/images/inspiration/textured-microcement-01.webp";
import texturedMicrocement02 from "../assets/images/inspiration/textured-microcement-02.webp";
import texturedMicrocement03 from "../assets/images/inspiration/textured-microcement-03.webp";
import bespokeHero from "../assets/images/inspiration/bespoke-01.webp";
import concretePanelHero from "../assets/images/inspiration/concrete-panel-01.webp";

// Inspiration Showcase Component with Randomization
function InspirationShowcase({ inspirationAnim }: { inspirationAnim: ReturnType<typeof useFadeIn> }) {
  const { t, language } = useLanguage();
  const [randomizedImages, setRandomizedImages] = useState<Array<{
    image: string;
    category: string;
    link: string;
  }>>([]);

  // Fetch inspiration images from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.getInspirationImages();
        if (res.error || !res.data) {
          console.error("Failed to fetch inspiration images:", res.error);
          return;
        }

        const images = res.data;
        const categories = await api.getInspirationCategories();
        const categoryMap = new Map((categories.data || []).map((cat: any) => [cat.id, cat]));

        // Map images to display format
        const mappedImages = images.map((img: any) => {
          const category = categoryMap.get(img.categoryId);
          const categoryName = language === "id" ? category?.nameId : category?.name || "";
          return {
            image: img.imageUrl,
            category: categoryName,
            link: `/inspiration#${img.categoryId}`,
          };
        });

        // Randomize and select 10
        const shuffled = [...mappedImages].sort(() => Math.random() - 0.5);
        setRandomizedImages(shuffled.slice(0, 10));
      } catch (err) {
        console.error("Error fetching inspiration images:", err);
      }
    };

    fetchImages();
  }, [language]);

  return (
    <section id="inspiration" className="border-b border-white/10 bg-[#353535]">
      <div ref={inspirationAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${inspirationAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
        <div className="text-center mb-12 space-y-4">
          <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.designInspiration")}</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
            {t("home.inspirationHeading")}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
            {t("home.inspirationDescription")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
          {randomizedImages.map((item, i) => (
            <Link
              key={`${item.image}-${i}`}
              to={item.link}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] hover:border-white/30 transition-all hover:-translate-y-1"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-semibold text-white uppercase">{item.category}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/inspiration"
            onClick={() => window.scrollTo(0, 0)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] hover-lift shadow-lg shadow-black/20"
          >
            {t("home.viewAllInspiration")}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// Featured Projects Carousel Component
function FeaturedProjectsCarousel() {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Array<{
    title: string;
    category: string;
    image: string;
  }>>([]);

  // Fetch featured projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getFeaturedProjects();
        if (res.error || !res.data) {
          console.error("Failed to fetch featured projects:", res.error);
          return;
        }

        const projects = res.data.map((project: any) => ({
          title: language === "id" ? project.titleId : project.title,
          category: language === "id" ? project.categoryId : project.category,
          image: project.imageUrl,
        }));

        setFeaturedProjects(projects);
      } catch (err) {
        console.error("Error fetching featured projects:", err);
      }
    };

    fetchProjects();
  }, [language]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (isPaused || featuredProjects.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredProjects.length / 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, featuredProjects.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10 seconds
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(featuredProjects.length / 3)) % Math.ceil(featuredProjects.length / 3));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToNext = () => {
    if (featuredProjects.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredProjects.length / 3));
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (featuredProjects.length === 0) {
    return null; // Don't render until data is loaded
  }

  const visibleProjects = featuredProjects.slice(currentIndex * 3, currentIndex * 3 + 3);
  const totalSlides = Math.ceil(featuredProjects.length / 3);

  return (
    <div className="relative">
      {/* Projects Grid */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        {visibleProjects.map((project, i) => (
          <div
            key={`${currentIndex}-${i}`}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-black hover:border-white/30 transition-all hover:-translate-y-1 animate-fade-in"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 flex items-end p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <div className="w-full">
                <h3 className="text-lg font-bold uppercase mb-1">{project.title}</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{project.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Previous projects"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="p-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all"
          aria-label="Next projects"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function PublicHome() {
  const state = load();
  const site = state.settings?.site || {};
  const { t } = useLanguage();

  const heroTitle = site.heroTitle || t("home.heroTitle");
  const heroSubtitle = site.heroSubtitle || t("home.heroSubtitle");

  // Hero animation - no longer needed since we use CSS animation directly
  const heroRef = useRef<HTMLDivElement>(null);

  // Section animations
  const aboutAnim = useFadeIn({ delay: 200 });
  const servicesAnim = useFadeIn({ delay: 300 });
  const servicesDetailAnim = useFadeIn({ delay: 350 });
  const processAnim = useFadeIn({ delay: 400 });
  const projectsAnim = useFadeIn({ delay: 450 });
  const inspirationAnim = useFadeIn({ delay: 500 });
  const technicalAnim = useFadeIn({ delay: 550 });
  const testimonialsAnim = useFadeIn({ delay: 600 });
  const contactAnim = useFadeIn({ delay: 700 });

  return (
    <div className="bg-[#232323] text-white">
      {/* ===== HERO ===== */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[90vh] flex items-center">
        {/* Hero Background - Arcos Brand */}
        <div className="absolute inset-0">
          {/* Main Background Image */}
          <div className="absolute inset-0 opacity-30">
            <img
              src={heroFacade}
              alt="Architectural concrete installation"
              className="w-full h-full object-cover parallax-bg scale-105"
            />
          </div>

          {/* Brand-compliant Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#232323] via-[#232323]/85 to-[#232323]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#232323] via-transparent to-transparent" />

          {/* Subtle depth elements - monochrome only */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#353535]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[#353535]/15 rounded-full blur-3xl" />
        </div>

        <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8 sm:pt-12 md:pt-16 pb-20 sm:pb-28 md:pb-32 animate-fade-in-up">
          <div className="relative rounded-[36px] overflow-hidden border border-white/10 bg-[#353535]/40 backdrop-blur-md shadow-[0_40px_120px_-60px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-0">
              <img
                src={heroFacade}
                alt="Arcos crew installing architectural concrete panels"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#232323]/90 via-[#232323]/70 to-[#232323]/30" />
            </div>

            <div className="relative z-10 grid gap-10 lg:gap-12 lg:grid-cols-[1.15fr_0.9fr] items-center px-6 sm:px-10 md:px-12 py-14 sm:py-16 md:py-20">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full animate-fade-in-up stagger-1">
                  <span className="h-2 w-2 rounded-full bg-white/80 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.3em] font-semibold text-white/80">{t("home.founded")}</span>
                </div>

                <div className="space-y-5">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-tight text-white animate-fade-in-down">
                    {heroTitle}
                  </h1>
                  <p className="text-gray-200 text-lg sm:text-xl md:text-2xl leading-relaxed animate-fade-in-up stagger-1">
                    {heroSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-6 animate-fade-in-up stagger-2">
                  <Link
                    to="/catalog"
                    className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black text-sm sm:text-base font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] touch-manipulation hover-lift shadow-lg shadow-black/20"
                  >
                    {t("home.exploreCatalog")}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#353535]/80 border border-white/30 text-white text-sm sm:text-base font-bold uppercase tracking-[0.18em] hover:bg-[#353535] hover:border-white/50 transition-all min-h-[52px] touch-manipulation hover-lift"
                  >
                    {t("home.getStarted")}
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up stagger-3">
                  {[
                    { label: t("home.launchYear"), value: "2025" },
                    { label: t("home.coreExperts"), value: "22" },
                    { label: t("home.activeProjects"), value: "14" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-5">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">{item.label}</p>
                      <p className="mt-2 text-2xl sm:text-3xl font-black text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5 lg:space-y-6 animate-fade-in-up stagger-2">
                <div className="grid grid-cols-2 gap-4 sm:gap-5">
                  {[
                    {
                      title: t("home.seamlessMicrocement"),
                      image: microcementInterior1,
                      caption: t("home.seamlessMicrocementHero"),
                      link: "/services#seamless-microcement",
                    },
                    {
                      title: t("home.architecturalPanels"),
                      image: concretePanelHero,
                      caption: t("home.architecturalPanelsHero"),
                      link: "/services#architectural-panels",
                    },
                    {
                      title: t("home.precastTiles"),
                      image: concretePanelDetail,
                      caption: t("home.precastTilesHero"),
                      link: "/services#precast-tiles",
                    },
                    {
                      title: t("home.customSolutions"),
                      image: bespokeHero,
                      caption: t("home.customSolutionsHero"),
                      link: "/services",
                    },
                  ].map((card) => (
                    <Link
                      key={card.title}
                      to={card.link}
                      className="group rounded-3xl overflow-hidden border border-white/15 bg-white/5 shadow-2xl flex flex-col hover:border-white/30 hover:-translate-y-1 transition-all"
                    >
                      <img src={card.image} alt={card.title} className="h-36 w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="px-4 py-4 space-y-1">
                        <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60 font-semibold group-hover:text-white/80 transition-colors">{card.title}</p>
                        <p className="text-sm text-gray-200 group-hover:text-white transition-colors">{card.caption}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/8 backdrop-blur-lg px-5 sm:px-6 py-5 shadow-2xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-3">{t("home.currentlyInProduction")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-white/80">
                    <div>
                      <p className="text-2xl font-black text-white leading-none">3.5k</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em]">{t("home.facadeUnits")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white leading-none">48</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em]">{t("home.customMolds")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white leading-none">9</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em]">{t("home.digitalTwins")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT OVERVIEW ===== */}
      <section id="about" className="border-b border-white/10 bg-[#232323]">
        <div ref={aboutAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${aboutAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.aboutTitle")}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.aboutHeading")}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              {t("home.aboutDescription")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: t("home.materialLab"),
                description: t("home.materialLabDesc"),
              },
              {
                label: t("home.digitalFabrication"),
                description: t("home.digitalFabricationDesc"),
              },
              {
                label: t("home.projectDelivery"),
                description: t("home.projectDeliveryDesc"),
              },
              {
                label: t("home.certifiedInstallers"),
                description: t("home.certifiedInstallersDesc"),
              },
            ].map((feature) => (
              <div key={feature.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 space-y-3">
                <h3 className="text-lg font-bold text-white uppercase">{feature.label}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#353535] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#232323] transition-all min-h-[52px]"
            >
              {t("home.learnMoreAboutUs")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SERVICES OVERVIEW ===== */}
      <section id="services" className="border-b border-white/10 bg-[#353535]">
        <div ref={servicesAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${servicesAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.servicesTitle")}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.servicesHeading")}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              {t("home.servicesDescription")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: t("home.indoorFloors"),
                description: t("home.indoorFloorsDesc"),
                link: "/services",
              },
              {
                title: t("home.wallsSurfaces"),
                description: t("home.wallsSurfacesDesc"),
                link: "/services",
              },
              {
                title: t("home.architecturalPanels"),
                description: t("home.architecturalPanelsDesc"),
                link: "/services",
              },
              {
                title: t("home.outdoorSolutions"),
                description: t("home.outdoorSolutionsDesc"),
                link: "/services",
              },
            ].map((service) => (
              <Link
                key={service.title}
                to={service.link}
                className="group rounded-2xl border border-white/10 bg-white/[0.05] p-6 hover:border-white/30 hover:-translate-y-1 transition-all"
              >
                <h3 className="text-xl font-bold text-white uppercase mb-2">{service.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{service.description}</p>
                <span className="text-xs uppercase tracking-wider text-white/60 group-hover:text-white transition-colors">
                  Learn More →
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center">
                  <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] hover-lift shadow-lg shadow-black/20"
            >
              {t("home.viewAllServices")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURED SERVICES DETAIL - Using Brand Layout ===== */}
      <ArcosSectionTwo
        id="seamless-microcement"
        label={t("home.appliedFinishes")}
        headline={t("home.seamlessMicrocement")}
        subheadline={t("home.seamlessMicrocementDesc")}
        image={microcementInterior1}
        imageAlt="Seamless microcement interior"
        imagePosition="left"
        variant="primary"
        body={
          <ul className="space-y-3 text-sm">
            {[t("home.appliedThickness"), t("home.curatedPalettes"), t("home.moistureResistant")].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
        cta={
          <Link to="/services#microcement" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors">
            Learn More <span>→</span>
          </Link>
        }
      />

      <ArcosSectionTwo
        id="architectural-panels"
        label={t("home.precastPanels")}
        headline={t("home.architecturalPanelsTiles")}
        subheadline={t("home.architecturalPanelsTilesDesc")}
        image={structuralPanels}
        imageAlt="Architectural concrete panels"
        imagePosition="right"
        variant="secondary"
        body={
          <ul className="space-y-3 text-sm">
            {[t("home.precastManufacturing"), t("home.texturedTiles"), t("home.customFabrication")].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
        cta={
          <Link to="/services#panels" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors">
            Learn More <span>→</span>
          </Link>
        }
      />

      {/* ===== PROCESS OVERVIEW ===== */}
      <section id="process" className="border-b border-white/10 bg-[#353535]">
        <div ref={processAnim.ref} className={`max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${processAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              {t("home.howWeWork")}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.processHeading")}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              {t("home.processDescription")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: "01",
                title: t("home.designPlanning"),
                description: t("home.designPlanningDesc"),
              },
              {
                step: "02",
                title: t("home.materialEngineering"),
                description: t("home.materialEngineeringDesc"),
              },
              {
                step: "03",
                title: t("home.fabrication"),
                description: t("home.fabricationDesc"),
              },
              {
                step: "04",
                title: t("home.installation"),
                description: t("home.installationDesc"),
              },
            ].map((phase) => (
              <div key={phase.step} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 space-y-4">
                <div className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold">
                  {phase.step}
                </div>
                <h3 className="text-lg font-bold text-white uppercase">
                  {phase.title}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {phase.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/process"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#232323] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#353535] transition-all min-h-[52px]"
            >
              Learn More About Our Process
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS PREVIEW ===== */}
      <section id="projects" className="border-b border-white/10 bg-[#232323]">
        <div ref={projectsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${projectsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.featuredWork")}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.projectsHeading")}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              {t("home.projectsDescription")}
            </p>
          </div>

          <FeaturedProjectsCarousel />

          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] hover-lift shadow-lg shadow-black/20"
            >
              {t("home.viewAllProjects")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== DESIGN INSPIRATION SHOWCASE ===== */}
      <InspirationShowcase inspirationAnim={inspirationAnim} />

      {/* ===== TECHNICAL SPECIFICATIONS PREVIEW ===== */}
      <section className="border-b border-white/10 bg-[#232323]">
        <div ref={technicalAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${technicalAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.materialPerformance")}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.technicalHeading")}
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              {t("home.technicalDescription")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { title: t("home.compressiveStrength"), value: t("home.compressiveStrengthValue"), detail: t("home.compressiveStrengthDesc") },
              { title: t("home.flexuralStrength"), value: t("home.flexuralStrengthValue"), detail: t("home.flexuralStrengthDesc") },
              { title: t("home.waterAbsorption"), value: t("home.waterAbsorptionValue"), detail: t("home.waterAbsorptionDesc") },
              { title: t("home.thermalTolerance"), value: t("home.thermalToleranceValue"), detail: t("home.thermalToleranceDesc") },
              { title: t("home.surfaceProfiles"), value: t("home.surfaceProfilesValue"), detail: t("home.surfaceProfilesDesc") },
              { title: t("home.fireRating"), value: t("home.fireRatingValue"), detail: t("home.fireRatingDesc") },
            ].map((metric, index) => (
              <div key={metric.title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50 font-semibold">{metric.title}</p>
                  <span className="text-white/15 text-lg font-bold">/{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">{metric.value}</div>
                <p className="text-sm text-gray-300 leading-relaxed">{metric.detail}</p>
              </div>
            ))}
            </div>

          <div className="text-center">
            <Link
              to="/about#specifications"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#353535] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#232323] transition-all min-h-[52px]"
            >
              {t("home.viewFullSpecifications")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="border-b border-white/10 bg-[#353535]">
        <div ref={testimonialsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${testimonialsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              {t("home.clientStories")}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              {t("home.testimonialsHeading")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "The quality and precision of Arcos's UHPC panels exceeded our expectations. The installation was seamless and the final result is stunning.",
                author: "Sarah Chen",
                role: "Project Architect",
                company: "Modern Architecture Studio",
                project: "Commercial Tower, Jakarta",
              },
              {
                quote: "Working with Arcos transformed our design vision into reality. Their expertise in custom fabrication allowed us to create unique architectural elements.",
                author: "Michael Rodriguez",
                role: "Lead Designer",
                company: "Urban Design Collective",
                project: "Residential Complex, Bali",
              },
              {
                quote: "The durability and aesthetic appeal of their products is unmatched. Our clients are consistently impressed with the finish quality.",
                author: "David Kim",
                role: "Construction Manager",
                company: "Premium Builders Group",
                project: "Hotel Renovation, Singapore",
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className={`group border border-white/10 bg-[#232323] p-6 sm:p-8 hover:border-white/30 transition-all hover-lift rounded-xl shadow-lg shadow-black/20 ${testimonialsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : "opacity-0"}`}
                style={{ animationDelay: testimonialsAnim.isVisible ? `${i * 0.15}s` : "0s" }}
              >
                <div className="mb-5">
                  <svg className="w-10 h-10 text-white/20 mb-4 group-hover:text-white/40 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10z" />
                  </svg>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-6 group-hover:text-gray-200 transition-colors">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="border-t border-white/10 pt-5">
                  <div className="font-bold text-white text-sm sm:text-base mb-1">{testimonial.author}</div>
                  <div className="text-gray-400 text-xs sm:text-sm">{testimonial.role}</div>
                  <div className="text-gray-500 text-xs mt-1">{testimonial.company}</div>
                  <div className="text-gray-400 text-xs mt-3 uppercase tracking-wider border-t border-white/5 pt-3">{testimonial.project}</div>
                </div>
                  </div>
            ))}
                    </div>
                  </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-b border-white/10 bg-[#232323] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: "35+", label: "Years Experience", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { number: "500+", label: "Projects Completed", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { number: "50+", label: "Countries Served", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
              { number: "98%", label: "Client Satisfaction", icon: "M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                  <svg className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform inline-block">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 font-bold group-hover:text-gray-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA - Using Brand Layout ===== */}
      <ArcosSectionOne
        id="contact"
        label={t("home.contactUs")}
        headline={t("home.readyToStart")}
        subheadline={t("home.contactDescription")}
        variant="primary"
        className="border-b border-white/10"
        cta={
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-gray-100 transition-all min-h-[52px] touch-manipulation hover-lift shadow-lg shadow-black/20"
            >
              {t("home.contactUs")}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="mailto:hello@arcos.com"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#353535] border-2 border-white/20 text-white text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-[#232323] hover:border-white/30 transition-all min-h-[52px] touch-manipulation hover-lift"
            >
              {t("home.requestSample")}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        }
      />
    </div>
  );
}
