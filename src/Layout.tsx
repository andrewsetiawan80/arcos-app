import React from "react";
import { NavLink, Outlet } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  "block px-4 py-2 rounded-lg text-sm font-medium transition " +
  (isActive
    ? "bg-white/10 text-white"
    : "text-gray-400 hover:text-white hover:bg-white/5");

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 border-r border-white/10 bg-black/20 p-4 space-y-3">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600" />
          <div className="font-semibold text-sm tracking-wide">CRETEWERKZ</div>
        </div>
        <nav className="space-y-1">
          <NavLink to="/studio" className={navLinkClass}>Mix Studio</NavLink>
          <NavLink to="/planner/production" className={navLinkClass}>Production Planner</NavLink>
          <NavLink to="/planner/tile" className={navLinkClass}>Tile Planner</NavLink>
          <NavLink to="/planner/slab" className={navLinkClass}>Slab Calculator</NavLink>
          <NavLink to="/recipes" className={navLinkClass}>Recipes</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          <NavLink to="/products/edit" className={navLinkClass}>Catalog Admin</NavLink>
          <NavLink to="/ideas" className={navLinkClass}>Ideas & Starters</NavLink>
          <NavLink to="/proposal" className={navLinkClass}>Proposal / Quotation</NavLink> {/* <-- added */}
          <NavLink to="/cost" className={navLinkClass}>Cost & Profit</NavLink>
          <NavLink to="/materials" className={navLinkClass}>Materials</NavLink>
          <div className="pt-3 border-t border-white/10" />
          <NavLink to="/settings/processes" className={navLinkClass}>Processes</NavLink>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
