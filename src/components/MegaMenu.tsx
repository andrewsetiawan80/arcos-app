import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";

type Item = { to: string; label: string; roles?: string[] };
type Group = { title?: string; items: Item[] };

export default function MegaMenu({
  open,
  onClose,
  groups,
  role,
}: {
  open: boolean;
  onClose: () => void;
  groups: Group[];
  role: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape / outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    }
    if (open) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  // Mount/Unmount with opacity+slide; keep in DOM for focus trap when open
  return (
    <div
      className={[
        "absolute left-0 right-0 top-full",
        "origin-top",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        className={[
          "mx-auto max-w-7xl px-4",
          "pt-2",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
          "transition duration-150 ease-out",
        ].join(" ")}
      >
        <div className="rounded-2xl border border-white/10 bg-[color:var(--panel)]/90 backdrop-blur shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {groups.map((g, gi) => {
              const visible = g.items.filter(
                (it) => !it.roles || it.roles.includes(role) || role === "admin"
              );
              if (visible.length === 0) return null;
              return (
                <div
                  key={gi}
                  className={[
                    "rounded-xl p-3",
                    "hover:bg-white/5 transition",
                    // staggered reveal
                    open ? `animate-[fadeIn_.25s_${gi * 50}ms_both]` : "",
                  ].join(" ")}
                  style={{ animationTimingFunction: "cubic-bezier(.2,.7,.2,1)" }}
                >
                  {g.title ? (
                    <div className="text-[11px] uppercase tracking-wide text-stone-400 mb-2">
                      {g.title}
                    </div>
                  ) : null}
                  <ul className="space-y-1.5">
                    {visible.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            [
                              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                              "text-stone-300 hover:text-white hover:bg-white/5",
                              isActive ? "bg-white/10 text-white" : "",
                            ].join(" ")
                          }
                          onClick={onClose}
                        >
                          <span className="inline-block h-1.5 w-1.5 rounded-full"
                                style={{ background: "var(--accent)" }} />
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
      {/* keyframes for stagger */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px) }
          to { opacity: 1; transform: translateY(0) }
        }
      `}</style>
    </div>
  );
}
