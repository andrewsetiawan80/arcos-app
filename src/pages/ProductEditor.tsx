import React, { useEffect, useMemo, useState } from "react";
import { load, save } from "../store";
import type { AppState, Product, ProductVariant, Recipe } from "../types";
import { getProcesses } from "../lib/process";
import NumberField from "../components/NumberField";

const newid = ()=>Math.random().toString(36).slice(2,10);

export default function ProductEditor(){
  const [state, setState] = useState<AppState>(()=>load());
  useEffect(()=>save(state),[state]);

  const [selectedId, setSelectedId] = useState(state.products[0]?.id || "");
  const products = state.products;
  const pIdx = products.findIndex(p=>p.id===selectedId);
  const product = pIdx>=0 ? products[pIdx] : undefined;

  const PROC_LIST = getProcesses(state);

  const recipesByProcess = useMemo(()=>{
    const map: Record<string, Recipe[]> = {};
    for (const p of PROC_LIST) map[p.key] = [];
    for(const r of state.recipes){
      (map[r.process] ||= []).push(r);
    }
    return map;
  },[state.recipes, PROC_LIST.map(p=>p.key).join("|")]);

  const visibleProcesses = useMemo(
    ()=> PROC_LIST.filter(p => (recipesByProcess[p.key]?.length ?? 0) > 0),
    [recipesByProcess, PROC_LIST]
  );

  function addProduct(){
    const title = prompt("Product name (e.g., Wave):","Wave");
    if (!title) return;
    const p: Product = {
      id: newid(),
      title,
      size: { w_mm: 300, h_mm: 300, t_mm: 12 },
      tileArea_m2: undefined,
      coverImageUrl: "",
      variants: [
        { id: newid(), name: "Default", color: "", recipeByProcess: {} as any }
      ] as ProductVariant[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product;
    const next = {...state, products: [p, ...state.products]};
    setState(next);
    setSelectedId(p.id);
  }

  function removeProduct(id:string){
    if (!confirm("Delete this product and all its variants?")) return;
    setState(s=> ({...s, products: s.products.filter(p=>p.id!==id)}));
    if (id===selectedId){
      const next = state.products.find(p=>p.id!==id);
      setSelectedId(next?.id || "");
    }
  }

  function updateProduct(patch: Partial<Product>){
    setState(s=>{
      if (pIdx<0) return s;
      const copy = {...s};
      const list = [...copy.products];
      const updated = {...list[pIdx], ...patch, updatedAt: new Date().toISOString()};
      list[pIdx] = updated;
      copy.products = list;
      return copy;
    });
  }

  function addVariant(){
    if (!product) return;
    const name = prompt("Variant name (e.g., Charcoal)","New Variant");
    if (!name) return;
    setState(s=>{
      const list = [...s.products];
      const cur = {...list[pIdx]};
      const v: ProductVariant = {
        id: newid(),
        name,
        color: "",
        recipeByProcess: {} as any,
      };
      cur.variants = [v, ...cur.variants];
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return {...s, products: list};
    });
  }

  function updateVariant(vid:string, patch: Partial<ProductVariant>){
    setState(s=>{
      const list = [...s.products];
      const cur = {...list[pIdx]};
      cur.variants = cur.variants.map(v => v.id===vid ? {...v, ...patch} : v);
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return {...s, products: list};
    });
  }

  function removeVariant(vid:string){
    if (!confirm("Delete this variant?")) return;
    setState(s=>{
      const list = [...s.products];
      const cur = {...list[pIdx]};
      cur.variants = cur.variants.filter(v=>v.id!==vid);
      cur.updatedAt = new Date().toISOString();
      list[pIdx] = cur;
      return {...s, products: list};
    });
  }

  function toggleProcess(vid:string, procKey:string, enabled:boolean){
    const v = product?.variants.find(x=>x.id===vid);
    if (!v) return;
    const nextMap = {...(v.recipeByProcess||{})};
    if (!enabled){
      delete (nextMap as any)[procKey];
    } else {
      const first = (recipesByProcess[procKey]||[])[0];
      (nextMap as any)[procKey] = first?.id || "";
    }
    updateVariant(vid, { recipeByProcess: nextMap as any });
  }

  function setRecipeFor(vid:string, procKey:string, recipeId:string){
    const v = product?.variants.find(x=>x.id===vid);
    if (!v) return;
    const nextMap = {...(v.recipeByProcess||{}), [procKey]: recipeId};
    updateVariant(vid, { recipeByProcess: nextMap as any });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Catalog Admin</h1>
        <div className="flex gap-2">
          <a className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10" href="/products">Back to Products</a>
          <button className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow-lg" onClick={addProduct}>+ Add Product</button>
        </div>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-2 max-h-[70vh] overflow-auto">
          {products.map(p=>(
            <div key={p.id} className={`rounded-lg px-3 py-2 cursor-pointer flex items-center justify-between ${selectedId===p.id ? "bg-white/10" : "hover:bg-white/5"}`}
                 onClick={()=>setSelectedId(p.id)}>
              <div className="truncate">{p.title}</div>
              <button
                className="text-xs text-red-300 hover:text-red-200"
                onClick={(e)=>{e.stopPropagation(); removeProduct(p.id);}}
                title="Delete product"
              >Delete</button>
            </div>
          ))}
          {!products.length && <div className="text-gray-400 text-sm">No products yet. Click “Add Product”.</div>}
        </div>

        <div className="rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-white/5 to-white/0 shadow-lg space-y-6">
          {product ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Product name</div>
                  <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                         value={product.title}
                         onChange={e=>updateProduct({title:e.target.value})}/>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Cover image URL (optional)</div>
                  <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                         value={(product as any).coverImageUrl || ""}
                         onChange={e=>updateProduct({ ...(product as any), coverImageUrl: e.target.value })}/>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Width (mm)</div>
                  <NumberField
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.size?.w_mm}
                    onChange={(v)=>updateProduct({ size: {...product.size, w_mm: v as any } as any })}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Height (mm)</div>
                  <NumberField
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.size?.h_mm}
                    onChange={(v)=>updateProduct({ size: {...product.size, h_mm: v as any } as any })}
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Thickness (mm)</div>
                  <NumberField
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    value={product.size?.t_mm}
                    onChange={(v)=>updateProduct({ size: {...product.size, t_mm: v as any } as any })}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">Custom tile area (m²) — optional</div>
                <NumberField
                  className="w-60 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                  value={product.tileArea_m2}
                  onChange={(v)=>updateProduct({ tileArea_m2: v })}
                  step="0.0001"
                />
                <div className="text-xs text-gray-500 mt-1">For non-rectangular tiles, enter the area directly.</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Variants</div>
                <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10" onClick={addVariant}>+ Add Variant</button>
              </div>

              <div className="space-y-4">
                {product.variants.map(variant=>(
                  <div key={variant.id} className="rounded-xl border border-white/10 p-4 bg-black/20 space-y-4">
                    <div className="grid md:grid-cols-[1fr_200px_100px] gap-3">
                      <input className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                             placeholder="Variant name"
                             value={variant.name}
                             onChange={e=>updateVariant(variant.id,{name:e.target.value})}/>
                      <input className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                             placeholder="Color (optional)"
                             value={variant.color || ""}
                             onChange={e=>updateVariant(variant.id,{color:e.target.value})}/>
                      <div className="flex items-center justify-end">
                        <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                                onClick={()=>removeVariant(variant.id)}>
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-white/10 p-3">
                      <div className="text-xs text-gray-400 mb-2">Processes for this variant</div>
                      {visibleProcesses.length===0 ? (
                        <div className="text-sm text-gray-400">No processes available — add recipes first.</div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {visibleProcesses.map(proc=>{
                            const enabled = !!(variant.recipeByProcess || {})[proc.key];
                            const list = recipesByProcess[proc.key] || [];
                            const currentId = (variant.recipeByProcess || {})[proc.key] || "";
                            return (
                              <div key={proc.key} className="rounded-lg border border-white/10 p-3 bg-black/10">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={enabled}
                                    onChange={e=>toggleProcess(variant.id, proc.key, e.target.checked)}
                                  />
                                  <span className="text-sm">{proc.label}</span>
                                </label>

                                <div className="mt-2 flex items-end gap-2">
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-400 mb-1">Recipe</div>
                                    <select
                                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm disabled:opacity-40"
                                      disabled={!enabled}
                                      value={currentId}
                                      onChange={e=>setRecipeFor(variant.id, proc.key, e.target.value)}
                                    >
                                      <option value="">— Select recipe —</option>
                                      {list.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                  </div>

                                  <button
                                    className="shrink-0 rounded-lg px-3 py-2 text-xs border border-white/10 bg-black/20 hover:bg-white/10 disabled:opacity-40"
                                    disabled={!enabled || !currentId}
                                    onClick={()=>{
                                      const url = `/derive-recipe?base=${encodeURIComponent(currentId)}&product=${encodeURIComponent(product!.id)}&variant=${encodeURIComponent(variant.id)}&process=${encodeURIComponent(proc.key)}`;
                                      window.location.href = url;
                                    }}
                                    title="Create a new recipe derived from the selected base and assign it to this variant"
                                  >
                                    Derive…
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {!product.variants.length && <div className="text-gray-400 text-sm">No variants yet.</div>}
              </div>
            </>
          ) : (
            <div className="text-gray-400">Select a product on the left or add a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}
