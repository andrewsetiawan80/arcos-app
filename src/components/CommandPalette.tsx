import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../state/ui";
import { useAuth } from "../state/auth";
import type { Role } from "../state/auth";

type Item = { label: string; to: string; roles?: Role[] };

const ITEMS: Item[] = [
  { label: "Dashboard", to: "/app/dashboard" },

  { label: "All products", to: "/app/products" },
  { label: "Add / edit product", to: "/app/products/edit", roles: ["admin"] },
  { label: "Product settings", to: "/app/settings/catalog" },

  { label: "Mix designer", to: "/app/studio" },
  { label: "Projects", to: "/app/mix-projects" },
  { label: "Mix log", to: "/app/mix-log" },
  { label: "Materials & prices", to: "/app/materials" },
  { label: "Base recipes", to: "/app/recipes" },
  { label: "Product recipes", to: "/app/product-recipes" },
  { label: "Derive from base", to: "/app/derive-recipe" },

  { label: "Tile calculator", to: "/app/planner/tile" },
  { label: "Slab calculator", to: "/app/planner/slab" },
  { label: "Production planning", to: "/app/planner/production" },
  { label: "Cost calculator", to: "/app/cost" },

  { label: "Clients", to: "/app/clients" },
  { label: "Jobs", to: "/app/jobs" },
  { label: "Quotes", to: "/app/quotes" },
  { label: "Mix Projects", to: "/app/mix-projects" },

  { label: "Lab notebook", to: "/app/lab" },
  { label: "Idea sparks", to: "/app/ideas" },

  { label: "Processes", to: "/app/settings/processes" },
  { label: "Site pages", to: "/app/content/pages" },
  { label: "Mail", to: "/app/settings/mail" },
  { label: "Webhooks", to: "/app/webhooks", roles: ["admin"] },
  { label: "Backups", to: "/app/backups", roles: ["admin"] },
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
      .slice(0, 12);
  }, [q, role]);

  useEffect(() => {
    if (!commandOpen) return;
    setQ("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(t);
  }, [commandOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCommandOpen(false);
    };
    if (commandOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, setCommandOpen]);

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-black/60" onClick={() => setCommandOpen(false)} />
      <div className="relative mx-auto mt-24 w-full max-w-2xl border border-white/10 bg-[#232323] shadow-2xl">
        <div className="p-3 border-b border-white/10">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages…"
            className="w-full bg-[#353535] border border-white/10 px-4 py-3 outline-none text-base font-medium text-white placeholder:text-gray-500 focus:border-white/20"
          />
        </div>
        <ul className="max-h-[50vh] overflow-auto divide-y divide-white/5">
          {results.map((it) => (
            <li key={it.to}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 text-sm hover:bg-white/5"
                onClick={() => {
                  setCommandOpen(false);
                  nav(it.to);
                }}
              >
                {it.label}
              </button>
            </li>
          ))}
          {!results.length && (
            <li className="px-4 py-6 text-sm text-gray-500">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
}
