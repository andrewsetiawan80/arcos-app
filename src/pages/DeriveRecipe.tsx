import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { load, save } from "../store";
import type { AppState, Recipe, RecipeLine, Unit } from "../types";

const newid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => Object.fromEntries(new URLSearchParams(search).entries()), [search]);
}

const UNITS: Unit[] = ["ratio", "kg", "g", "L", "mL"];

export default function DeriveRecipe() {
  const navigate = useNavigate();
  const q = useQuery();
  const baseId = q.base || "";
  const productId = q.product || "";
  const variantId = q.variant || "";
  const processKey = q.process || "";

  const [state, setState] = useState<AppState>(() => load());
  const base = state.recipes.find(r => r.id === baseId);

  const [name, setName] = useState<string>(() => {
    const pv = productVariantTitle(state, productId, variantId);
    return base ? `${base.name} — ${pv || "variant"} (${new Date().toLocaleDateString()})` : "Derived Recipe";
  });
  const [version, setVersion] = useState<string>("v0.1");
  const [density, setDensity] = useState<number | "">(() => base?.densityKgM3 ?? "");
  const [tags, setTags] = useState<string>("");
  const [lines, setLines] = useState<RecipeLine[]>(() =>
    base ? base.lines.map(l => ({ ...l, id: newid() })) : []
  );

  function productVariantTitle(s: AppState, pid: string, vid: string) {
    const p = s.products.find(x => x.id === pid);
    const v = p?.variants.find(x => x.id === vid);
    return p && v ? `${p.title} / ${v.name}` : "";
  }

  function addLine() {
    const firstMat = state.materials[0]?.id || "";
    setLines([{ id: newid(), materialId: firstMat, unit: "ratio", amount: 0.01 }, ...lines]);
  }
  function updateLine(lineId: string, patch: Partial<RecipeLine>) {
    setLines(lines.map(l => (l.id === lineId ? { ...l, ...patch } : l)));
  }
  function removeLine(lineId: string) {
    setLines(lines.filter(l => l.id !== lineId));
  }

  function quickAddPigment(name: string, amount: number, unit: Unit = "ratio") {
    // find or create material by name
    let mat = state.materials.find(m => m.name === name);
    if (!mat) {
      mat = { id: newid(), name };
      const nextS = { ...state, materials: [mat, ...state.materials] };
      setState(nextS); save(nextS);
    }
    setLines([{ id: newid(), materialId: mat.id, amount, unit }, ...lines]);
  }
  function quickWaterDelta(deltaRatio: number) {
    // append a water ratio delta as a separate line (keeps base intact)
    const waterMat = findOrCreateMaterial("Water");
    setLines([{ id: newid(), materialId: waterMat.id, amount: deltaRatio, unit: "ratio" }, ...lines]);
  }
  function findOrCreateMaterial(name: string) {
    let m = state.materials.find(mm => mm.name === name);
    if (!m) {
      m = { id: newid(), name };
      const nextS = { ...state, materials: [m, ...state.materials] };
      setState(nextS); save(nextS);
    }
    return m;
  }

  function saveDerived() {
    if (!base) return alert("Base recipe not found.");
    if (!name.trim()) return alert("Please enter a name.");
    const newRecipe: Recipe = {
      id: newid(),
      name: name.trim(),
      process: processKey || base.process,
      version,
      densityKgM3: density === "" ? undefined : Number(density),
      lines,
      parentId: base.id,
      tags: tags
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      createdAt: now(),
      updatedAt: now(),
    };

    // write new recipe and assign to variant if provided
    const next: AppState = { ...state, recipes: [newRecipe, ...state.recipes] };

    if (productId && variantId && processKey) {
      const pIdx = next.products.findIndex(p => p.id === productId);
      if (pIdx >= 0) {
        const prod = { ...next.products[pIdx] };
        const vIdx = prod.variants.findIndex(v => v.id === variantId);
        if (vIdx >= 0) {
          const v = { ...prod.variants[vIdx] };
          const map = { ...(v.recipeByProcess || {}) };
          map[processKey] = newRecipe.id;
          v.recipeByProcess = map;
          prod.variants = prod.variants.map((vv, i) => (i === vIdx ? v : vv));
          prod.updatedAt = now();
          next.products = next.products.map((pp, i) => (i === pIdx ? prod : pp));
        }
      }
    }

    setState(next); save(next);
    alert("Derived recipe created and assigned.");
    // go to editor for fine-tuning
    window.location.href = `/recipes/${newRecipe.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide">Derive Recipe</h1>
        <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10" onClick={()=>navigate(-1)}>
          Back
        </button>
      </div>

      {!base ? (
        <div className="text-sm text-red-300">Base recipe not found.</div>
      ) : (
        <div className="text-sm text-gray-400">
          From base: <b>{base.name}</b> (key: <span className="font-mono">{base.id}</span>)
        </div>
      )}

      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-400 mb-1">Name</div>
            <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                   value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Process (kept from context)</div>
            <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                   value={processKey || base?.process || ""} disabled />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Version</div>
              <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                     value={version} onChange={e=>setVersion(e.target.value)} />
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Density (kg/m³)</div>
              <input type="number" className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                     value={density as any} onChange={e=>setDensity(e.target.value===""?"":+e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400 mb-1">Tags (comma separated)</div>
          <input className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                 placeholder="charcoal, high-water, export"
                 value={tags} onChange={e=>setTags(e.target.value)} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 p-6 bg-black/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium tracking-widest uppercase text-gray-400">Adjustments</div>
          <div className="flex gap-2">
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={()=>quickAddPigment("Pigment — carbon black", 0.01, "ratio")}>
              + Add carbon black (0.01 ratio)
            </button>
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={()=>quickWaterDelta(0.01)}>
              + Extra water (0.01 ratio)
            </button>
            <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                    onClick={addLine}>
              + Add line
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10">Material</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10 w-28">Unit</th>
                <th className="text-xs uppercase tracking-wider text-gray-400 font-medium py-3 px-4 border-b border-white/10 w-32">Amount</th>
                <th className="py-3 px-4 border-b border-white/10 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line=>(
                <tr key={line.id} className="hover:bg-white/5">
                  <td className="py-3 px-4 border-b border-white/5">
                    <select className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.materialId}
                      onChange={e=>updateLine(line.id, { materialId: e.target.value })}>
                      {state.materials.map(m=>(
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <select className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.unit}
                      onChange={e=>updateLine(line.id, { unit: e.target.value as Unit })}>
                      {["ratio","kg","g","L","mL"].map(u=><option value={u} key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <input type="number" step="0.001"
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                      value={line.amount}
                      onChange={e=>updateLine(line.id, { amount: +e.target.value })} />
                  </td>
                  <td className="py-3 px-4 border-b border-white/5">
                    <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                            onClick={()=>removeLine(line.id)}>Remove</button>
                  </td>
                </tr>
              ))}
              {!lines.length && (
                <tr><td colSpan={4} className="py-6 px-4 text-gray-400">No lines. Use the buttons above to add.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button className="rounded-lg px-4 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                  onClick={()=>navigate(-1)}>Cancel</button>
          <button className="rounded-lg px-4 py-2 text-sm font-semibold bg-white text-black shadow"
                  onClick={saveDerived}>Save Derived Recipe</button>
        </div>
      </section>
    </div>
  );
}
