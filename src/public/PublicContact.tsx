import { useState } from "react";
import { useFadeIn } from "../utils/useAnimation";
import { usePublicTheme } from "./PublicThemeContext";
import { api } from "../lib/api";

// Import images
import concreteTexture2 from "../assets/images/concrete-texture-2.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";

export default function PublicContact() {
  const { isDark } = usePublicTheme();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Animation refs
  const heroAnim = useFadeIn({ delay: 100 });
  const introAnim = useFadeIn({ delay: 150 });
  const optionsAnim = useFadeIn({ delay: 200 });
  const formAnim = useFadeIn({ delay: 250 });
  const supportAnim = useFadeIn({ delay: 300 });
  const locationAnim = useFadeIn({ delay: 350 });
  const ctaAnim = useFadeIn({ delay: 400 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState('sending');
    try {
      const res = await api.submitContactForm(formData);
      if (res.error) {
        setSubmitState('error');
      } else {
        setSubmitState('sent');
        setFormData({ fullName: "", email: "", phone: "", company: "", message: "" });
      }
    } catch {
      setSubmitState('error');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "bg-[#232323] text-white" : "bg-white text-[#232323]"
    }`}>
      
      {/* ===== PAGE HEADER / HERO ===== */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img
            src={workshopCloseup}
            alt="Architectural concrete texture"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#232323]/60 via-[#232323]/50 to-[#232323]" 
              : "bg-gradient-to-b from-white/70 via-white/60 to-white"
          }`} />
        </div>

        <div 
          ref={heroAnim.ref}
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 lg:px-20 py-32 text-center ${
            heroAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          {/* Main Title */}
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Let's shape your next space.
          </h1>
          
          {/* Subheadline */}
          <p className={`text-lg sm:text-xl font-light leading-relaxed max-w-2xl mx-auto ${
            isDark ? "text-white/80" : "text-[#4A4A4A]"
          }`}>
            We collaborate with architects, designers, developers, and homeowners to create meaningful, modern concrete surfaces.
          </p>
        </div>
      </section>

      {/* ===== INTRO BLOCK ===== */}
      <section className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={introAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            introAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            We're here to support your vision.
          </h2>

          <p className={`text-lg font-light leading-relaxed mb-8 ${
            isDark ? "text-white/70" : "text-[#6F6F6F]"
          }`}>
            Whether you need samples, technical guidance, design consultation, or a full project discussion, the ARCOS team is ready to assist. We respond with clarity, precision, and the calm professionalism that defines our brand.
          </p>

          <p className={`text-base font-medium ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Every collaboration begins with a conversation.
          </p>
        </div>
      </section>

      {/* ===== CONTACT OPTIONS SECTION ===== */}
      <section className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}>
        <div 
          ref={optionsAnim.ref}
          className={`max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 ${
            optionsAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-12">
            {/* Column 1: General Inquiries */}
            <div className="space-y-6">
              <h3 className={`text-xl font-light ${isDark ? "text-white" : "text-[#232323]"}`}>
                General Inquiries
              </h3>
              <p className={`text-base font-light leading-relaxed ${
                isDark ? "text-white/60" : "text-[#6F6F6F]"
              }`}>
                For early-stage discussions, material questions, or collaboration opportunities.
              </p>
              <div className={`space-y-3 text-sm ${isDark ? "text-white/70" : "text-[#4A4A4A]"}`}>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/40" : "bg-[#AFAFAF]"}`} />
                  Email: <a href="mailto:info@arcosworks.com" className={`hover:underline ${isDark ? "text-white" : "text-[#232323]"}`}>info@arcosworks.com</a>
                </p>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/40" : "bg-[#AFAFAF]"}`} />
                  WhatsApp: <a href="https://wa.me/6281234567890" className={`hover:underline ${isDark ? "text-white" : "text-[#232323]"}`}>+62 812 3456 7890</a>
                </p>
              </div>
            </div>

            {/* Column 2: Project Consultation */}
            <div className="space-y-6">
              <h3 className={`text-xl font-light ${isDark ? "text-white" : "text-[#232323]"}`}>
                Project Consultation
              </h3>
              <p className={`text-base font-light leading-relaxed ${
                isDark ? "text-white/60" : "text-[#6F6F6F]"
              }`}>
                For architects, interior designers, and developers requiring technical or design support.
              </p>
              <div className={`space-y-2 text-sm ${isDark ? "text-white/50" : "text-[#AFAFAF]"}`}>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-[#AFAFAF]"}`} />
                  Technical assistance
                </p>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-[#AFAFAF]"}`} />
                  Material recommendations
                </p>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-[#AFAFAF]"}`} />
                  Cost estimation guidance
                </p>
                <p className="flex items-center gap-3">
                  <span className={`w-1 h-1 rounded-full ${isDark ? "bg-white/30" : "bg-[#AFAFAF]"}`} />
                  Project scoping
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="mailto:projects@arcosworks.com?subject=Project%20Consultation"
              className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "bg-white text-[#232323] hover:bg-white/90" 
                  : "bg-[#232323] text-white hover:bg-[#353535]"
              }`}
            >
              Start a Consultation
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== CONTACT FORM SECTION ===== */}
      <section className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={formAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 ${
            formAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl font-light tracking-tight mb-12 text-center ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Send us a message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="fullName" 
                className={`block text-sm font-medium mb-3 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className={`w-full px-5 py-4 border transition-all duration-300 outline-none ${
                  isDark 
                    ? "bg-transparent border-white/20 text-white placeholder-white/30 focus:border-white/50" 
                    : "bg-transparent border-[#E0E0E0] text-[#232323] placeholder-[#AFAFAF] focus:border-[#232323]"
                }`}
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className={`block text-sm font-medium mb-3 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-5 py-4 border transition-all duration-300 outline-none ${
                  isDark 
                    ? "bg-transparent border-white/20 text-white placeholder-white/30 focus:border-white/50" 
                    : "bg-transparent border-[#E0E0E0] text-[#232323] placeholder-[#AFAFAF] focus:border-[#232323]"
                }`}
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Phone (Optional) */}
            <div>
              <label 
                htmlFor="phone" 
                className={`block text-sm font-medium mb-3 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}
              >
                Phone Number <span className={isDark ? "text-white/40" : "text-[#AFAFAF]"}>(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-5 py-4 border transition-all duration-300 outline-none ${
                  isDark 
                    ? "bg-transparent border-white/20 text-white placeholder-white/30 focus:border-white/50" 
                    : "bg-transparent border-[#E0E0E0] text-[#232323] placeholder-[#AFAFAF] focus:border-[#232323]"
                }`}
                placeholder="+62 xxx xxx xxxx"
              />
            </div>

            {/* Company (Optional) */}
            <div>
              <label 
                htmlFor="company" 
                className={`block text-sm font-medium mb-3 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}
              >
                Company / Studio <span className={isDark ? "text-white/40" : "text-[#AFAFAF]"}>(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full px-5 py-4 border transition-all duration-300 outline-none ${
                  isDark 
                    ? "bg-transparent border-white/20 text-white placeholder-white/30 focus:border-white/50" 
                    : "bg-transparent border-[#E0E0E0] text-[#232323] placeholder-[#AFAFAF] focus:border-[#232323]"
                }`}
                placeholder="Your company or studio name"
              />
            </div>

            {/* Message */}
            <div>
              <label 
                htmlFor="message" 
                className={`block text-sm font-medium mb-3 ${isDark ? "text-white/70" : "text-[#6F6F6F]"}`}
              >
                Message
              </label>
              <textarea
                id="message"
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`w-full px-5 py-4 border transition-all duration-300 outline-none resize-none ${
                  isDark 
                    ? "bg-transparent border-white/20 text-white placeholder-white/30 focus:border-white/50" 
                    : "bg-transparent border-[#E0E0E0] text-[#232323] placeholder-[#AFAFAF] focus:border-[#232323]"
                }`}
                placeholder="Tell us about your project or inquiry..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              {submitState === 'sent' ? (
                <p className={`text-lg font-medium ${isDark ? "text-green-400" : "text-green-700"}`}>
                  Thank you! Your message has been sent. We'll be in touch shortly.
                </p>
              ) : (
                <>
                  {submitState === 'error' && (
                    <p className={`text-sm mb-4 ${isDark ? "text-red-400" : "text-red-600"}`}>
                      Something went wrong. Please try again or email us directly.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitState === 'sending'}
                    className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 disabled:opacity-50 ${
                      isDark 
                        ? "bg-white text-[#232323] hover:bg-white/90" 
                        : "bg-[#232323] text-white hover:bg-[#353535]"
                    }`}
                  >
                    {submitState === 'sending' ? 'Sending...' : 'Submit Request'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* ===== ADDITIONAL SUPPORT ===== */}
      <section className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-[#F8F8F8]"
      }`}>
        <div 
          ref={supportAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            supportAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Need samples or material specifications?
          </h2>

          <p className={`text-lg font-light leading-relaxed mb-12 ${
            isDark ? "text-white/70" : "text-[#6F6F6F]"
          }`}>
            We provide physical samples, color swatches, and technical documentation to support your design process. Let us know what you need and we'll guide you with clarity.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:samples@arcosworks.com?subject=Sample%20Request"
              className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "bg-white text-[#232323] hover:bg-white/90" 
                  : "bg-[#232323] text-white hover:bg-[#353535]"
              }`}
            >
              Request Samples
            </a>
            <a
              href="#"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
                isDark 
                  ? "border-white/30 text-white hover:bg-white hover:text-[#232323]" 
                  : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
              }`}
            >
              Download Technical Sheets
            </a>
          </div>
        </div>
      </section>

      {/* ===== LOCATION ===== */}
      <section className={`py-20 sm:py-28 border-b transition-colors duration-300 ${
        isDark ? "border-white/10 bg-[#232323]" : "border-[#E0E0E0] bg-white"
      }`}>
        <div 
          ref={locationAnim.ref}
          className={`max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            locationAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2 className={`text-2xl sm:text-3xl font-light tracking-tight mb-8 ${
            isDark ? "text-white" : "text-[#232323]"
          }`}>
            Studio & Production
          </h2>

          <p className={`text-lg font-light leading-relaxed mb-10 ${
            isDark ? "text-white/70" : "text-[#6F6F6F]"
          }`}>
            Our studio and production facility welcome visits by appointment. Explore textures, discuss ideas, or view ongoing work.
          </p>

          {/* Address Block */}
          <div className={`mb-10 ${isDark ? "text-white/60" : "text-[#6F6F6F]"}`}>
            <p className={`text-lg font-medium mb-2 ${isDark ? "text-white" : "text-[#232323]"}`}>ARCOS</p>
            <p className="text-base">Surabaya, Indonesia</p>
          </div>

          <a
            href="mailto:visit@arcosworks.com?subject=Studio%20Visit%20Request"
            className={`inline-flex items-center gap-3 px-8 py-4 border text-sm font-medium tracking-wider transition-all duration-300 ${
              isDark 
                ? "border-white/30 text-white hover:bg-white hover:text-[#232323]" 
                : "border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white"
            }`}
          >
            Schedule a Visit
          </a>
        </div>
      </section>

      {/* ===== FINAL CTA BLOCK ===== */}
      <section className="relative py-32 sm:py-40 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={concreteTexture2}
            alt="Concrete texture"
            className={`w-full h-full object-cover ${isDark ? "opacity-10" : "opacity-10"}`}
          />
          <div className={`absolute inset-0 ${
            isDark 
              ? "bg-gradient-to-b from-[#232323] via-[#232323]/95 to-[#232323]" 
              : "bg-gradient-to-b from-[#F8F8F8] via-white/95 to-white"
          }`} />
        </div>

        <div 
          ref={ctaAnim.ref}
          className={`relative z-10 max-w-3xl mx-auto px-6 sm:px-12 lg:px-20 text-center ${
            ctaAnim.isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <div className="space-y-4 mb-12">
            <p className={`text-2xl sm:text-3xl font-light leading-relaxed ${
              isDark ? "text-white" : "text-[#232323]"
            }`}>
              We respond with intention, clarity, and care.
            </p>
            <p className={`text-2xl sm:text-3xl font-light leading-relaxed ${
              isDark ? "text-white/60" : "text-[#6F6F6F]"
            }`}>
              Let's create something meaningful together.
            </p>
          </div>

          <a
            href="mailto:hello@arcosworks.com"
            className={`inline-flex items-center gap-3 px-8 py-4 text-sm font-medium tracking-wider transition-all duration-300 ${
              isDark 
                ? "bg-white text-[#232323] hover:bg-white/90" 
                : "bg-[#232323] text-white hover:bg-[#353535]"
            }`}
          >
            Contact ARCOS
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
