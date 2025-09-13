import React from "react";
import { useTheme } from "../theme/ThemeProvider";
import type { AppTheme } from "../theme/ThemeProvider"; // 👈 type-only import

export default function ThemeSwitcher() {
  const { theme, setTheme, toggleTheme } = useTheme();
  const options: AppTheme[] = ["concrete", "dark", "light"];

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-stone-400">Theme:</span>
      <select
        className="bg-transparent border border-white/10 rounded px-2 py-1"
        value={theme}
        onChange={(e) => setTheme(e.target.value as AppTheme)}
        aria-label="Theme"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <button
        className="px-2 py-1 rounded border border-white/10 hover:bg-white/5"
        onClick={toggleTheme}
        type="button"
        aria-label="Toggle theme"
      >
        Toggle
      </button>
    </div>
  );
}
