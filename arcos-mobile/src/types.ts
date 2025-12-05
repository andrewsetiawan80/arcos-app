// src/types.ts - Match web app types exactly
// This mirrors the web app's data structures 100%

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
   Proposals / Sales
   ========================= */
export type Proposal = {
  id: string;
  clientName: string;
  projectName?: string;
  status: "draft" | "sent" | "won" | "lost";
  totalValueIDR?: number;
  items: ProposalItem[];
  notes?: string;

  createdAt: string;
  updatedAt: string;
};

export type ProposalItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  unit: "sqm" | "tile" | "piece";
  unitPriceIDR?: number;
};

/* =========================
   Lab / R&D
   ========================= */
export type LabEntry = {
  id: string;
  title: string;
  status: "draft" | "promising" | "candidate" | "promoted";
  recipeId?: string;        // link to recipe if promoted
  notes?: string;
  testResults?: Record<string, any>; // flexible test data

  createdAt: string;
  updatedAt: string;
};

/* =========================
   CMS / Pages
   ========================= */
export type Page = {
  id: string;
  title: string;
  slug: string;
  content: string; // markdown or HTML
  public: boolean;

  createdAt: string;
  updatedAt: string;
};

/* =========================
   Site Config
   ========================= */
export type SiteConfig = {
  heroTitle?: string;
  heroSubtitle?: string;
  catalogTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
};

/* =========================
   Settings
   ========================= */
export type Settings = {
  units: "metric" | "imperial";
  defaultSparePct: number; // default waste/spare percentage for calculators
};

/* =========================
   App State
   ========================= */
export type AppState = {
  materials: Material[];
  recipes: Recipe[];
  productRecipes: ProductRecipe[];
  products: Product[];
  batches: any[]; // TODO: type this properly
  proposals: Proposal[];
  labEntries: LabEntry[];
  categories: Category[];
  pages: Page[];
  siteConfig: SiteConfig;
  settings: Settings;
};

// Mobile-specific theme type
export type MobileTheme = "dark" | "light";
