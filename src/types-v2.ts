// Recipe v2 Types - Multi-dimensional variant system
// This is a separate type system for testing the new recipe management approach

export type VariantDimension = {
  type: string;        // "color", "texture", "finish", "size", etc.
  value: string;       // "red", "rough", "matte", "large", etc.
  label?: string;      // Display label for UI
};

export type RecipeV2 = {
  id: string;
  name: string;
  process: string;
  version?: string;
  densityKgM3?: number;
  lines: RecipeLineV2[];
  tags?: string[];
  
  // Family relationships
  parentId?: string;           // Points to base recipe (e.g., UHPC base recipe)
  familyId?: string;           // Groups all related recipes (e.g., "Tile" family)
  isBaseRecipe?: boolean;      // Is this a base recipe for the family?
  
  // Product model and variant dimensions
  productModelId?: string;     // Which product model (e.g., "Tile A", "Tile B")
  variantDimensions?: VariantDimension[];  // Colors, textures, etc.
  displayName?: string;        // Auto-generated display name (e.g., "Tile A - Red - Rough")
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  notes?: string;
};

export type RecipeLineV2 = {
  id: string;
  materialId: string;
  amount: number;
  unit: Unit;
  notes?: string;
};

export type Unit = "ratio" | "kg" | "g" | "L" | "mL";

export type RecipeFamily = {
  id: string;
  name: string;                // "Tile", "Panel", "Slab", etc. (Product Type)
  baseRecipeId: string;        // The process-specific base recipe (e.g., UHPC-based tile recipe)
  process: string;             // "uhpc", "gfrc", etc.
  description?: string;
  
  // Product models in this family (e.g., "Tile A", "Tile B", "Tile C")
  productModels: {
    id: string;
    name: string;              // "Tile A", "Tile B", etc.
    description?: string;
    recipeId?: string;         // Optional: specific recipe for this model
  }[];
  
  // Variant dimensions available for this family (colors, textures, etc.)
  availableDimensions: {
    type: string;
    label: string;
    values: Array<{
      value: string;
      label: string;
    }>;
  }[];
  
  // All recipes in this family
  recipeIds: string[];
  
  createdAt: string;
  updatedAt: string;
};

export type AppStateV2 = {
  recipes: RecipeV2[];
  families: RecipeFamily[];
  materials: MaterialV2[];
  processes: ProcessV2[];
  
  // Settings
  defaultDimensions: {
    type: string;
    label: string;
    values: string[];
  }[];
  
  createdAt: string;
  updatedAt: string;
};

export type MaterialV2 = {
  id: string;
  name: string;
  unit: Unit;
  costPerUnit?: number;
  density?: number;
  description?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProcessV2 = {
  id: string;
  key: string;
  label: string;
  description?: string;
  defaultDimensions?: string[];  // Which dimensions are commonly used for this process
  createdAt: string;
  updatedAt: string;
};

// Utility types for UI
export type VariantCreationRequest = {
  baseRecipeId: string;
  dimensions: VariantDimension[];
  name?: string;  // Optional custom name
};

export type RecipeFamilyView = {
  family: RecipeFamily;
  baseRecipe: RecipeV2;
  variants: RecipeV2[];
  dimensionMatrix: {
    [dimensionType: string]: {
      [value: string]: RecipeV2[];
    };
  };
};

// Filter and search types
export type RecipeFilter = {
  familyId?: string;
  process?: string;
  dimensions?: {
    type: string;
    values: string[];
  }[];
  tags?: string[];
  isBaseRecipe?: boolean;
};

export type RecipeSearchResult = {
  recipe: RecipeV2;
  family?: RecipeFamily;
  matchScore: number;
  matchReasons: string[];
};
