import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, ProductRecipe, Product, Recipe } from "../types";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

export default function ProductRecipes() {
  const navigate = useNavigate();
  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Refresh data when component mounts
  useEffect(() => {
    const refreshData = () => {
      const freshState = load();
      setState(freshState);
      console.log('ProductRecipes page refreshed - product recipes count:', freshState.productRecipes?.length || 0);
    };
    
    refreshData();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const productRecipes = state.productRecipes || [];
  const products = state.products || [];
  const mainRecipes = state.recipes || [];

  // Group product recipes by product
  const recipesByProduct = productRecipes.reduce((acc, recipe) => {
    const product = products.find(p => p.id === recipe.productId);
    const productName = product?.title || 'Unknown Product';
    if (!acc[productName]) {
      acc[productName] = [];
    }
    acc[productName].push({ ...recipe, product });
    return acc;
  }, {} as Record<string, Array<ProductRecipe & { product?: Product }>>);

  const handleDeleteProductRecipe = async (recipeId: string) => {
    if (!confirm('Are you sure you want to delete this product recipe? This action cannot be undone.')) {
      return;
    }
    
    try {
      const updatedState = {
        ...state,
        productRecipes: state.productRecipes.filter(recipe => recipe.id !== recipeId)
      };
      setState(updatedState);
      setHasUnsavedChanges(true);
      console.log('Product recipe deleted successfully');
    } catch (error) {
      console.error('Failed to delete product recipe:', error);
      alert('Failed to delete product recipe. Please try again.');
    }
  };

  const handleSave = async () => {
    try {
      await save(state);
      setHasUnsavedChanges(false);
      alert('Product recipes saved successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save product recipes. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Product Recipe Management</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Product Recipes
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              View and manage recipes that are specific to individual products and variants.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            <button 
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg transition-all duration-300 hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Changes
            </button>
            <button 
              className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all duration-300 hover:border-white/30 hover:shadow-lg flex items-center gap-2"
              onClick={()=>navigate(-1)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Product Recipe System Explanation */}
      <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Product-Specific Recipes</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-green-400 mb-2">🏭 Product Recipes</h4>
                <p>Recipes created specifically for individual product variants. These don't appear in the main recipe library.</p>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-2">🏗️ Base Recipe Connection</h4>
                <p>Each product recipe is derived from a main recipe and maintains a connection to its base recipe.</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-2">📦 Product Assignment</h4>
                <p>Product recipes are automatically assigned to the specific product variant they were created for.</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-2">✏️ Edit & Manage</h4>
                <p>You can view, edit, and delete product recipes here without affecting the main recipe library.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Object.keys(recipesByProduct).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Product Recipes Yet</h3>
            <p className="text-gray-400 mb-6">Product-specific recipes will appear here when you derive them from the Product Editor.</p>
            <Link
              to="/app/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Go to Products
            </Link>
          </div>
        ) : (
          Object.entries(recipesByProduct).map(([productName, recipes]) => (
            <section key={productName} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-blue-600/3 rounded-2xl blur-2xl" />
              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <h2 className="text-lg font-black text-white">{productName}</h2>
                  <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-lg">{recipes.length}</span>
                </div>
                <div className="grid gap-4">
                  {recipes.map((recipe) => {
                    const baseRecipe = mainRecipes.find(r => r.id === recipe.baseRecipeId);
                    const variant = recipe.product?.variants.find(v => v.id === recipe.variantId);
                    
                    return (
                      <div key={recipe.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-white text-lg">{recipe.name}</h3>
                                <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold">
                                  Product Recipe
                                </span>
                              </div>
                              <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Product:</span>
                                  <span>{recipe.product?.title || 'Unknown'}</span>
                                  {variant && <span>• {variant.name}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Process:</span>
                                  <span className="capitalize">{recipe.process}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Base Recipe:</span>
                                  <span>{baseRecipe?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Materials:</span>
                                  <span>{recipe.lines.length} ingredients</span>
                                  {recipe.densityKgM3 && (
                                    <>
                                      <span>•</span>
                                      <span>{recipe.densityKgM3} kg/m³</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>Created: {new Date(recipe.createdAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                                onClick={() => navigate(`/app/product-recipes/edit/${recipe.id}`)}
                              >
                                Edit
                              </button>
                              <button
                                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
                                onClick={() => handleDeleteProductRecipe(recipe.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}






