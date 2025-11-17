// src/Layout.tsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useUI } from "./state/ui";
import { useAuth } from "./state/auth";
import type { Role } from "./state/auth";
import CommandPalette from "./components/CommandPalette";
import ThemeSwitcher from "./components/ThemeSwitcher";
import MobileMenu from "./components/MobileMenu";
import MegaMenuSheet from "./components/MegaMenuSheet";
import ArqonLogo from "./components/ArqonLogo";

type AreaKey = "dashboard" | "products" | "recipes" | "planning" | "sales" | "lab" | "settings";

/** Flip to "instant" if you want zero animation */
const MENU_MODE: "instant" | "smooth" = "smooth";

const NAV: Record<
  AreaKey,
  { header: string; groups: { title?: string; items: { to: string; label: string; roles?: Role[] }[] }[] }
> = {
  dashboard: {
    header: "Dashboard",
    groups: [
      { 
        items: [
          { to: "/app/dashboard", label: "Overview & Quick Actions" },
        ] 
      },
    ],
  },
  products: {
    header: "Products & Catalog",
    groups: [
      {
        title: "Product Management",
        items: [
          { to: "/app/products", label: "View Products" },
          { to: "/app/products/edit", label: "Add/Edit Products", roles: ["admin"] },
          { to: "/app/settings/catalog", label: "Product Settings" },
        ],
      },
    ],
  },
  recipes: {
    header: "Recipes & Mixes",
    groups: [
      {
        title: "Recipe Management",
        items: [
          { to: "/app/recipes", label: "All Recipes" },
          { to: "/app/product-recipes", label: "Product Recipes" },
          { to: "/app/derive-recipe", label: "Create Recipe" },
          { to: "/app/studio", label: "Mix Studio" },
        ],
      },
    ],
  },
  planning: {
    header: "Planning & Estimating",
    groups: [
      {
        title: "Calculators",
        items: [
          { to: "/app/planner/tile", label: "Tile Calculator" },
          { to: "/app/planner/slab", label: "Slab Calculator" },
          { to: "/app/planner/production", label: "Production Planning" },
          { to: "/app/cost", label: "Cost Calculator" },
        ],
      },
    ],
  },
  sales: {
    header: "Sales & Proposals",
    groups: [
      {
        title: "Client Work",
        items: [
          { to: "/app/proposal", label: "Create Proposals" },
          { to: "/app/cost", label: "Pricing Tools" },
        ],
      },
    ],
  },
  lab: {
    header: "Lab & R&D",
    groups: [
      {
        title: "Research & Testing",
        items: [
          { to: "/app/lab", label: "Lab Notebook" },
          { to: "/app/ideas", label: "Experiment Ideas" },
        ],
      },
    ],
  },
  settings: {
    header: "Settings",
    groups: [
      {
        title: "System Configuration",
        items: [
          { to: "/app/materials", label: "Materials" },
          { to: "/app/settings/processes", label: "Processes" },
          { to: "/app/content/pages", label: "Site Settings" },
        ],
      },
    ],
  },
};

function useActiveArea(pathname: string): AreaKey {
  // Dashboard
  if (pathname.startsWith("/app/dashboard")) return "dashboard";

  // Products & Catalog
  if (
    pathname.startsWith("/app/products") ||
    pathname.startsWith("/app/settings/catalog")
  ) return "products";

  // Recipes & Mixes
  if (
    pathname.startsWith("/app/recipes") ||
    pathname.startsWith("/app/studio") ||
    pathname.startsWith("/app/derive-recipe")
  ) return "recipes";

  // Planning & Estimating
  if (
    pathname.startsWith("/app/planner") ||
    pathname.startsWith("/app/cost")
  ) return "planning";

  // Sales & Proposals
  if (pathname.startsWith("/app/proposal")) return "sales";

  // Lab & R&D
  if (
    pathname.startsWith("/app/lab") ||
    pathname.startsWith("/app/ideas")
  ) return "lab";

  // Settings
  if (
    pathname.startsWith("/app/materials") ||
    pathname.startsWith("/app/settings") ||
    pathname.startsWith("/app/content")
  ) return "settings";

  return "dashboard";
}


export default function Layout() {
  const { pathname } = useLocation();
  const activeArea = useActiveArea(pathname);
  const { setCommandOpen } = useUI();
  const role = useAuth((s) => s.role);

  const [openKey, setOpenKey] = useState<AreaKey | null>(null);
  const hoverTimer = useRef<number | null>(null);

  const openNow = (key: AreaKey) => setOpenKey(key);
  const closeNow = () => setOpenKey(null);

  const openWithDelay = (key: AreaKey) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(key), MENU_MODE === "smooth" ? 70 : 0);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(null), MENU_MODE === "smooth" ? 140 : 0);
  };

  const [mobileOpen, setMobileOpen] = useState(false);

  // Shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mac = navigator.platform.toUpperCase().includes("MAC");
      const meta = mac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (e.key === "Escape") closeNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  const tabs: { key: AreaKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "recipes", label: "Recipes" },
    { key: "planning", label: "Planning" },
    { key: "sales", label: "Sales" },
    { key: "lab", label: "Lab" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur border-b border-white/10">
        <header className="relative h-20 max-w-7xl mx-auto px-6 flex items-center justify-between gap-6">
          {/* Brand → internal home (Arqon logo) */}
          <NavLink to="/app/dashboard" className="flex items-center hover:opacity-90 transition-opacity duration-300">
            <ArqonLogo size="medium" className="scale-[1.2]" />
          </NavLink>

          {/* Tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            {tabs.map((t) => {
              // Dashboard tab should navigate directly, others show dropdown
              if (t.key === "dashboard") {
                return (
                  <NavLink
                    key={t.key}
                    to="/app"
                    className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all relative ${
                      activeArea === t.key 
                        ? "text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                    {activeArea === t.key && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    )}
                  </NavLink>
                );
              }
              
              return (
                <button
                  key={t.key}
                  className={`px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all relative ${
                    activeArea === t.key 
                      ? "text-white" 
                      : "text-gray-400 hover:text-white"
                  }`}
                  onMouseEnter={() => (MENU_MODE === "smooth" ? openWithDelay(t.key) : openNow(t.key))}
                  onMouseLeave={() => (MENU_MODE === "smooth" ? closeWithDelay() : undefined)}
                  onFocus={() => openNow(t.key)}
                  onClick={() => setOpenKey((k) => (k === t.key ? null : t.key))}
                  aria-expanded={openKey === t.key}
                  type="button"
                >
                  {t.label}
                  {activeArea === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-fade-in" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center ml-auto mr-6">
            <button
              onClick={() => setCommandOpen(true)}
              className="group w-72 px-4 py-2.5 text-sm bg-[#2A2A2A] border border-white/10 rounded-lg text-gray-400 hover:border-white/20 hover:text-white hover:bg-[#333333] transition-all flex items-center gap-2 hover-lift"
            >
              <svg className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs uppercase tracking-wider">Search...</span>
              <span className="ml-auto text-xs text-gray-500 group-hover:text-gray-400 transition-colors">⌘K</span>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Mobile toggle - on right side like public site */}
            <button
              className="sm:hidden h-9 w-9 rounded-md hover:bg-white/10 flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <NavLink
              to="/"
              className="hidden sm:block text-xs uppercase tracking-wider font-bold px-4 py-2 bg-[#2A2A2A] border border-white/10 hover:bg-[#333333] transition-colors text-gray-300 hover:text-white"
            >
              Public Site
            </NavLink>
          </div>

          {/* Mega menu overlay */}
          <div
            className="absolute left-0 right-0 top-full"
            onMouseEnter={() => {
              if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
            }}
            onMouseLeave={() => (MENU_MODE === "smooth" ? closeWithDelay() : closeNow())}
          >
            {(["products", "recipes", "planning", "sales", "lab", "settings"] as AreaKey[]).map((key) => (
              <MegaMenuSheet key={key} open={openKey === key} groups={NAV[key].groups} role={role} mode={MENU_MODE} onClose={closeNow} />
            ))}
          </div>
        </header>
      </div>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <ArqonLogo size="small" />
              <span className="text-xs uppercase tracking-wider">Concrete Management System</span>
              <span className="text-xs">© 2024</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
                <span>Theme:</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} areas={NAV} role={role} />
      <CommandPalette />
    </div>
  );
}
