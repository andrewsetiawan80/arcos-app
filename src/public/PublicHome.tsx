import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { api } from "../lib/api";
import { useLanguage } from "../i18n/LanguageContext";
import { usePublicTheme } from "./PublicThemeContext";
import { OcutShape } from "../components/brand/Supergraphic";

// Import images
import heroFacade from "../assets/images/hero-facade.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";

// Featured Projects Carousel
function FeaturedProjectsCarousel() {
  const { language } = useLanguage();
  const { isDark } = usePublicTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<Array<{
    title: string;
    category: string;
    image: string;
  }>>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getFeaturedProjects();
        if (res.error || !res.data) return;
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
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (featuredProjects.length === 0) return null;

  const visibleProjects = featuredProjects.slice(currentIndex * 3, currentIndex * 3 + 3);
  const totalSlides = Math.ceil(featuredProjects.length / 3);

  return (
    <div className="relative">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {visibleProjects.map((project, i) => (
          <div
            key={`${currentIndex}-${i}`}
            className="group relative overflow-hidden animate-fade-in"
          >
            <div className={`aspect-[4/3] overflow-hidden ${isDark ? "bg-white/5" : "bg-neutral-200"}`}>
              <img
                src={project.image}
                alt={project.title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isDark ? "opacity-80 group-hover:opacity-100" : "group-hover:scale-105"
                }`}
                loading="lazy"
              />
            </div>
            <div className="pt-6 space-y-2">
              <h3 className={`text-lg font-medium ${isDark ? "text-white" : "text-[#232323]"}`}>
                {project.title}
              </h3>
              <p className={`text-sm tracking-wide ${isDark ? "text-white/50" : "text-[#6F6F6F]"}`}>
                A study in texture, proportion, and modern spatial expression.
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-3">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? `w-8 ${isDark ? "bg-white" : "bg-[#232323]"}`
                : `w-2 ${isDark ? "bg-white/30 hover:bg-white/50" : "bg-[#AFAFAF] hover:bg-[#6F6F6F]"}`
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function PublicHome() {
  const { isDark } = usePublicTheme();
  
  // Animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const brandIntroAnim = useFadeIn({ delay: 200 });
  const materialsAnim = useFadeIn({ delay: 300 });
  const collectionsAnim = useFadeIn({ delay: 350 });
  const applicationsAnim = useFadeIn({ delay: 400 });
  const projectsAnim = useFadeIn({ delay: 450 });
  const processAnim = useFadeIn({ delay: 500 });
  const statementAnim = useFadeIn({ delay: 550 });
  const ctaAnim = useFadeIn({ delay: 600 });

  return (
    <div className={`transition-colors duration-300 ${isDark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"}`}>
      {/* ===== SECTION 1: HERO ===== */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={heroFacade}
            alt="Architectural concrete texture"
            className="w-full h-full object-cover"
          />
          {/* Overlay - different for light/dark */}
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-[#232323] via-[#232323]/80 to-[#232323]/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-transparent to-[#232323]/50" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-white/40" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-white/30" />
            </>
          )}
        </div>

        <div 
          ref={heroRef} 
          className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-32 w-full animate-fade-in-up"
        >
          {/* Supergraphic: horizontal cut of letter O (arc shape) */}
          <div className="mb-8" aria-hidden>
            <OcutShape size={80} variant={isDark ? "on-black" : "on-white"} opacity={0.5} />
          </div>
          <div className="max-w-3xl space-y-10">
            {/* Headline */}
            <h1 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.05] ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              Surfaces,<br />reimagined.
            </h1>
            
            {/* Subheadline */}
            <p className={`text-xl sm:text-2xl font-light leading-relaxed max-w-xl ${
              isDark ? "text-white/60" : "text-[#6F6F6F]"
            }`}>
              Architectural concrete crafted with precision, emotion, and timeless design.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                to="/catalog"
                className={`group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                  isDark 
                    ? "bg-white text-[#232323] hover:bg-white/90" 
                    : "bg-[#232323] text-white hover:bg-[#353535]"
                }`}
              >
                Explore Surfaces
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                to="/projects"
                className={`group inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                  isDark 
                    ? "border-white/30 text-white hover:bg-white hover:text-[#232323]" 
                    : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
                }`}
              >
                View Projects
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 ${
          isDark ? "text-white/40" : "text-[#AFAFAF]"
        }`}>
          <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
          <div className={`w-px h-12 bg-gradient-to-b ${isDark ? "from-white/40" : "from-[#AFAFAF]"} to-transparent`} />
        </div>
      </section>

      {/* ===== SECTION 2: BRAND INTRO ===== */}
      <section className={`py-32 sm:py-40 lg:py-48 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-white"
      }`}>
        <div 
          ref={brandIntroAnim.ref} 
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${brandIntroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="space-y-12 text-center">
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              Concrete, as a language of design.
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-8">
              <p className={`text-lg sm:text-xl font-light leading-relaxed ${
                isDark ? "text-white/60" : "text-[#6F6F6F]"
              }`}>
                ARCOS transforms UHPC, GFRC, and microcement into expressive surfaces that shape modern architecture.
              </p>
              <p className={`text-lg sm:text-xl font-light leading-relaxed ${
                isDark ? "text-white/60" : "text-[#6F6F6F]"
              }`}>
                We believe concrete is more than a material — it is a medium of art, emotion, and spatial storytelling. Every form, texture, and contour reflects precision, craftsmanship, and timeless intention.
              </p>
            </div>

            <p className={`text-sm tracking-[0.2em] uppercase pt-8 ${
              isDark ? "text-white/30" : "text-[#AFAFAF]"
            }`}>
              Where structural strength meets human expression.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: MATERIAL INNOVATION ===== */}
      <section className={`py-32 sm:py-40 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div 
          ref={materialsAnim.ref} 
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${materialsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="text-center mb-20">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              Material innovation, engineered for design.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                title: "UHPC",
                description: "Ultra High Performance Concrete with refined texture, thin profiles, and exceptional durability. Ideal for sculptural elements and precise architectural details.",
                image: structuralPanels
              },
              {
                title: "GFRC",
                description: "Lightweight, flexible, and strong. Engineered for detailed forms, façade panels, and refined surface geometry.",
                image: concretePanelDetail
              },
              {
                title: "Microcement",
                description: "A seamless finishing system for modern interiors. Smooth, continuous, and tactile across walls, floors, and furniture.",
                image: microcementInterior1
              }
            ].map((material) => (
              <div key={material.title} className="group">
                {/* Image */}
                <div className={`aspect-[4/3] overflow-hidden mb-8 ${
                  isDark ? "bg-white/5" : "bg-[#E0E0E0]"
                }`}>
                  <img
                    src={material.image}
                    alt={material.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isDark 
                        ? "opacity-80 group-hover:opacity-100 group-hover:scale-105" 
                        : "group-hover:scale-105"
                    }`}
                    loading="lazy"
                  />
                </div>
                {/* Content */}
                <div className="space-y-4">
                  <div className={`w-12 h-px ${isDark ? "bg-white" : "bg-[#232323]"}`} />
                  <h3 className={`text-xl font-medium tracking-tight ${isDark ? "text-white" : "text-[#232323]"}`}>
                    {material.title}
                  </h3>
                  <p className={`leading-relaxed font-light ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
                    {material.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: SIGNATURE COLLECTIONS ===== */}
      <section className={`py-32 sm:py-40 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-white"
      }`}>
        <div 
          ref={collectionsAnim.ref} 
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${collectionsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="text-center mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-6 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              Signature surface collections.
            </h2>
            <p className={`text-lg font-light max-w-2xl mx-auto ${
              isDark ? "text-white/60" : "text-[#6F6F6F]"
            }`}>
              Each series is crafted with its own character — defined by geometry, texture, and architectural intent.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Solis Series */}
            <div className="group">
              <div className={`aspect-[4/3] overflow-hidden mb-8 ${isDark ? "bg-white/5" : "bg-[#E3DFD9]"}`}>
                <img
                  src={structuralPanels}
                  alt="UHPC Solis Series"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark ? "opacity-80 group-hover:opacity-100" : "group-hover:scale-105"
                  }`}
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <p className={`text-xs tracking-[0.2em] uppercase ${isDark ? "text-white/40" : "text-[#AFAFAF]"}`}>
                  UHPC
                </p>
                <h3 className={`text-2xl font-light ${isDark ? "text-white" : "text-[#232323]"}`}>
                  Solis Series
                </h3>
                <p className={`font-light leading-relaxed ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
                  Defined by permanence, clarity, and structural expression. Designed for bold architectural gestures.
                </p>
              </div>
            </div>

            {/* Aeris Series */}
            <div className="group">
              <div className={`aspect-[4/3] overflow-hidden mb-8 ${isDark ? "bg-white/5" : "bg-[#E3DFD9]"}`}>
                <img
                  src={concretePanelDetail}
                  alt="GFRC Aeris Series"
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark ? "opacity-80 group-hover:opacity-100" : "group-hover:scale-105"
                  }`}
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <p className={`text-xs tracking-[0.2em] uppercase ${isDark ? "text-white/40" : "text-[#AFAFAF]"}`}>
                  GFRC
                </p>
                <h3 className={`text-2xl font-light ${isDark ? "text-white" : "text-[#232323]"}`}>
                  Aeris Series
                </h3>
                <p className={`font-light leading-relaxed ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
                  Lightweight, expressive, and versatile. Created for sculptural forms and refined surface geometry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: APPLICATIONS ===== */}
      <section className={`py-32 sm:py-40 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#232323]"
      } text-white`}>
        <div 
          ref={applicationsAnim.ref} 
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${applicationsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mb-6">
              Designed for modern environments.
            </h2>
            <p className="text-lg text-white/60 font-light max-w-3xl mx-auto">
              ARCOS surfaces inhabit hotels, villas, residences, retail spaces, and creative studios — shaping atmosphere and identity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-16">
            {[
              { label: "Feature Walls", image: microcementWalls },
              { label: "Façade Panels", image: structuralPanels },
              { label: "Furniture & Sculptural Pieces", image: microcementInterior1 },
              { label: "Interior Surface Systems", image: microcementInterior2 },
            ].map((item) => (
              <div key={item.label} className="group">
                <div className="aspect-square overflow-hidden bg-white/5 mb-6">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm tracking-wide text-white/80">{item.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-white/50 font-light max-w-2xl mx-auto">
            Our materials adapt to diverse architectural needs, merging durability with artistic intention.
          </p>
        </div>
      </section>

      {/* ===== SECTION 6: PROJECTS HIGHLIGHT ===== */}
      <section className={`py-32 sm:py-40 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-white"
      }`}>
        <div 
          ref={projectsAnim.ref} 
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${projectsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="text-center mb-16">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight mb-6 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              Designed to endure, crafted to inspire.
            </h2>
            <p className={`text-lg font-light max-w-2xl mx-auto ${
              isDark ? "text-white/60" : "text-[#6F6F6F]"
            }`}>
              A selection of spaces shaped with ARCOS surfaces.
            </p>
          </div>

          <FeaturedProjectsCarousel />

          <div className="text-center mt-16">
            <Link
              to="/projects"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "border-white/30 text-white hover:bg-white hover:text-[#232323]" 
                  : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
              }`}
            >
              View All Projects
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: HOW WE WORK ===== */}
      <section className={`py-32 sm:py-40 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div 
          ref={processAnim.ref} 
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${processAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <div className="text-center mb-20">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              A seamless process, from concept to creation.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {[
              {
                step: "01",
                title: "Discover",
                description: "Explore textures, tones, and applications through samples or digital previews.",
              },
              {
                step: "02",
                title: "Design & Consultation",
                description: "We refine the aesthetic and technical direction with your design team.",
              },
              {
                step: "03",
                title: "Engineering & Craft",
                description: "Surfaces are shaped using UHPC/GFRC precision and artisan finishing.",
              },
              {
                step: "04",
                title: "Installation Support",
                description: "We coordinate with site teams to ensure seamless integration and long-term performance.",
              },
            ].map((phase) => (
              <div key={phase.step} className="space-y-6">
                <span className={`text-xs tracking-[0.2em] ${isDark ? "text-white/40" : "text-[#AFAFAF]"}`}>
                  {phase.step}
                </span>
                <h3 className={`text-xl font-medium ${isDark ? "text-white" : "text-[#232323]"}`}>
                  {phase.title}
                </h3>
                <p className={`font-light leading-relaxed ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
                  {phase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: BRAND STATEMENT ===== */}
      <section className={`py-32 sm:py-40 lg:py-48 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-white"
      }`}>
        <div 
          ref={statementAnim.ref} 
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${statementAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <blockquote className="space-y-6">
            <p className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              We shape experiences.
            </p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              We blend artistry with architectural integrity.
            </p>
            <p className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed ${
              isDark ? "text-white/50" : "text-[#6F6F6F]"
            }`}>
              Because beauty should stand the test of time.
            </p>
          </blockquote>
        </div>
      </section>

      {/* ===== SECTION 9: CTA / CONTACT ===== */}
      <section className="relative py-32 sm:py-40 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={concreteTexture2}
            alt="Concrete texture background"
            className={`w-full h-full object-cover ${isDark ? "opacity-10" : "opacity-20"}`}
          />
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#232323] to-[#232323]" 
              : "bg-gradient-to-b from-[#E3DFD9] to-[#D6D6D6]"
          }`} />
        </div>

        <div 
          ref={ctaAnim.ref} 
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Let's shape your next space.
          </h2>
          <p className={`text-lg font-light mb-12 max-w-xl mx-auto ${
            isDark ? "text-white/60" : "text-[#6F6F6F]"
          }`}>
            For consultations, samples, or project collaborations, our team is ready.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "bg-white text-[#232323] hover:bg-white/90" 
                  : "bg-[#232323] text-white hover:bg-[#353535]"
              }`}
            >
              Contact Us
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="mailto:hello@arcos.id?subject=Sample%20Request"
              className={`group inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "border-white/30 text-white hover:bg-white hover:text-[#232323]" 
                  : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
              }`}
            >
              Request Samples
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
