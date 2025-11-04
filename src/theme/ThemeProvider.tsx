import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppTheme = "concrete" | "dark" | "light"; // ✅ type export

type Ctx = {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<Ctx | null>(null);
const THEME_KEY = "castura.theme";

export function ThemeProvider({ children, defaultTheme = "dark" as AppTheme }) {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = (localStorage.getItem(THEME_KEY) as AppTheme | null) || defaultTheme;
    return saved;
  });

  useEffect(() => {
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
