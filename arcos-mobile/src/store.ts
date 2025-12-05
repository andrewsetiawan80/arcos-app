// src/store.ts - API-backed store
import type { AppState } from "./types";
import { api } from "./lib/api";
import { useAuth } from "./store/auth";

// Use API to load state (requires authentication)
export async function load(): Promise<AppState> {
  try {
    // Check if authenticated before loading state
    const isAuthenticated = useAuth.getState().isAuthenticated;
    
    if (!isAuthenticated) {
      // If not authenticated, load only public data
      return await loadPublicData();
    }
    
    const result = await api.getState();
    if (result.error) {
      console.error('Failed to load state:', result.error);
      // If auth error, try loading public data
      if (result.error.includes('token') || result.error.includes('auth')) {
        return await loadPublicData();
      }
      return getEmptyState();
    }
    return result.data || getEmptyState();
  } catch (error: any) {
    console.error('Failed to load state:', error);
    // If auth error, try loading public data
    if (error?.message?.includes('token') || error?.message?.includes('auth')) {
      return await loadPublicData();
    }
    return getEmptyState();
  }
}

// Load public data (no auth required)
async function loadPublicData(): Promise<AppState> {
  try {
    const [productsResult, settingsResult] = await Promise.all([
      api.request('/data/public/products'),
      api.request('/data/public/settings'),
    ]);
    
    return {
      materials: [],
      recipes: [],
      productRecipes: [],
      products: productsResult.data || [],
      batches: [],
      proposals: [],
      labEntries: [],
      categories: [],
      pages: [],
      settings: settingsResult.data || {
        units: "metric",
        defaultSparePct: 7,
        site: {},
      },
      siteConfig: {},
    };
  } catch (error) {
    console.error('Failed to load public data:', error);
    return getEmptyState();
  }
}

// Use API to save state
export async function save(state: AppState): Promise<void> {
  try {
    const result = await api.saveState(state);
    if (result.error) {
      console.error('Failed to save state:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Failed to save state:', error);
    throw error;
  }
}

function getEmptyState(): AppState {
  return {
    materials: [],
    recipes: [],
    productRecipes: [],
    products: [],
    batches: [],
    proposals: [],
    labEntries: [],
    categories: [],
    pages: [],
    settings: {
      units: "metric",
      defaultSparePct: 7,
      site: {},
    },
    siteConfig: {},
  };
}

// Legacy functions for backward compatibility
export function migrate(state: AppState): AppState {
  return state;
}

export function seedState(): AppState {
  return getEmptyState();
}