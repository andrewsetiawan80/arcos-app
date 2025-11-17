import { useState, useEffect } from "react";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.jpg";
import workshopCloseup from "../assets/images/workshop-closeup.jpg";
import { api } from "../lib/api";

interface Milestone {
  id: number;
  year: string;
  headline: string;
  headlineId?: string;
  detail: string;
  detailId?: string;
  displayOrder: number;
}

interface Highlight {
  id: number;
  title: string;
  titleId?: string;
  detail: string;
  detailId?: string;
  displayOrder: number;
}

export default function PublicAbout() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [milestonesRes, highlightsRes] = await Promise.all([
          api.getMilestones(),
          api.getHighlights(),
        ]);
        if (milestonesRes.error) {
          throw new Error(milestonesRes.error);
        }
        if (highlightsRes.error) {
          throw new Error(highlightsRes.error);
        }
        setMilestones((milestonesRes.data as Milestone[]) || []);
        setHighlights((highlightsRes.data as Highlight[]) || []);
      } catch (err) {
        console.error("Failed to fetch about data:", err);
        setError(err instanceof Error ? err.message : "Failed to load about data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1A1A1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading content</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#1A1A1A] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={mosaicFacadeDetail}
              alt="About Arqon"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/70 via-[#1A1A1A]/50 to-[#1A1A1A]/70" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              About Arqon
              <span className="h-px w-16 bg-white/20" />
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-[1]">
              Engineered concrete artistry for visionaries.
            </h1>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed">
              Arqon formed in 2025 when a collective of materials scientists, architects, and fabrication engineers set out to collapse
              the gap between avant-garde design intent and construction reality.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 grid gap-12 lg:gap-16 xl:gap-20 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">
              About Arqon
              <span className="h-px w-16 bg-white/20" />
            </p>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              We specialise in seamless microcement finishes, polished concrete overlays, terrazzo systems, architectural panels, and 3D tiles—all engineered, fabricated, and delivered through one accountable partner.
            </p>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              From laboratory mix development to on-site installation, our team balances strength, durability, and aesthetic precision.
              Designers come to us when they need the craftsmanship and scientific rigour to make ambitious spaces possible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                label: "Material Lab",
                description: "UHPC, GFRC, and microtopping formulations tuned for climate, performance, and finish.",
              },
              {
                label: "Fabrication & Delivery",
                description: "Parametric modelling flows into robotic casting, modular molds, logistics, and install supervision.",
              },
            ].map((feature) => (
              <div key={feature.label} className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 shadow-lg">
                <p className="text-sm uppercase tracking-[0.25em] text-white/60 font-semibold">{feature.label}</p>
                <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-lg">
                <div className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold">{milestone.year}</div>
                <p className="mt-2 text-sm font-semibold text-white">{milestone.headline}</p>
                <p className="mt-2 text-sm text-gray-300 leading-relaxed">{milestone.detail}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50 font-semibold">{item.title}</p>
                <p className="mt-2 text-sm sm:text-base text-white font-semibold">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[40px] overflow-hidden border border-white/10 shadow-[0_40px_120px_-60px_rgba(0,0,0,0.8)]">
            <img
              src={mosaicFacadeDetail}
              alt="Arqon fabrication team preparing UHPC panels"
              className="w-full h-[480px] object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-transparent to-transparent" />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.08] backdrop-blur-lg shadow-2xl px-6 py-6">
              <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-4">What We Make</p>
              <ul className="space-y-3 text-sm text-gray-200">
                {["Seamless microcement coatings", "Polished concrete overlays", "Terrazzo systems", "3D concrete tiles", "Architectural wall panels"].map((cap) => (
                  <li key={cap} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.08] backdrop-blur-lg shadow-2xl px-6 py-6">
              <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-4">How We Work</p>
              <ul className="space-y-3 text-sm text-gray-200">
                {["Six specialised workshop zones", "3 dedicated curing lines", "24/7 quality control & reporting"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.7)]">
            <img
              src={workshopCloseup}
              alt="Arqon laboratory engineers testing concrete mixes"
              className="w-full h-64 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Company Values & Culture */}
      <section className="border-b border-white/10 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Our Values</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              What drives us
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              Our commitment to excellence, innovation, and sustainability guides every project we undertake.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Precision",
                description: "Every mix, every panel, every installation meets exacting standards. We measure twice, fabricate once.",
              },
              {
                title: "Innovation",
                description: "We push boundaries in material science and fabrication techniques to deliver solutions others can't.",
              },
              {
                title: "Sustainability",
                description: "Our formulations reduce environmental impact while maintaining uncompromising performance.",
              },
              {
                title: "Partnership",
                description: "We work alongside architects and designers as true collaborators, not just suppliers.",
              },
            ].map((value) => (
              <div key={value.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 space-y-3">
                <h3 className="text-xl font-bold text-white uppercase">{value.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Training */}
      <section className="border-b border-white/10 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Certifications & Training</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Certified excellence
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                Our team undergoes rigorous training and certification programs to ensure every installation meets international standards.
              </p>
              <div className="space-y-4">
                {[
                  "Certified Applicators",
                  "JCtec Training Lineage",
                  "ISO 9001 Quality Management",
                  "Sustainable Material Certifications",
                  "Regional Building Code Compliance",
                ].map((cert) => (
                  <div key={cert} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-300">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-4">Training Programs</p>
                <p className="text-sm text-gray-300 leading-relaxed mb-4">
                  We offer comprehensive training programs for applicators, ensuring consistent quality across all installations.
                </p>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    On-site applicator certification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    Technical workshops and seminars
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                    Continuous education programs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Specifications Section - Moved from Home */}
      <section id="specifications" className="border-b border-white/10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 mb-16">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Material Performance Index</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Numbers that unlock architectural freedom.
              </h2>
            </div>
            <div className="max-w-xl text-sm text-gray-300">
              Precision data informs every specification. Our lab continuously profiles mix behaviour to guarantee repeatable results on site.
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 lg:gap-12">
            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              {[
                { title: "Compressive Strength", value: "150–180 MPa", detail: "Ultra-high performance, load-bearing ready." },
                { title: "Flexural Strength", value: "25–35 MPa", detail: "Resists cracking on cantilevers and long spans." },
                { title: "Density", value: "2,200–2,450 kg/m³", detail: "Optimized for mass vs. performance balance." },
                { title: "Water Absorption", value: "< 3%", detail: "Moisture resistant even in tropical climates." },
                { title: "Thermal Tolerance", value: "≤ 500°C", detail: "Stable under heat, fire, and thermal cycling." },
                { title: "Surface Profiles", value: "50+ finishes", detail: "Microtextures, pigments, and metallic inlays." },
              ].map((metric, index) => (
                <div key={metric.title} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-sm shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/50 font-semibold">{metric.title}</p>
                    <span className="text-white/15 text-lg font-bold">/{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="mt-5">
                    <div className="text-3xl sm:text-4xl font-black text-white">{metric.value}</div>
                    <p className="mt-3 text-sm text-gray-300 leading-relaxed">{metric.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1F1F1F] via-[#111] to-black p-8 sm:p-10 shadow-2xl">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold mb-6">
                Mix Intelligence Snapshot
              </p>
              <div className="space-y-6 text-sm text-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Shrinkage Control</span>
                  <span className="text-white font-semibold">≤ 0.035%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Elastic Modulus</span>
                  <span className="text-white font-semibold">45 GPa</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Fire Rating</span>
                  <span className="text-white font-semibold">2 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Sustainability Index</span>
                  <span className="text-white font-semibold">-18% CO₂</span>
                </div>
              </div>
              <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold">Signature Systems</p>
                  <p className="mt-2 text-sm text-gray-200">
                    Arqon UHPC-X, GFRC-Aero, and Microveil surfaces engineered for bespoke interiors and exterior envelopes.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold">Quality Safeguards</p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      Continuous strength monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      Batch traceability + digital logs
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      On-site calibration & testing
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


