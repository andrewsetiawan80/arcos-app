import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUI } from "../state/ui";
import { useAuth } from "../state/auth";
import type { Role } from "../state/auth";

type Item = { label: string; to: string; roles?: Role[] };

const ITEMS: Item[] = [
  // Engineering
  { label: "Mix Studio", to: "/studio" },
  { label: "Recipes", to: "/recipes" },
  { label: "Ideas & Starters", to: "/ideas" },

  // Production
  { label: "Production Planner", to: "/planner/production" },
  { label: "Materials", to: "/materials" },
  { label: "Processes", to: "/settings/processes" },

  // Sales
  { label: "Tile Planner", to: "/planner/tile" },
  { label: "Slab Calculator", to: "/planner/slab" },
  { label: "Catalog", to: "/products" },
  { label: "Catalog Admin", to: "/products/edit", roles: ["admin"] },
  { label: "Cost & Profit", to: "/cost" },
  { label: "Proposal / Quotation", to: "/proposal" },
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
        className="absolute inset-0 bg-black/60"
        onClick={() => setCommandOpen(false)}
      />
      <div className="relative mx-auto mt-24 w-full max-w-xl rounded-xl border border-white/10 bg-zinc-950 shadow-xl">
        <div className="px-3 py-2 border-b border-white/10">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search pages…"
            className="w-full bg-transparent outline-none text-sm text-white placeholder:text-zinc-500 py-2"
          />
        </div>
        <div className="p-2 max-h-80 overflow-auto">
          {results.length === 0 ? (
            <div className="text-xs text-zinc-400 px-2 py-3">No results</div>
          ) : (
            <ul className="space-y-1">
              {results.map((r) => (
                <li key={r.to}>
                  <button
                    onClick={() => {
                      setCommandOpen(false);
                      nav(r.to);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-white/5"
                  >
                    {r.label}
                    <span className="text-xs text-zinc-500 ml-2">{r.to}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-3 py-2 border-t border-white/10 text-[11px] text-zinc-500">
          Enter to open • Esc to close
        </div>
      </div>
    </div>
  );
}
