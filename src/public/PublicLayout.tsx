import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import ArcosLogo from "../components/ArcosLogo";
import LanguageToggle from "../components/LanguageToggle";
import ScrollToTop from "../components/ScrollToTop";
import { useLanguage } from "../i18n/LanguageContext";
import { PublicThemeProvider, usePublicTheme } from "./PublicThemeContext";

// Theme Toggle Component
function ThemeToggle() {
  const { isDark, toggleTheme } = usePublicTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300
        ${isDark 
          ? "bg-white/10 hover:bg-white/20 text-white" 
          : "bg-[#1B1B1B]/5 hover:bg-[#1B1B1B]/10 text-[#1B1B1B]"
        }
      `}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon for dark mode (click to go light)
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for light mode (click to go dark)
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function PublicLayoutInner() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { isDark, toggleTheme } = usePublicTheme();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on ESC / outside click
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
    <>
      <ScrollToTop />
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? "bg-[#1B1B1B] text-white" : "bg-white text-[#1B1B1B]"
      }`}>
        {/* Header */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur transition-colors duration-300 ${
        isDark 
          ? "border-white/10 bg-[#1B1B1B]/95" 
          : "border-[#1B1B1B]/10 bg-white/95"
      }`}>
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <ArcosLogo size="medium" variant={isDark ? "light" : "dark"} className="m-0 p-0" />
          </NavLink>
          
          <nav className={`hidden sm:flex items-center gap-4 lg:gap-6 text-xs uppercase tracking-[0.2em] font-medium ${
            isDark ? "text-white/70" : "text-[#6F6F6F]"
          }`}>
            {[
              { key: "surfaces", to: "/surfaces", label: "Surfaces" },
              { key: "collection", to: "/collection", label: "Collection" },
              { key: "services", to: "/services", label: "Services" },
              { key: "projects", to: "/projects", label: "Projects" },
              { key: "inspiration", to: "/inspiration", label: "Inspiration" },
              { key: "about", to: "/about", label: "About" },
              { key: "contact", to: "/contact", label: "Contact" },
            ].map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={`transition-colors ${
                  isDark ? "hover:text-white" : "hover:text-[#1B1B1B]"
                }`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
          
          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`h-10 w-10 flex items-center justify-center transition-colors ${
                isDark ? "hover:bg-white/10" : "hover:bg-[#1B1B1B]/5"
              }`}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden={!mobileMenuOpen}
        />
        {/* Drawer */}
        <aside
          ref={panelRef}
          className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm border-l shadow-2xl sm:hidden transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } ${isDark ? "bg-[#1B1B1B] border-white/10" : "bg-white border-[#1B1B1B]/10"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className={`h-16 px-4 flex items-center justify-between border-b ${
            isDark ? "border-white/10" : "border-[#1B1B1B]/10"
          }`}>
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center hover:opacity-90 transition-opacity">
              <ArcosLogo size="small" variant={isDark ? "light" : "dark"} />
            </NavLink>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className={`h-10 w-10 flex items-center justify-center transition-colors ${
                  isDark ? "hover:bg-white/10" : "hover:bg-[#1B1B1B]/5"
                }`}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="overflow-y-auto h-[calc(100vh-4rem)] p-6 space-y-4">
            <NavLink
              to="/"
              className={`block text-base font-medium uppercase tracking-wider py-2 px-2 rounded-md transition-colors ${
                isDark 
                  ? "text-white/70 hover:text-white hover:bg-white/5" 
                  : "text-[#6F6F6F] hover:text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("nav.home")}
            </NavLink>
            {[
              { key: "surfaces", to: "/surfaces", label: "Surfaces" },
              { key: "collection", to: "/collection", label: "Collection" },
              { key: "services", to: "/services", label: "Services" },
              { key: "projects", to: "/projects", label: "Projects" },
              { key: "inspiration", to: "/inspiration", label: "Inspiration" },
              { key: "process", to: "/process", label: "Process" },
              { key: "about", to: "/about", label: "About" },
              { key: "contact", to: "/contact", label: "Contact" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={`block text-base font-medium uppercase tracking-wider py-2 px-2 rounded-md transition-colors ${
                  isDark 
                    ? "text-white/70 hover:text-white hover:bg-white/5" 
                    : "text-[#6F6F6F] hover:text-[#1B1B1B] hover:bg-[#1B1B1B]/5"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className={`pt-4 mt-4 border-t ${isDark ? "border-white/10" : "border-[#1B1B1B]/10"}`}>
              {/* Theme toggle in mobile menu */}
              <button
                onClick={toggleTheme}
                className={`w-full flex items-center gap-3 text-sm py-2 px-2 rounded-md transition-colors ${
                  isDark 
                    ? "text-white/50 hover:text-white/70 hover:bg-white/5" 
                    : "text-[#AFAFAF] hover:text-[#6F6F6F] hover:bg-[#1B1B1B]/5"
                }`}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              <NavLink
                to="/login"
                className={`block text-sm py-2 px-2 rounded-md transition-colors mt-2 ${
                  isDark 
                    ? "text-white/50 hover:text-white/70 hover:bg-white/5" 
                    : "text-[#AFAFAF] hover:text-[#6F6F6F] hover:bg-[#1B1B1B]/5"
                }`}
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
      <footer className="border-t border-[#353535] bg-[#232323]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 py-12 sm:py-14">
          {/* Main Footer Content - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 mb-12">
            
            {/* Column 1 - Brand Block */}
            <div className="text-center md:text-left">
              {/* Logo */}
              <div className="mb-6">
                <NavLink to="/" className="inline-block hover:opacity-90 transition-opacity">
                  <ArcosLogo size="medium" variant="light" className="mx-auto md:mx-0" />
                </NavLink>
              </div>
              
              {/* Brand Line */}
              <p className="text-white/70 text-sm font-light leading-relaxed mb-3">
                Architectural concrete surfaces, crafted with precision, emotion, and timeless design.
              </p>
              
              {/* Tagline */}
              <p className="text-white/40 text-xs font-light italic">
                Surfaces, reimagined.
              </p>
            </div>

            {/* Column 2 - Navigation */}
            <div className="text-center md:text-left">
              <h4 className="text-white/50 text-xs font-medium uppercase tracking-[0.2em] mb-6">
                Navigate
              </h4>
              <nav className="flex flex-col gap-3">
                {[
                  { to: "/surfaces", label: "Surfaces" },
                  { to: "/projects", label: "Projects" },
                  { to: "/about", label: "About" },
                  { to: "/process", label: "Process" },
                  { to: "/contact", label: "Contact" },
                ].map((item) => (
                  <NavLink 
                    key={item.to}
                    to={item.to} 
                    className="text-white/70 text-sm font-light hover:text-white transition-colors"
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Column 3 - Contact */}
            <div className="text-center md:text-left">
              <h4 className="text-white/50 text-xs font-medium uppercase tracking-[0.2em] mb-6">
                Contact
              </h4>
              <div className="space-y-3 text-sm font-light">
                <p className="text-white/70">
                  <span className="text-white/40">Email: </span>
                  <a 
                    href="mailto:info@arcosworks.com" 
                    className="hover:text-white transition-colors"
                  >
                    info@arcosworks.com
                  </a>
                </p>
                <p className="text-white/70">
                  <span className="text-white/40">WhatsApp: </span>
                  <a 
                    href="https://wa.me/6281234567890" 
                    className="hover:text-white transition-colors"
                  >
                    +62 812 3456 7890
                  </a>
                </p>
                <p className="text-white/50">
                  Surabaya, Indonesia
                </p>
              </div>

              {/* Social Links */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h5 className="text-white/40 text-xs font-medium uppercase tracking-[0.15em] mb-4">
                  Social
                </h5>
                <div className="flex justify-center md:justify-start gap-4">
                  <a 
                    href="https://instagram.com/arcosworks" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition-colors text-sm"
                  >
                    Instagram
                  </a>
                  <a 
                    href="https://pinterest.com/arcosworks" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition-colors text-sm"
                  >
                    Pinterest
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#353535] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/30">
            <p>© {new Date().getFullYear()} ARCOS. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <NavLink 
                to="/login" 
                className="hover:text-white/50 transition-colors"
              >
                {t("nav.staffLogin")}
              </NavLink>
              <p className="text-center sm:text-right font-light italic">
                Where form, function, and feeling coexist in perfect balance.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}

export default function PublicLayout() {
  return (
    <PublicThemeProvider>
      <PublicLayoutInner />
    </PublicThemeProvider>
  );
}
