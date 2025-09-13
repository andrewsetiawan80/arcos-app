import React from "react";
import { NavLink } from "react-router-dom";
import type { Role } from "../state/auth";

export default function MegaMenuSheet({
  open,
  groups,
  role,
}: {
  open: boolean;
  groups: { title?: string; items: { to: string; label: string; roles?: Role[] }[] }[];
  role: Role;
}) {
  return (
    <div
      className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-3 gap-8">
        {groups.map((g, idx) => (
          <div
            key={idx}
            className={`space-y-2 transform transition-all duration-300 ${
              open
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            }`}
            style={{ transitionDelay: `${idx * 80}ms` }} // stagger per group
          >
            {g.title && <div className="text-xs uppercase text-stone-400 font-medium">{g.title}</div>}
            <ul className="space-y-1">
              {g.items
                .filter((it) => !it.roles || it.roles.includes(role) || role === "admin")
                .map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className="block px-2 py-1.5 rounded-md text-sm text-stone-300 hover:text-white hover:bg-white/5"
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
