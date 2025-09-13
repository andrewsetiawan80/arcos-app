import type { AppState, Material, Recipe } from "./types";

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export function seedMaterials(): Material[] {
  return [
    { id: id(), name: "Cement (GP)", densityKgM3: 3150, baseCostPerKg: 2.1, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Silica fume", densityKgM3: 2200, baseCostPerKg: 12, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Metakaolin", densityKgM3: 2500, baseCostPerKg: 7, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Fly ash (Class F)", densityKgM3: 2200, baseCostPerKg: 1.5, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Limestone powder", densityKgM3: 2700, baseCostPerKg: 1.2, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Sand (0–0.5 mm)", densityKgM3: 2650, baseCostPerKg: 0.25, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Sand (0–2 mm)", densityKgM3: 2650, baseCostPerKg: 0.20, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Coarse 5–10 mm", densityKgM3: 2700, baseCostPerKg: 0.18, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Coarse 10–20 mm", densityKgM3: 2700, baseCostPerKg: 0.16, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Water", densityKgM3: 1000, baseCostPerKg: 0, baseCostCurrency: "IDR" as any },
    { id: id(), name: "PCE Superplasticizer (product)", densityKgM3: 1050, baseCostPerKg: 3.5, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Steel fibers", densityKgM3: 7800, baseCostPerKg: 24, baseCostCurrency: "IDR" as any },
    { id: id(), name: "AR Glass fibers (chopped)", densityKgM3: 2550, baseCostPerKg: 7.5, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Polymer emulsion (flooring)", densityKgM3: 1040, baseCostPerKg: 4.2, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Pigment — carbon black", densityKgM3: 1500, baseCostPerKg: 15, baseCostCurrency: "IDR" as any },
    { id: id(), name: "Pigment — titanium white", densityKgM3: 4200, baseCostPerKg: 6.8, baseCostCurrency: "IDR" as any },
  ];
}

function nameToId(materials: Material[], key: string): string {
  const alias: Record<string,string> = {
    cement: "Cement (GP)",
    silica: "Silica fume",
    metakaolin: "Metakaolin",
    flyash: "Fly ash (Class F)",
    limestone: "Limestone powder",
    sand005: "Sand (0–0.5 mm)",
    sand02: "Sand (0–2 mm)",
    c5_10: "Coarse 5–10 mm",
    c10_20: "Coarse 10–20 mm",
    water: "Water",
    pce: "PCE Superplasticizer (product)",
    steel: "Steel fibers",
    argf: "AR Glass fibers (chopped)",
    polymer: "Polymer emulsion (flooring)",
    pig_black: "Pigment — carbon black",
    pig_white: "Pigment — titanium white",
  };
  const target = alias[key] || key;
  const m = materials.find(x => x.name.toLowerCase() === target.toLowerCase());
  if (!m) throw new Error("seed: material not found " + key);
  return m.id;
}

export function seedRecipes(materials: Material[]): Recipe[] {
  const get = (k: string) => nameToId(materials, k);

  return [
    {
      id: id(), name: "UHPC — baseline 2% steel", process: "UHPC" as any, version: "v1.0",
      densityKgM3: 2350,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("silica"), amount: 0.25, unit: "ratio" },
        { id: id(), materialId: get("metakaolin"), amount: 0.00, unit: "ratio" },
        { id: id(), materialId: get("sand02"), amount: 1.10, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.19, unit: "ratio" },
        { id: id(), materialId: get("pce"), amount: 0.015, unit: "ratio" },
        { id: id(), materialId: get("steel"), amount: 0.02, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(), name: "GFRC — facecoat smooth", process: "GFRC_FACE" as any, version: "v1.0",
      densityKgM3: 2200,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("silica"), amount: 0.20, unit: "ratio" },
        { id: id(), materialId: get("sand005"), amount: 1.20, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.33, unit: "ratio" },
        { id: id(), materialId: get("pce"), amount: 0.008, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(), name: "GFRC — backer AR", process: "GFRC_BACK" as any, version: "v1.0",
      densityKgM3: 2200,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("silica"), amount: 0.20, unit: "ratio" },
        { id: id(), materialId: get("sand02"), amount: 1.60, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.33, unit: "ratio" },
        { id: id(), materialId: get("pce"), amount: 0.006, unit: "ratio" },
        { id: id(), materialId: get("argf"), amount: 0.05, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(), name: "SCC — pumpable", process: "SCC" as any, version: "v1.0",
      densityKgM3: 2400,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("flyash"), amount: 0.20, unit: "ratio" },
        { id: id(), materialId: get("limestone"), amount: 0.10, unit: "ratio" },
        { id: id(), materialId: get("sand02"), amount: 1.90, unit: "ratio" },
        { id: id(), materialId: get("c5_10"), amount: 0.80, unit: "ratio" },
        { id: id(), materialId: get("c10_20"), amount: 0.80, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.32, unit: "ratio" },
        { id: id(), materialId: get("pce"), amount: 0.010, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(), name: "Microcement — flooring base", process: "MICROCEMENT" as any, version: "v1.0",
      densityKgM3: 1800,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("limestone"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("polymer"), amount: 0.10, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.35, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
    {
      id: id(), name: "Concrete — 1:2:3 (w/c 0.50)", process: "CONCRETE" as any, version: "v1.0",
      densityKgM3: 2350,
      lines: [
        { id: id(), materialId: get("cement"), amount: 1.0, unit: "ratio" },
        { id: id(), materialId: get("sand02"), amount: 2.0, unit: "ratio" },
        { id: id(), materialId: get("c10_20"), amount: 3.0, unit: "ratio" },
        { id: id(), materialId: get("water"), amount: 0.50, unit: "ratio" },
        { id: id(), materialId: get("pce"), amount: 0.004, unit: "ratio" },
      ],
      createdAt: now(), updatedAt: now(),
    },
  ];
}

export function seedState(): AppState {
  const materials = seedMaterials();
  const recipes = seedRecipes(materials);
  return {
    materials,
    recipes,
    products: [],
    batches: [],
    settings: { units: "metric", defaultSparePct: 7 },
  } as AppState;
}
