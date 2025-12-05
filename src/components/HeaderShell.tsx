// src/components/HeaderShell.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

type Props = {
  children?: React.ReactNode;
  showTheme?: boolean;
};

export default function HeaderShell({ children, showTheme = true }: Props) {
  const { pathname } = useLocation();
  const isInternal = pathname.startsWith("/app");

  const brandTo = isInternal ? "/app" : "/";
  const crossLinkHref = isInternal ? "/" : "/app";
  const crossLinkLabel = isInternal ? "Public site" : "Open App";

  return (
    <div className="sticky top-0 z-40 bg-[color:var(--panel)]/90 backdrop-blur border-b border-white/10">
      <header className="relative h-14 max-w-7xl mx-auto px-4 flex items-center gap-3">
        {/* Brand */}
        <NavLink
          to={brandTo}
          className="flex items-center gap-3 hover:opacity-90 transition"
          aria-label="Home"
        >
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-stone-400 to-amber-600" />
          <div className="font-semibold text-sm tracking-wide">ARCOS</div>
        </NavLink>

        {/* Middle navigation block */}
        {children && (
          <nav className="hidden sm:flex items-center gap-2 ml-2">{children}</nav>
        )}

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-3">
          {showTheme && (
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
          )}
          <a
            href={crossLinkHref}
            className="text-xs rounded-md px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10"
          >
            {crossLinkLabel}
          </a>
        </div>
      </header>
    </div>
  );
}
