// src/public/PublicProductDetail.tsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { load } from "../store";
import type { Product } from "../types";
import Modal from "../components/Modal";
import { useFadeIn } from "../utils/useAnimation";

export default function PublicProductDetail() {
  const { slug = "" } = useParams();
  const state = load();
  const products = (state.products || []) as Product[];

  const product = products.find((p) => p.slug === slug) || null;

  const [heroUrl, setHeroUrl] = useState<string | null>(product?.coverImageUrl || null);
  const [sampleOpen, setSampleOpen] = useState(false);
  
  const productAnim = useFadeIn();
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (heroRef.current && product) {
      heroRef.current.classList.add("animate-scale-in");
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold mb-2">Product not found</h1>
        <p className="text-stone-400 mb-6">It may be private or not yet published.</p>
        <Link to="/catalog" className="inline-block text-sm underline">Back to Catalog</Link>
      </div>
    );
  }

  const { title, coverImageUrl, galleryImages = [], category, size, variants = [], tags = [], blurb, seoDescription, priceFromIDR } = product;
  const gallery = [coverImageUrl, ...galleryImages].filter(Boolean) as string[];

  return (
    <div className="bg-[#1A1A1A] text-white">
      {/* Hero / Title */}
      <section className="border-b border-white/10">
        <div ref={productAnim.ref} className={`max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12 md:pb-16 ${productAnim.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <nav className="text-xs text-gray-400 mb-4 sm:mb-6 uppercase tracking-wider flex flex-wrap items-center gap-1 sm:gap-2 animate-fade-in">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
            <span>/</span>
            <span className="text-white break-words">{title}</span>
          </nav>

          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.2fr_1fr] items-start">
            {/* Visual */}
            <div ref={heroRef} className="relative opacity-0">
              <div className="aspect-[4/3] sm:aspect-[21/9] md:aspect-[16/9] overflow-hidden bg-black hover-zoom">
                {heroUrl ? (
                  <img src={heroUrl} alt={title} className="w-full h-full object-cover" loading="eager" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-500 text-sm sm:text-base">
                    (Add a cover image in Catalog Admin)
                  </div>
                )}
              </div>

              {/* Thumb rail */}
              {gallery.length > 1 && (
                <div className="mt-3 sm:mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0">
                  {gallery.map((src, idx) => (
                    <button
                      key={idx}
                      className={["shrink-0 overflow-hidden border min-h-[44px] touch-manipulation", heroUrl === src ? "border-white/40" : "border-white/10 hover:border-white/20"].join(" ")}
                      onClick={() => setHeroUrl(src)}
                      title="View image"
                      type="button"
                      style={{ width: 80, height: 56 }}
                    >
                      <img src={src} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {/* Category chip */}
              {category && (
                <div className="absolute left-2 sm:left-4 top-2 sm:top-4 text-xs uppercase tracking-[0.2em] text-white bg-black/80 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 font-bold">
                  {category}
                </div>
              )}
            </div>

            {/* Copy / Specs */}
            <aside className="lg:pl-6 xl:pl-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase leading-tight mb-3 sm:mb-4 break-words">{title}</h1>

              {blurb && <p className="mt-3 sm:mt-4 text-gray-300 text-base sm:text-lg leading-relaxed">{blurb}</p>}

              <p className="mt-3 sm:mt-4 text-gray-300 leading-relaxed max-w-prose text-sm sm:text-base">
                {seoDescription || "Precision-cast architectural concrete with a refined surface. Built for durability, designed for modern interiors and exteriors."}
              </p>

              {!!tags.length && (
                <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs uppercase tracking-wider font-bold border border-white/10 bg-[#2A2A2A]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {typeof priceFromIDR === "number" && (
                <div className="mt-4 sm:mt-6 text-white text-base sm:text-lg">
                  From <span className="font-bold">IDR {priceFromIDR.toLocaleString("id-ID")}</span>
                </div>
              )}

              {/* Variants */}
              {!!variants.length && (
                <div className="mt-6 sm:mt-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2 sm:mb-3">Variants</div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <span key={v.id} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-white/10 bg-[#2A2A2A]" title={v.color || v.name || "Variant"}>
                        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white/30" />
                        {v.name || "Variant"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specs */}
              <div className="mt-6 sm:mt-8">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2 sm:mb-3">Specifications</div>
                <div className="border border-white/10 bg-[#2A2A2A] p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-4">
                  <Spec label="Dimensions">
                    {size?.w_mm && size?.h_mm ? (
                      <>
                        {size.w_mm} × {size.h_mm}
                        {size.t_mm ? ` × ${size.t_mm}` : ""} mm
                      </>
                    ) : (
                      "Custom"
                    )}
                  </Spec>
                  <Spec label="Material">UHPC / GFRC</Spec>
                  <Spec label="Finish">As specified</Spec>
                  <Spec label="Lead time">2–6 weeks</Spec>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors border border-white/10 min-h-[44px] touch-manipulation"
                  onClick={() => setSampleOpen(true)}
                >
                  Request Sample
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <a 
                  href="/#contact" 
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors border border-white/10 min-h-[44px] touch-manipulation"
                >
                  Request Quote
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <Link 
                  to="/catalog" 
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#2A2A2A] text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors border border-white/10 min-h-[44px] touch-manipulation"
                >
                  Back to Catalog
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              <p className="mt-4 sm:mt-6 text-xs text-gray-400 leading-relaxed">
                Need custom sizes, colors, or embedded hardware? Get in touch—most requests are possible.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* Related */}
      <Related currentSlug={slug} />

      {/* Request Sample Modal */}
      <SampleModal open={sampleOpen} onClose={() => setSampleOpen(false)} productTitle={title} />
    </div>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-1">{label}</div>
      <div className="text-white">{children}</div>
    </div>
  );
}

function Related({ currentSlug }: { currentSlug: string }) {
  const state = load();
  const products = (state.products || []) as Product[];
  const related = products.filter((p) => p.public && p.slug !== currentSlug).slice(0, 3);

  if (!related.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20 pt-12 sm:pt-16 border-t border-white/10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-black uppercase">Related</h2>
        <Link 
          to="/catalog" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 hover:text-white uppercase tracking-wider font-bold transition-colors min-h-[44px] touch-manipulation self-start sm:self-auto"
        >
          View All
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((p) => (
          <Link
            key={p.id}
            to={`/product/${p.slug}`}
            className="group relative overflow-hidden"
          >
            <div className="aspect-[4/3] bg-black">
              {p.coverImageUrl ? (
                <img
                  src={p.coverImageUrl}
                  alt={p.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-500 text-sm">No image</div>
              )}
            </div>
            <div className="absolute inset-0 flex items-end">
              <div className="w-full p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <h3 className="font-bold uppercase text-sm sm:text-base break-words">{p.title}</h3>
                  {p.category && (
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-400 shrink-0">{p.category}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========== Sample Modal =========== */
function SampleModal({
  open,
  onClose,
  productTitle,
}: {
  open: boolean;
  onClose: () => void;
  productTitle: string;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Sample request submitted for "${productTitle}"\n\nName: ${name}\nCompany: ${company}\nEmail: ${email}\nNotes: ${notes}`);
    onClose();
    setName(""); setCompany(""); setEmail(""); setNotes("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Request a Sample">
      <form onSubmit={submit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Product</label>
          <div className="px-4 py-3 bg-[#2A2A2A] border border-white/10 text-white">{productTitle}</div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Your name</label>
            <input
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-white/10 text-white outline-none focus:border-white/30 focus:bg-[#333333] transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Company</label>
            <input
              className="w-full px-4 py-3 bg-[#2A2A2A] border border-white/10 text-white outline-none focus:border-white/30 focus:bg-[#333333] transition-colors"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Email</label>
          <input
            type="email"
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-white/10 text-white outline-none focus:border-white/30 focus:bg-[#333333] transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-2">Notes</label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-[#2A2A2A] border border-white/10 text-white outline-none focus:border-white/30 focus:bg-[#333333] transition-colors"
            placeholder="Tell us the finish or color you're considering…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 bg-[#2A2A2A] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors border border-white/10"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A2A2A] text-white text-sm font-bold uppercase tracking-wider hover:bg-[#333333] transition-colors border border-white/10"
          >
            Send Request
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>
    </Modal>
  );
}
