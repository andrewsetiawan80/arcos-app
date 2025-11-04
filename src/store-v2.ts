// Recipe v2 Store - Separate data management for the new recipe system
import type { AppStateV2, RecipeV2, RecipeFamily, MaterialV2, ProcessV2, VariantCreationRequest } from './types-v2';

const STORAGE_KEY = 'cw_app_state_v2';

// Utility functions
const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

// Load from localStorage
export function load(): AppStateV2 {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load Recipe v2 state:', error);
  }
  
  // Return default state if nothing stored
  return seedState();
}

// Save to localStorage
export async function save(state: AppStateV2): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save Recipe v2 state:', error);
    throw error;
  }
}

// Seed with initial data
export function seedState(): AppStateV2 {
  const now = new Date().toISOString();
  
  // Create sample materials
  const materials: MaterialV2[] = [
    {
      id: 'cement',
      name: 'Portland Cement',
      unit: 'kg',
      costPerUnit: 0.15,
      density: 1500,
      category: 'binder',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sand',
      name: 'Fine Sand',
      unit: 'kg',
      costPerUnit: 0.05,
      density: 1600,
      category: 'aggregate',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'water',
      name: 'Water',
      unit: 'L',
      costPerUnit: 0.001,
      density: 1000,
      category: 'liquid',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'red_pigment',
      name: 'Red Pigment',
      unit: 'kg',
      costPerUnit: 2.50,
      density: 1200,
      category: 'colorant',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'blue_pigment',
      name: 'Blue Pigment',
      unit: 'kg',
      costPerUnit: 2.50,
      density: 1200,
      category: 'colorant',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'texture_additive',
      name: 'Texture Additive',
      unit: 'kg',
      costPerUnit: 1.20,
      density: 800,
      category: 'additive',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Create sample processes (matching main system) - these are just labels/categories
  const processes: ProcessV2[] = [
    {
      id: 'uhpc',
      key: 'UHPC',
      label: 'UHPC',
      description: 'Ultra High Performance Concrete process',
      defaultDimensions: ['color', 'texture'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'gfrc_face',
      key: 'GFRC_FACE',
      label: 'GFRC — Face Coat',
      description: 'Glass Fiber Reinforced Concrete Face Coat process',
      defaultDimensions: ['color', 'texture', 'finish'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'gfrc_back',
      key: 'GFRC_BACK',
      label: 'GFRC — Backer Coat',
      description: 'Glass Fiber Reinforced Concrete Backer Coat process',
      defaultDimensions: ['color', 'texture'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'micro_cement',
      key: 'MICRO_CEMENT',
      label: 'Microcement',
      description: 'Microcement process for decorative applications',
      defaultDimensions: ['color', 'texture', 'finish'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'scc',
      key: 'SCC',
      label: 'Self-Compacting Concrete (SCC)',
      description: 'Self-Compacting Concrete process',
      defaultDimensions: ['color', 'texture'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'ecc',
      key: 'ECC',
      label: 'Engineered Cementitious Composite (ECC)',
      description: 'Engineered Cementitious Composite process',
      defaultDimensions: ['color', 'texture', 'finish'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'general',
      key: 'GENERAL',
      label: 'General Mix',
      description: 'General concrete mix process',
      defaultDimensions: ['color', 'texture'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Create base recipes (process-specific)
  const baseRecipes: RecipeV2[] = [
    {
      id: 'uhpc_tile_base',
      name: 'UHPC Tile Base Recipe',
      process: 'UHPC',
      version: 'v1.0',
      densityKgM3: 2450,
      lines: [
        { id: newid(), materialId: 'cement', amount: 1.0, unit: 'ratio' },
        { id: newid(), materialId: 'sand', amount: 1.8, unit: 'ratio' },
        { id: newid(), materialId: 'water', amount: 0.22, unit: 'ratio' },
      ],
      isBaseRecipe: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Create recipe families
  const families: RecipeFamily[] = [
    {
      id: 'tile_family',
      name: 'Tile',
      baseRecipeId: 'uhpc_tile_base',
      process: 'UHPC',
      description: 'Tile product family with UHPC base',
      productModels: [
        {
          id: 'tile_a',
          name: 'Tile A',
          description: 'Standard tile model',
        },
        {
          id: 'tile_b',
          name: 'Tile B',
          description: 'Premium tile model',
        },
        {
          id: 'tile_c',
          name: 'Tile C',
          description: 'Economy tile model',
        },
      ],
      availableDimensions: [
        {
          type: 'color',
          label: 'Color',
          values: [
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'gray', label: 'Gray' },
            { value: 'white', label: 'White' },
          ],
        },
        {
          type: 'texture',
          label: 'Texture',
          values: [
            { value: 'smooth', label: 'Smooth' },
            { value: 'rough', label: 'Rough' },
            { value: 'brick', label: 'Brick' },
            { value: 'stone', label: 'Stone' },
          ],
        },
        {
          type: 'finish',
          label: 'Finish',
          values: [
            { value: 'matte', label: 'Matte' },
            { value: 'glossy', label: 'Glossy' },
            { value: 'satin', label: 'Satin' },
          ],
        },
      ],
      recipeIds: ['uhpc_tile_base'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  return {
    recipes: baseRecipes,
    families,
    materials,
    processes,
    defaultDimensions: [
      {
        type: 'color',
        label: 'Color',
        values: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray'],
      },
      {
        type: 'texture',
        label: 'Texture',
        values: ['smooth', 'rough', 'polished', 'brushed', 'exposed'],
      },
      {
        type: 'finish',
        label: 'Finish',
        values: ['matte', 'glossy', 'satin', 'natural'],
      },
      {
        type: 'size',
        label: 'Size',
        values: ['small', 'medium', 'large', 'extra-large'],
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

// Recipe CRUD operations
export function addRecipe(state: AppStateV2, recipe: Omit<RecipeV2, 'id' | 'createdAt' | 'updatedAt'>): AppStateV2 {
  const newRecipe: RecipeV2 = {
    ...recipe,
    id: newid(),
    createdAt: now(),
    updatedAt: now(),
  };
  
  return {
    ...state,
    recipes: [newRecipe, ...state.recipes],
    updatedAt: now(),
  };
}

export function updateRecipe(state: AppStateV2, id: string, updates: Partial<RecipeV2>): AppStateV2 {
  return {
    ...state,
    recipes: state.recipes.map(recipe => 
      recipe.id === id 
        ? { ...recipe, ...updates, updatedAt: now() }
        : recipe
    ),
    updatedAt: now(),
  };
}

export function deleteRecipe(state: AppStateV2, id: string): AppStateV2 {
  return {
    ...state,
    recipes: state.recipes.filter(recipe => recipe.id !== id),
    updatedAt: now(),
  };
}

// Recipe Family CRUD operations
export function addFamily(state: AppStateV2, family: Omit<RecipeFamily, 'id' | 'createdAt' | 'updatedAt' | 'recipeIds'>): AppStateV2 {
  const newFamily: RecipeFamily = {
    ...family,
    id: newid(),
    recipeIds: [],
    createdAt: now(),
    updatedAt: now(),
  };
  
  return {
    ...state,
    families: [newFamily, ...state.families],
    updatedAt: now(),
  };
}

export function updateFamily(state: AppStateV2, id: string, updates: Partial<RecipeFamily>): AppStateV2 {
  return {
    ...state,
    families: state.families.map(family => 
      family.id === id 
        ? { ...family, ...updates, updatedAt: now() }
        : family
    ),
    updatedAt: now(),
  };
}

export function deleteFamily(state: AppStateV2, id: string): AppStateV2 {
  return {
    ...state,
    families: state.families.filter(family => family.id !== id),
    updatedAt: now(),
  };
}

// Variant creation
export function createVariant(state: AppStateV2, request: VariantCreationRequest): AppStateV2 {
  const baseRecipe = state.recipes.find(r => r.id === request.baseRecipeId);
  if (!baseRecipe) {
    throw new Error('Base recipe not found');
  }
  
  // Generate variant name
  const dimensionNames = request.dimensions.map(d => d.value).join(' - ');
  const variantName = request.name || `${baseRecipe.name} - ${dimensionNames}`;
  
  // Create variant recipe
  const variantRecipe: RecipeV2 = {
    ...baseRecipe,
    id: newid(),
    name: variantName,
    parentId: baseRecipe.id,
    familyId: baseRecipe.familyId || baseRecipe.id,
    isBaseRecipe: false,
    variantDimensions: request.dimensions,
    displayName: variantName,
    createdAt: now(),
    updatedAt: now(),
  };
  
  // Update family to include new variant
  const updatedState = addRecipe(state, variantRecipe);
  const family = updatedState.families.find(f => f.id === variantRecipe.familyId);
  
  if (family) {
    return updateFamily(updatedState, family.id, {
      recipeIds: [...family.recipeIds, variantRecipe.id],
    });
  }
  
  return updatedState;
}

// Utility functions
export function getRecipeFamily(state: AppStateV2, familyId: string): RecipeFamily | undefined {
  return state.families.find(f => f.id === familyId);
}

export function getFamilyRecipes(state: AppStateV2, familyId: string): RecipeV2[] {
  const family = getRecipeFamily(state, familyId);
  if (!family) return [];
  
  return state.recipes.filter(recipe => 
    family.recipeIds.includes(recipe.id)
  );
}

export function getBaseRecipe(state: AppStateV2, familyId: string): RecipeV2 | undefined {
  const family = getRecipeFamily(state, familyId);
  if (!family) return undefined;
  
  return state.recipes.find(recipe => recipe.id === family.baseRecipeId);
}

export function getVariantRecipes(state: AppStateV2, familyId: string): RecipeV2[] {
  const family = getRecipeFamily(state, familyId);
  if (!family) return [];
  
  return state.recipes.filter(recipe => 
    recipe.familyId === familyId && !recipe.isBaseRecipe
  );
}

export function generateVariantName(baseName: string, dimensions: { type: string; value: string }[]): string {
  const dimensionValues = dimensions.map(d => d.value);
  return `${baseName} - ${dimensionValues.join(' - ')}`;
}

export function getAvailableDimensions(state: AppStateV2, process?: string, familyId?: string): { type: string; label: string; values: string[] }[] {
  let dimensions = state.defaultDimensions;
  
  if (process) {
    const processConfig = state.processes.find(p => p.key === process);
    if (processConfig?.defaultDimensions) {
      dimensions = state.defaultDimensions.filter(dim => 
        processConfig.defaultDimensions!.includes(dim.type)
      );
    }
  }
  
  // Add custom dimensions from family if provided
  if (familyId) {
    const family = state.families.find(f => f.id === familyId);
    if (family?.availableDimensions) {
      dimensions = dimensions.map(dim => {
        const customDim = family.availableDimensions.find(cd => cd.type === dim.type);
        if (customDim) {
          return {
            ...dim,
            values: [...new Set([...dim.values, ...customDim.values])], // Merge and deduplicate
          };
        }
        return dim;
      });
    }
  }
  
  return dimensions;
}
