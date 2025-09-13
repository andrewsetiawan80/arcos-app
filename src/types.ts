// src/types.ts
export type Unit = "ratio" | "kg" | "g" | "L" | "mL";

export type Currency = "IDR" | "USD" | "EUR";

export type Material = {
  id: string;
  name: string;
  densityKgM3?: number;
  // NEW: pricing preferences
  pricePerKg?: number;             // price per 1 kg in given currency
  priceCurrency?: Currency;        // default "IDR"
};

export type RecipeLine = {
  id: string;
  materialId: string;
  amount?: number;
  unit: Unit; // "ratio" shares pool mass; else absolute units
};

export type Recipe = {
  id: string;
  name: string;
  process: string;
  version?: string;
  densityKgM3?: number;
  lines: RecipeLine[];
  createdAt: string;
  updatedAt: string;
};

export type ProductVariant = {
  id: string;
  name?: string;
  recipeByProcess?: Record<string, string | undefined>;
  perTileKg?: number;
};

export type Product = {
  id: string;
  title: string;
  size?: { w_mm?: number; h_mm?: number; t_mm?: number };
  tileArea_m2?: number;
  variants: ProductVariant[];
  // Optional price fields if you quote directly by product:
  pricePerSqmIDR?: number;
  pricePerTileIDR?: number;
};

export type Settings = {
  units: "metric";
  defaultSparePct?: number;
};

export type AppState = {
  materials: Material[];
  recipes: Recipe[];
  products: Product[];
  batches: any[];
  settings: Settings;
};
