import React from "react";
import { NavLink } from "react-router-dom";
import type { Role } from "../state/auth";

type Props = {
  open: boolean;
  groups: { title?: string; items: { to: string; label: string; roles?: Role[] }[] }[];
  role: Role;
  mode?: "instant" | "smooth";
  onClose?: () => void;
};

export default function MegaMenuSheet({ open, groups, role, mode = "smooth", onClose }: Props) {
  // Compact translucent panel
  const base =
    "absolute left-0 right-0 top-full z-30 bg-[#1A1A1A]/98 backdrop-blur-xl shadow-xl border-t border-white/10";

  const smoothVisible =
    "opacity-100 translate-y-0 pointer-events-auto";
  const smoothHidden =
    "opacity-0 -translate-y-4 pointer-events-none";
  const smoothTrans =
    "transition-all duration-300 ease-[cubic-bezier(.25,.46,.45,.94)] will-change-transform will-change-opacity";

  const instantVisible = "block";
  const instantHidden = "hidden";

  const cls =
    mode === "smooth"
      ? [base, smoothTrans, open ? smoothVisible : smoothHidden].join(" ")
      : [base, open ? instantVisible : instantHidden].join(" ");

  return (
    <div className={cls}>
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {groups.map((g, idx) => (
            <div key={idx} className="space-y-3">
              {g.title && (
                <div className="space-y-1">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">{g.title}</h3>
                  <div className="w-8 h-px bg-white/10"></div>
                </div>
              )}
              <ul className="space-y-1">
                {g.items
                  .filter((it) => !it.roles || it.roles.includes(role) || role === "admin")
                  .map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                          [
                            "group flex items-center gap-3 px-3 py-2 text-sm transition-all rounded-md",
                            isActive
                              ? "bg-[#2A2A2A] text-white border-l-2 border-white shadow-sm"
                              : "text-gray-400 hover:bg-[#2A2A2A] hover:text-white hover:translate-x-1",
                          ].join(" ")
                        }
                      >
                        <span className="flex-1">{item.label}</span>
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </NavLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Quick Actions</div>
            </div>
            <div className="flex items-center gap-2">
              <NavLink
                to="/app/products/edit"
                onClick={onClose}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] border border-white/10 text-xs uppercase tracking-wider font-bold text-white hover:bg-[#333333] hover:border-white/20 transition-all hover-lift"
              >
                New Product
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
              <NavLink
                to="/app/derive-recipe"
                onClick={onClose}
                className="group inline-flex items-center gap-2 px-4 py-2 bg-[#2A2A2A] border border-white/10 text-xs uppercase tracking-wider font-bold text-white hover:bg-[#333333] hover:border-white/20 transition-all hover-lift"
              >
                New Recipe
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
