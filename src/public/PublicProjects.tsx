import { Link } from "react-router-dom";
import { load } from "../store";
import type { Product, Category } from "../types";
import landmarkInstallation from "../assets/images/landmark-installation.jpg";
import mosaicInterior from "../assets/images/mosaic-interior.jpg";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.jpg";
import structuralPanels from "../assets/images/structural-panels.jpg";
import concreteInstallation from "../assets/images/concrete-installation.jpg";
import concreteFinish from "../assets/images/concrete-finish.jpg";
import concreteTexture2 from "../assets/images/concrete-texture-2.jpg";
import concretePanelDetail from "../assets/images/concrete-panel-detail.jpg";
import workshopCloseup from "../assets/images/workshop-closeup.jpg";
import microcementInterior1 from "../assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg";

type FeaturedProject = {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  slug?: string;
};

const FEATURED_PROJECTS: FeaturedProject[] = [
  {
    id: "residential-microcement",
    title: "Residential Microcement",
    category: "Residential",
    image: microcementInterior1,
    description: "Seamless microcement floors and walls in a modern Jakarta residence.",
  },
  {
    id: "commercial-facade",
    title: "Commercial Facade System",
    category: "Commercial",
    image: landmarkInstallation,
    description: "UHPC facade panels for a landmark commercial building.",
  },
  {
    id: "hospitality-spa",
    title: "Hospitality Spa",
    category: "Hospitality",
    image: concreteFinish || mosaicFacadeDetail,
    description: "Microcement finishes for a luxury spa and wellness center.",
  },
  {
    id: "terrazzo-flooring",
    title: "Terrazzo Flooring",
    category: "Commercial",
    image: concreteTexture2,
    description: "Custom terrazzo flooring system for retail spaces.",
  },
  {
    id: "structural-panels",
    title: "Structural GFRC Panels",
    category: "Architectural",
    image: structuralPanels,
    description: "Lightweight GFRC panels for complex architectural forms.",
  },
  {
    id: "outdoor-terrace",
    title: "Outdoor Terrace",
    category: "Outdoor",
    image: mosaicFacadeDetail,
    description: "Weather-resistant microcement for outdoor terraces and patios.",
  },
];

export default function PublicProjects() {
  const state = load();
  const products: Product[] = state.products || [];
  const categories: Category[] = state.categories || [];

  const published = products.filter((p) => !!p.public && !!p.slug);

  const display = published.length > 0 ? published : FEATURED_PROJECTS;

  const categoryName = (slug?: string) => categories.find((c) => c.slug === slug)?.name;

  return (
    <div className="bg-[#131313] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={landmarkInstallation}
              alt="Arqon projects portfolio"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/70 via-[#131313]/50 to-[#131313]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className="space-y-4 max-w-3xl">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Project Portfolio</p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
                Built references for seamless finishes, terrazzo systems, and architectural façades.
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                     Explore completed spaces featuring our seamless microcement interiors, terrazzo systems, polished concrete overlays, architectural panels, and 3D tiles—all engineered and fabricated in our workshop.
              </p>
            </div>
            <div className="text-sm text-gray-400 max-w-md">
              Looking for something specific?{" "}
              <Link to="/catalog" className="underline hover:text-white transition-colors">
                Browse the catalog
              </Link>{" "}
              or{" "}
              <Link to="/contact" className="underline hover:text-white transition-colors">
                contact us
              </Link>{" "}
              for a tailored case study.
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="border-b border-white/10 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {display.map((project, index) => {
              const isProduct = "coverImageUrl" in project;
              const projectImage = isProduct ? (project as Product).coverImageUrl : (project as FeaturedProject).image;
              const projectCategory = isProduct
                ? (project as Product).categorySlug
                  ? categoryName((project as Product).categorySlug)
                  : undefined
                : (project as FeaturedProject).category;
              const projectSlug = isProduct ? (project as Product).slug : (project as FeaturedProject).slug || project.id;

              return (
                <Link
                  key={project.id}
                  to={projectSlug ? `/product/${projectSlug}` : "#"}
                  className={[
                    "relative group border border-white/10 bg-black hover:border-white/30 transition-all overflow-hidden rounded-3xl hover:-translate-y-1.5",
                    projectImage ? "" : "pointer-events-none",
                    index === 0 ? "sm:col-span-2 lg:col-span-1" : "",
                  ].join(" ")}
                >
                  <div className={["w-full bg-black hover-zoom", index === 0 ? "aspect-[21/9]" : "aspect-[4/3]"].join(" ")}>
                    {projectImage ? (
                      <img
                        src={projectImage}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02]" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-end p-5 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    <div className="w-full">
                      <h2 className="text-lg sm:text-xl font-bold uppercase mb-1 break-words">{project.title}</h2>
                      {projectCategory && (
                        <span className="text-xs uppercase tracking-[0.2em] text-gray-400">{projectCategory}</span>
                      )}
                      {!isProduct && (project as FeaturedProject).description && (
                        <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-2">{(project as FeaturedProject).description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Project Solutions Section - Moved from Home */}
      <section className="border-b border-white/10 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              Solutions by Project Type
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Tailored solutions for every project
            </h2>
            <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
              From residential renovations to commercial installations, we provide specialized solutions for each project type.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Residential",
                image: mosaicInterior,
                description: "Homes, apartments, and private spaces",
                applications: ["Floors & walls", "Bathrooms & kitchens", "Outdoor patios"],
              },
              {
                title: "Commercial",
                image: concreteInstallation || landmarkInstallation,
                description: "Retail, offices, and public spaces",
                applications: ["Lobbies & corridors", "Retail floors", "Restaurant interiors"],
              },
              {
                title: "Hospitality",
                image: concreteFinish || mosaicFacadeDetail,
                description: "Hotels, spas, and restaurants",
                applications: ["Spa treatments", "Hotel suites", "Dining areas"],
              },
              {
                title: "Outdoor",
                image: concretePanelDetail || structuralPanels,
                description: "Patios, terraces, and exterior surfaces",
                applications: ["Terrace floors", "Pool surrounds", "Outdoor walls"],
              },
              {
                title: "Industrial",
                image: workshopCloseup,
                description: "Workshops, warehouses, and production areas",
                applications: ["Durable floors", "Utility surfaces", "Heavy-duty finishes"],
              },
              {
                title: "Custom",
                image: concreteTexture2,
                description: "Bespoke projects and unique requirements",
                applications: ["Custom colors", "Special textures", "Designer finishes"],
              },
            ].map((solution, index) => (
              <div key={solution.title} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-xl">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/60 font-semibold">/{String(index + 1).padStart(2, "0")}</div>
                  <h3 className="text-xl font-bold uppercase text-white">{solution.title}</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{solution.description}</p>
                  <ul className="space-y-2 pt-2 border-t border-white/10">
                    {solution.applications.map((app) => (
                      <li key={app} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

             {/* Project Types & Applications */}
             <section className="border-b border-white/10 bg-[#131313]">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
                 <div className="mb-12 space-y-4">
                   <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
                     Applications
                   </p>
                   <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                     Where our solutions excel
                   </h2>
                   <p className="text-gray-300 max-w-2xl text-base sm:text-lg">
                     From residential renovations to commercial landmarks, our concrete solutions transform spaces across diverse applications.
                   </p>
                 </div>

                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                   {[
                     {
                       category: "Residential",
                       applications: ["Homes & Apartments", "Bathrooms & Kitchens", "Outdoor Terraces", "Feature Walls"],
                       description: "Seamless microcement and custom finishes for modern living spaces.",
                     },
                     {
                       category: "Commercial",
                       applications: ["Retail Spaces", "Office Lobbies", "Restaurants", "Showrooms"],
                       description: "Durable, high-traffic solutions for commercial environments.",
                     },
                     {
                       category: "Hospitality",
                       applications: ["Hotels & Resorts", "Spas & Wellness", "Restaurants", "Lounges"],
                       description: "Luxury finishes that create memorable guest experiences.",
                     },
                     {
                       category: "Institutional",
                       applications: ["Museums", "Cultural Centers", "Educational Facilities", "Healthcare"],
                       description: "Sophisticated surfaces for public and institutional spaces.",
                     },
                     {
                       category: "Exterior",
                       applications: ["Facades", "Terraces", "Pool Surrounds", "Landscape Features"],
                       description: "Weather-resistant systems for outdoor applications.",
                     },
                     {
                       category: "Custom",
                       applications: ["Sculptural Elements", "Art Installations", "Bespoke Designs", "Special Projects"],
                       description: "Unique solutions for one-of-a-kind architectural visions.",
                     },
                   ].map((type) => (
                     <div key={type.category} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 space-y-4">
                       <h3 className="text-xl font-bold text-white uppercase">{type.category}</h3>
                       <p className="text-sm text-gray-300 leading-relaxed">{type.description}</p>
                       <ul className="space-y-2 pt-4 border-t border-white/10">
                         {type.applications.map((app) => (
                           <li key={app} className="flex items-center gap-2 text-xs text-gray-400">
                             <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                             {app}
                           </li>
                         ))}
                       </ul>
                     </div>
                   ))}
                 </div>
               </div>
             </section>

             {/* CTA Section */}
             <section className="bg-[#0B0B0B]">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
                 <div className="text-center space-y-6">
                   <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                     Ready to start your project?
                   </h2>
                   <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
                     Let's discuss how we can bring your vision to life with our premium concrete solutions.
                   </p>
                   <div className="flex flex-wrap justify-center gap-4">
                     <Link
                       to="/contact"
                       className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] hover-lift shadow-lg shadow-black/20"
                     >
                       Get in Touch
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                       </svg>
                     </Link>
                     <Link
                       to="/catalog"
                       className="inline-flex items-center gap-2 px-8 py-4 bg-[#2A2A2A] border border-white/10 text-white text-sm font-bold uppercase tracking-[0.18em] hover:bg-[#333333] transition-all min-h-[52px]"
                     >
                       View Catalog
                     </Link>
                   </div>
                 </div>
               </div>
             </section>
           </div>
         );
       }
