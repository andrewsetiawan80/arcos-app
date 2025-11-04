// src/store.ts
import type { AppState, Material, Currency, Unit, Recipe } from "./types";

const KEY = "castura_app_state"; // bump if structure changes

export function save(state: AppState): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function load(): AppState {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seedState();
    save(s).catch(console.error);
    return s;
  }
  try {
    const parsed: AppState = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    const s = seedState();
    save(s).catch(console.error);
    return s;
  }
}

// --- migrations ---
function migrate(state: AppState): AppState {
  // Ensure materials have currency defaults
  const materials = state.materials.map((m) => ({
    ...m,
    priceCurrency: (m.priceCurrency as Currency) || "IDR",
  }));
  return { ...state, materials };
}

// --- seed data (examples only) ---
const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function seedMaterials(): Material[] {
  return [
    { id: id(), name: "Cement (OPC)", densityKgM3: 1500, pricePerKg: 2000, priceCurrency: "IDR" },
    { id: id(), name: "Silica Fume", densityKgM3: 400, pricePerKg: 1.8, priceCurrency: "USD" },
    { id: id(), name: "Metakaolin", densityKgM3: 500, pricePerKg: 2.1, priceCurrency: "USD" },
    { id: id(), name: "Quartz Sand 0–2mm", densityKgM3: 1600, pricePerKg: 1500, priceCurrency: "IDR" },
    { id: id(), name: "PCE Superplasticizer", densityKgM3: 1050, pricePerKg: 2.4, priceCurrency: "EUR" },
    { id: id(), name: "Water", densityKgM3: 1000, pricePerKg: 0, priceCurrency: "IDR" },
    { id: id(), name: "AR Glass Fiber", densityKgM3: 2600, pricePerKg: 4.0, priceCurrency: "USD" },
    { id: id(), name: "Pigment (Carbon Black)", densityKgM3: 450, pricePerKg: 3.0, priceCurrency: "USD" },
  ];
}

function seedRecipes(materials: Material[]) {
  const get = (name: string) => materials.find((m) => m.name.includes(name))?.id || "";
  return [
    {
      id: id(),
      name: "UHPC Base",
      process: "UHPC",
      version: "v1.0",
      densityKgM3: 2450,
      lines: [
        { id: id(), materialId: get("Cement"), amount: 1, unit: "ratio" as Unit as Unit },
        { id: id(), materialId: get("Silica Fume"), amount: 0.2, unit: "ratio" as Unit as Unit },
        { id: id(), materialId: get("Metakaolin"), amount: 0.1, unit: "ratio" as Unit as Unit },
        { id: id(), materialId: get("Quartz Sand"), amount: 1.8, unit: "ratio" as Unit as Unit },
        { id: id(), materialId: get("Water"), amount: 0.22, unit: "ratio" as Unit as Unit },
        { id: id(), materialId: get("PCE"), amount: 0.02, unit: "ratio" as Unit as Unit },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(),
      name: "GFRC Facecoat",
      process: "GFRC_FACE",
      version: "v1.0",
      densityKgM3: 2150,
      lines: [
        { id: id(), materialId: get("Cement"), amount: 1, unit: "ratio" as Unit },
        { id: id(), materialId: get("Quartz Sand"), amount: 1.2, unit: "ratio" as Unit },
        { id: id(), materialId: get("Water"), amount: 0.35, unit: "ratio" as Unit },
        { id: id(), materialId: get("PCE"), amount: 0.01, unit: "ratio" as Unit },
        { id: id(), materialId: get("Pigment"), amount: 0.02, unit: "ratio" as Unit },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(),
      name: "GFRC Backer",
      process: "GFRC_BACK",
      version: "v1.0",
      densityKgM3: 2200,
      lines: [
        { id: id(), materialId: get("Cement"), amount: 1, unit: "ratio" as Unit },
        { id: id(), materialId: get("Quartz Sand"), amount: 1.5, unit: "ratio" as Unit },
        { id: id(), materialId: get("Water"), amount: 0.35, unit: "ratio" as Unit },
        { id: id(), materialId: get("PCE"), amount: 0.01, unit: "ratio" as Unit },
        { id: id(), materialId: get("AR Glass Fiber"), amount: 0.04, unit: "ratio" as Unit },
      ],
      createdAt: now(), updatedAt: now(),
    },
  ];
}

export function addRecipe(state: AppState, recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newRecipe: Recipe = {
    ...recipe,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return {
    ...state,
    recipes: [...state.recipes, newRecipe],
  };
}

export function seedState(): AppState {
  const materials = seedMaterials();
  const recipes = seedRecipes(materials);
  return {
    materials,
    recipes,
    productRecipes: [],
    products: [],
    batches: [],
    settings: { units: "metric", defaultSparePct: 7 },
  };
}
