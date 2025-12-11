import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../lib/api";

// Import images
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";

// Sample projects for display
const SAMPLE_PROJECTS = [
  {
    id: "villa-tamarind",
    title: "Villa Tamarind",
    location: "Canggu, Bali",
    material: "GFRC Aeris Series • Feature Wall & Interior Panels",
    image: mosaicFacadeDetail,
  },
  {
    id: "studio-k",
    title: "Studio K",
    location: "Surabaya",
    material: "Microcement • Seamless Interior Surfaces",
    image: microcementInterior1,
  },
  {
    id: "private-residence-jakarta",
    title: "Private Residence",
    location: "Jakarta",
    material: "UHPC Solis Series • Living Room Feature Wall",
    image: structuralPanels,
  },
  {
    id: "hotel-ayana",
    title: "Hotel Ayana",
    location: "Bali",
    material: "GFRC • Lobby & Corridor Panels",
    image: landmarkInstallation,
  },
  {
    id: "creative-studio",
    title: "Creative Studio",
    location: "Bandung",
    material: "Microcement • Floor & Wall Systems",
    image: microcementInterior2,
  },
  {
    id: "retail-space",
    title: "Retail Space",
    location: "Jakarta",
    material: "UHPC • Sculptural Display Elements",
    image: workshopCloseup,
  },
];

export default function PublicProjects() {
  const { isDark } = usePublicTheme();
  const { language } = useLanguage();
  const [projects, setProjects] = useState(SAMPLE_PROJECTS);

  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const introAnim = useFadeIn({ delay: 150 });
  const gridAnim = useFadeIn({ delay: 200 });
  const calloutAnim = useFadeIn({ delay: 250 });
  const ctaAnim = useFadeIn({ delay: 300 });

  // Fetch featured projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.getFeaturedProjects();
        if (res.data && res.data.length > 0) {
          const apiProjects = res.data.map((project: any) => ({
            id: project.id,
            title: language === "id" ? project.titleId : project.title,
            location: project.location || "",
            material: language === "id" ? project.categoryId : project.category,
            image: project.imageUrl,
          }));
          setProjects(apiProjects.length > 0 ? apiProjects : SAMPLE_PROJECTS);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, [language]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-[#1B1B1B]"
    }`}>
      
      {/* ===== PAGE HEADER ===== */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={landmarkInstallation}
            alt="Architectural concrete wall"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#1B1B1B]/60 via-[#1B1B1B]/40 to-[#1B1B1B]" 
              : "bg-gradient-to-b from-white/70 via-white/50 to-white"
          }`} />
        </div>

        <div 
          ref={heroAnim.ref}
          className={`relative z-10 max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-32 text-center ${
            heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Main Title */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-8 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Spaces shaped through concrete.
          </h1>
          
          {/* Subheadline */}
          <p className={`text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto ${
            isDark ? "text-white/80" : "text-[#4A4A4A]"
          }`}>
            A curated selection of projects where ARCOS surfaces define atmosphere, identity, and spatial emotion.
          </p>
        </div>
      </section>

      {/* ===== INTRODUCTION BLOCK ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={introAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 ${
            introAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl font-light tracking-tight mb-10 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Designed to endure. Crafted to inspire.
          </h2>

          <div className="space-y-6">
            <p className={`text-lg font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}>
              Our work lives in villas, hotels, residences, commercial interiors, and creative environments across Indonesia. Every project is a collaboration — merging architectural vision with the expressive character of UHPC, GFRC, and microcement surfaces.
            </p>
            <p className={`text-lg font-light leading-relaxed ${
              isDark ? "text-white/60" : "text-[#AFAFAF]"
            }`}>
              We design for permanence, quiet sophistication, and modern spatial clarity.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PROJECT GRID ===== */}
      <section className={`py-24 sm:py-32 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div 
          ref={gridAnim.ref}
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${
            gridAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group block"
              >
                {/* Image */}
                <div className={`aspect-[4/3] overflow-hidden mb-6 ${
                  isDark ? "bg-white/5" : "bg-[#E0E0E0]"
                }`}>
                  <img
                    src={project.image}
                    alt={project.title}
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
                  <h3 className={`text-lg font-medium transition-colors ${
                    isDark 
                      ? "text-white group-hover:text-white/80" 
                      : "text-[#1B1B1B] group-hover:text-[#6F6F6F]"
                  }`}>
                    {project.title} — {project.location}
                  </h3>
                  <p className={`text-sm font-light ${
                    isDark ? "text-white/50" : "text-[#AFAFAF]"
                  }`}>
                    {project.material}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALLOUT SECTION ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={calloutAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            calloutAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-light tracking-tight leading-relaxed mb-8 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Every project is a dialogue between material and space.
          </h2>
          
          <p className={`text-lg font-light ${
            isDark ? "text-white/60" : "text-[#6F6F6F]"
          }`}>
            We work closely with architects, designers, and builders to develop surfaces that reflect the intention of the environment.
          </p>
        </div>
      </section>

      {/* ===== VISUAL GALLERY ===== */}
      <section className={`py-16 sm:py-24 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { image: mosaicFacadeDetail, alt: "Architectural detail" },
              { image: structuralPanels, alt: "Surface texture" },
              { image: concreteTexture2, alt: "Material closeup" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`aspect-[3/4] overflow-hidden ${
                  isDark ? "bg-white/5" : "bg-[#E0E0E0]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark ? "opacity-60 hover:opacity-100" : "grayscale hover:grayscale-0"
                  }`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BLOCK ===== */}
      <section className="relative py-32 sm:py-40 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={concreteTexture2}
            alt="Concrete texture"
            className={`w-full h-full object-cover ${isDark ? "opacity-10" : "opacity-15"}`}
          />
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#1B1B1B] via-[#1B1B1B]/95 to-[#1B1B1B]" 
              : "bg-gradient-to-b from-white via-white/95 to-white"
          }`} />
        </div>

        <div 
          ref={ctaAnim.ref}
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Let's shape your next space.
          </h2>
          
          <p className={`text-lg font-light mb-12 max-w-xl mx-auto ${
            isDark ? "text-white/60" : "text-[#6F6F6F]"
          }`}>
            For consultations, samples, or project discussions, connect with our team.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "bg-white text-[#1B1B1B] hover:bg-white/90" 
                  : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
              }`}
            >
              Start a Project
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className={`group inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "border-white/30 text-white hover:bg-white hover:text-[#1B1B1B]" 
                  : "border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white"
              }`}
            >
              Contact Us
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
