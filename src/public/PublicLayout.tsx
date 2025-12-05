import React, { useState, useEffect, useRef } from "react";
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
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1A1A1A]/95 backdrop-blur">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <ArcosLogo size="medium" className="m-0 p-0" />
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
          className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#1A1A1A] border-l border-white/10 shadow-2xl sm:hidden transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center hover:opacity-90 transition-opacity">
              <ArcosLogo size="small" />
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

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Main Footer Grid */}
          <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-4 text-sm mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <div className="mb-4 sm:mb-6">
                <ArcosLogo size="small" />
              </div>
              <p className="text-gray-400 leading-relaxed text-sm mb-6">
                {t("footer.description")}
              </p>
              {/* Social Links */}
              <div className="flex gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Products Column */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">Products</div>
              <div className="flex flex-col gap-3">
                <NavLink to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">Microcement</NavLink>
                <NavLink to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">3D Tiles</NavLink>
                <NavLink to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">Concrete Panels</NavLink>
                <NavLink to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm">Custom Solutions</NavLink>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">Company</div>
              <div className="flex flex-col gap-3">
                <NavLink to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">{t("nav.about")}</NavLink>
                <NavLink to="/process" className="text-gray-400 hover:text-white transition-colors text-sm">{t("nav.process")}</NavLink>
                <NavLink to="/projects" className="text-gray-400 hover:text-white transition-colors text-sm">{t("nav.projects")}</NavLink>
                <NavLink to="/inspiration" className="text-gray-400 hover:text-white transition-colors text-sm">{t("nav.inspiration")}</NavLink>
              </div>
            </div>

            {/* Contact Column */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-4">{t("footer.contact")}</div>
              <div className="flex flex-col gap-3 text-sm text-gray-400">
                <a href="mailto:hello@arcos.id" className="hover:text-white transition-colors">hello@arcos.id</a>
                <a href="tel:+6221123456" className="hover:text-white transition-colors">+62 21 123 456</a>
                <p>Jl. Concrete No. 42<br />Jakarta Selatan 12345<br />Indonesia</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Arcos. All rights reserved.</p>
            <div className="flex gap-6">
              <NavLink to="/faq" className="hover:text-gray-300 transition-colors">{t("nav.faq")}</NavLink>
              <NavLink to="/contact" className="hover:text-gray-300 transition-colors">{t("nav.contact")}</NavLink>
              <NavLink to="/login" className="hover:text-gray-300 transition-colors">{t("nav.staffLogin")}</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
