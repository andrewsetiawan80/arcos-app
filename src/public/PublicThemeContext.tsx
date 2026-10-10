import type { ReactNode } from "react";
import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
export type PublicTheme = "dark" | "light";
interface PublicThemeContextType {
    theme: PublicTheme;
    setTheme: (t: PublicTheme) => void;
    toggleTheme: () => void;
    isDark: boolean;
}
const PublicThemeContext = createContext<PublicThemeContextType | null>(null);
const PUBLIC_THEME_KEY = "arcos.public.theme";
function getInitialTheme(): PublicTheme {
    // Check localStorage first
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(PUBLIC_THEME_KEY) as PublicTheme | null;
        if (saved && ["dark", "light"].includes(saved)) {
            return saved;
        }
    }
    // Default to dark mode
    return "dark";
}
export function PublicThemeProvider({ children }: {
    children: ReactNode;
}) {
    const [theme, setTheme] = useState<PublicTheme>(getInitialTheme);
    useLayoutEffect(() => {
        localStorage.setItem(PUBLIC_THEME_KEY, theme);
        // Set data attribute for CSS targeting if needed
        document.documentElement.setAttribute("data-public-theme", theme);
    }, [theme]);
    const value = useMemo<PublicThemeContextType>(() => ({
        theme,
        setTheme,
        toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        isDark: theme === "dark",
    }), [theme]);
    return (<PublicThemeContext.Provider value={value}>
      {children}
    </PublicThemeContext.Provider>);
}
export function usePublicTheme() {
    const ctx = useContext(PublicThemeContext);
    if (!ctx)
        throw new Error("usePublicTheme must be used within <PublicThemeProvider>");
    return ctx;
}
