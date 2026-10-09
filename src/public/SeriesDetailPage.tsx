import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";

// Types for series data
export interface SeriesApplication {
  title: string;
  description?: string;
}

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface ColorSwatch {
  name: string;
  color: string; // hex color or tailwind class
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface SeriesData {
  // Basic info
  name: string;
  tagline: string;
  materialType: "UHPC" | "GFRC" | "Microcement";
  
  // Hero
  heroImage: string;
  
  // Overview
  overviewText: string;
  overviewBullets: {
    material: string;
    idealFor: string;
    surfaceCharacter: string;
  };
  
  // Applications
  applications: SeriesApplication[];
  
  // Technical
  technicalSpecs: TechnicalSpec[];
  technicalNote: string;
  
  // Textures & Tones
  textureDescription: string;
  colorSwatches: ColorSwatch[];
  
  // Gallery
  galleryImages: GalleryImage[];
}

interface SeriesDetailPageProps {
  series: SeriesData;
}

export default function SeriesDetailPage({ series }: SeriesDetailPageProps) {
  const { isDark } = usePublicTheme();

  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const overviewAnim = useFadeIn({ delay: 150 });
  const applicationsAnim = useFadeIn({ delay: 200 });
  const technicalAnim = useFadeIn({ delay: 250 });
  const textureAnim = useFadeIn({ delay: 300 });
  const collaborationAnim = useFadeIn({ delay: 350 });
  const galleryAnim = useFadeIn({ delay: 400 });
  const ctaAnim = useFadeIn({ delay: 450 });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"
      }`}
    >
      {/* ===== PAGE HEADER / HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={series.heroImage}
            alt={series.name}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-b from-[#232323]/70 via-[#232323]/50 to-[#232323]"
                : "bg-gradient-to-b from-white/70 via-white/50 to-white"
            }`}
          />
        </div>

        <div
          ref={heroAnim.ref}
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-32 text-center ${
            heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Series Name */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-10 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            {series.name}
          </h1>

          {/* Tagline */}
          <p
            className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}
          >
            {series.tagline}
          </p>
        </div>
      </section>

      {/* ===== SECTION 1: OVERVIEW ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={overviewAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            overviewAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-10 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Overview
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Text */}
            <p
              className={`text-lg font-light leading-relaxed ${
                isDark ? "text-white/70" : "text-[#6F6F6F]"
              }`}
            >
              {series.overviewText}
            </p>

            {/* Right: Bullets */}
            <div className="space-y-6">
              <div
                className={`flex items-start gap-4 pb-6 border-b ${
                  isDark ? "border-white/10" : "border-[#E0E0E0]"
                }`}
              >
                <span
                  className={`text-sm font-medium uppercase tracking-wider w-32 flex-shrink-0 ${
                    isDark ? "text-white/50" : "text-[#AFAFAF]"
                  }`}
                >
                  Material
                </span>
                <span
                  className={`text-base ${isDark ? "text-white" : "text-[#232323]"}`}
                >
                  {series.overviewBullets.material}
                </span>
              </div>
              <div
                className={`flex items-start gap-4 pb-6 border-b ${
                  isDark ? "border-white/10" : "border-[#E0E0E0]"
                }`}
              >
                <span
                  className={`text-sm font-medium uppercase tracking-wider w-32 flex-shrink-0 ${
                    isDark ? "text-white/50" : "text-[#AFAFAF]"
                  }`}
                >
                  Ideal for
                </span>
                <span
                  className={`text-base ${isDark ? "text-white" : "text-[#232323]"}`}
                >
                  {series.overviewBullets.idealFor}
                </span>
              </div>
              <div className="flex items-start gap-4">
                <span
                  className={`text-sm font-medium uppercase tracking-wider w-32 flex-shrink-0 ${
                    isDark ? "text-white/50" : "text-[#AFAFAF]"
                  }`}
                >
                  Surface
                </span>
                <span
                  className={`text-base ${isDark ? "text-white" : "text-[#232323]"}`}
                >
                  {series.overviewBullets.surfaceCharacter}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: APPLICATIONS ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={applicationsAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            applicationsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Best used for
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {series.applications.map((app, index) => (
              <div
                key={index}
                className={`p-6 border transition-colors duration-300 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-[#E0E0E0] bg-white"
                }`}
              >
                <div
                  className={`text-4xl font-extralight mb-4 ${
                    isDark ? "text-white/20" : "text-[#E0E0E0]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <p
                  className={`text-base font-medium ${
                    isDark ? "text-white" : "text-[#232323]"
                  }`}
                >
                  {app.title}
                </p>
                {app.description && (
                  <p
                    className={`text-sm mt-2 ${
                      isDark ? "text-white/60" : "text-[#6F6F6F]"
                    }`}
                  >
                    {app.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: TECHNICAL SNAPSHOT ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={technicalAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            technicalAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Technical snapshot
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Specs */}
            <div className="space-y-4">
              {series.technicalSpecs.map((spec, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-4 pb-4 border-b ${
                    isDark ? "border-white/10" : "border-[#E0E0E0]"
                  }`}
                >
                  <span
                    className={`text-sm font-medium uppercase tracking-wider w-40 flex-shrink-0 ${
                      isDark ? "text-white/50" : "text-[#AFAFAF]"
                    }`}
                  >
                    {spec.label}
                  </span>
                  <span
                    className={`text-base ${isDark ? "text-white" : "text-[#232323]"}`}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Right: Note + Button */}
            <div className="space-y-8">
              <p
                className={`text-base font-light leading-relaxed ${
                  isDark ? "text-white/70" : "text-[#6F6F6F]"
                }`}
              >
                {series.technicalNote}
              </p>
              <a
                href="#"
                className={`inline-flex items-center gap-3 px-6 py-3 border text-sm font-medium tracking-wider transition-all duration-300 ${
                  isDark
                    ? "border-white/30 text-white hover:bg-white hover:text-[#232323]"
                    : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
                }`}
              >
                Request Technical Sheet
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: TEXTURE & TONES ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={textureAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            textureAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Texture and tones
          </h2>

          <p
            className={`text-lg font-light leading-relaxed mb-12 max-w-3xl ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            {series.textureDescription}
          </p>

          {/* Color Swatches Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {series.colorSwatches.map((swatch, index) => (
              <div key={index} className="text-center">
                <div
                  className="aspect-square mb-3 border"
                  style={{ backgroundColor: swatch.color }}
                />
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-white/60" : "text-[#6F6F6F]"
                  }`}
                >
                  {swatch.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: DESIGN COLLABORATION ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={collaborationAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            collaborationAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Text */}
            <div>
              <h2
                className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
                  isDark ? "text-white" : "text-[#232323]"
                }`}
              >
                Design collaboration
              </h2>

              <p
                className={`text-lg font-light leading-relaxed ${
                  isDark ? "text-white/70" : "text-[#6F6F6F]"
                }`}
              >
                We often join projects early in the design phase — helping define thickness, joint
                layout, fixing methods, and surface expression. Our goal is to align technical
                decisions with the emotional tone of the space.
              </p>
            </div>

            {/* Right: Bullets */}
            <ul className="space-y-4">
              {[
                "Early-stage material consultation",
                "Joint layout and panel sizing suggestions",
                "Fixing and substrate recommendations",
                "Sample development and mock-ups",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                      isDark ? "bg-white/40" : "bg-[#AFAFAF]"
                    }`}
                  />
                  <span
                    className={`text-base ${isDark ? "text-white/80" : "text-[#4A4A4A]"}`}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: GALLERY ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={galleryAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            galleryAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            In context
          </h2>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {series.galleryImages.map((img, index) => (
              <div
                key={index}
                className={`group overflow-hidden ${
                  index === 0 ? "col-span-2 row-span-2" : ""
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark
                      ? "opacity-80 group-hover:opacity-100"
                      : "group-hover:scale-105"
                  } ${index === 0 ? "aspect-square" : "aspect-[4/3]"}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Caption */}
          <p
            className={`text-center text-sm font-light italic ${
              isDark ? "text-white/50" : "text-[#AFAFAF]"
            }`}
          >
            Surfaces that feel calm, grounded, and intentionally designed.
          </p>
        </div>
      </section>

      {/* ===== SECTION 7: CTA ===== */}
      <section className="py-24 sm:py-32">
        <div
          ref={ctaAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
              isDark ? "text-white" : "text-[#232323]"
            }`}
          >
            Plan your project with {series.name}.
          </h2>

          <p
            className={`text-lg font-light leading-relaxed mb-10 ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            Share your drawings, moodboards, or early sketches — we'll help translate them into a
            concrete surface strategy.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "bg-white text-[#232323] hover:bg-white/90"
                  : "bg-[#232323] text-white hover:bg-[#353535]"
              }`}
            >
              Start a Project
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
            <a
              href="mailto:samples@arcosworks.com?subject=Sample%20Request"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "border-white/30 text-white hover:bg-white hover:text-[#232323]"
                  : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
              }`}
            >
              Request Samples
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}



