import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ArcosLogo from "../components/ArcosLogo";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../i18n/LanguageContext";

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on ESC / outside click - matching admin side behavior
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileMenuOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-[#232323] text-white font-sans">
      {/* Header - Arcos Brand */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#232323]/95 backdrop-blur">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <ArcosLogo size="medium" variant="light" className="m-0 p-0" />
          </NavLink>
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs uppercase tracking-[0.2em] font-bold">
            <NavLink to="/catalog" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.catalog")}
            </NavLink>
            <NavLink to="/services" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.services")}
            </NavLink>
            <NavLink to="/process" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.process")}
            </NavLink>
            <NavLink to="/projects" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.projects")}
            </NavLink>
            <NavLink to="/about" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.about")}
            </NavLink>
            <NavLink to="/inspiration" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.inspiration")}
            </NavLink>
            <NavLink to="/faq" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.faq")}
            </NavLink>
            <NavLink to="/contact" className="text-gray-300 hover:text-white transition-colors">
              {t("nav.contact")}
            </NavLink>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <LanguageToggle />
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="sm:hidden h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu - matching admin side slide animation */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
        />
        {/* Drawer - slides from right with ease-in-out animation */}
        <aside
          ref={panelRef}
          className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#232323] border-l border-white/10 shadow-2xl sm:hidden transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center hover:opacity-90 transition-opacity">
              <ArcosLogo size="small" variant="light" />
            </NavLink>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="overflow-y-auto h-[calc(100vh-4rem)] p-6 space-y-4">
            {/* Home Link */}
            <NavLink
              to="/"
              className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2 px-2 rounded-md hover:bg-white/5"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.home")}
            </NavLink>
            {[
              { key: "catalog", to: "/catalog" },
              { key: "services", to: "/services" },
              { key: "process", to: "/process" },
              { key: "projects", to: "/projects" },
              { key: "about", to: "/about" },
              { key: "inspiration", to: "/inspiration" },
              { key: "faq", to: "/faq" },
              { key: "contact", to: "/contact" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2 px-2 rounded-md hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(`nav.${item.key}`)}
              </NavLink>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10">
              <NavLink
                to="/login"
                className="block text-sm text-gray-500 hover:text-gray-300 transition-colors py-2 px-2 rounded-md hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.staffLogin")}
              </NavLink>
            </div>
          </nav>
        </aside>
      </>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer - Minimalist Brand */}
      <footer className="border-t border-[#1B1B1B]/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-16 sm:py-20">
          {/* Top Section - Brand & Tagline */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="text-xl font-light tracking-[0.1em] text-[#1B1B1B]">ARCOS</span>
              <span className="text-xl font-light text-[#AFAFAF] ml-2">—</span>
              <span className="text-xl font-light text-[#6F6F6F] ml-2">Architectural Concrete Surfaces</span>
            </div>
            <p className="text-sm text-[#AFAFAF] font-light italic">
              "Where form, function, and feeling coexist in perfect balance."
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-16 text-sm">
            <NavLink to="/catalog" className="text-[#6F6F6F] hover:text-[#1B1B1B] transition-colors tracking-wide">
              Surfaces
            </NavLink>
            <NavLink to="/projects" className="text-[#6F6F6F] hover:text-[#1B1B1B] transition-colors tracking-wide">
              Projects
            </NavLink>
            <NavLink to="/about" className="text-[#6F6F6F] hover:text-[#1B1B1B] transition-colors tracking-wide">
              About
            </NavLink>
            <NavLink to="/process" className="text-[#6F6F6F] hover:text-[#1B1B1B] transition-colors tracking-wide">
              Process
            </NavLink>
            <NavLink to="/contact" className="text-[#6F6F6F] hover:text-[#1B1B1B] transition-colors tracking-wide">
              Contact
            </NavLink>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 mb-12 text-sm text-[#AFAFAF]">
            <span>Jl. Concrete No. 42, Jakarta Selatan</span>
            <span className="hidden sm:block">·</span>
            <a href="https://wa.me/6281234567890" className="hover:text-[#1B1B1B] transition-colors">
              WhatsApp: +62 812 3456 7890
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#1B1B1B]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#AFAFAF]">
            <p>© {new Date().getFullYear()} ARCOS. All rights reserved.</p>
            <NavLink to="/login" className="hover:text-[#6F6F6F] transition-colors">
              Staff Portal
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
