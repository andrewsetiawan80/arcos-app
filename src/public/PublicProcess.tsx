import { useRef } from "react";
import { Link } from "react-router-dom";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";

// Import images
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import mixDesign from "../assets/images/mix-design.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";

// Process steps data
const PROCESS_STEPS = [
  {
    step: "01",
    title: "Discover",
    paragraph: "Every journey begins with inspiration. Clients explore our textures, tones, and materials through samples, digital previews, or studio visits. We introduce the possibilities of UHPC, GFRC, and microcement, helping define direction and design intent.",
    points: [
      "Texture & color exploration",
      "Sample viewing",
      "Material guidance",
    ],
  },
  {
    step: "02",
    title: "Design & Consultation",
    paragraph: "We work closely with architects, designers, and project teams to refine technical requirements and aesthetic goals. The design stage aligns structure, emotion, and material logic for a coherent architectural vision.",
    points: [
      "Technical review",
      "Material selection & thickness planning",
      "Aesthetic concept alignment",
      "Feasibility & engineering discussion",
    ],
  },
  {
    step: "03",
    title: "Engineering & Craft",
    paragraph: "Our artisans and engineers shape each piece with precision. Whether UHPC or GFRC, the process balances structural integrity with artistic detail. Molds, forms, and textures are produced with care to ensure consistent quality and expression.",
    points: [
      "Mold creation",
      "Surface texture development",
      "UHPC/GFRC casting",
      "Quality control & refinement",
    ],
  },
  {
    step: "04",
    title: "Installation Support",
    paragraph: "We guide installers and site teams with technical clarity. From mounting methods to joint details and protection guidelines, ARCOS ensures that every surface integrates seamlessly into the architectural environment.",
    points: [
      "Installation documentation",
      "Coordination with contractor teams",
      "On-site support if required",
      "Surface protection recommendations",
    ],
  },
  {
    step: "05",
    title: "Completion & Care",
    paragraph: "Once installation is complete, each surface is sealed and reviewed to ensure lasting performance. We provide maintenance guidance tailored to the material, ensuring the concrete's beauty endures for years.",
    points: [
      "Final inspection",
      "Sealing & finishing",
      "Maintenance guidelines",
      "Long-term support",
    ],
  },
];

export default function PublicProcess() {
  const { isDark } = usePublicTheme();
  
  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const stepsAnim = useFadeIn({ delay: 200 });
  const ctaAnim = useFadeIn({ delay: 300 });

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-[#1B1B1B]"
    }`}>
      
      {/* ===== HERO / INTRO SECTION ===== */}
      <section className={`py-24 sm:py-32 lg:py-40 border-b transition-colors duration-300 ${
        isDark ? "border-white/10" : "border-[#E0E0E0]"
      }`}>
        <div 
          ref={heroAnim.ref}
          className={`max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Page Header */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-10 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Crafting concrete as a language of design.
          </h1>
          
          {/* Intro Paragraph */}
          <p className={`text-lg sm:text-xl font-light leading-relaxed mb-8 max-w-3xl mx-auto ${
            isDark ? "text-white/70" : "text-[#6F6F6F]"
          }`}>
            Our process blends engineering precision with human craftsmanship. Each stage is designed to shape concrete into expressive surfaces that elevate modern architecture. From concept to installation, ARCOS ensures clarity, quality, and collaboration at every step.
          </p>
          
          {/* Secondary Text */}
          <p className={`text-sm tracking-wide ${
            isDark ? "text-white/40" : "text-[#AFAFAF]"
          }`}>
            A seamless journey built on expertise, transparency, and architectural intention.
          </p>
        </div>
      </section>

      {/* ===== PROCESS STEPS SECTION ===== */}
      <section className={`py-24 sm:py-32 lg:py-40 ${
        isDark ? "bg-[#1B1B1B]" : "bg-white"
      }`}>
        <div 
          ref={stepsAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            stepsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="space-y-0">
            {PROCESS_STEPS.map((step, index) => (
              <div 
                key={step.step}
                className={`py-16 sm:py-20 lg:py-24 border-b transition-colors duration-300 ${
                  isDark ? "border-white/10" : "border-[#E0E0E0]"
                } ${index === 0 ? "pt-0" : ""} ${index === PROCESS_STEPS.length - 1 ? "border-b-0 pb-0" : ""}`}
              >
                <div className="grid lg:grid-cols-[120px_1fr] gap-8 lg:gap-16">
                  {/* Step Number */}
                  <div className={`text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tight ${
                    isDark ? "text-white/20" : "text-[#E0E0E0]"
                  }`}>
                    {step.step}
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-8">
                    {/* Title */}
                    <h2 className={`text-2xl sm:text-3xl font-light tracking-tight ${
                      isDark ? "text-white" : "text-[#1B1B1B]"
                    }`}>
                      {step.step} — {step.title}
                    </h2>
                    
                    {/* Paragraph */}
                    <p className={`text-base sm:text-lg font-light leading-relaxed max-w-2xl ${
                      isDark ? "text-white/70" : "text-[#6F6F6F]"
                    }`}>
                      {step.paragraph}
                    </p>
                    
                    {/* Key Points */}
                    <ul className="space-y-3 pt-4">
                      {step.points.map((point) => (
                        <li 
                          key={point} 
                          className={`flex items-center gap-4 text-sm ${
                            isDark ? "text-white/50" : "text-[#AFAFAF]"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${
                            isDark ? "bg-white/30" : "bg-[#AFAFAF]"
                          }`} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VISUAL IMAGERY SECTION ===== */}
      <section className={`py-24 sm:py-32 transition-colors duration-300 ${
        isDark ? "bg-[#232323]" : "bg-[#F8F8F8]"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { image: workshopCloseup, alt: "Craftsmanship detail" },
              { image: mixDesign, alt: "Material textures" },
              { image: structuralPanels, alt: "Surface geometry" },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`aspect-[4/5] overflow-hidden ${
                  isDark ? "bg-white/5" : "bg-[#E0E0E0]"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    isDark ? "opacity-70 hover:opacity-100" : "grayscale hover:grayscale-0"
                  }`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CLOSING CTA SECTION ===== */}
      <section className="relative py-32 sm:py-40 lg:py-48 overflow-hidden">
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
          {/* Headline */}
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#1B1B1B]"
          }`}>
            Let's shape your next space.
          </h2>
          
          {/* Subtext */}
          <p className={`text-lg font-light mb-12 max-w-xl mx-auto ${
            isDark ? "text-white/60" : "text-[#6F6F6F]"
          }`}>
            Reach out to our team for consultations, samples, or technical guidance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className={`group inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "bg-white text-[#1B1B1B] hover:bg-white/90" 
                  : "bg-[#1B1B1B] text-white hover:bg-[#353535]"
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
                  ? "border-white/30 text-white hover:bg-white hover:text-[#1B1B1B]" 
                  : "border-[#1B1B1B] text-[#1B1B1B] hover:bg-[#1B1B1B] hover:text-white"
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
