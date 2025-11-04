// src/types.ts

/* =========================
   Units / Currency
   ========================= */
export type Unit = "ratio" | "kg" | "g" | "L" | "mL";
export type Currency = "IDR" | "USD" | "EUR";

/* =========================
   Materials / Recipes
   ========================= */
export type Material = {
  id: string;
  name: string;
  densityKgM3?: number;

  // Optional pricing
  pricePerKg?: number;
  priceCurrency?: Currency; // default "IDR"
};

export type RecipeLine = {
  id: string;
  materialId: string;
  amount?: number;
  unit: Unit; // "ratio" shares pool mass; else absolute
};

export type Recipe = {
  id: string;
  name: string;
  process: string;         // e.g. "gfrc", "uhpc", etc.
  version?: string;
  densityKgM3?: number;
  lines: RecipeLine[];

  createdAt: string;
  updatedAt: string;
};

export type ProductRecipe = {
  id: string;
  name: string;
  process: string;
  version?: string;
  densityKgM3?: number;
  lines: RecipeLine[];
  
  // Product-specific fields
  productId: string;
  variantId: string;
  baseRecipeId: string;    // Reference to the main recipe it was derived from
  
  createdAt: string;
  updatedAt: string;
};

/* =========================
   Products / Catalog
   ========================= */
export type ProductVariant = {
  id: string;
  name?: string;
  color?: string;
  recipeByProcess?: Record<string, string | undefined>; // processKey -> recipeId
  perTileKg?: number;
};

export type Category = {
  id: string;
  name: string;
  slug: string; // normalized id (used in Product.categorySlug)
};

export type Product = {
  id: string;
  title: string;
  slug: string;            // public URL id (/product/:slug)
  public: boolean;         // visible on public site
  featured?: boolean;      // show on homepage hero/featured

  coverImageUrl?: string;  // hero/cover
  categorySlug?: string;   // normalized, from Categories

  // Core specs
  size?: { w_mm?: number; h_mm?: number; t_mm?: number };
  tileArea_m2?: number;
  variants: ProductVariant[];

  // Optional price fields
  pricePerSqmIDR?: number;
  pricePerTileIDR?: number;

  // 🔧 Product-level default process → recipe mapping (used by planners as fallback)
  recipeByProcess?: Record<string, string | undefined>;

  // Merchandising / content
  tags?: string[];
  blurb?: string;           // short description for detail page
  galleryImages?: string[]; // extra images shown on detail page

  createdAt: string;
  updatedAt: string;
};

/* =========================
   Public Site Config
   ========================= */
export type SiteConfig = {
  catalogTitle?: string;  // heading on /catalog
  heroTitle?: string;     // public homepage hero title
  heroSubtitle?: string;  // public homepage hero subtitle
  contactEmail?: string;
};

/* =========================
   CMS Pages
   ========================= */
export type Page = {
  id: string;
  title: string;
  slug: string; // public URL (/page/:slug)
  status: "draft" | "published";
  description?: string;
  coverImageUrl?: string;
  tags?: string[];
  content?: string; // markdown or simple HTML
  createdAt: string;
  updatedAt: string;
};

/* =========================
   Lab (R&D Trials)
   ========================= */
export type LabStatus = "draft" | "promising" | "candidate" | "promoted";

export type LabEntry = {
  id: string;
  title: string;

  // Rich notes (plain text or markdown string for now)
  notes?: string;

  // Media (store as URLs; you can later swap to an upload service)
  images?: string[];
  videos?: string[];      // optional video links (mp4, YouTube/Vimeo URLs, etc.)
  attachments?: string[]; // PDFs, reports, etc. (URLs)

  // Optional linkage to a base recipe, and diffs you tried
  baseRecipeId?: string;
  modifications?: RecipeLine[]; // ad-hoc lines that differ from base

  // Quick evaluation state
  status: LabStatus;

  createdAt: string;
  updatedAt: string;
};

/* =========================
   App Settings / State
   ========================= */
export type Settings = {
  units: "metric";
  defaultSparePct?: number;

  // Public site configuration
  site?: SiteConfig;
  
  // Process configuration
  processes?: Array<{ key: string; label: string }>;
};

export type AppState = {
  // Core data
  materials: Material[];
  recipes: Recipe[];
  productRecipes: ProductRecipe[];
  products: Product[];

  // Catalog taxonomy
  categories?: Category[]; // central category list

  // R&D Lab trials
  labEntries?: LabEntry[];

  // CMS pages
  pages?: Page[];

  // Existing field you already had
  batches: any[];
  proposals?: any[];

  // Global settings
  settings: Settings;
};
