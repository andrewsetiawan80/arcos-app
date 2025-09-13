import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

type Role = string;
type Item = { to: string; label: string; roles?: Role[] };
type Group = { title?: string; items: Item[] };
type Area = { header: string; groups: Group[] };

export default function MobileMenu({
  open,
  onClose,
  areas,
  role,
}: {
  open: boolean;
  onClose: () => void;
  areas: Record<string, Area>;
  role: Role;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // which area is expanded
  const [expanded, setExpanded] = useState<string | null>(null);

  // close on ESC / outside
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden={!open}
      />
      {/* Drawer */}
      <aside
        ref={panelRef}
        className={[
          "fixed z-50 top-0 left-0 h-full w-[86%] max-w-sm",
          "bg-[color:var(--panel)]/95 border-r border-white/10",
          "shadow-2xl transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-stone-400 to-amber-600" />
            <div className="text-sm font-semibold tracking-wide">CRETEWERKZ</div>
          </div>
          <button
            className="h-9 w-9 rounded-md hover:bg-white/10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 overflow-y-auto h-[calc(100%-56px)]">
          {Object.entries(areas).map(([key, area]) => (
            <div key={key} className="mb-3">
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm bg-white/5 hover:bg-white/10"
                onClick={() => setExpanded((e) => (e === key ? null : key))}
                aria-expanded={expanded === key}
              >
                <span className="font-medium text-stone-100">{area.header}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={["h-4 w-4 transition-transform", expanded === key ? "rotate-180" : ""].join(" ")}
                  fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              <div
                className={[
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  expanded === key ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]",
                ].join(" ")}
              >
                <div className="overflow-hidden">
                  {/* groups */}
                  {area.groups.map((g, gi) => {
                    const visible = g.items.filter((it) => !it.roles || it.roles.includes(role) || role === "admin");
                    if (visible.length === 0) return null;
                    return (
                      <div key={gi} className="rounded-lg border border-white/10 bg-white/5 p-2 +:mt-2 mb-2">
                        {g.title ? (
                          <div className="text-[11px] uppercase tracking-wide text-stone-400 px-1 mb-1">
                            {g.title}
                          </div>
                        ) : null}
                        <ul className="space-y-1">
                          {visible.map((item) => (
                            <li key={item.to}>
                              <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                  [
                                    "block rounded-md px-2 py-1.5 text-sm",
                                    "text-stone-300 hover:text-white hover:bg-white/10",
                                    isActive ? "bg-white/10 text-white" : "",
                                  ].join(" ")
                                }
                                onClick={onClose}
                              >
                                {item.label}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
