// src/services/DataSync.ts
// Shared data synchronization service for web and mobile
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppState } from '../types';

const KEY = "arqon_app_state"; // Same key as web app
const SYNC_KEY = "arqon_sync_timestamp";

export class DataSyncService {
  // Load data from local storage (same as web app)
  static async load(): Promise<AppState> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (!raw) {
        const s = DataSyncService.seedState();
        await DataSyncService.save(s);
        return s;
      }
      
      const parsed: AppState = JSON.parse(raw);
      return DataSyncService.migrate(parsed);
    } catch (error) {
      console.error('Failed to load data:', error);
      const s = DataSyncService.seedState();
      await DataSyncService.save(s);
      return s;
    }
  }

  // Save data to local storage (same as web app)
  static async save(state: AppState): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
      await AsyncStorage.setItem(SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Get last sync timestamp
  static async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(SYNC_KEY);
    } catch (error) {
      console.error('Failed to get sync timestamp:', error);
      return null;
    }
  }

  // Migrate data structure (same as web app)
  private static migrate(state: AppState): AppState {
    // Ensure materials have currency defaults
    const materials = (state.materials || []).map((m) => ({
      ...m,
      costPerUnitIDR: m.costPerUnitIDR || 0,
      unit: m.unit || 'kg',
    }));
    return { ...state, materials };
  }

  // Seed data (same as web app)
  private static seedState(): AppState {
    const materials = this.seedMaterials();
    const recipes = this.seedRecipes(materials);
    
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
        title: "Arqon",
        description: "Advanced Concrete Solutions",
        contactEmail: "info@arqon.com",
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

  private static seedMaterials() {
    const id = () => Math.random().toString(36).slice(2, 10);
    const now = () => new Date().toISOString();
    
    return [
      { 
        id: id(), 
        name: "Cement (OPC)", 
        unit: "kg",
        costPerUnitIDR: 2000, 
        densityKgM3: 1500,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "Silica Fume", 
        unit: "kg",
        costPerUnitIDR: 27000, // ~1.8 USD * 15000 IDR/USD
        densityKgM3: 400,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "Metakaolin", 
        unit: "kg",
        costPerUnitIDR: 31500, // ~2.1 USD * 15000 IDR/USD
        densityKgM3: 500,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "Quartz Sand 0–2mm", 
        unit: "kg",
        costPerUnitIDR: 1500, 
        densityKgM3: 1600,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "PCE Superplasticizer", 
        unit: "kg",
        costPerUnitIDR: 36000, // ~2.4 EUR * 15000 IDR/EUR
        densityKgM3: 1050,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "Water", 
        unit: "L",
        costPerUnitIDR: 0, 
        densityKgM3: 1000,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "AR Glass Fiber", 
        unit: "kg",
        costPerUnitIDR: 60000, // ~4.0 USD * 15000 IDR/USD
        densityKgM3: 2600,
        createdAt: now(),
        updatedAt: now()
      },
      { 
        id: id(), 
        name: "Pigment (Carbon Black)", 
        unit: "kg",
        costPerUnitIDR: 45000, // ~3.0 USD * 15000 IDR/USD
        densityKgM3: 450,
        createdAt: now(),
        updatedAt: now()
      },
    ];
  }

  private static seedRecipes(materials: any[]) {
    const id = () => Math.random().toString(36).slice(2, 10);
    const now = () => new Date().toISOString();
    
    const cement = materials.find(m => m.name.includes("Cement"));
    const silica = materials.find(m => m.name.includes("Silica"));
    const sand = materials.find(m => m.name.includes("Sand"));
    const water = materials.find(m => m.name.includes("Water"));
    const superplasticizer = materials.find(m => m.name.includes("Superplasticizer"));
    
    if (!cement || !silica || !sand || !water || !superplasticizer) {
      return [];
    }

    return [
      {
        id: id(),
        name: "UHPC Base Mix",
        process: "UHPC",
        version: "v1.0",
        densityKgM3: 2350,
        lines: [
          { materialId: cement.id, amount: 1.0, notes: "Cement base" },
          { materialId: silica.id, amount: 0.25, notes: "Silica fume" },
          { materialId: sand.id, amount: 1.1, notes: "Fine sand" },
          { materialId: water.id, amount: 0.19, notes: "Water" },
          { materialId: superplasticizer.id, amount: 0.015, notes: "Superplasticizer" },
        ],
        createdAt: now(),
        updatedAt: now(),
        tags: ["UHPC", "base", "high-strength"]
      },
      {
        id: id(),
        name: "GFRC Backer Mix",
        process: "GFRC_BACK",
        version: "v1.0",
        densityKgM3: 2200,
        lines: [
          { materialId: cement.id, amount: 1.0, notes: "Cement base" },
          { materialId: silica.id, amount: 0.2, notes: "Silica fume" },
          { materialId: sand.id, amount: 1.6, notes: "Fine sand" },
          { materialId: water.id, amount: 0.33, notes: "Water" },
          { materialId: superplasticizer.id, amount: 0.006, notes: "Superplasticizer" },
        ],
        createdAt: now(),
        updatedAt: now(),
        tags: ["GFRC", "backer", "fiber-reinforced"]
      }
    ];
  }
}

// Export convenience functions (same interface as web app)
export const load = DataSyncService.load;
export const save = DataSyncService.save;
