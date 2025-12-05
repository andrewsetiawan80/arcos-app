import React from "react";
import mixDesign from "../assets/images/mix-design.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import workshopCloseup from "../assets/images/workshop-closeup.webp";
import landmarkInstallation from "../assets/images/landmark-installation.webp";

const PHASES = [
  {
    step: "01",
    title: "Design & Planning",
    description: "We work with you to understand your vision and requirements. Strategic workshops to decode vision, environmental context, timelines, and performance criteria.",
    image: mixDesign,
    details: ["Vision scoping", "Material benchmarking", "Timeline architecture"],
  },
  {
    step: "02",
    title: "Material Engineering",
    description: "Custom mixes tailored to your project's needs. Computational design, parametric modelling, and structural simulations feed directly into fabrication logic.",
    image: structuralPanels,
    details: ["BIM + parametric sync", "Tolerance choreography", "Assembly sequencing"],
  },
  {
    step: "03",
    title: "Fabrication",
    description: "Precision manufacturing in our workshop. Robotics, CNC milling, and tailored mix production operate in parallel streams to compress schedules.",
    image: workshopCloseup,
    details: ["Robotic milling", "Precision casting", "Smart curing cycles"],
  },
  {
    step: "04",
    title: "Installation",
    description: "Expert on-site installation and support. Global logistics, white-glove installation, and post-install monitoring ensure the design performs for decades.",
    image: landmarkInstallation,
    details: ["Installation command unit", "Performance commissioning", "Lifecycle support"],
  },
];

export default function PublicProcess() {
  return (
    <div className="bg-[#1A1A1A] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={workshopCloseup}
              alt="Arcos fabrication process"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/70 via-[#1A1A1A]/50 to-[#1A1A1A]/70" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">How We Work</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              From concept to completion
            </h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Every engagement follows an integrated workflow, aligning concept, material engineering, digital fabrication, and delivery into one continuous rhythm.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="border-b border-white/10 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PHASES.map((phase) => (
              <div key={phase.step} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl hover:-translate-y-1.5 hover:border-white/30 transition-all">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={phase.image}
                    alt={phase.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold">
                    {phase.step}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white uppercase leading-tight">
                    {phase.title}
                  </h2>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {phase.description}
                  </p>
                  <ul className="space-y-2 pt-4 border-t border-white/10">
                    {phase.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Workflow */}
      <section className="border-b border-white/10 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Detailed Workflow</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Every step, every detail
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg">
              Our comprehensive process ensures quality at every stage, from initial consultation to final handover.
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                phase: "Phase 1: Discovery & Design",
                timeline: "Weeks 1-3",
                activities: [
                  "Initial consultation and site visit",
                  "Design intent workshops",
                  "Material selection and benchmarking",
                  "Technical feasibility studies",
                  "3D modeling and visualization",
                  "Budget and timeline planning",
                ],
              },
              {
                phase: "Phase 2: Engineering & Prototyping",
                timeline: "Weeks 4-8",
                activities: [
                  "Custom mix development",
                  "Laboratory testing and validation",
                  "Mockup fabrication",
                  "Client approval process",
                  "Production planning",
                  "Quality control protocols",
                ],
              },
              {
                phase: "Phase 3: Fabrication",
                timeline: "Weeks 9-16",
                activities: [
                  "Precision mold creation",
                  "Batch production",
                  "Curing and finishing",
                  "Quality inspections",
                  "Packaging and logistics",
                  "Progress reporting",
                ],
              },
              {
                phase: "Phase 4: Installation & Handover",
                timeline: "Weeks 17-20",
                activities: [
                  "Site preparation",
                  "Professional installation",
                  "Final quality checks",
                  "Client walkthrough",
                  "Documentation delivery",
                  "Warranty and support",
                ],
              },
            ].map((phase, index) => (
              <div key={index} className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-2">
                      {phase.timeline}
                    </div>
                    <h3 className="text-2xl font-bold text-white uppercase">{phase.phase}</h3>
                  </div>
                  <div className="text-4xl font-black text-white/20">/{String(index + 1).padStart(2, "0")}</div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {phase.activities.map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-300">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance */}
      <section className="border-b border-white/10 bg-[#0B0B0B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Quality Assurance</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
                Rigorous testing at every stage
              </h2>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
                Our multi-layered quality assurance process ensures every product meets or exceeds specifications before leaving our facility.
              </p>
              <div className="space-y-4">
                {[
                  "Batch testing for strength and consistency",
                  "Dimensional accuracy verification",
                  "Surface finish quality checks",
                  "Environmental resistance testing",
                  "On-site installation verification",
                ].map((check) => (
                  <div key={check} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-300">{check}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] p-8 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/60 font-semibold mb-4">Quality Metrics</p>
                <div className="space-y-4">
                  {[
                    { label: "Dimensional Tolerance", value: "±1mm" },
                    { label: "Surface Flatness", value: "≤2mm/3m" },
                    { label: "Color Consistency", value: "ΔE ≤ 2" },
                    { label: "Defect Rate", value: "<0.1%" },
                  ].map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-sm text-gray-300">{metric.label}</span>
                      <span className="text-sm font-bold text-white">{metric.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-b border-white/10 bg-[#131313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 md:py-32">
          <div className="text-center mb-12 space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Why Arcos</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase leading-tight">
              Integrated expertise, seamless delivery
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "One Partner",
                description: "From concept to installation, one accountable team handles every aspect of your project.",
              },
              {
                title: "Material Science",
                description: "Proprietary mixes engineered for your specific climate, performance, and aesthetic requirements.",
              },
              {
                title: "Certified Installers",
                description: "Trained applicators ensure every installation meets our exacting quality standards.",
              },
              {
                title: "Digital Integration",
                description: "BIM-ready workflows and parametric design tools streamline collaboration and reduce errors.",
              },
              {
                title: "Global Reach",
                description: "Projects across Southeast Asia with local expertise and international quality standards.",
              },
              {
                title: "Sustainability Focus",
                description: "Eco-friendly formulations and processes that reduce environmental impact without compromising performance.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 space-y-3">
                <h3 className="text-lg font-bold text-white uppercase">{feature.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}




