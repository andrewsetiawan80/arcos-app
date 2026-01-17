import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";

// Import images
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";

// Core Services Data
const CORE_SERVICES = [
  {
    title: "Material Consultation",
    description:
      "We help identify the right material system — UHPC, GFRC, or microcement — based on thickness, performance, and desired expression.",
    bullets: [
      "Early design guidance",
      "Sample and tone selection",
      "Substrate recommendations",
    ],
    image: concretePanelDetail,
  },
  {
    title: "Design & Engineering",
    description:
      "From joint layout to fixing strategy, we translate design concepts into engineered solutions.",
    bullets: [
      "Technical drawings",
      "Panel sizing & joint studies",
      "Custom mold engineering",
    ],
    image: workshopCloseup,
  },
  {
    title: "Fabrication & Craft",
    description:
      "Our team casts, finishes, and textures every piece with precision and consistency.",
    bullets: [
      "UHPC casting",
      "GFRC panel forming",
      "Microcement application",
    ],
    image: structuralPanels,
  },
];

// Specialized Capabilities
const SPECIALIZED_CAPABILITIES = [
  {
    title: "Bespoke Surface Design",
    description: "Custom textures, forms, curves, and profiles.",
  },
  {
    title: "Architectural Feature Walls",
    description: "Large-format panels, sculptural planes, custom geometries.",
  },
  {
    title: "Integrated Furniture & Elements",
    description: "Benches, counters, niches, monolithic blocks.",
  },
  {
    title: "Façade Systems (GFRC/UHPC)",
    description: "Lightweight or high-performance panels designed for exterior environments.",
  },
  {
    title: "Seamless Microcement Interiors",
    description: "Bathrooms, floors, cabinetry, built-ins, and continuous surfaces.",
  },
  {
    title: "Installation Support",
    description: "Alignment, fixing details, and on-site coordination.",
  },
];

// Process Steps
const PROCESS_STEPS = [
  "Discover",
  "Design",
  "Engineering",
  "Craft",
  "Installation Support",
  "Completion & Care",
];

// Industries
const INDUSTRIES = [
  "Residential Villas",
  "Hospitality & Hotels",
  "Retail & Commercial",
  "Creative Studios",
  "Public Spaces",
  "Developers",
  "Architects & Interior Designers",
];

// Why ARCOS
const WHY_ARCOS = [
  {
    title: "Material Expertise",
    description: "Mastery of UHPC, GFRC, and microcement systems.",
  },
  {
    title: "Architectural Sensitivity",
    description: "Surfaces designed with clarity, proportion, and timeless restraint.",
  },
  {
    title: "Craftsmanship",
    description: "Hand-finished surfaces that elevate the spatial experience.",
  },
];

export default function PublicServices() {
  const { isDark } = usePublicTheme();

  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const overviewAnim = useFadeIn({ delay: 150 });
  const coreAnim = useFadeIn({ delay: 200 });
  const specializedAnim = useFadeIn({ delay: 250 });
  const processAnim = useFadeIn({ delay: 300 });
  const industriesAnim = useFadeIn({ delay: 350 });
  const whyAnim = useFadeIn({ delay: 400 });
  const ctaAnim = useFadeIn({ delay: 450 });

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
            src={microcementWalls}
            alt="Architectural concrete surfaces"
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
          {/* Title */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-10 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Services
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
              isDark ? "text-white/80" : "text-[#4A4A4A]"
            }`}
          >
            From concept to completion, we support architects, designers, developers, and homeowners
            with end-to-end concrete surface solutions.
          </p>
        </div>
      </section>

      {/* ===== SECTION 1: OVERVIEW ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={overviewAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            overviewAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            What we do
          </h2>

          <p
            className={`text-lg font-light leading-relaxed ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            ARCOS provides design, engineering, fabrication, and finishing services for projects
            that require refined concrete surfaces. Our approach blends material expertise with
            architectural sensitivity — ensuring every surface aligns with the emotional and spatial
            intent of the environment.
          </p>
        </div>
      </section>

      {/* ===== SECTION 2: CORE SERVICES ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={coreAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            coreAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Our core services
          </h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {CORE_SERVICES.map((service, index) => (
              <div key={index} className="group">
                {/* Image */}
                <div
                  className={`aspect-[4/3] overflow-hidden mb-6 ${
                    isDark ? "bg-white/5" : "bg-[#E0E0E0]"
                  }`}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className={`w-full h-full object-cover transition-all duration-700 ${
                      isDark
                        ? "opacity-80 group-hover:opacity-100 group-hover:scale-105"
                        : "group-hover:scale-105"
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Content */}
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDark ? "text-white" : "text-[#1B1B1B]"
                  }`}
                >
                  {service.title}
                </h3>
                <p
                  className={`text-base font-light leading-relaxed mb-6 ${
                    isDark ? "text-white/60" : "text-[#6F6F6F]"
                  }`}
                >
                  {service.description}
                </p>

                {/* Bullets */}
                <ul className="space-y-2">
                  {service.bullets.map((bullet, bIndex) => (
                    <li key={bIndex} className="flex items-start gap-3">
                      <span
                        className={`w-1 h-1 rounded-full mt-2.5 flex-shrink-0 ${
                          isDark ? "bg-white/40" : "bg-[#AFAFAF]"
                        }`}
                      />
                      <span
                        className={`text-sm font-light ${
                          isDark ? "text-white/50" : "text-[#AFAFAF]"
                        }`}
                      >
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: SPECIALIZED CAPABILITIES ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={specializedAnim.ref}
          className={`max-w-6xl mx-auto px-6 sm:px-12 lg:px-20 ${
            specializedAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Specialized capabilities
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SPECIALIZED_CAPABILITIES.map((capability, index) => (
              <div
                key={index}
                className={`p-6 border transition-colors duration-300 ${
                  isDark
                    ? "border-white/10 bg-white/5 hover:border-white/20"
                    : "border-[#E0E0E0] bg-[#F8F8F8] hover:border-[#AFAFAF]"
                }`}
              >
                <div
                  className={`text-3xl font-extralight mb-4 ${
                    isDark ? "text-white/20" : "text-[#E0E0E0]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3
                  className={`text-base font-medium mb-3 ${
                    isDark ? "text-white" : "text-[#1B1B1B]"
                  }`}
                >
                  {capability.title}
                </h3>
                <p
                  className={`text-sm font-light leading-relaxed ${
                    isDark ? "text-white/60" : "text-[#6F6F6F]"
                  }`}
                >
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: PROCESS REFERENCE ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={processAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            processAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            How we work
          </h2>

          <p
            className={`text-lg font-light leading-relaxed text-center mb-12 max-w-3xl mx-auto ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            Our process is collaborative and transparent. We join your project at any stage — from
            early concept to final installation — ensuring both structure and aesthetics align
            seamlessly.
          </p>

          {/* Horizontal Stepper */}
          <div className="relative">
            {/* Connection Line */}
            <div
              className={`hidden md:block absolute top-6 left-0 right-0 h-px ${
                isDark ? "bg-white/20" : "bg-[#E0E0E0]"
              }`}
            />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-4">
              {PROCESS_STEPS.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Step Number */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-medium ${
                      isDark
                        ? "bg-[#1B1B1B] border border-white/20 text-white"
                        : "bg-white border border-[#E0E0E0] text-[#1B1B1B]"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  {/* Step Name */}
                  <p
                    className={`text-sm font-light ${
                      isDark ? "text-white/70" : "text-[#6F6F6F]"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Link to Process Page */}
          <div className="text-center mt-12">
            <Link
              to="/process"
              className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                isDark ? "text-white/70 hover:text-white" : "text-[#6F6F6F] hover:text-[#1B1B1B]"
              }`}
            >
              Learn more about our process
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </section>

      {/* ===== SECTION 5: INDUSTRIES WE SERVE ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#1B1B1B]" : "border-[#E0E0E0] bg-white"
        }`}
      >
        <div
          ref={industriesAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            industriesAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Industries we serve
          </h2>

          <p
            className={`text-lg font-light leading-relaxed text-center mb-12 max-w-2xl mx-auto ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            We support a wide range of project types, from luxury residential to commercial
            environments.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {INDUSTRIES.map((industry, index) => (
              <div
                key={index}
                className={`p-4 text-center border transition-colors duration-300 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-[#E0E0E0] bg-[#F8F8F8]"
                }`}
              >
                <p
                  className={`text-sm font-light ${
                    isDark ? "text-white/70" : "text-[#6F6F6F]"
                  }`}
                >
                  {industry}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: WHY ARCOS ===== */}
      <section
        className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
          isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
        }`}
      >
        <div
          ref={whyAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            whyAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Why work with ARCOS
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {WHY_ARCOS.map((item, index) => (
              <div key={index} className="text-center">
                <h3
                  className={`text-lg font-medium mb-4 ${
                    isDark ? "text-white" : "text-[#1B1B1B]"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-base font-light leading-relaxed ${
                    isDark ? "text-white/60" : "text-[#6F6F6F]"
                  }`}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
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
              isDark ? "text-white" : "text-[#1B1B1B]"
            }`}
          >
            Let's build something meaningful.
          </h2>

          <p
            className={`text-lg font-light leading-relaxed mb-10 ${
              isDark ? "text-white/70" : "text-[#6F6F6F]"
            }`}
          >
            Share your drawings or early concepts — we'll help translate them into refined concrete
            surfaces.
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
                  ? "border-white/30 text-white hover:bg-white hover:text-[#1B1B1B]"
                  : "border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white"
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
