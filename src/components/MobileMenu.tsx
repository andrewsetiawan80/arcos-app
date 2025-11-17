import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import ArqonLogo from "./ArqonLogo";

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
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Drawer - matching public menu style, slides from right */}
      <aside
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#1A1A1A] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
          <NavLink to="/app/dashboard" onClick={onClose} className="flex items-center hover:opacity-90 transition-opacity">
            <ArqonLogo size="small" />
          </NavLink>
          <button
            onClick={onClose}
            className="h-10 w-10 flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="overflow-y-auto h-[calc(100vh-4rem)] p-6 space-y-6">
          {/* Home/Dashboard Link */}
          <div className="pb-2 border-b border-white/10">
            <NavLink
              to="/app/dashboard"
              className="block text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2 px-2 rounded-md hover:bg-white/5"
              onClick={onClose}
            >
              Dashboard
            </NavLink>
          </div>
          {Object.entries(areas).map(([areaKey, area]) => {
            // Collect all visible items from all groups in this area
            const visibleGroups = area.groups
              .map((group) => {
                const visibleItems = group.items.filter(
                  (it) => !it.roles || it.roles.includes(role) || role === "admin"
                );
                return visibleItems.length > 0 ? { ...group, items: visibleItems } : null;
              })
              .filter((g): g is Group & { items: Item[] } => g !== null);

            // Skip area if no visible items
            if (visibleGroups.length === 0) return null;

            return (
              <div key={areaKey} className="space-y-3">
                {/* Area Header */}
                <h2 className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold px-2">
                  {area.header}
                </h2>
                
                {/* Groups within area */}
                {visibleGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-2">
                    {/* Group Title (if exists) */}
                    {group.title && (
                      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold px-2">
                        {group.title}
                      </h3>
                    )}
                    
                    {/* Items in group */}
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className="block text-sm font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors py-2 px-2 rounded-md hover:bg-white/5"
                          onClick={onClose}
                        >
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          
          {/* Footer section with Public Site link */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <NavLink
              to="/"
              className="block text-sm text-gray-500 hover:text-gray-300 transition-colors py-2 px-2 rounded-md hover:bg-white/5"
              onClick={onClose}
            >
              Go to Public Site
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}
