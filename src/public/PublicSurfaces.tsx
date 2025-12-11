import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";

// Import images
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";

// Hero image - high quality microcement stairs (2.7MB)
import heroImage from "../assets/images/grey-microcement-stairs-stairs-viewed-from-modern-design-innovative-material-metal-railing.webp";

// Material systems data
const MATERIALS = [
  {
    id: "uhpc",
    title: "UHPC — Ultra High Performance Concrete",
    description:
      "A dense, ultra-strong concrete with refined texture and high durability. Ideal for thin profiles, sculptural elements, and architectural details that demand precision and longevity.",
    link: "/catalog?category=uhpc",
    buttonText: "Explore UHPC Solis Series",
    image: workshopCloseup,
  },
  {
    id: "gfrc",
    title: "GFRC — Glass Fiber Reinforced Concrete",
    description:
      "Lightweight yet strong. GFRC allows thinner, more expressive forms while reducing structural load — perfect for panels, façades, and bespoke design pieces.",
    link: "/catalog?category=gfrc",
    buttonText: "Explore GFRC Aeris Series",
    image: mosaicFacadeDetail,
  },
  {
    id: "microcement",
    title: "Microcement — Seamless surface system",
    description:
      "A thin, continuous finishing system applicable over walls, floors, and furniture. Minimalist, tactile, and ideal for contemporary interiors requiring seamless surfaces.",
    link: "/catalog?category=microcement",
    buttonText: "Explore Microcement",
    image: microcementInterior1,
  },
];

// Why these materials - bullets
const WHY_BULLETS = [
  "High strength with reduced thickness",
  "Refined textures and consistent finishes",
  "Flexibility in form, geometry, and scale",
  "Long-term durability and reduced maintenance",
];

// Material attributes for diagram
const ATTRIBUTES = [
  { label: "Strength", icon: "strength" },
  { label: "Lightness", icon: "lightness" },
  { label: "Flexibility", icon: "flexibility" },
  { label: "Surface Quality", icon: "surface" },
];

// Applications data
const APPLICATIONS = [
  {
    title: "UHPC – Structural surface presence",
    description:
      "Feature walls, sculptural elements, benches, exterior details, and surfaces where slender thickness meets high performance.",
    image: workshopCloseup,
  },
  {
    title: "GFRC – Lightweight architectural panels",
    description:
      "Façade cladding, large wall panels, soffits, and custom forms that benefit from lighter weight and flexible shaping.",
    image: mosaicFacadeDetail,
  },
  {
    title: "Microcement – Seamless interiors",
    description:
      "Bathrooms, living areas, counters, cabinetry fronts, and furniture pieces requiring a continuous, minimalist finish.",
    image: microcementWalls,
  },
];

// Series callouts
const SERIES = [
  {
    title: "UHPC Solis Series",
    description: "Surfaces that embody permanence, clarity, and structural expression.",
    buttonText: "View Solis Series",
    link: "/catalog?category=uhpc",
    image: workshopCloseup,
  },
  {
    title: "GFRC Aeris Series",
    description: "Light, versatile, and expressive — designed for sculptural panels and refined geometry.",
    buttonText: "View Aeris Series",
    link: "/catalog?category=gfrc",
    image: landmarkInstallation,
  },
  {
    title: "Microcement Systems",
    description: "Seamless, tactile finishes for interiors that feel grounded yet minimal.",
    buttonText: "View Microcement",
    link: "/catalog?category=microcement",
    image: microcementInterior2,
  },
];

// Texture gallery images
const TEXTURE_GALLERY = [
  { src: concreteTexture2, alt: "Close-up texture of concrete surface" },
  { src: workshopCloseup, alt: "Light grazing over curved surface" },
  { src: mosaicFacadeDetail, alt: "Detail of edges and junctions" },
];

export default function PublicSurfaces() {
  const { isDark } = usePublicTheme();

  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const materialsAnim = useFadeIn({ delay: 150 });
  const whyAnim = useFadeIn({ delay: 200 });
  const applicationsAnim = useFadeIn({ delay: 250 });
  const characterAnim = useFadeIn({ delay: 300 });
  const seriesAnim = useFadeIn({ delay: 350 });
  const ctaAnim = useFadeIn({ delay: 400 });

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-[#1B1B1B]"
      }`}
    >
      {/* ===== PAGE HEADER / HERO ===== */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern concrete surfaces"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-b from-[#1B1B1B]/70 via-[#1B1B1B]/50 to-[#1B1B1B]"
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
          {/* Main Title */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-10 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Surfaces, reimagined.
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}
          >
            Advanced concrete and finishing systems for modern architecture — designed to balance
            strength, expression, and timeless simplicity.
          </p>
        </div>
      </section>

      {/* ===== SECTION 1: MATERIAL OVERVIEW ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={materialsAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            materialsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2
              className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
                isDark ? "text-white" : "text-[#1B1B1B]"
              }`}
            >
              Material systems
            </h2>
            <p
              className={`text-lg font-light leading-relaxed max-w-3xl mx-auto ${
                isDark ? "text-white/70" : "text-[#6F6F6F]"
              }`}
            >
              ARCOS works with three core material systems: UHPC, GFRC, and microcement. Each is
              engineered for different applications, thicknesses, and design intentions — from
              sculptural elements to seamless interior finishes.
            </p>
          </div>

          {/* 3-Column Layout */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {MATERIALS.map((material) => (
              <div key={material.id} className="group space-y-6">
                {/* Image */}
                <div
                  className={`aspect-[4/3] overflow-hidden ${
                    isDark ? "bg-white/5" : "bg-[#F0F0F0]"
                  }`}
                >
                  <img
                    src={material.image}
                    alt={material.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isDark
                        ? "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                        : "grayscale group-hover:grayscale-0 group-hover:scale-105"
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3
                    className={`text-lg font-medium ${isDark ? "text-white" : "text-[#1B1B1B]"}`}
                  >
                    {material.title}
                  </h3>
                  <p
                    className={`text-base font-light leading-relaxed ${
                      isDark ? "text-white/60" : "text-[#6F6F6F]"
                    }`}
                  >
                    {material.description}
                  </p>
                  <Link
                    to={material.link}
                    className={`inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                      isDark
                        ? "text-white hover:text-white/70"
                        : "text-[#1B1B1B] hover:text-[#6F6F6F]"
                    }`}
                  >
                    {material.buttonText}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: WHY THESE MATERIALS ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={whyAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            whyAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Section Title */}
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Why these materials?
          </h2>

          {/* 2-Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Column: Text & Bullets */}
            <div className="space-y-8">
              <p
                className={`text-lg font-light leading-relaxed ${
                  isDark ? "text-white/70" : "text-[#6F6F6F]"
                }`}
              >
                These materials push concrete beyond its conventional role as a structural mass.
                They allow thinner sections, refined textures, and stronger performance — opening up
                new possibilities for architectural expression.
              </p>

              <ul className="space-y-4">
                {WHY_BULLETS.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0 ${
                        isDark ? "bg-white/40" : "bg-[#AFAFAF]"
                      }`}
                    />
                    <span
                      className={`text-base font-light ${
                        isDark ? "text-white/80" : "text-[#4A4A4A]"
                      }`}
                    >
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Attributes Diagram */}
            <div className="grid grid-cols-2 gap-6">
              {ATTRIBUTES.map((attr) => (
                <div
                  key={attr.icon}
                  className={`p-6 border transition-colors duration-300 ${
                    isDark
                      ? "border-white/10 bg-white/5"
                      : "border-[#E0E0E0] bg-white"
                  }`}
                >
                  {/* Simple geometric icon */}
                  <div
                    className={`w-10 h-10 mb-4 flex items-center justify-center ${
                      isDark ? "text-white/40" : "text-[#AFAFAF]"
                    }`}
                  >
                    {attr.icon === "strength" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    )}
                    {attr.icon === "lightness" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )}
                    {attr.icon === "flexibility" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    )}
                    {attr.icon === "surface" && (
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-white/80" : "text-[#4A4A4A]"
                    }`}
                  >
                    {attr.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: APPLICATIONS ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={applicationsAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            applicationsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2
              className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
                isDark ? "text-white" : "text-[#1B1B1B]"
              }`}
            >
              Where they belong
            </h2>
            <p
              className={`text-lg font-light leading-relaxed max-w-2xl mx-auto ${
                isDark ? "text-white/70" : "text-[#6F6F6F]"
              }`}
            >
              Each material has its own ideal context. We select and engineer the system based on
              how it will live in the space.
            </p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {APPLICATIONS.map((app, index) => (
              <div
                key={index}
                className={`group border transition-colors duration-300 ${
                  isDark ? "border-white/10 bg-white/5" : "border-[#E0E0E0] bg-[#F8F8F8]"
                }`}
              >
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={app.image}
                    alt={app.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isDark
                        ? "opacity-80 group-hover:opacity-100"
                        : "grayscale group-hover:grayscale-0"
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3
                    className={`text-base font-medium ${isDark ? "text-white" : "text-[#1B1B1B]"}`}
                  >
                    {app.title}
                  </h3>
                  <p
                    className={`text-sm font-light leading-relaxed ${
                      isDark ? "text-white/60" : "text-[#6F6F6F]"
                    }`}
                  >
                    {app.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: SURFACE CHARACTER ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={characterAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            characterAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2
              className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
                isDark ? "text-white" : "text-[#1B1B1B]"
              }`}
            >
              The character of ARCOS surfaces
            </h2>
            <p
              className={`text-lg font-light leading-relaxed max-w-3xl mx-auto ${
                isDark ? "text-white/70" : "text-[#6F6F6F]"
              }`}
            >
              Beyond performance, we care deeply about how each surface feels — visually and
              tactically. Texture, tone, and light interaction are considered as carefully as
              structural behavior.
            </p>
          </div>

          {/* 3-Photo Strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {TEXTURE_GALLERY.map((img, index) => (
              <div key={index} className="aspect-[4/3] overflow-hidden group">
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark
                      ? "opacity-80 group-hover:opacity-100"
                      : "grayscale group-hover:grayscale-0"
                  }`}
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
            Concrete as a calm, expressive layer in space.
          </p>
        </div>
      </section>

      {/* ===== SECTION 5: SERIES CALLOUTS ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={seriesAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            seriesAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Section Title */}
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Explore our series
          </h2>

          {/* 3 Large Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {SERIES.map((series, index) => (
              <div
                key={index}
                className={`group border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:border-white/20"
                    : "border-[#E0E0E0] bg-[#F8F8F8] hover:border-[#AFAFAF]"
                }`}
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={series.image}
                    alt={series.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isDark
                        ? "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                        : "grayscale group-hover:grayscale-0 group-hover:scale-105"
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3
                    className={`text-lg font-medium ${isDark ? "text-white" : "text-[#1B1B1B]"}`}
                  >
                    {series.title}
                  </h3>
                  <p
                    className={`text-sm font-light leading-relaxed ${
                      isDark ? "text-white/60" : "text-[#6F6F6F]"
                    }`}
                  >
                    {series.description}
                  </p>
                  <Link
                    to={series.link}
                    className={`inline-flex items-center gap-3 px-6 py-3 text-sm font-medium tracking-wider transition-all duration-300 ${
                      isDark
                        ? "bg-white text-[#1B1B1B] hover:bg-white/90"
                        : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
                    }`}
                  >
                    {series.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: CTA ===== */}
      <section className="py-24 sm:py-32">
        <div
          ref={ctaAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-6 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Not sure which material fits your project?
          </h2>

          <p
            className={`text-lg font-light leading-relaxed mb-10 ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            We can help translate your design intent into the right material system — from concept
            to technical specification.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "bg-white text-[#1B1B1B] hover:bg-white/90"
                  : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
              }`}
            >
              Start a Consultation
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
              href="#"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark
                  ? "border-white/30 text-white hover:bg-white hover:text-[#1B1B1B]"
                  : "border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white"
              }`}
            >
              Request Material Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
