import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, ProductRecipe, Product, Recipe, Material, RecipeLine, Unit } from "../types";
import { getProcesses } from "../lib/process";
import NumberField from "../components/NumberField";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function ProductRecipeEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [state, setState] = useState<AppState>(() => load());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const productRecipe = state.productRecipes?.find(r => r.id === id);
  const product = productRecipe ? state.products.find(p => p.id === productRecipe.productId) : undefined;
  const variant = productRecipe && product ? product.variants.find(v => v.id === productRecipe.variantId) : undefined;
  const baseRecipe = productRecipe ? state.recipes.find(r => r.id === productRecipe.baseRecipeId) : undefined;

  const materials = state.materials || [];
  const PROC_LIST = getProcesses(state);

  // Form state
  const [name, setName] = useState(productRecipe?.name || '');
  const [version, setVersion] = useState(productRecipe?.version || 'v0.1');
  const [density, setDensity] = useState<number | ''>(productRecipe?.densityKgM3 ?? '');
  const [lines, setLines] = useState<RecipeLine[]>(productRecipe?.lines || []);

  useEffect(() => {
    if (productRecipe) {
      setName(productRecipe.name);
      setVersion(productRecipe.version || 'v0.1');
      setDensity(productRecipe.densityKgM3 ?? '');
      setLines(productRecipe.lines);
    }
  }, [productRecipe]);

  const handleAddLine = () => {
    if (materials.length === 0) {
      alert('Please create materials first');
      return;
    }
    
    const materialOptions = materials.map(material => ({
      text: material.name,
      onPress: () => {
        setLines([{ id: newid(), materialId: material.id, amount: 0.01, unit: 'kg' }, ...lines]);
        setHasUnsavedChanges(true);
      },
    }));
    
    alert('Select Material', 'Choose a material to add:', materialOptions);
  };

  const handleUpdateLine = (lineId: string, updates: Partial<RecipeLine>) => {
    setLines(lines.map(l => (l.id === lineId ? { ...l, ...updates } : l)));
    setHasUnsavedChanges(true);
  };

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter(l => l.id !== lineId));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!productRecipe) return;
    
    try {
      const updatedRecipe: ProductRecipe = {
        ...productRecipe,
        name: name.trim(),
        version,
        densityKgM3: density === '' ? undefined : Number(density),
        lines,
        updatedAt: now(),
      };

      const updatedState = {
        ...state,
        productRecipes: state.productRecipes.map(r => 
          r.id === productRecipe.id ? updatedRecipe : r
        ),
      };

      setState(updatedState);
      await save(updatedState);
      setHasUnsavedChanges(false);
      alert('Product recipe updated successfully!');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save product recipe. Please try again.');
    }
  };

  if (!productRecipe) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Product Recipe Not Found</h3>
          <p className="text-gray-400 mb-6">The product recipe you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => navigate('/app/product-recipes')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Product Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Product Recipe Editor</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Edit Product Recipe
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Modify the recipe for {product?.title} / {variant?.name} ({productRecipe.process} process)
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
              Save Recipe
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

      {/* Recipe Info */}
      <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white">Recipe Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">Product</h4>
                <p>{product?.title} / {variant?.name}</p>
              </div>
              <div>
                <h4 className="font-semibold text-green-400 mb-1">Base Recipe</h4>
                <p>{baseRecipe?.name || 'Unknown'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-purple-400 mb-1">Process</h4>
                <p className="capitalize">{productRecipe.process}</p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-400 mb-1">Created</h4>
                <p>{new Date(productRecipe.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-transparent to-blue-600/3 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Basic Information</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-white/20 focus:outline-none"
                    placeholder="Enter recipe name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => {
                      setVersion(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-white/20 focus:outline-none"
                    placeholder="v0.1"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Density (kg/m³)
                </label>
                <NumberField
                  value={density === '' ? 0 : Number(density)}
                  onChange={(num) => {
                    setDensity(num === 0 ? '' : num);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="2400"
                  style={{ width: '200px' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/3 via-transparent to-green-600/3 rounded-2xl blur-2xl" />
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/8 to-white/3 overflow-hidden hover:from-white/12 hover:to-white/6 transition-all duration-500 hover:border-white/20 hover:shadow-xl backdrop-blur-sm concrete-texture">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Materials ({lines.length})</h2>
                <button
                  className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
                  onClick={handleAddLine}
                >
                  Add Material
                </button>
              </div>
              
              {lines.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">No materials added yet</p>
                  <p className="text-sm text-gray-500">Click "Add Material" to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lines.map((line) => {
                    const material = materials.find(m => m.id === line.materialId);
                    return (
                      <div key={line.id} className="p-4 rounded-xl border border-white/10 bg-black/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{material?.name || 'Unknown Material'}</h4>
                          <button
                            className="p-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                            onClick={() => handleRemoveLine(line.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Amount
                            </label>
                            <NumberField
                              value={line.amount || 0}
                              onChange={(amount) => handleUpdateLine(line.id, { amount })}
                              placeholder="0.00"
                              style={{ width: '100%' }}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                              Unit
                            </label>
                            <select
                              value={line.unit}
                              onChange={(e) => handleUpdateLine(line.id, { unit: e.target.value as Unit })}
                              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                            >
                              {UNITS.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}






