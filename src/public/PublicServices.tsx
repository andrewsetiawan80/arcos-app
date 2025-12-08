import { useState, useEffect } from "react";
import landmarkInstallation from "../assets/images/landmark-installation.webp";
import microcementStairs from "../assets/images/grey-microcement-stairs-stairs-viewed-from-modern-design-innovative-material-metal-railing.webp";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.webp";
import microcementWalls from "../assets/images/minimalist-interior-design-with-concrete-walls-modern-furniture.webp";
import microcementInterior2 from "../assets/images/modern-concrete-interior-design-with-stone-sculptures-steps.webp";
import tile01 from "../assets/images/inspiration/3d-tile-01.webp";
import tile02 from "../assets/images/inspiration/3d-tile-02.webp";
import tile07 from "../assets/images/inspiration/3d-tile-07.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";
import mosaicInterior from "../assets/images/mosaic-interior.webp";
import concreteInstallation from "../assets/images/concrete-installation.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import { api } from "../lib/api";
import { ArcosSectionTwo } from "../components/brand";

interface Service {
  id: number;
  title: string;
  titleId?: string;
  description: string;
  descriptionId?: string;
  category: string;
  categoryId?: string;
  accent: string;
  accentId?: string;
  imageUrl: string;
  points: string[];
  pointsId?: string[];
  displayOrder: number;
}

export default function PublicServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getServices();
        if (res.error) {
          throw new Error(res.error);
        }
        setServices((res.data as Service[]) || []);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError(err instanceof Error ? err.message : "Failed to load services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = Array.from(new Set(services.map(s => s.category)));

  if (loading) {
    return (
      <div className="bg-[#232323] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#232323] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading services</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#232323] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={landmarkInstallation}
              alt="Architectural concrete services"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#232323]/70 via-[#232323]/50 to-[#232323]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Ecosystem of Expertise</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1]">
                Full-spectrum concrete innovation, tailored to your project.
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Arcos delivers Southeast Asia–specific concrete solutions: seamless microcement finishes, polished concrete overlays, terrazzo systems, 3D tiles, and architectural panels—all engineered, fabricated, and installed by our in-house team of mix lab specialists, fabrication experts, and certified installers.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300 max-w-xl">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                <p className="uppercase text-xs tracking-[0.25em] text-white/60 font-semibold mb-2">Delivery Model</p>
                <p>Design-assist, substrate diagnostics, mockups, and on-site supervision backed by digital progress reporting.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                    <p className="uppercase text-xs tracking-[0.25em] text-white/60 font-semibold mb-2">Why Arcos</p>
                <p>Certified applicators, JCtec training lineage, and real-time QA to guarantee the finish you approved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services by Category */}
      {categories.map((category) => {
        const categoryServices = services.filter(s => s.category === category);
        return (
          <section key={category} className="border-b border-white/10 bg-[#353535]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
              <div className="mb-12 space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">{category}</p>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                  {category}
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                  {category === "Seamless Applied Finishes" && "Thin-layer coatings applied directly on-site for seamless, joint-free surfaces"}
                  {category === "Outdoor Applied Finishes" && "Weather-resistant coatings applied on-site for exterior applications"}
                  {category === "Precast Panels & Tiles" && "Prefabricated panels and tiles manufactured off-site, ready for installation"}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {categoryServices.map((service) => (
                  <div
                    key={service.id}
                    className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#353535]/90 backdrop-blur-sm shadow-2xl hover:-translate-y-1.5 hover:border-white/30 transition-all"
                  >
                    {/* Main Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img src={service.imageUrl} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="relative p-8 sm:p-10 flex flex-col gap-8 h-full">
                      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/[0.06] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">
                        <span className="h-2 w-2 rounded-full bg-white/70" />
                        {service.accent}
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase leading-tight">{service.title}</h2>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{service.description}</p>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        {service.points.map((point, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm sm:text-base text-gray-200">
                            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Microcement Project Showcase Section */}
      <section className="border-b border-white/10 bg-[#232323]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              Project Showcase
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Microcement in action
            </h2>
            <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
              Explore real-world microcement applications showcasing seamless floors, walls, and custom finishes in residential and commercial spaces.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Modern Staircase Design",
                location: "Jakarta, Indonesia",
                description: "Seamless microcement stairs with modern design and innovative material application.",
                image: microcementStairs,
                category: "Residential",
              },
              {
                title: "Minimalist Interior",
                location: "Singapore",
                description: "Contemporary microcement interior with seamless floors and walls creating a cohesive space.",
                image: microcementInterior1,
                category: "Residential",
              },
              {
                title: "Concrete Walls & Modern Furniture",
                location: "Melbourne, Australia",
                description: "Minimalist interior design featuring microcement walls with modern furniture integration.",
                image: microcementWalls,
                category: "Commercial",
              },
              {
                title: "Stone Sculptures & Steps",
                location: "Bali, Indonesia",
                description: "Modern concrete interior design with stone sculptures and seamless microcement steps.",
                image: microcementInterior2,
                category: "Hospitality",
              },
              {
                title: "Luxury Staircase",
                location: "Bangkok, Thailand",
                description: "Grey microcement stairs with metal railing creating a sophisticated architectural element.",
                image: microcementStairs,
                category: "Hospitality",
              },
              {
                title: "Contemporary Living Space",
                location: "Jakarta, Indonesia",
                description: "Seamless microcement floors and walls creating a modern, minimalist living environment.",
                image: microcementInterior1,
                category: "Commercial",
              },
            ].map((project, index) => (
              <div key={index} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-xl hover:-translate-y-1.5 hover:border-white/30 transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.24em] text-white/60 font-semibold">/{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{project.category}</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase text-white">{project.title}</h3>
                  <p className="text-sm text-gray-400">{project.location}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Float Concrete Architectural Panels Showcase */}
      <section className="border-b border-white/10 bg-[#353535]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              Architectural Panels & Tiles
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Architectural Panels & Tiles
            </h2>
            <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
              Discover our range of architectural concrete panels and 3D tiles—from feature walls to complete facades, engineered for modern architecture.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* 3D Tiles Feature */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={tile01}
                  alt="3D concrete tiles"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  3D Tiles
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white">
                  3D Concrete Tiles
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Add depth and dimension to your walls with innovative 3D concrete tiles. Multiple patterns available for interior and exterior applications.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Multiple 3D pattern options</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Lightweight and easy installation</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom designs available</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Wall Panels Feature */}
            <div className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={tile02}
                  alt="Concrete wall panels"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-8 space-y-4">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  Wall Panels
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white">
                  Architectural Wall Panels
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  High-performance precast concrete panels for facades and interior feature walls. Custom sizes, textures, and finishes to match your design vision.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Precast precision manufacturing</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom sizes and finishes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Weather-resistant formulations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: "Modular Systems",
                description: "Interlocking tile systems for quick installation and pattern flexibility.",
                image: mosaicFacadeDetail,
              },
              {
                title: "Custom Fabrication",
                description: "Bespoke panels fabricated to your exact specifications and design requirements.",
                image: concreteInstallation,
              },
              {
                title: "Thin Panel Solutions",
                description: "Lightweight thin panels perfect for renovations and retrofit applications.",
                    image: tile01,
              },
            ].map((feature, index) => (
              <div key={index} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="text-xl font-bold uppercase text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floors & Walls Section - Using Brand Layout */}
      <ArcosSectionTwo
        id="microcement-floors"
        label="Floors"
        headline="Microcement Floors"
        subheadline="Seamless, durable floor finishes perfect for residential and commercial spaces. Available in 60+ colors with custom textures and patterns."
        image={microcementInterior2}
        imageAlt="Microcement floors"
        imagePosition="left"
        variant="primary"
        body={
          <ul className="space-y-3 text-sm">
            {["2-3mm thin overlay on existing substrates", "High abrasion resistance for heavy traffic", "Moisture and UV-resistant sealants"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
      />

      <ArcosSectionTwo
        id="microcement-walls"
        label="Walls"
        headline="Microcement Walls"
        subheadline="Transform walls with seamless microcement finishes. Perfect for bathrooms, kitchens, and feature walls with custom textures and colors."
        image={microcementWalls}
        imageAlt="Microcement walls"
        imagePosition="right"
        variant="secondary"
        body={
          <ul className="space-y-3 text-sm">
            {["Seamless application on vertical surfaces", "Water-resistant for wet areas", "Custom textures: smooth, brushed, or textured"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        }
      />

      {/* Applications Section - Moved from Home */}
      <section className="border-b border-white/10 bg-[#353535]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="flex flex-col lg:flex-row lg:items-baseline lg:justify-between gap-8 mb-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Signature Environments</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Crafted to transform every dimension of space.
              </h2>
            </div>
            <p className="max-w-xl text-sm text-gray-300">
              Arcos surfaces and structures land impact—from skyline icons and hospitality environments to bespoke residences and cultural destinations.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-10">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] shadow-2xl group">
              <img
                src={landmarkInstallation}
                alt="Urban landmark facade"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/15 bg-white/[0.08] text-xs uppercase tracking-[0.28em] text-white/70 font-semibold mb-5">
                  <span className="h-2 w-2 rounded-full bg-white/70" />
                  Landmark Installations
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase text-white">
                  Facades & Cultural Icons
                </h3>
                <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                  Parametric panel systems, kinetic fins, and sculptural envelopes engineered in UHPC and GFRC for world-stage architecture.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Hospitality & Lifestyle",
                  image: mosaicInterior,
                  description: "Immersive lobbies, spas, and suites rendered in microcement and modular panels.",
                },
                {
                  title: "Residential Statements",
                  image: mosaicFacadeDetail,
                  description: "Bespoke kitchens, baths, and courtyards formed with seamless surfaces.",
                },
                {
                  title: "Public Realm & Landscape",
                  image: tile07,
                  description: "Sculptural seating, bridges, water features, and wayfinding elements.",
                },
                {
                  title: "Structural Components",
                  image: workshopCloseup,
                  description: "Lightweight yet resilient beams, canopies, and modular shells.",
                },
              ].map((card, index) => (
                <div key={card.title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-xl group">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-40 sm:h-44 object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="p-6 space-y-3">
                    <div className="text-xs uppercase tracking-[0.24em] text-white/60 font-semibold">/{String(index + 1).padStart(2, "0")}</div>
                    <h3 className="text-lg font-bold uppercase text-white">{card.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}




