// src/store.ts - API-backed store
import type { AppState } from "./types";
import { api } from "./lib/api";

const listeners = new Set<(state: AppState) => void>();
const authListeners = new Set<(authorized: boolean) => void>();

let cachedState: AppState = getEmptyState();
let initialized = false;
let publicMode = !tokenAvailable();
let refreshPromise: Promise<void> | null = null;
let pendingRedirect = false;

function tokenAvailable(): boolean {
  try {
    return Boolean(api.getToken?.());
  } catch {
    return false;
  }
}

export function load(): AppState {
  if (!initialized) {
    initialized = true;

    const storedState = loadFromStorage();
    if (storedState) {
      cachedState = storedState;
    }

    scheduleRefresh();
  }

  return cachedState;
}

function loadFromStorage(): AppState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("cw_app_state");
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse cached state:", error);
    return null;
  }
}

function persistState(state: AppState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem("cw_app_state", JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to persist state to localStorage", error);
  }
}

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener(cachedState);
    } catch (error) {
      console.error("State listener failed:", error);
    }
  });
}

function notifyAuthListeners(authorized: boolean) {
  authListeners.forEach((listener) => {
    try {
      listener(authorized);
    } catch (error) {
      console.error("Auth listener failed:", error);
    }
  });
}

function scheduleRefresh(force = false) {
  if (refreshPromise && !force) {
    return refreshPromise;
  }

  const promise = refreshState()
    .catch((error) => {
      console.error("Failed to refresh state:", error);
    })
    .finally(() => {
      if (refreshPromise === promise) {
        refreshPromise = null;
      }
    });

  refreshPromise = promise;
  return refreshPromise;
}

async function refreshState() {
  const newState = await fetchState();
  cachedState = newState;
  persistState(newState);
  notifyListeners();
}

async function fetchState(): Promise<AppState> {
  if (!publicMode && tokenAvailable()) {
    const result = await api.getState();
    if (!result.error) {
      publicMode = false;
      notifyAuthListeners(true);
      return (result.data as AppState) || getEmptyState();
    }

    if (result.error === "Access token required") {
      handleUnauthorized();
      return loadPublicState();
    }

    throw new Error(result.error);
  }

  publicMode = true;
  return loadPublicState();
}

async function loadPublicState(): Promise<AppState> {
  const [productsRes, settingsRes] = await Promise.all([
    api.getPublicProducts(),
    api.getPublicSettings(),
  ]);

  if (productsRes.error) {
    throw new Error(productsRes.error);
  }

  if (settingsRes.error) {
    throw new Error(settingsRes.error);
  }

  return buildPublicState(
    (productsRes.data as any[]) || [],
    (settingsRes.data as Record<string, any>) || {},
  );
}

function buildPublicState(productsData: any[], settingsData: Record<string, any>): AppState {
  const normalizedProducts = (productsData || []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    categorySlug: product.category_slug || product.categorySlug,
    public: product.public,
    featured: product.featured,
    coverImageUrl: product.cover_image_url || product.coverImageUrl,
    variants: (product.variants || []).map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      color: variant.color,
      recipeByProcess: {},
    })),
    createdAt: product.created_at || product.createdAt,
    updatedAt: product.updated_at || product.updatedAt,
  }));

  const categoryMap = new Map<
    string,
    { id: string; name: string; slug: string; description?: string }
  >();

  normalizedProducts.forEach((product) => {
    if (product.categorySlug && !categoryMap.has(product.categorySlug)) {
      const slug = product.categorySlug;
      const name = slug
        .split("-")
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      categoryMap.set(slug, {
        id: slug,
        name,
        slug,
        description: "",
      });
    }
  });

  const publicSettings = {
    ...getEmptyState().settings,
    ...settingsData,
    site: settingsData.site || getEmptyState().settings.site,
  };

  return {
    materials: [],
    recipes: [],
    productRecipes: [],
    products: normalizedProducts,
    batches: [],
    proposals: [],
    labEntries: [],
    categories: Array.from(categoryMap.values()),
    pages: [],
    settings: publicSettings,
    siteConfig: settingsData.siteConfig || {},
  };
}

function handleUnauthorized() {
  publicMode = true;
  cachedState = getEmptyState();
  persistState(cachedState);
  notifyListeners();
  notifyAuthListeners(false);

  if (typeof api.logout === "function") {
    try {
      api.logout();
    } catch (error) {
      console.warn("Failed to run logout handler:", error);
    }
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem("auth_token");
    } catch (error) {
      console.warn("Failed to clear auth token:", error);
    }
  }
}

export async function refreshStore(force = false) {
  publicMode = !tokenAvailable();
  await scheduleRefresh(force);
  return cachedState;
}

export function hasAuthToken(): boolean {
  return tokenAvailable();
}

export async function verifyAuth(): Promise<boolean> {
  if (!tokenAvailable()) {
    return false;
  }

  try {
    const result = await api.getState();
    if (result.error) {
      if (result.error === "Access token required") {
        handleUnauthorized();
      }
      return false;
    }
    notifyAuthListeners(true);
    return true;
  } catch (error) {
    console.error("Failed to verify auth state:", error);
    return false;
  }
}

export function subscribeAuth(listener: (authorized: boolean) => void) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export function subscribe(listener: (state: AppState) => void) {
  listeners.add(listener);
  try {
    listener(cachedState);
  } catch (error) {
    console.error("State listener failed during subscribe:", error);
  }
  return () => listeners.delete(listener);
}

export async function save(state: AppState): Promise<void> {
  const result = await api.saveState(state);
  if (result.error) {
    console.error("Failed to save state:", result.error);
    throw new Error(result.error);
  }

  cachedState = state;
  publicMode = !tokenAvailable();
  persistState(state);
  notifyListeners();
  notifyAuthListeners(!publicMode);
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

export function migrate(state: AppState): AppState {
  return state;
}

export function seedState(): AppState {
  return getEmptyState();
}

if (typeof window !== "undefined") {
  scheduleRefresh();
}
