import React, { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import CasturaLogo from "../components/CasturaLogo";

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#1A1A1A]/95 backdrop-blur">
        <div className="h-16 sm:h-20 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <NavLink to="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <CasturaLogo size="medium" className="scale-[1.1] sm:scale-[1.2]" />
          </NavLink>
          <nav className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs uppercase tracking-[0.2em] font-bold">
            <NavLink to="/catalog" className="text-gray-300 hover:text-white transition-colors">
              Catalog
            </NavLink>
            <a href="/#services" className="text-gray-300 hover:text-white transition-colors">
              Services
            </a>
            <a href="/#process" className="text-gray-300 hover:text-white transition-colors">
              Process
            </a>
            <a href="/#projects" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </a>
            <a href="/#contact" className="text-gray-300 hover:text-white transition-colors">
              Contact
            </a>
          </nav>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#1A1A1A] border-l border-white/10 shadow-2xl sm:hidden transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
              <CasturaLogo size="small" />
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
            <nav className="p-6 space-y-4">
              <NavLink
                to="/catalog"
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catalog
              </NavLink>
              <a
                href="/#services"
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="/#process"
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Process
              </a>
              <a
                href="/#projects"
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Projects
              </a>
              <a
                href="/#contact"
                className="block text-base font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-4 mt-4 border-t border-white/10">
                <NavLink
                  to="/app"
                  className="block text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff Login
                </NavLink>
              </div>
            </nav>
          </div>
        </>
      )}

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid gap-8 sm:gap-12 sm:grid-cols-3 text-sm">
          <div>
            <div className="mb-4 sm:mb-6">
              <CasturaLogo size="small" />
            </div>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              Premium architectural concrete products: panels, tiles, microcement, and custom elements.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-3 sm:mb-4">Contact</div>
            <p className="text-gray-400 mb-2 text-sm sm:text-base">hello@castura.com</p>
            <p className="text-gray-400 text-sm sm:text-base">Jakarta, Indonesia</p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-white mb-3 sm:mb-4">Links</div>
            <div className="flex flex-col gap-2">
              <NavLink to="/catalog" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Catalog
              </NavLink>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                About
              </a>
              <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base">
                Contact
              </a>
              <NavLink to="/app" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Staff Login
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
