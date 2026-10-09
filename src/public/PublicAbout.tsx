import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";
import CompanyProfileDownloadButton from "../components/CompanyProfileDownloadButtonLazy";

// Import images
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";

export default function PublicAbout() {
  const { isDark } = usePublicTheme();
  
  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const aboutAnim = useFadeIn({ delay: 150 });
  const coreAnim = useFadeIn({ delay: 200 });
  const purposeAnim = useFadeIn({ delay: 250 });
  const valuesAnim = useFadeIn({ delay: 300 });
  const personalityAnim = useFadeIn({ delay: 350 });
  const competenciesAnim = useFadeIn({ delay: 400 });
  const storyAnim = useFadeIn({ delay: 450 });
  const manifestoAnim = useFadeIn({ delay: 500 });
  const ctaAnim = useFadeIn({ delay: 550 });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"
    }`}>
      
      {/* ===== PAGE HEADER SECTION ===== */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={mosaicFacadeDetail}
            alt="Architectural concrete surface"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#232323]/60 via-[#232323]/40 to-[#232323]" 
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
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Concrete, reimagined as a medium of expression.
          </h1>
          
          {/* Subheadline */}
          <p className={`text-lg sm:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-10 ${
            isDark ? "text-white/80" : "text-[#4A4A4A]"
          }`}>
            ARCOS transforms architectural concrete into surfaces that tell stories — crafted with precision, emotion, and timeless design.
          </p>

          {/* Company Profile Download */}
          <CompanyProfileDownloadButton 
            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-wider transition-all ${
              isDark 
                ? "bg-white/10 border border-white/20 text-white hover:bg-white/20" 
                : "bg-[#232323]/5 border border-[#232323]/10 text-[#232323] hover:bg-[#232323]/10"
            }`}
          />
        </div>
      </section>

      {/* ===== SECTION 1: ABOUT THE BRAND ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={aboutAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 ${
            aboutAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-12 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            About ARCOS
          </h2>

          <div className="space-y-8">
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}>
              ARCOS was born from a simple curiosity: What if concrete could tell stories?
            </p>
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}>
              We saw an opportunity to transform one of the world's most rigid materials into something expressive, modern, and deeply architectural. Our work explores the boundaries of UHPC, GFRC, and microcement — reshaping concrete into surfaces that speak through texture, light, and proportion.
            </p>
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}>
              We believe concrete is more than a building material. In the hands of ARCOS, it becomes a living design language — one that reflects strength, serenity, and the quiet sophistication of modern architecture.
            </p>
          </div>

          <p className={`mt-16 text-base font-medium tracking-wide ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Every surface is crafted with intention, engineered to endure, and shaped to inspire.
          </p>
        </div>
      </section>

      {/* ===== SECTION 2: CORE IDEA ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}>
        <div 
          ref={coreAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 ${
            coreAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-12 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            Our core idea
          </h2>

          <div className="space-y-8">
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}>
              Concrete holds stories of space, time, and human interaction. ARCOS exists to reveal those stories. We merge artisan craftsmanship with material innovation, allowing concrete to become a sculptural and emotional part of the environment.
            </p>
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}>
              From minimalist interiors to bold architectural planes, our surfaces embody the values of modern design: simplicity, integrity, and timelessness.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: BRAND PURPOSE ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={purposeAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            purposeAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-12 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            Purpose
          </h2>

          {/* Large Statement */}
          <p className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed mb-12 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            To redefine the perception of concrete — from a cold, utilitarian substance into a warm, expressive medium of art and architecture.
          </p>

          {/* Supporting Text */}
          <div className={`space-y-4 ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
            <p className="text-base font-light leading-relaxed">
              We champion authenticity, sustainable processes, and material honesty.
            </p>
            <p className="text-base font-light leading-relaxed">
              ARCOS creates surfaces designed for permanence rather than trends, reflecting the belief that beauty should stand the test of time.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: BRAND VALUES ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}>
        <div 
          ref={valuesAnim.ref}
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${
            valuesAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-16 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            What we stand for
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            {[
              {
                title: "Expertise",
                description: "Advanced mastery of UHPC, GFRC, and microcement — engineered for strength, precision, and modern performance."
              },
              {
                title: "Authenticity",
                description: "Material honesty at every stage. We celebrate raw texture, real character, and transparent craftsmanship."
              },
              {
                title: "Innovation",
                description: "Relentlessly pushing boundaries to explore new techniques, forms, and surface possibilities."
              },
              {
                title: "Artistry",
                description: "Design as storytelling. Each surface carries emotion, narrative, and human touch."
              }
            ].map((value) => (
              <div key={value.title} className="space-y-4">
                <div className={`w-12 h-px ${isDark ? "bg-white/30" : "bg-[#232323]/20"}`} />
                <h3 className={`text-lg font-medium ${isDark ? "text-white" : "text-[#232323]"}`}>
                  {value.title}
                </h3>
                <p className={`text-sm font-light leading-relaxed ${
                  isDark ? "text-white/60" : "text-[#6F6F6F]"
                }`}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>

          <p className={`text-sm tracking-wide ${isDark ? "text-white/30" : "text-[#AFAFAF]"}`}>
            Sustainability • Collaboration • Timelessness
          </p>
        </div>
      </section>

      {/* ===== SECTION 5: BRAND PERSONALITY ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={personalityAnim.ref}
          className={`max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 ${
            personalityAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-16 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            Personality
          </h2>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                pillar: "Visionary Artist",
                description: "Finds beauty in raw material. Shapes concrete with emotion and expressive intention."
              },
              {
                pillar: "Modern Architect",
                description: "Balances structure, proportion, and logic. Simplicity with purpose."
              },
              {
                pillar: "Industrial Minimalist",
                description: "Quiet strength. Clean, restrained forms. Material-first thinking."
              }
            ].map((item) => (
              <div key={item.pillar} className="space-y-4">
                <h3 className={`text-xl font-light ${isDark ? "text-white" : "text-[#232323]"}`}>
                  {item.pillar}
                </h3>
                <p className={`text-base font-light leading-relaxed ${
                  isDark ? "text-white/60" : "text-[#6F6F6F]"
                }`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: OUR COMPETENCIES ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}>
        <div 
          ref={competenciesAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            competenciesAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-12 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            What we do exceptionally well
          </h2>

          <ul className="space-y-4 mb-16">
            {[
              "Expertise in UHPC & GFRC for thin, durable, and expressive architectural surfaces",
              "Microcement finishing for seamless, modern interior applications",
              "Advanced mold fabrication and texture development",
              "High-precision casting with artisan finishing",
              "Custom surface design for architectural and interior projects",
              "Integration of artistic concept with technical feasibility",
              "Surface engineering for façades, feature walls, and sculptural pieces",
              "Use of natural pigments, durable sealers, and long-lasting coatings",
              "Project collaboration with architects, designers, and developers"
            ].map((competency) => (
              <li 
                key={competency}
                className={`flex items-start gap-4 text-base font-light ${
                  isDark ? "text-white/70" : "text-[#6F6F6F]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                  isDark ? "bg-white/40" : "bg-[#AFAFAF]"
                }`} />
                {competency}
              </li>
            ))}
          </ul>

          <p className={`text-base font-medium ${isDark ? "text-white" : "text-[#232323]"}`}>
            We merge design sensibility with engineering precision.
          </p>
        </div>
      </section>

      {/* ===== SECTION 7: OUR STORY ===== */}
      <section className={`py-24 sm:py-32 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={storyAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            storyAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-sm tracking-[0.2em] uppercase mb-12 ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            Our story
          </h2>

          <div className="space-y-8">
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}>
              Concrete is often seen as rigid, heavy, and purely structural. ARCOS challenges that assumption. We explore concrete through the lens of design, allowing it to become light, refined, and quietly expressive. Every creation begins with curiosity and ends with a surface that reflects emotion, proportion, and intention.
            </p>
            <p className={`text-lg sm:text-xl font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}>
              Our work spans villas, hotels, residences, creative studios, and public spaces — shaping environments that feel grounded yet elevated.
            </p>
          </div>
        </div>
      </section>

      {/* ===== VISUAL IMAGERY ===== */}
      <section className={`py-16 sm:py-24 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            <div className={`aspect-[4/3] overflow-hidden ${isDark ? "bg-white/5" : "bg-[#E0E0E0]"}`}>
              <img
                src={workshopCloseup}
                alt="Craftsmanship detail"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isDark ? "opacity-70 hover:opacity-100" : "hover:scale-105"
                }`}
                loading="lazy"
              />
            </div>
            <div className={`aspect-[4/3] overflow-hidden ${isDark ? "bg-white/5" : "bg-[#E0E0E0]"}`}>
              <img
                src={mosaicFacadeDetail}
                alt="Surface texture"
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isDark ? "opacity-70 hover:opacity-100" : "hover:scale-105"
                }`}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 8: BRAND MANIFESTO ===== */}
      <section className={`py-32 sm:py-40 lg:py-48 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-white"
      }`}>
        <div 
          ref={manifestoAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            manifestoAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="space-y-4 mb-12">
            {[
              "We shape experiences.",
              "We blend artistry with architectural integrity.",
              "We honor material honesty.",
              "We design with intention.",
              "We craft for permanence."
            ].map((line, index) => (
              <p 
                key={index}
                className={`text-2xl sm:text-3xl md:text-4xl font-light leading-relaxed ${
                  isDark ? "text-white" : "text-[#232323]"
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          <p className={`text-lg font-medium tracking-wide ${
            isDark ? "text-white/50" : "text-[#AFAFAF]"
          }`}>
            This is ARCOS.
          </p>
        </div>
      </section>

      {/* ===== SECTION 9: CTA BLOCK ===== */}
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
              ? "bg-gradient-to-b from-[#232323] via-[#232323]/95 to-[#232323]" 
              : "bg-gradient-to-b from-[#F8F8F8] via-[#F8F8F8]/95 to-white"
          }`} />
        </div>

        <div 
          ref={ctaAnim.ref}
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Let's create meaningful spaces.
          </h2>
          
          <p className={`text-lg font-light mb-12 max-w-xl mx-auto ${
            isDark ? "text-white/60" : "text-[#6F6F6F]"
          }`}>
            For collaborations, consultations, or project discussions, our team is ready.
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
