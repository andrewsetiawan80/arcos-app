import React from "react";
import heroFacade from "../assets/images/hero-facade.webp";

const CONTACT_CARDS = [
  {
    label: "Email",
    value: "hello@arcos.com",
    href: "mailto:hello@arcos.com",
    description: "General enquiries, samples, and collaboration.",
  },
  {
    label: "Specifications",
    value: "specs@arcos.com",
    href: "mailto:specs@arcos.com",
    description: "Design-assist, technical sheets, and BIM requests.",
  },
  {
    label: "Phone",
    value: "+62 811 1234 567",
    href: "tel:+628111234567",
    description: "WhatsApp and hotline for quick coordination.",
  },
];

export default function PublicContact() {
  return (
    <div className="bg-[#1A1A1A] text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/10 overflow-hidden min-h-[60vh] flex items-center">
        {/* Hero Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0">
            <img
              src={heroFacade}
              alt="Contact Arcos"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A]/70 via-[#1A1A1A]/50 to-[#1A1A1A]/70" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 w-full">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60 font-semibold">Contact</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight">
              Let's design the next landmark surface.
            </h1>
            <p className="text-gray-200 text-base sm:text-lg leading-relaxed max-w-3xl">
              Share drawings, mood boards, or performance criteria—we'll advise on seamless finishes, architectural panels, and custom solutions, prepare samples, and
              coordinate installation with our certified applicator network.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32 space-y-12">

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_CARDS.map((card) => (
            <a
              key={card.label}
              href={card.href}
              className="block px-5 sm:px-6 py-5 bg-[#2A2A2A] border border-white/10 hover:bg-[#333333] hover:border-white/20 transition-all rounded-xl"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">{card.label}</div>
                  <div className="text-white font-medium text-sm sm:text-base break-all">{card.value}</div>
                </div>
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.description}</p>
            </a>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 space-y-4">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">Project Submission</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Send PDF drawings, renders, and performance notes to{" "}
              <a href="mailto:specs@arcos.com" className="underline hover:text-white transition-colors">
                specs@arcos.com
              </a>
              . We'll review and schedule a workshop to map surface build-ups, joints, and installation logistics.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 space-y-4">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-white/80">Studio Visit</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
                     Our materials library is available by appointment. Explore microcement palettes, terrazzo chip samples, polished concrete mockups, 3D tile samples, and architectural panel test pieces directly with the fabrication team.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-12 rounded-[32px] border border-white/10 bg-[#1F1F1F] p-8 sm:p-10 shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold uppercase mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-gray-300 mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition-all"
                placeholder="Project inquiry, sample request, etc."
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-gray-300 mb-2">Message</label>
              <textarea
                id="message"
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white/20 focus:border-transparent outline-none transition-all resize-none"
                placeholder="Tell us about your project or inquiry..."
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.18em] hover:bg-gray-100 transition-all min-h-[52px] hover-lift shadow-lg shadow-black/20"
            >
              Send Message
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}




