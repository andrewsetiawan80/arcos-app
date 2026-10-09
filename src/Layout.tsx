// src/Layout.tsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { useUI } from "./state/ui";
import { useAuth } from "./state/auth";
import type { Role } from "./state/auth";
import CommandPalette from "./components/CommandPalette";
import ThemeSwitcher from "./components/ThemeSwitcher";
import MobileMenu from "./components/MobileMenu";
import MegaMenuSheet from "./components/MegaMenuSheet";
import ArcosLogo from "./components/ArcosLogo";
import { SupergraphicStrip } from "./components/brand/Supergraphic";

type AreaKey = "dashboard" | "products" | "mixes" | "planning" | "sales" | "lab" | "settings";

const MENU_MODE: "instant" | "smooth" = "smooth";

/** Top-level areas in display order (dashboard is a direct link, not a mega-menu). */
const AREA_ORDER: AreaKey[] = ["products", "mixes", "planning", "sales", "lab", "settings"];

type NavItem = { to: string; label: string; roles?: Role[] };
type NavGroup = { title?: string; items: NavItem[] };

const NAV: Record<AreaKey, { header: string; groups: NavGroup[] }> = {
  dashboard: {
    header: "Dashboard",
    groups: [{ items: [{ to: "/app/dashboard", label: "Overview" }] }],
  },
  products: {
    header: "Products",
    groups: [
      {
        title: "Catalog",
        items: [
          { to: "/app/products", label: "All products" },
          { to: "/app/products/edit", label: "Add / edit product", roles: ["admin"] },
          { to: "/app/settings/catalog", label: "Product settings" },
        ],
      },
    ],
  },
  mixes: {
    header: "Mixes & recipes",
    groups: [
      {
        title: "Floor",
        items: [
          { to: "/app/studio", label: "Mix designer" },
          { to: "/app/mix-projects", label: "Projects" },
          { to: "/app/mix-log", label: "Mix log" },
          { to: "/app/materials", label: "Materials & prices" },
        ],
      },
      {
        title: "Recipes",
        items: [
          { to: "/app/recipes", label: "Base recipes" },
          { to: "/app/product-recipes", label: "Product recipes" },
          { to: "/app/derive-recipe", label: "Derive from base" },
        ],
      },
    ],
  },
  planning: {
    header: "Planning",
    groups: [
      {
        title: "Tools",
        items: [
          { to: "/app/planner/tile", label: "Tile calculator" },
          { to: "/app/planner/slab", label: "Slab calculator" },
          { to: "/app/planner/production", label: "Production planning" },
          { to: "/app/cost", label: "Cost calculator" },
        ],
      },
    ],
  },
  sales: {
    header: "Sales",
    groups: [
      {
        title: "Clients & quotes",
        items: [
          { to: "/app/clients", label: "Clients" },
          { to: "/app/jobs", label: "Jobs" },
          { to: "/app/jobs/labour-presets", label: "Labour presets" },
          { to: "/app/quotes", label: "Quotes" },
        ],
      },
    ],
  },
  lab: {
    header: "Lab",
    groups: [
      {
        title: "R&D",
        items: [
          { to: "/app/lab", label: "Lab notebook" },
          { to: "/app/ideas", label: "Idea sparks" },
        ],
      },
    ],
  },
  settings: {
    header: "Settings",
    groups: [
      {
        title: "System",
        items: [
          { to: "/app/settings/processes", label: "Processes" },
          { to: "/app/content/pages", label: "Site pages" },
          { to: "/app/settings/mail", label: "Mail" },
          { to: "/app/webhooks", label: "Webhooks", roles: ["admin"] },
          { to: "/app/backups", label: "Backups", roles: ["admin"] },
        ],
      },
    ],
  },
};

function useActiveArea(pathname: string): AreaKey {
  if (pathname.startsWith("/app/dashboard")) return "dashboard";
  if (pathname.startsWith("/app/products") || pathname.startsWith("/app/settings/catalog")) return "products";
  if (
    pathname.startsWith("/app/studio") ||
    pathname.startsWith("/app/mix-log") ||
    pathname.startsWith("/app/mix-projects") ||
    pathname.startsWith("/app/materials") ||
    pathname.startsWith("/app/recipes") ||
    pathname.startsWith("/app/product-recipes") ||
    pathname.startsWith("/app/derive-recipe")
  ) {
    return "mixes";
  }
  if (pathname.startsWith("/app/planner") || pathname.startsWith("/app/cost")) return "planning";
  if (
    pathname.startsWith("/app/proposal") ||
    pathname.startsWith("/app/clients") ||
    pathname.startsWith("/app/quotes") ||
    pathname.startsWith("/app/jobs")
  ) {
    return "sales";
  }
  if (pathname.startsWith("/app/lab") || pathname.startsWith("/app/ideas")) return "lab";
  if (
    pathname.startsWith("/app/settings") ||
    pathname.startsWith("/app/content") ||
    pathname.startsWith("/app/webhooks") ||
    pathname.startsWith("/app/backups")
  ) {
    return "settings";
  }
  return "dashboard";
}

const TAB_LABELS: { key: AreaKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Products" },
  { key: "mixes", label: "Mixes" },
  { key: "planning", label: "Planning" },
  { key: "sales", label: "Sales" },
  { key: "lab", label: "Lab" },
  { key: "settings", label: "Settings" },
];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeArea = useActiveArea(pathname);
  const { setCommandOpen } = useUI();
  const role = useAuth((s) => s.role);
  const loadAuth = useAuth((s) => s.loadAuth);
  const logout = useAuth((s) => s.logout);

  const [openKey, setOpenKey] = useState<AreaKey | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keep role in sync — login used to skip this, which hid Mix designer for "guest".
  useEffect(() => {
    void loadAuth();
  }, [loadAuth]);

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

  useEffect(() => {
    closeNow();
  }, [pathname]);

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

  const mobileAreas = Object.fromEntries(AREA_ORDER.map((k) => [k, NAV[k]]));

  return (
    <div className="min-h-screen flex flex-col bg-[#232323] text-white overflow-x-hidden">
      <div className="sticky top-0 z-40 bg-[#232323] arcos-no-print">
        <header className="relative h-14 sm:h-16 max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <NavLink to="/app/dashboard" className="flex items-center shrink-0 hover:opacity-90 transition-opacity duration-200 min-w-0">
            <ArcosLogo size="medium" />
          </NavLink>

          <nav className="hidden lg:flex items-center gap-0.5 min-w-0">
            {TAB_LABELS.map((t) => {
              const isActive = activeArea === t.key;
              const cls = `px-3 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors relative ${
                isActive ? "text-white" : "text-gray-500 hover:text-white"
              }`;
              const underline = isActive ? (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-white" />
              ) : null;

              if (t.key === "dashboard") {
                return (
                  <NavLink key={t.key} to="/app/dashboard" className={cls}>
                    {t.label}
                    {underline}
                  </NavLink>
                );
              }
              return (
                <button
                  key={t.key}
                  className={cls}
                  onMouseEnter={() => (MENU_MODE === "smooth" ? openWithDelay(t.key) : openNow(t.key))}
                  onMouseLeave={() => (MENU_MODE === "smooth" ? closeWithDelay() : undefined)}
                  onFocus={() => openNow(t.key)}
                  onClick={() => setOpenKey((k) => (k === t.key ? null : t.key))}
                  aria-expanded={openKey === t.key}
                  type="button"
                >
                  {t.label}
                  {underline}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex items-center ml-auto">
            <button
              onClick={() => setCommandOpen(true)}
              className="group w-56 px-3 py-2 text-sm bg-[#353535] border border-white/10 rounded-md text-gray-500 hover:border-white/20 hover:text-white hover:bg-[#2a2a2a] transition-all flex items-center gap-2"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[11px] uppercase tracking-[0.2em]">Search...</span>
              <span className="ml-auto text-[10px] text-gray-600">⌘K</span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto lg:ml-0 shrink-0">
            <button
              onClick={() => setCommandOpen(true)}
              className="lg:hidden h-10 w-10 rounded-md hover:bg-white/10 flex items-center justify-center text-gray-400"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="hidden sm:inline-flex text-[11px] uppercase tracking-[0.2em] font-semibold px-3 py-1.5 text-gray-500 hover:text-white"
            >
              Log out
            </button>
            <button
              className="lg:hidden h-10 w-10 rounded-md hover:bg-white/10 flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <NavLink
              to="/"
              className="hidden lg:block text-[11px] uppercase tracking-[0.2em] font-semibold px-3 py-1.5 border border-white/10 hover:bg-white/5 transition-colors text-gray-500 hover:text-white rounded-sm"
            >
              Public Site
            </NavLink>
          </div>

          <div
            className={`hidden lg:block absolute left-0 right-0 top-full z-30 ${openKey ? "" : "pointer-events-none"}`}
            onMouseEnter={() => {
              if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
            }}
            onMouseLeave={() => (MENU_MODE === "smooth" ? closeWithDelay() : closeNow())}
          >
            {AREA_ORDER.map((key) => (
              <MegaMenuSheet
                key={key}
                open={openKey === key}
                groups={NAV[key].groups}
                role={role}
                mode={MENU_MODE}
                onClose={closeNow}
              />
            ))}
          </div>
        </header>
        <SupergraphicStrip variant="on-black" height={3} className="shrink-0 opacity-40" />
      </div>

      {openKey ? (
        <button
          type="button"
          aria-label="Close menu"
          className="hidden lg:block fixed inset-0 z-30 bg-black/40 arcos-no-print"
          onClick={closeNow}
        />
      ) : null}

      <main className="flex-1 min-w-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-5 sm:py-8 admin-page">
          <React.Suspense fallback={<div className="min-h-[32vh]" aria-hidden />}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#232323] arcos-no-print">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <ArcosLogo size="small" />
              <span className="text-xs uppercase tracking-wider">Concrete Management System</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider">
              <span>Theme:</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </footer>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} areas={mobileAreas} role={role} onLogout={logout} />
      <CommandPalette />
    </div>
  );
}
