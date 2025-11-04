import React, { useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { load } from "../store";
import type { Product, Category } from "../types";
import { useFadeIn } from "../utils/useAnimation";

function categoryName(slug?: string, categories: Category[] = []) {
  return categories.find((c) => c.slug === slug)?.name;
}

export default function PublicHome() {
  const state = load();
  const site = state.settings?.site || {};
  const products: Product[] = state.products || [];
  const categories: Category[] = state.categories || [];

  const heroTitle = site.heroTitle || "ARCHITECTURAL CONCRETE, REFINED.";
  const heroSubtitle =
    site.heroSubtitle ||
    "UHPC & GFRC panels, modular tiles, and microcement finishes — engineered for strength, durability, and beauty.";

  // Only show featured items that are published AND have a slug
  const featured = useMemo(
    () => products.filter((p) => !!p.public && !!p.featured && !!p.slug),
    [products]
  );

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
  const processAnim = useFadeIn({ delay: 400 });
  const specsAnim = useFadeIn({ delay: 500 });
  const applicationsAnim = useFadeIn({ delay: 600 });
  const projectsAnim = useFadeIn({ delay: 700 });
  const testimonialsAnim = useFadeIn({ delay: 800 });
  const contactAnim = useFadeIn({ delay: 900 });

  return (
    <div className="bg-[#1A1A1A] text-white">
      {/* ===== HERO ===== */}
      <section className="relative border-b border-white/10 overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 opacity-30">
          <img
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover parallax-bg"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] via-[#1A1A1A]/80 to-[#1A1A1A]" />
        </div>
        
        <div ref={heroRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 md:pt-40 pb-16 sm:pb-28 md:pb-36 opacity-0">
          <div className="max-w-4xl">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[1.05] tracking-tight break-words animate-fade-in-down">
              {heroTitle}
            </h1>
            <p className="mt-4 sm:mt-6 text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl animate-fade-in-up stagger-1">
              {heroSubtitle}
            </p>
            <div className="mt-6 sm:mt-10 flex flex-wrap gap-3 sm:gap-4 animate-fade-in-up stagger-2">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors min-h-[44px] touch-manipulation"
              >
                Learn More
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors min-h-[44px] touch-manipulation"
              >
                Contact
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="border-b border-white/10">
        <div ref={aboutAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${aboutAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
                Welcome to Castura
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-4 sm:mb-6">
                New Heights in the World of Concrete Fabrication
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-4 sm:mb-6">
                With decades of experience in architectural concrete, we specialize in creating 
                precision-engineered products that combine exceptional strength with aesthetic beauty. 
                Our expertise spans UHPC panels, GFRC systems, modular tiles, and custom microcement 
                finishes for residential, commercial, and institutional projects.
              </p>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                Since 1989, we've been pushing the boundaries of what's possible with concrete, 
                delivering innovative solutions that stand the test of time.
              </p>
            </div>
            <div className="relative aspect-[4/3] order-1 lg:order-2 hover-zoom">
              <img
                src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
                alt="Concrete fabrication facility"
                className="w-full h-full object-cover opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" className="border-b border-white/10">
        <div ref={servicesAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${servicesAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="mb-8 sm:mb-12 md:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              What We Offer
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Services
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { 
                title: "UHPC Panels", 
                desc: "Ultra-high performance concrete panels with compressive strength exceeding 150 MPa. Ideal for facades, cladding, and structural applications requiring exceptional durability and aesthetic precision.",
                image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                features: ["150+ MPa strength", "Custom sizes", "Various finishes"]
              },
              { 
                title: "GFRC Systems", 
                desc: "Glass fiber reinforced concrete delivering lightweight yet durable architectural elements. Perfect for large-scale projects requiring strength-to-weight optimization and design flexibility.",
                image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                features: ["Lightweight", "High flexibility", "Weather resistant"]
              },
              { 
                title: "Modular Tiles", 
                desc: "Precision-cast modular tiles engineered for flooring, walls, and decorative surfaces. Available in multiple sizes, textures, and finishes to match any design aesthetic.",
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
                features: ["Multiple sizes", "Easy installation", "Durable finish"]
              },
              { 
                title: "Microcement Finishes", 
                desc: "Seamless, contemporary microcement applications for both interiors and exteriors. Creates a modern, continuous surface with exceptional durability and minimal maintenance.",
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
                features: ["Seamless finish", "Low maintenance", "Versatile colors"]
              },
              { 
                title: "Custom Fabrication", 
                desc: "Tailored solutions for unique architectural requirements and specifications. From complex geometries to specialized performance needs, we bring your vision to life.",
                image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                features: ["Bespoke design", "Complex geometries", "Technical support"]
              },
            ].map((service, i) => (
              <div 
                key={i} 
                className={`group border border-white/10 hover:border-white/20 transition-all overflow-hidden hover-lift flex flex-col ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''} ${servicesAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'}`}
                style={{ animationDelay: servicesAnim.isVisible ? `${i * 0.1}s` : '0s' }}
              >
                <div className="aspect-[16/10] relative overflow-hidden hover-zoom flex-shrink-0">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="p-4 sm:p-6 bg-[#2A2A2A] flex-1 flex flex-col">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold uppercase mb-3">{service.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4 flex-1">{service.desc}</p>
                  {service.features && (
                    <ul className="space-y-1">
                      {service.features.map((feature, fi) => (
                        <li key={fi} className="text-xs text-gray-400 flex items-center gap-2">
                          <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section id="process" className="border-b border-white/10 bg-[#1A1A1A]">
        <div ref={processAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${processAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Our Process
            </h2>
            <p className="mt-4 sm:mt-6 text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
              From initial consultation to final installation, we guide you through every step of your project.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Consultation",
                desc: "We discuss your vision, requirements, and project specifications to understand your needs.",
                icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              },
              {
                step: "02",
                title: "Design & Engineering",
                desc: "Our team creates detailed designs and engineering calculations to ensure optimal performance.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              },
              {
                step: "03",
                title: "Fabrication",
                desc: "Precision manufacturing in our state-of-the-art facility using advanced concrete technology.",
                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              },
              {
                step: "04",
                title: "Installation",
                desc: "Professional installation by certified teams ensuring perfect execution on-site.",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            ].map((item, i) => (
              <div 
                key={i}
                className={`text-center ${processAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'}`}
                style={{ animationDelay: processAnim.isVisible ? `${i * 0.15}s` : '0s' }}
              >
                <div className="mb-4 sm:mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/20 bg-[#2A2A2A] mb-4">
                    <span className="text-2xl sm:text-3xl font-black text-white">{item.step}</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold uppercase mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TECHNICAL SPECIFICATIONS ===== */}
      <section id="specifications" className="border-b border-white/10 bg-[#1A1A1A]">
        <div ref={specsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${specsAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              Technical Excellence
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Specifications
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: "Compressive Strength",
                value: "150+ MPa",
                desc: "Exceptional structural integrity for demanding applications"
              },
              {
                title: "Flexural Strength",
                value: "25+ MPa",
                desc: "Superior resistance to bending and deformation"
              },
              {
                title: "Density",
                value: "2,400 kg/m³",
                desc: "Optimized weight-to-strength ratio for efficiency"
              },
              {
                title: "Water Absorption",
                value: "< 0.5%",
                desc: "Minimal water ingress for long-term durability"
              },
              {
                title: "Freeze-Thaw",
                value: "300+ Cycles",
                desc: "Excellent resistance to extreme temperature variations"
              },
              {
                title: "Fire Rating",
                value: "A1 Class",
                desc: "Non-combustible material meeting highest safety standards"
              }
            ].map((spec, i) => (
              <div 
                key={i}
                className={`border border-white/10 bg-[#2A2A2A] p-6 sm:p-8 hover:border-white/20 transition-all hover-lift ${specsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'}`}
                style={{ animationDelay: specsAnim.isVisible ? `${i * 0.1}s` : '0s' }}
              >
                <div className="text-3xl sm:text-4xl font-black text-white mb-2">{spec.value}</div>
                <h3 className="text-base sm:text-lg font-bold uppercase mb-2 text-gray-200">{spec.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== APPLICATIONS ===== */}
      <section id="applications" className="border-b border-white/10 bg-[#1A1A1A]">
        <div ref={applicationsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${applicationsAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              Versatile Applications
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Where Our Products Excel
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Facades & Cladding",
                image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                desc: "Modern building exteriors"
              },
              {
                title: "Interior Surfaces",
                image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
                desc: "Walls, floors, and ceilings"
              },
              {
                title: "Landscape Design",
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
                desc: "Outdoor installations"
              },
              {
                title: "Structural Elements",
                image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                desc: "Load-bearing components"
              }
            ].map((app, i) => (
              <div 
                key={i}
                className={`group relative overflow-hidden hover-lift ${applicationsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'}`}
                style={{ animationDelay: applicationsAnim.isVisible ? `${i * 0.1}s` : '0s' }}
              >
                <div className="aspect-[4/5] relative overflow-hidden hover-zoom">
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold uppercase mb-1">{app.title}</h3>
                      <p className="text-xs text-gray-300 uppercase tracking-wider">{app.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      <section id="projects" className="border-b border-white/10">
        <div ref={projectsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${projectsAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 mb-8 sm:mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
                Featured Work
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
                Our Projects
              </h2>
            </div>
            <Link 
              to="/catalog" 
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors min-h-[44px] touch-manipulation self-start sm:self-auto"
            >
              View All
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Default featured projects with beautiful images */}
              {[
                {
                  title: "Modern Facade Panels",
                  category: "UHPC Systems",
                  image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                  big: true
                },
                {
                  title: "Interior Tile Collection",
                  category: "Modular Tiles",
                  image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
                  big: false
                },
                {
                  title: "Custom Microcement Finish",
                  category: "Finishes",
                  image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
                  big: false
                },
                {
                  title: "Structural GFRC Elements",
                  category: "GFRC Systems",
                  image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                  big: false
                },
                {
                  title: "Commercial Installation",
                  category: "Projects",
                  image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop",
                  big: false
                },
              ].map((project, i) => (
                <div
                  key={i}
                  className={[
                    "group relative overflow-hidden hover-lift",
                    project.big ? "sm:col-span-2" : "",
                    projectsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0',
                  ].join(" ")}
                  style={{ animationDelay: projectsAnim.isVisible ? `${i * 0.1}s` : '0s' }}
                >
                  <div
                    className={[
                      "w-full bg-black hover-zoom",
                      project.big ? "aspect-[21/9] sm:aspect-[21/9]" : "aspect-[4/3]",
                    ].join(" ")}
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-end p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                    <div className="w-full">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase mb-1 break-words">
                        {project.title}
                      </h3>
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className={[
                    "group relative overflow-hidden hover-lift",
                    i % 5 === 0 ? "sm:col-span-2" : "",
                    projectsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0',
                  ].join(" ")}
                  style={{ animationDelay: projectsAnim.isVisible ? `${i * 0.1}s` : '0s' }}
                >
                  <div
                    className={[
                      "w-full bg-black hover-zoom",
                      i % 5 === 0 ? "aspect-[21/9] sm:aspect-[21/9]" : "aspect-[4/3]",
                    ].join(" ")}
                  >
                    {p.coverImageUrl ? (
                      <img
                        src={p.coverImageUrl}
                        alt={p.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
                        alt={p.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-end p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                    <div className="w-full">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold uppercase mb-1 break-words">
                        {p.title}
                      </h3>
                      {p.categorySlug && (
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                          {categoryName(p.categorySlug, categories)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="border-b border-white/10 bg-[#1A1A1A]">
        <div ref={testimonialsAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${testimonialsAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              Client Stories
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "The quality and precision of Castura's UHPC panels exceeded our expectations. The installation was seamless and the final result is stunning.",
                author: "Sarah Chen",
                role: "Project Architect",
                company: "Modern Architecture Studio",
                project: "Commercial Tower, Jakarta"
              },
              {
                quote: "Working with Castura transformed our design vision into reality. Their expertise in custom fabrication allowed us to create unique architectural elements.",
                author: "Michael Rodriguez",
                role: "Lead Designer",
                company: "Urban Design Collective",
                project: "Residential Complex, Bali"
              },
              {
                quote: "The durability and aesthetic appeal of their products is unmatched. Our clients are consistently impressed with the finish quality.",
                author: "David Kim",
                role: "Construction Manager",
                company: "Premium Builders Group",
                project: "Hotel Renovation, Singapore"
              }
            ].map((testimonial, i) => (
              <div 
                key={i}
                className={`border border-white/10 bg-[#2A2A2A] p-6 sm:p-8 hover:border-white/20 transition-all hover-lift ${testimonialsAnim.isVisible ? `animate-fade-in-up stagger-${Math.min(i + 1, 6)}` : 'opacity-0'}`}
                style={{ animationDelay: testimonialsAnim.isVisible ? `${i * 0.15}s` : '0s' }}
              >
                <div className="mb-4">
                  <svg className="w-8 h-8 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10z"/>
                  </svg>
                  <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="font-bold text-white text-sm sm:text-base">{testimonial.author}</div>
                  <div className="text-gray-400 text-xs sm:text-sm mt-1">{testimonial.role}</div>
                  <div className="text-gray-500 text-xs mt-1">{testimonial.company}</div>
                  <div className="text-gray-400 text-xs mt-2 uppercase tracking-wider">{testimonial.project}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="border-b border-white/10 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: "35+", label: "Years Experience" },
              { number: "500+", label: "Projects Completed" },
              { number: "50+", label: "Countries Served" },
              { number: "98%", label: "Client Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-2 sm:mb-3">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm uppercase tracking-wider text-gray-400 font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="border-b border-white/10 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover parallax-bg"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#1A1A1A]" />
        </div>
        
        <div ref={contactAnim.ref} className={`relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 md:py-28 ${contactAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="max-w-4xl">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-3 sm:mb-4">
              Get in Touch
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-6 sm:mb-8">
              Contact
            </h2>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
              Tell us about your project—sizes, finish, and timeline. We'll get back with samples 
              and a tailored quotation.
            </p>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-8 sm:mb-10">
              <a
                href="mailto:hello@castura.com"
                className="block px-4 sm:px-6 py-4 bg-[#2A2A2A] border border-white/10 hover:bg-[#333333] transition-colors min-h-[44px] touch-manipulation hover-lift"
              >
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Email</div>
                <div className="text-white font-medium text-sm sm:text-base break-all sm:break-normal">hello@castura.com</div>
              </a>
              <div className="px-4 sm:px-6 py-4 bg-[#2A2A2A] border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Location</div>
                <div className="text-white font-medium text-sm sm:text-base">Jakarta, Indonesia</div>
              </div>
              <div className="px-4 sm:px-6 py-4 bg-[#2A2A2A] border border-white/10">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Phone</div>
                <div className="text-white font-medium text-sm sm:text-base">+62 21 1234 5678</div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-black text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors min-h-[44px] touch-manipulation"
              >
                Request Sample
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="mailto:hello@castura.com"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#2A2A2A] border border-white/10 text-white text-sm sm:text-base font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors min-h-[44px] touch-manipulation"
              >
                Get Quote
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
