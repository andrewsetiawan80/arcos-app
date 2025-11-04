import type { AppState, Material, Recipe } from "./types";

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export function seedMaterials(): Material[] {
  return [
    { 
      id: "cement-gp", 
      name: "Cement (GP)", 
      unit: "kg",
      costPerUnitIDR: 2100, 
      densityKgM3: 3150,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "silica-fume", 
      name: "Silica fume", 
      unit: "kg",
      costPerUnitIDR: 12000, 
      densityKgM3: 2200,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "metakaolin", 
      name: "Metakaolin", 
      unit: "kg",
      costPerUnitIDR: 7000, 
      densityKgM3: 2500,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "fly-ash", 
      name: "Fly ash (Class F)", 
      unit: "kg",
      costPerUnitIDR: 1500, 
      densityKgM3: 2200,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "limestone-powder", 
      name: "Limestone powder", 
      unit: "kg",
      costPerUnitIDR: 1200, 
      densityKgM3: 2700,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "sand-005", 
      name: "Sand (0–0.5 mm)", 
      unit: "kg",
      costPerUnitIDR: 250, 
      densityKgM3: 2650,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "sand-02", 
      name: "Sand (0–2 mm)", 
      unit: "kg",
      costPerUnitIDR: 200, 
      densityKgM3: 2650,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "coarse-5-10", 
      name: "Coarse 5–10 mm", 
      unit: "kg",
      costPerUnitIDR: 180, 
      densityKgM3: 2700,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "coarse-10-20", 
      name: "Coarse 10–20 mm", 
      unit: "kg",
      costPerUnitIDR: 160, 
      densityKgM3: 2700,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "water", 
      name: "Water", 
      unit: "kg",
      costPerUnitIDR: 0, 
      densityKgM3: 1000,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "pce-superplasticizer", 
      name: "PCE Superplasticizer (product)", 
      unit: "kg",
      costPerUnitIDR: 3500, 
      densityKgM3: 1050,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "steel-fibers", 
      name: "Steel fibers", 
      unit: "kg",
      costPerUnitIDR: 24000, 
      densityKgM3: 7800,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "ar-glass-fibers", 
      name: "AR Glass fibers (chopped)", 
      unit: "kg",
      costPerUnitIDR: 7500, 
      densityKgM3: 2550,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "polymer-emulsion", 
      name: "Polymer emulsion (flooring)", 
      unit: "kg",
      costPerUnitIDR: 4200, 
      densityKgM3: 1040,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "pigment-black", 
      name: "Pigment — carbon black", 
      unit: "kg",
      costPerUnitIDR: 15000, 
      densityKgM3: 1500,
      createdAt: now(), 
      updatedAt: now() 
    },
    { 
      id: "pigment-white", 
      name: "Pigment — titanium white", 
      unit: "kg",
      costPerUnitIDR: 6800, 
      densityKgM3: 4200,
      createdAt: now(), 
      updatedAt: now() 
    },
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
      id: "uhpc-baseline", 
      name: "UHPC — baseline 2% steel", 
      process: "UHPC", 
      densityKgM3: 2350,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("silica"), amount: 0.25, notes: "" },
        { materialId: get("metakaolin"), amount: 0.00, notes: "" },
        { materialId: get("sand02"), amount: 1.10, notes: "" },
        { materialId: get("water"), amount: 0.19, notes: "" },
        { materialId: get("pce"), amount: 0.015, notes: "" },
        { materialId: get("steel"), amount: 0.02, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
    },
    {
      id: "gfrc-facecoat", 
      name: "GFRC — facecoat smooth", 
      process: "GFRC_FACE", 
      densityKgM3: 2200,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("silica"), amount: 0.20, notes: "" },
        { materialId: get("sand005"), amount: 1.20, notes: "" },
        { materialId: get("water"), amount: 0.33, notes: "" },
        { materialId: get("pce"), amount: 0.008, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
    },
    {
      id: "gfrc-backer", 
      name: "GFRC — backer AR", 
      process: "GFRC_BACK", 
      densityKgM3: 2200,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("silica"), amount: 0.20, notes: "" },
        { materialId: get("sand02"), amount: 1.60, notes: "" },
        { materialId: get("water"), amount: 0.33, notes: "" },
        { materialId: get("pce"), amount: 0.006, notes: "" },
        { materialId: get("argf"), amount: 0.05, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
    },
    {
      id: "scc-pumpable", 
      name: "SCC — pumpable", 
      process: "SCC", 
      densityKgM3: 2400,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("flyash"), amount: 0.20, notes: "" },
        { materialId: get("limestone"), amount: 0.10, notes: "" },
        { materialId: get("sand02"), amount: 1.90, notes: "" },
        { materialId: get("c5_10"), amount: 0.80, notes: "" },
        { materialId: get("c10_20"), amount: 0.80, notes: "" },
        { materialId: get("water"), amount: 0.32, notes: "" },
        { materialId: get("pce"), amount: 0.010, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
    },
    {
      id: "microcement-flooring", 
      name: "Microcement — flooring base", 
      process: "MICROCEMENT", 
      densityKgM3: 1800,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("limestone"), amount: 1.0, notes: "" },
        { materialId: get("polymer"), amount: 0.10, notes: "" },
        { materialId: get("water"), amount: 0.35, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
    },
    {
      id: "concrete-123", 
      name: "Concrete — 1:2:3 (w/c 0.50)", 
      process: "CONCRETE", 
      densityKgM3: 2350,
      lines: [
        { materialId: get("cement"), amount: 1.0, notes: "" },
        { materialId: get("sand02"), amount: 2.0, notes: "" },
        { materialId: get("c10_20"), amount: 3.0, notes: "" },
        { materialId: get("water"), amount: 0.50, notes: "" },
        { materialId: get("pce"), amount: 0.004, notes: "" },
      ],
      createdAt: now(), 
      updatedAt: now(),
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
    labEntries: [],
    proposals: [],
    ideas: [],
    processes: [],
    batches: [],
    site: {
      title: "Castura",
      description: "Advanced Concrete Solutions",
      contactEmail: "info@castura.com",
    },
    categories: [],
    settings: { 
      defaultCurrency: "IDR",
      units: "metric", 
      defaultSparePct: 7,
      processes: [
        { key: "UHPC", label: "Ultra-High Performance Concrete" },
        { key: "GFRC_FACE", label: "GFRC Facecoat" },
        { key: "GFRC_BACK", label: "GFRC Backer" },
        { key: "SCC", label: "Self-Compacting Concrete" },
        { key: "MICROCEMENT", label: "Microcement" },
        { key: "CONCRETE", label: "Standard Concrete" },
      ]
    },
  } as AppState;
}
