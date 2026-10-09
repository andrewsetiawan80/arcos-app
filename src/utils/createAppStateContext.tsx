import React, { createContext, useContext, useEffect, useState } from "react";
import type { AppState } from "../types";
import { load, refreshStore, subscribe } from "../store";

interface AppStateContextValue {
  state: AppState;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Initialize state synchronously from cache to avoid hook order issues
  const [state, setState] = useState<AppState>(() => {
    try {
      return load();
    } catch (error) {
      console.error("Failed to load initial state:", error);
      // Return empty state as fallback
      return {
        products: [],
        recipes: [],
        materials: [],
        categories: [],
        processes: [],
        labEntries: [],
        proposals: [],
        ideas: [],
        pages: [],
        settings: {},
      } as AppState;
    }
  });
  // Don't flash a loading screen when local cache already has data
  const [loading, setLoading] = useState(() => {
    try {
      const s = load();
      const empty =
        !(s.products?.length || s.recipes?.length || s.materials?.length);
      return empty;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let mounted = true;

    const unsubscribe = subscribe((nextState) => {
      if (!mounted) {
        return;
      }
      setState((prev) => (prev === nextState ? prev : nextState));
      setLoading(false);
    });

    // Refresh in the background (do not flash loading on every notify)
    refreshStore().catch(() => {
      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value: AppStateContextValue = {
    state,
    loading,
    refresh: async () => {
      await refreshStore();
    },
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppStateContext must be used within AppStateProvider");
  }
  return ctx;
}


