import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import { useUI } from "./state/ui";
import { useAuth } from "./state/auth";
import type { Role } from "./state/auth";
import CommandPalette from "./components/CommandPalette";
import ThemeSwitcher from "./components/ThemeSwitcher";
import MobileMenu from "./components/MobileMenu";
import MegaMenuSheet from "./components/MegaMenuSheet";

type AreaKey = "engineering" | "production" | "sales" | "settings";

const NAV: Record<
  AreaKey,
  { header: string; groups: { title?: string; items: { to: string; label: string; roles?: Role[] }[] }[] }
> = {
  engineering: {
    header: "Engineering",
    groups: [
      { title: "Design & Mix", items: [{ to: "/studio", label: "Mix Studio" }, { to: "/recipes", label: "Recipes" }] },
      { title: "References", items: [{ to: "/ideas", label: "Ideas & Starters" }] },
    ],
  },
  production: {
    header: "Production",
    groups: [
      { title: "Planning", items: [{ to: "/planner/production", label: "Production Planner" }] },
      { title: "Resources", items: [{ to: "/materials", label: "Materials" }, { to: "/settings/processes", label: "Processes" }] },
    ],
  },
  sales: {
    header: "Sales",
    groups: [
      { title: "Estimating", items: [{ to: "/planner/tile", label: "Tile Planner" }, { to: "/planner/slab", label: "Slab Calculator" }, { to: "/cost", label: "Cost & Profit" }] },
      { title: "Catalog", items: [{ to: "/products", label: "Catalog" }, { to: "/products/edit", label: "Catalog Admin", roles: ["admin"] }] },
      { title: "Client Docs", items: [{ to: "/proposal", label: "Proposal / Quotation" }] },
    ],
  },
  settings: { header: "Settings", groups: [{ items: [{ to: "/settings/processes", label: "Processes" }] }] },
};

function useActiveArea(pathname: string): AreaKey {
  if (pathname.startsWith("/planner/production") || pathname.startsWith("/materials") || pathname.startsWith("/settings")) return "production";
  if (pathname.startsWith("/planner/tile") || pathname.startsWith("/planner/slab") || pathname.startsWith("/products") || pathname.startsWith("/proposal") || pathname.startsWith("/cost")) return "sales";
  if (pathname.startsWith("/studio") || pathname.startsWith("/recipes") || pathname.startsWith("/ideas") || pathname.startsWith("/derive-recipe")) return "engineering";
  return "engineering";
}

const topTab = (active: boolean) =>
  "px-3 py-1.5 rounded-md text-sm font-medium transition " +
  (active ? "bg-white/10 text-white" : "text-stone-300 hover:text-white/90 hover:bg-white/5");

export default function Layout() {
  const { pathname } = useLocation();
  const activeArea = useActiveArea(pathname);
  const { setCommandOpen } = useUI();
  const role = useAuth((s) => s.role);

  // Desktop: which tab’s sheet is open
  const [openKey, setOpenKey] = useState<AreaKey | null>(null);
  const hoverTimer = useRef<number | null>(null);
  const openWithDelay = (key: AreaKey) => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(key), 80);
  };
  const closeWithDelay = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpenKey(null), 120);
  };

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  // ⌘/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mac = navigator.platform.toUpperCase().includes("MAC");
      const meta = mac ? e.metaKey : e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  const tabs: { key: AreaKey; label: string }[] = [
    { key: "engineering", label: "Engineering" },
    { key: "production", label: "Production" },
    { key: "sales", label: "Sales" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg)] text-stone-100">
      {/* background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[.85]"
          style={{
            background:
              "radial-gradient(1200px 600px at 30% -10%, rgba(214,163,98,0.08), transparent 60%)," +
              "radial-gradient(900px 500px at 110% 10%, rgba(120,113,108,0.08), transparent 60%)," +
              "linear-gradient(180deg, rgba(12,12,12,.9), rgba(16,16,16,.9))",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-overlay opacity-[.10]"
          style={{
            background:
              "repeating-linear-gradient(45deg, rgba(255,255,255,.08) 0, rgba(255,255,255,.08) 1px, transparent 1px, transparent 3px)",
          }}
        />
      </div>

      {/* Sticky header grows smoothly */}
      <div
        className="sticky top-0 z-40 bg-[color:var(--panel)]/90 backdrop-blur border-b border-white/10 transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: openKey ? "500px" : "56px" }}
      >
        <header className="h-14 max-w-7xl mx-auto px-4 flex items-center gap-3">
          {/* Hamburger (mobile) */}
          <button
            className="sm:hidden h-9 w-9 rounded-md hover:bg-white/10"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          {/* Brand clickable home */}
          <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-stone-400 to-amber-600" />
            <div className="font-semibold text-sm tracking-wide">CRETEWERKZ</div>
          </NavLink>

          {/* Tabs */}
          <nav className="hidden sm:flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={topTab(activeArea === t.key)}
                onMouseEnter={() => openWithDelay(t.key)}
                onFocus={() => setOpenKey(t.key)}
                onMouseLeave={closeWithDelay}
                onClick={() => setOpenKey((k) => (k === t.key ? null : t.key))}
                aria-expanded={openKey === t.key}
                type="button"
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <div className="text-xs text-stone-400">⌘K / Ctrl+K</div>
          </div>
        </header>

        {/* Mega menu sheets (staggered animation inside) */}
        <div
          onMouseEnter={() => {
            if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
          }}
          onMouseLeave={closeWithDelay}
          className="hidden sm:block"
        >
          {(["engineering", "production", "sales", "settings"] as AreaKey[]).map((key) => (
            <MegaMenuSheet key={key} open={openKey === key} groups={NAV[key].groups} role={role} />
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile menu */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} areas={NAV} role={role} />

      <CommandPalette />
    </div>
  );
}
