import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../state/ui";
import { useAuth } from "../state/auth";
import type { Role } from "../state/auth";

type Item = { label: string; to: string; roles?: Role[] };

const ITEMS: Item[] = [
  // Dashboard
  { label: "Dashboard", to: "/app/dashboard" },
  
  // Products & Catalog
  { label: "View Products", to: "/app/products" },
  { label: "Add/Edit Products", to: "/app/products/edit", roles: ["admin"] },
  { label: "Product Settings", to: "/app/settings/catalog" },
  
  // Recipes & Mixes
  { label: "Recipe Library", to: "/app/recipes" },
  { label: "Create New Recipe", to: "/app/derive-recipe" },
  { label: "Mix Studio", to: "/app/studio" },
  
  // Planning & Estimating
  { label: "Tile Calculator", to: "/app/planner/tile" },
  { label: "Slab Calculator", to: "/app/planner/slab" },
  { label: "Production Planning", to: "/app/planner/production" },
  { label: "Cost Calculator", to: "/app/cost" },
  
  // Sales & Proposals
  { label: "Create Proposals", to: "/app/proposal" },
  { label: "Pricing Tools", to: "/app/cost" },
  
  // Lab & R&D
  { label: "Lab Notebook", to: "/app/lab" },
  { label: "Experiment Ideas", to: "/app/ideas" },
  
  // Settings
  { label: "Materials", to: "/app/materials" },
  { label: "Processes", to: "/app/settings/processes" },
  { label: "Site Settings", to: "/app/content/pages" },
];

export default function CommandPalette() {
  const { commandOpen, setCommandOpen } = useUI();
  const role = useAuth((s) => s.role);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return ITEMS
      .filter((it) => !it.roles || it.roles.includes(role) || role === "admin")
      .filter((it) => (query ? it.label.toLowerCase().includes(query) : true))
      .slice(0, 10);
  }, [q, role]);

  // Esc to close
  useEffect(() => {
    if (!commandOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  // Autofocus when opened
  useEffect(() => {
    if (commandOpen) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [commandOpen]);

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setCommandOpen(false)}
      />
      <div className="relative mx-auto mt-24 w-full max-w-2xl border border-white/10 bg-[#232323] shadow-2xl">
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Command Palette</div>
          </div>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search commands..."
            className="w-full bg-[#353535] border border-white/10 px-4 py-3 outline-none text-base font-medium text-white placeholder:text-gray-500 focus:border-white/20 focus:bg-[#232323] transition-colors"
          />
        </div>
        <div className="p-2 max-h-80 overflow-auto">
          {results.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-sm uppercase tracking-wider mb-2">No commands found</div>
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.to}>
                  <button
                    onClick={() => {
                      setCommandOpen(false);
                      nav(r.to);
                    }}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#353535] transition-colors group"
                  >
                    <div className="font-bold text-white">{r.label}</div>
                    <div className="text-xs text-gray-500 mt-1 font-mono">{r.to}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-6 py-3 border-t border-white/10 text-xs text-gray-500 bg-[#353535] uppercase tracking-wider">
          ⌘K to open • Esc to close • Enter to navigate
        </div>
      </div>
    </div>
  );
}
