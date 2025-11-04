// src/store.ts - Mobile data storage using shared DataSync service
// This ensures "one data, one setting" between web and mobile
import type { AppState, Material, Recipe, Product, Proposal } from './types';
import { DataSyncService } from './services/DataSync';

// Re-export the shared data sync service for compatibility
export const load = DataSyncService.load;
export const save = DataSyncService.save;

// Utility functions for data manipulation
export function addMaterial(state: AppState, material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const now = new Date().toISOString();
  const newMaterial: Material = {
    ...material,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    ...state,
    materials: [...state.materials, newMaterial],
  };
}

export function updateMaterial(state: AppState, id: string, updates: Partial<Material>): AppState {
  return {
    ...state,
    materials: state.materials.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
    ),
  };
}

export function deleteMaterial(state: AppState, id: string): AppState {
  return {
    ...state,
    materials: state.materials.filter(m => m.id !== id),
  };
}

// Similar functions for recipes, products, etc.
export function addRecipe(state: AppState, recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const now = new Date().toISOString();
  const newRecipe: Recipe = {
    ...recipe,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    ...state,
    recipes: [...state.recipes, newRecipe],
  };
}

export function updateRecipe(state: AppState, id: string, updates: Partial<Recipe>): AppState {
  return {
    ...state,
    recipes: state.recipes.map(r => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ),
  };
}

export function deleteRecipe(state: AppState, id: string): AppState {
  return {
    ...state,
    recipes: state.recipes.filter(r => r.id !== id),
  };
}

export function addProduct(state: AppState, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const now = new Date().toISOString();
  const newProduct: Product = {
    ...product,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    ...state,
    products: [...state.products, newProduct],
  };
}

export function updateProduct(state: AppState, id: string, updates: Partial<Product>): AppState {
  return {
    ...state,
    products: state.products.map(p => 
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ),
  };
}

export function deleteProduct(state: AppState, id: string): AppState {
  return {
    ...state,
    products: state.products.filter(p => p.id !== id),
  };
}

export function addProposal(state: AppState, proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newProposal: Proposal = {
    ...proposal,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return {
    ...state,
    proposals: [...(state.proposals || []), newProposal],
  };
}

export function updateProposal(state: AppState, id: string, updates: Partial<Proposal>): AppState {
  return {
    ...state,
    proposals: (state.proposals || []).map(p => 
      p.id === id 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ),
  };
}

export function deleteProposal(state: AppState, id: string): AppState {
  return {
    ...state,
    proposals: (state.proposals || []).filter(p => p.id !== id),
  };
}

export function addLabEntry(state: AppState, labEntry: Omit<LabEntry, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const now = new Date().toISOString();
  const newLabEntry: LabEntry = {
    ...labEntry,
    id: Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  };
  
  return {
    ...state,
    labEntries: [...(state.labEntries || []), newLabEntry],
  };
}

// Reset to seed data
export async function resetToSeedData(): Promise<AppState> {
  const seedData = await DataSyncService.load(); // This will create fresh seed data if none exists
  await DataSyncService.save(seedData);
  return seedData;
}