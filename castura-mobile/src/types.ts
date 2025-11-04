// src/types.ts - Shared types for Castura Mobile App
// This mirrors the web app's data structures

export type Currency = "IDR" | "USD" | "EUR";

export type Material = {
  id: string;
  name: string;
  unit: string; // "kg", "L", "m3", etc.
  costPerUnitIDR: number;
  costPerUnitUSD?: number;
  costPerUnitEUR?: number;
  densityKgM3?: number; // for volume→mass conversion
  createdAt: string;
  updatedAt: string;
};

export type RecipeLine = {
  materialId: string;
  amount: number; // in material's unit
  notes?: string;
};

export type Recipe = {
  id: string;
  name: string;
  process: string; // "precast", "cast-in-place", "tile", etc.
  version?: string;
  lines: RecipeLine[];
  densityKgM3?: number; // target density
  createdAt: string;
  updatedAt: string;
  tags?: string[];
};

export type ProductVariant = {
  id: string;
  name: string;
  size: { w_mm: number; h_mm: number; t_mm: number };
  recipeId: string; // which recipe to use for this variant
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string; // normalized id (used in Product.categorySlug)
};

export type Product = {
  id: string;
  title: string;
  slug: string; // public URL id (/product/:slug)
  public: boolean; // visible on public site
  featured?: boolean; // show on homepage hero/featured

  coverImageUrl?: string; // hero/cover
  categorySlug?: string; // normalized, from Categories

  // Core specs
  size?: { w_mm?: number; h_mm?: number; t_mm?: number };
  tileArea_m2?: number;
  variants: ProductVariant[];

  // Optional price fields
  pricePerSqmIDR?: number;
  pricePerTileIDR?: number;

  // Product-level default process → recipe mapping
  recipeByProcess?: Record<string, string | undefined>;

  // Merchandising / content
  tags?: string[];
  blurb?: string; // short description for detail page
  galleryImages?: string[]; // extra images shown on detail page

  createdAt: string;
  updatedAt: string;
};

export type SiteConfig = {
  heroTitle?: string;
  heroSubtitle?: string;
  catalogTitle?: string;
  contactEmail?: string;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown or HTML
  public: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LabStatus = "draft" | "promising" | "candidate" | "promoted";

export type LabEntry = {
  id: string;
  title: string;

  // Rich notes (plain text or markdown string for now)
  notes?: string;

  // Media (store as URLs; you can later swap to an upload service)
  images?: string[];
  videos?: string[]; // optional video links (mp4, YouTube/Vimeo URLs, etc.)
  attachments?: string[]; // PDFs, reports, etc. (URLs)

  // Optional linkage to a base recipe, and diffs you tried
  baseRecipeId?: string;
  modifications?: RecipeLine[]; // ad-hoc lines that differ from base

  // Quick evaluation state
  status: LabStatus;

  createdAt: string;
  updatedAt: string;
};

export type Idea = {
  id: string;
  title: string;
  process: string;
  summary: string;
  densityKgM3?: number;
  lines: Array<{
    materialName: string;
    amount: number;
    unit: string;
  }>;
  tags: string[];
  source: "curated" | "ai";
  createdAt: string;
  bookmarked: boolean;
};

export type Proposal = {
  id: string;
  title: string;
  client?: string;
  status: "draft" | "sent" | "won" | "lost";
  total?: number;
  items?: any[];
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  // Currency / FX
  defaultCurrency: Currency;
  manualFx?: {
    USD: number; // IDR per USD
    EUR: number; // IDR per EUR
  };

  // Process definitions
  processes?: Array<{ key: string; label: string }>;

  // Site configuration
  site?: SiteConfig;
};

export type AppState = {
  // Core data
  materials: Material[];
  recipes: Recipe[];
  products: Product[];

  // Catalog taxonomy
  categories?: Category[]; // central category list

  // R&D Lab trials
  labEntries?: LabEntry[];

  // CMS pages
  pages?: Page[];

  // Existing field you already had
  batches: any[];
  proposals?: Proposal[];
  ideas?: Idea[];

  // Global settings
  settings: Settings;
};

// Mobile-specific types
export type MobileTheme = 'light' | 'dark';

export type MobileSettings = {
  theme: MobileTheme;
  notifications: boolean;
  syncEnabled: boolean;
};

export type NavigationTab = {
  name: string;
  icon: string;
  screen: string;
  badge?: number;
};
