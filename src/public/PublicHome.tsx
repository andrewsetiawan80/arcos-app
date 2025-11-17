import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { load } from "../store";
import { useFadeIn } from "../utils/useAnimation";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";

import heroFacade from "../assets/images/hero-facade.jpg";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.jpg";
import mosaicInterior from "../assets/images/mosaic-interior.jpg";
import workshopCloseup from "../assets/images/workshop-closeup.jpg";
import qualityReview from "../assets/images/quality-review.jpg";
import landmarkInstallation from "../assets/images/landmark-installation.jpg";
import concreteFinish from "../assets/images/concrete-finish.jpg";
import concreteTexture2 from "../assets/images/concrete-texture-2.jpg";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.jpg";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.jpg";
import microcementStairs from "../assets/images/grey-microcement-stairs-stairs-viewed-from-modern-design-innovative-material-metal-railing.jpg";
import structuralPanels from "../assets/images/structural-panels.jpg";
import concretePanelDetail from "../assets/images/concrete-panel-detail.jpg";
import concreteInstallation from "../assets/images/concrete-installation.jpg";
import mixDesign from "../assets/images/mix-design.jpg";
// Inspiration images for showcase
import tile01 from "../assets/images/inspiration/3d-tile-01.png";
import tile02 from "../assets/images/inspiration/3d-tile-02.png";
import tile03 from "../assets/images/inspiration/3d-tile-03.png";
import tile04 from "../assets/images/inspiration/3d-tile-04.png";
import tile05 from "../assets/images/inspiration/3d-tile-05.png";
import tile07 from "../assets/images/inspiration/3d-tile-07.png";
import tile10 from "../assets/images/inspiration/3d-tile-10.png";
import tile15 from "../assets/images/inspiration/3d-tile-15.png";
import tile20 from "../assets/images/inspiration/3d-tile-20.png";
import tile25 from "../assets/images/inspiration/3d-tile-25.png";
import tile30 from "../assets/images/inspiration/3d-tile-30.png";
import tile35 from "../assets/images/inspiration/3d-tile-35.png";
import tile40 from "../assets/images/inspiration/3d-tile-40.png";
import tile45 from "../assets/images/inspiration/3d-tile-45.png";
import tile50 from "../assets/images/inspiration/3d-tile-50.png";
import tile55 from "../assets/images/inspiration/3d-tile-55.png";
import tile60 from "../assets/images/inspiration/3d-tile-60.png";
import tile65 from "../assets/images/inspiration/3d-tile-65.png";
import tile70 from "../assets/images/inspiration/3d-tile-70.png";
import tile75 from "../assets/images/inspiration/3d-tile-75.png";
import tile80 from "../assets/images/inspiration/3d-tile-80.png";
import tile85 from "../assets/images/inspiration/3d-tile-85.png";
import tile90 from "../assets/images/inspiration/3d-tile-90.png";
import tile95 from "../assets/images/inspiration/3d-tile-95.png";
import tile100 from "../assets/images/inspiration/3d-tile-100.png";
import microcementInsp01 from "../assets/images/inspiration/microcement-01.png";
import microcementInsp02 from "../assets/images/inspiration/microcement-02.png";
import microcementInsp03 from "../assets/images/inspiration/microcement-03.png";
import concretePanelInsp01 from "../assets/images/inspiration/concrete-panel-01.png";
import concretePanelInsp02 from "../assets/images/inspiration/concrete-panel-02.png";
import concretePanelInsp03 from "../assets/images/inspiration/concrete-panel-03.png";
import bespokeInsp01 from "../assets/images/inspiration/bespoke-01.png";
import bespokeInsp02 from "../assets/images/inspiration/bespoke-02.png";
import bespokeInsp03 from "../assets/images/inspiration/bespoke-03.png";
import texturedMicrocement01 from "../assets/images/inspiration/textured-microcement-01.png";
import texturedMicrocement02 from "../assets/images/inspiration/textured-microcement-02.png";
import texturedMicrocement03 from "../assets/images/inspiration/textured-microcement-03.png";
import bespokeHero from "../assets/images/inspiration/bespoke-01.png";
import concretePanelHero from "../assets/images/inspiration/concrete-panel-01.png";

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
    <section id="inspiration" className="border-b border-white/10 bg-[#0B0B0B]">
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

  // Hero animation
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.classList.add("animate-fade-in-up");
    }
  }, []);

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
    <div className="bg-[#1A1A1A] text-white">
      {/* ===== HERO ===== */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[90vh] flex items-center">
        {/* Hero Background - Enhanced Multi-Layer */}
        <div className="absolute inset-0">
          {/* Main Background Image */}
          <div className="absolute inset-0 opacity-35">
            <img
              src={heroFacade}
              alt="Architectural concrete installation"
              className="w-full h-full object-cover parallax-bg scale-105"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/85 to-[#1A1A1A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-transparent to-transparent" />

          {/* Animated Gradient Orbs for Depth */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full pt-8 sm:pt-12 md:pt-16 pb-20 sm:pb-28 md:pb-32 opacity-0">
          <div className="relative rounded-[36px] overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md shadow-[0_40px_120px_-60px_rgba(0,0,0,0.75)]">
            <div className="absolute inset-0">
              <img
                src={heroFacade}
                alt="Arqon crew installing architectural concrete panels"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/20" />
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
                    className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-black/40 border border-white/30 text-white text-sm sm:text-base font-bold uppercase tracking-[0.18em] hover:bg-black/25 hover:border-white/50 transition-all min-h-[52px] touch-manipulation hover-lift"
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
      <section id="about" className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]">
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2A2A] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#333333] transition-all min-h-[52px]"
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
      <section id="services" className="border-b border-white/10 bg-[#131313]">
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

      {/* ===== FEATURED SERVICES DETAIL ===== */}
      <section className="border-b border-white/10 bg-[#0B0B0B]">
        <div ref={servicesDetailAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32 ${servicesDetailAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{t("home.featuredSolutions")}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              {t("home.signatureSystems")}
            </h2>
            <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
              {t("home.signatureSystemsDesc")}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Seamless Microcement Feature */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={microcementInterior1}
                  alt="Seamless microcement"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  {t("home.appliedFinishes")}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white">
                  {t("home.seamlessMicrocement")}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t("home.seamlessMicrocementDesc")}
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.appliedThickness")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.curatedPalettes")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.moistureResistant")}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Architectural Panels Feature */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={structuralPanels}
                  alt="Architectural panels"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  {t("home.precastPanels")}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white">
                  {t("home.architecturalPanelsTiles")}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {t("home.architecturalPanelsTilesDesc")}
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.precastManufacturing")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.texturedTiles")}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t("home.customFabrication")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS OVERVIEW ===== */}
      <section id="process" className="border-b border-white/10 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_65%)]">
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2A2A] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#333333] transition-all min-h-[52px]"
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
      <section id="projects" className="border-b border-white/10 bg-[#131313]">
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
      <section className="border-b border-white/10 bg-[#0B0B0B]">
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2A2A] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#333333] transition-all min-h-[52px]"
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
      <section id="testimonials" className="border-b border-white/10 bg-[#1A1A1A]">
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
                quote: "The quality and precision of Arqon's UHPC panels exceeded our expectations. The installation was seamless and the final result is stunning.",
                author: "Sarah Chen",
                role: "Project Architect",
                company: "Modern Architecture Studio",
                project: "Commercial Tower, Jakarta",
              },
              {
                quote: "Working with Arqon transformed our design vision into reality. Their expertise in custom fabrication allowed us to create unique architectural elements.",
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
                className={`group border border-white/10 bg-[#2A2A2A] p-6 sm:p-8 hover:border-white/30 transition-all hover-lift rounded-xl shadow-lg shadow-black/20 ${testimonialsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : "opacity-0"}`}
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
      <section className="border-b border-white/10 bg-[#1A1A1A] relative overflow-hidden">
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

      {/* ===== CONTACT CTA ===== */}
      <section id="contact" className="border-b border-white/10 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroFacade}
            alt="Architectural concrete detail"
            className="w-full h-full object-cover parallax-bg"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#1A1A1A]" />
        </div>

        <div ref={contactAnim.ref} className={`relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${contactAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">
              {t("home.contactUs")}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              {t("home.readyToStart")}
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              {t("home.contactDescription")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-4">
              <Link
                to="/contact"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-black text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-gray-100 transition-all min-h-[52px] touch-manipulation hover-lift shadow-lg shadow-black/20 rounded-xl"
              >
                {t("home.contactUs")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="mailto:hello@arqon.com"
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-[#2A2A2A] border-2 border-white/20 text-white text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-[#333333] hover:border-white/30 transition-all min-h-[52px] touch-manipulation hover-lift rounded-xl"
              >
                {t("home.requestSample")}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
