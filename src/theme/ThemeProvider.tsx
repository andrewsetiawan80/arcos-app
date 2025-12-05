import React, { createContext, useContext, useEffect, useMemo, useState, useLayoutEffect } from "react";

export type AppTheme = "concrete" | "dark" | "light"; // ✅ type export

type Ctx = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const THEME_KEY = "arcos.theme";

// Read theme from DOM (set by inline script in index.html) to avoid flash
function getInitialTheme(defaultTheme: AppTheme): AppTheme {
  // First check what's already set on the document (from inline script)
  const domTheme = document.documentElement.getAttribute("data-theme") as AppTheme | null;
  if (domTheme && ["concrete", "dark", "light"].includes(domTheme)) {
    return domTheme;
  }
  // Fallback to localStorage
  const saved = localStorage.getItem(THEME_KEY) as AppTheme | null;
  if (saved && ["concrete", "dark", "light"].includes(saved)) {
    return saved;
  }
  return defaultTheme;
}

export function ThemeProvider({ children, defaultTheme = "concrete" as AppTheme }) {
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme(defaultTheme));

  // Use useLayoutEffect to sync theme immediately before paint
  useLayoutEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const value = useMemo<Ctx>(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === "concrete" ? "dark" : t === "dark" ? "light" : "concrete")),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
