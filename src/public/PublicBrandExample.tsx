/**
 * Arcos Brand Example Page
 * All page design templates + supergraphics from the Arcos Brand Identity PDF.
 * Route: /brand-example
 */
import { Link } from "react-router-dom";
import { usePublicTheme } from "./PublicThemeContext";
import { Supergraphic, SupergraphicStrip, OcutShape } from "../components/brand/Supergraphic";
import heroFacade from "../assets/images/hero-facade.webp";
import concretePanelDetail from "../assets/images/concrete-panel-detail.webp";
import structuralPanels from "../assets/images/structural-panels.webp";
import mosaicFacadeDetail from "../assets/images/mosaic-facade-detail.webp";

const t = (isDark: boolean) => ({
  text: isDark ? "text-white" : "text-[#232323]",
  muted: isDark ? "text-white/70" : "text-[#353535]",
  label: isDark ? "text-white/50" : "text-[#353535]",
  bg: isDark ? "bg-[#232323]" : "bg-white",
  box: isDark ? "bg-[#353535]" : "bg-[#f5f5f5]",
  border: isDark ? "border-white/10" : "border-[#232323]/10",
});

const variant = (isDark: boolean) => (isDark ? "on-black" : "on-white");

export default function PublicBrandExample() {
  const { isDark } = usePublicTheme();
  const c = t(isDark);
  const v = variant(isDark);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${c.bg} ${c.text}`}>
      {/* ===== HERO ===== */}
      <section className="relative min-h-[50vh] flex items-end">
        <div className="absolute inset-0">
          <img src={heroFacade} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#232323] via-[#232323]/60 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pb-16">
          <div className="mb-6" aria-hidden>
            <OcutShape size={100} variant="on-black" opacity={0.6} />
          </div>
          <p className={`arcos-label ${c.label} mb-2`}>Page design templates</p>
          <h1 className="arcos-heading-hero text-white mb-4">
            Arcos brand guidelines
          </h1>
          <p className="text-white/80 max-w-2xl text-lg font-light">
            Supergraphics (horizontal cut from “O”), typography, and all layout templates: 1 Box, 2 Element, 3 Element, and placement formats.
          </p>
        </div>
      </section>

      {/* ===== SUPERGRAPHICS (PDF: “taken from horizontal cut letter O” — arc shape, not lines) ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-2 ${c.text}`}>Supergraphics</h2>
          <p className={`arcos-body mb-10 ${c.muted}`}>Taken from the horizontal cut in the letter “O” — the curved arc shape. Use on dark (#232323) or light (#fff) backgrounds.</p>

          <div className="space-y-12">
            <div>
              <p className={`arcos-label mb-3 ${c.label}`}>Single O-cut shape</p>
              <OcutShape size={120} variant={v} opacity={0.5} />
            </div>
            <div>
              <p className={`arcos-label mb-3 ${c.label}`}>Column of O-cut arcs</p>
              <Supergraphic count={4} size="medium" variant={v} opacity={0.4} orientation="vertical" />
            </div>
            <div>
              <p className={`arcos-label mb-3 ${c.label}`}>Horizontal strip (repeating arcs)</p>
              <SupergraphicStrip variant={v} height={48} className="opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 1 ELEMENT (1 Box) – 3 variants ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>1 Element (1 Box)</h2>

          {/* Variant A: Top Headline */}
          <div className={`${c.box} p-10 mb-10 rounded-sm relative overflow-hidden`}>
            <div className="mb-4" aria-hidden><OcutShape size={64} variant={v} opacity={0.5} /></div>
            <p className={`arcos-label mb-2 ${c.label}`}>Top Headline</p>
            <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
            <p className={`arcos-subheading mb-4 ${c.muted}`}>Sub-Headline</p>
            <p className={`arcos-body ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
          </div>

          {/* Variant B: Middle Headline */}
          <div className={`${c.box} p-10 mb-10 rounded-sm`}>
            <p className={`arcos-body mb-4 ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
            <p className={`arcos-label mb-2 ${c.label}`}>Middle Headline</p>
            <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
            <p className={`arcos-subheading mb-4 ${c.muted}`}>Sub-Headline</p>
            <p className={`arcos-body ${c.muted}`}>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
          </div>

          {/* Variant C: Bottom Headline */}
          <div className={`${c.box} p-10 rounded-sm`}>
            <p className={`arcos-body mb-6 ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam.</p>
            <div className="mb-3" aria-hidden><OcutShape size={48} variant={v} opacity={0.5} /></div>
            <p className={`arcos-label mb-2 ${c.label}`}>Bottom Headline</p>
            <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
            <p className={`arcos-subheading ${c.muted}`}>Sub-Headline</p>
          </div>
        </div>
      </section>

      {/* ===== 2 ELEMENT (Image + 1 Box) – 2 variants ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>2 Element (Image + 1 Box)</h2>

          {/* Variant A: Image left */}
          <div className="mb-12">
            <p className={`arcos-label mb-4 ${c.label}`}>Image left · Landscape</p>
            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-sm border border-[#353535]/30">
              <div className="relative">
                <img src={concretePanelDetail} alt="" className="w-full h-full min-h-[280px] object-cover" />
              </div>
              <div className={`${c.box} p-10 flex flex-col justify-center relative`}>
                <div className="mb-4" aria-hidden><OcutShape size={64} variant={v} opacity={0.5} /></div>
                <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
                <p className={`arcos-subheading mb-4 ${c.muted}`}>Sub-Headline</p>
                <p className={`arcos-body ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
              </div>
            </div>
          </div>

          {/* Variant B: Image right */}
          <div>
            <p className={`arcos-label mb-4 ${c.label}`}>Image right</p>
            <div className="grid lg:grid-cols-2 gap-0 overflow-hidden rounded-sm border border-[#353535]/30">
              <div className={`${c.box} p-10 flex flex-col justify-center relative order-2 lg:order-1`}>
                <div className="mb-4" aria-hidden><OcutShape size={48} variant={v} opacity={0.5} /></div>
                <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
                <p className={`arcos-subheading mb-4 ${c.muted}`}>Sub-Headline</p>
                <p className={`arcos-body ${c.muted}`}>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
              </div>
              <div className="relative order-1 lg:order-2">
                <img src={structuralPanels} alt="" className="w-full h-full min-h-[280px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3 ELEMENT (Image + 2 Boxes) ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>3 Element (Image + 2 Boxes)</h2>

          <div className="grid md:grid-cols-3 gap-0 overflow-hidden rounded-sm border border-[#353535]/30">
            <div className="relative">
              <img src={heroFacade} alt="" className="w-full h-full min-h-[260px] object-cover" />
            </div>
            <div className={`${c.box} p-8 flex flex-col justify-center border-l ${c.border}`}>
              <div className="mb-3" aria-hidden><SupergraphicStrip variant={v} height={20} className="opacity-50" /></div>
              <h3 className={`arcos-heading-h4 mb-2 ${c.text}`}>Headline</h3>
              <p className={`arcos-body text-sm ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod.</p>
            </div>
            <div className={`${c.box} p-8 flex flex-col justify-center relative`}>
              <div className="mb-4" aria-hidden>
                <Supergraphic count={3} size="small" variant={v} opacity={0.4} orientation="vertical" />
              </div>
              <h3 className={`arcos-heading-h4 mb-2 ${c.text}`}>Headline</h3>
              <p className={`arcos-body text-sm ${c.muted}`}>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLACEMENT FORMAT 4:5 PORTRAIT ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>Placement format – 4:5 Portrait</h2>
          <p className={`arcos-body mb-8 ${c.muted}`}>25px margins. Headline, Sub-Headline, Images, Logo & tagline, Pattern/Supergraphic, Body text.</p>
          <div className="max-w-md mx-auto">
            <div className={`aspect-[4/5] ${c.box} rounded-sm overflow-hidden flex flex-col p-6 border ${c.border}`}>
              <div className="mb-4" aria-hidden><OcutShape size={64} variant={v} opacity={0.5} /></div>
              <h3 className={`arcos-heading-h4 mb-1 ${c.text}`}>Headline</h3>
              <p className={`arcos-label mb-4 ${c.label}`}>Sub-Headline</p>
              <div className="flex-1 min-h-[120px] rounded overflow-hidden mb-4">
                <img src={mosaicFacadeDetail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="mb-2" aria-hidden><SupergraphicStrip variant={v} height={16} className="opacity-50" /></div>
              <p className={`arcos-body text-sm ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLACEMENT FORMAT 4:5 LANDSCAPE ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>Placement format – 4:5 Landscape</h2>
          <p className={`arcos-body mb-8 ${c.muted}`}>25px margins. Logo & tagline, Images, Pattern/Supergraphic, Body text.</p>
          <div className={`aspect-[5/4] max-w-3xl mx-auto ${c.box} rounded-sm overflow-hidden flex flex-col p-6 border ${c.border}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`arcos-heading-h4 mb-1 ${c.text}`}>Headline</h3>
                <p className={`arcos-label ${c.label}`}>Sub-Headline</p>
              </div>
              <div aria-hidden><OcutShape size={72} variant={v} opacity={0.5} /></div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-[140px] mb-4">
              <img src={concretePanelDetail} alt="" className="w-full h-full object-cover rounded" />
              <img src={structuralPanels} alt="" className="w-full h-full object-cover rounded" />
            </div>
            <div className="mb-2" aria-hidden><SupergraphicStrip variant={v} height={20} className="opacity-50" /></div>
            <p className={`arcos-body text-sm ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
          </div>
        </div>
      </section>

      {/* ===== PLACEMENT FORMAT LANDSCAPE ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>Placement format – Landscape</h2>
          <p className={`arcos-body mb-8 ${c.muted}`}>20px margins. Headline, Sub-Headline, Logo & tagline, Images, Pattern/Supergraphic, Body text.</p>
          <div className={`${c.box} rounded-sm overflow-hidden border ${c.border} p-6`}>
            <div className="flex flex-wrap gap-6 items-start justify-between mb-6">
              <div>
                <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
                <p className={`arcos-subheading ${c.muted}`}>Sub-Headline</p>
              </div>
              <div aria-hidden><OcutShape size={80} variant={v} opacity={0.5} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <img src={heroFacade} alt="" className="w-full h-48 object-cover rounded" />
              <div className="flex flex-col justify-center">
                <div className="mb-3" aria-hidden><SupergraphicStrip variant={v} height={28} className="opacity-50" /></div>
                <p className={`arcos-body text-sm ${c.muted}`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLACEMENT FORMAT PORTRAIT ===== */}
      <section className={`py-16 border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
          <h2 className={`arcos-heading-h2 mb-8 ${c.text}`}>Placement format – Portrait</h2>
          <p className={`arcos-body mb-8 ${c.muted}`}>30px margins. Headline, Sub-Headline, Pattern/Supergraphic, Body text, Logo & tagline.</p>
          <div className="max-w-sm mx-auto">
            <div className={`aspect-[3/4] ${c.box} rounded-sm overflow-hidden flex flex-col p-8 border ${c.border}`}>
              <h3 className={`arcos-heading-h3 mb-2 ${c.text}`}>Headline</h3>
              <p className={`arcos-label mb-6 ${c.label}`}>Sub-Headline</p>
              <div className="mb-4" aria-hidden><SupergraphicStrip variant={v} height={20} className="opacity-50" /></div>
              <p className={`arcos-body text-sm ${c.muted} flex-1`}>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</p>
              <div className="mt-4" aria-hidden><OcutShape size={48} variant={v} opacity={0.5} /></div>
              <p className={`arcos-label mt-4 ${c.label}`}>Logo & tagline</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FULL-WIDTH SUPERGRAPHIC (O-cut arcs) ===== */}
      <section className={`py-12 ${isDark ? "bg-[#232323]" : "bg-white"}`}>
        <SupergraphicStrip variant={v} height={64} className="w-full opacity-40" />
      </section>

      {/* ===== CTA ===== */}
      <section className={`py-16 ${c.bg}`}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6" aria-hidden><OcutShape size={56} variant={v} opacity={0.5} /></div>
          <h2 className={`arcos-heading-h2 mb-4 ${c.text}`}>Use these templates site-wide</h2>
          <p className={`arcos-body mb-8 ${c.muted}`}>Apply 1 Box, 2 Element, 3 Element, and placement formats with supergraphics for a consistent Arcos look.</p>
          <Link to="/" className="arcos-button arcos-button-primary inline-flex">
            Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
