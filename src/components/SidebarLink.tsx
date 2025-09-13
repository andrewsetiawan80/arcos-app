import React from "react";
import { NavLink } from "react-router-dom";

// Icons (optional)
let Icons: any = {};
try {
  // Lazy require so the app still runs without lucide installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Icons = require("lucide-react");
} catch { /* no-op fallback */ }

type Props = {
  to: string;
  label: string;
  collapsed: boolean;
  accentVar?: string; // CSS var name for accent (defaults to --accent)
  icon?: React.ReactNode; // allow manual icon override
};

/**
 * Sidebar link that supports:
 * - mini-rail (collapsed) with centered icon
 * - hover flyout to show full label when collapsed
 * - no clipping (overflow visible)
 */
export default function SidebarLink({ to, label, collapsed, accentVar = "--accent", icon }: Props) {
  // pick an icon by route hint (very small map)
  const IconComp = pickIcon(to);
  const iconNode =
    icon ??
    (IconComp ? <IconComp className="w-4 h-4" aria-hidden /> : (
      <span className="text-[11px] font-semibold">{label.charAt(0)}</span>
    ));

  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        [
          "group relative flex items-center",
          collapsed ? "justify-center px-0" : "justify-start px-3",
          "h-9 rounded-md text-sm transition",
          "text-stone-300 hover:text-white hover:bg-white/5",
          isActive && !collapsed ? "bg-white/10 text-white" : "",
        ].join(" ")
      }
    >
      {/* Accent bar only when expanded */}
      {!collapsed && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full opacity-0 group-[.active]:opacity-100"
          style={{ background: `var(${accentVar})` }}
        />
      )}

      {/* Icon/letter */}
      {collapsed ? (
        <span className="inline-grid place-items-center w-8 h-8 rounded-md bg-white/5">
          {iconNode}
        </span>
      ) : (
        label
      )}

      {/* Flyout: when collapsed, show label on hover, positioned to the right */}
      {collapsed && (
        <span
          className="pointer-events-none absolute left-full ml-2 top-1/2 -translate-y-1/2
                     whitespace-nowrap rounded-md px-2 py-1 text-xs
                     text-stone-100 border border-white/10 bg-[color:var(--panel)]/90 backdrop-blur
                     opacity-0 translate-x-[-4px] transition
                     group-hover:opacity-100 group-hover:translate-x-0 shadow-lg"
        >
          {label}
        </span>
      )}
    </NavLink>
  );
}

function pickIcon(to: string) {
  const { Beaker, FlaskConical, Wrench, Package, Boxes, Ruler, LayoutGrid, Calculator, Coins, FileText, Hammer, Settings } = Icons;
  // minimal route->icon guess
  if (to.startsWith("/studio")) return Beaker || FlaskConical;
  if (to.startsWith("/recipes")) return FlaskConical || Beaker;
  if (to.startsWith("/planner/production")) return Hammer || Wrench;
  if (to.startsWith("/materials")) return Boxes || Package;
  if (to.startsWith("/planner/tile")) return LayoutGrid || Ruler;
  if (to.startsWith("/planner/slab")) return Ruler || Calculator;
  if (to.startsWith("/cost")) return Coins || Calculator;
  if (to.startsWith("/products/edit")) return Settings;
  if (to.startsWith("/products")) return Package || Boxes;
  if (to.startsWith("/proposal")) return FileText;
  if (to.startsWith("/settings")) return Settings;
  return null;
}
