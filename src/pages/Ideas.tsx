import React, { useMemo, useState } from "react";
import { load, save } from "../store";
import type { AppState, Idea, Recipe } from "../types";
import { getProcessLabel } from "../lib/process";
import { generateAIIdeas } from "../lib/aiIdeas";

const id = () => Math.random().toString(36).slice(2,10);
const now = () => new Date().toISOString();

/** Your curated baseline ideas stay here (edit as you like) */
const CURATED: Idea[] = [
  {
    id: "cur-uhpc-panel",
    title: "UHPC facade panel",
    process: "UHPC",
    summary: "Thin high-strength facade with ~2% steel fibers; start w/b≈0.19.",
    densityKgM3: 2350,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Silica fume", amount: 0.25, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.1, unit: "ratio" },
      { materialName: "Water", amount: 0.19, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.015, unit: "ratio" },
      { materialName: "Steel fibers", amount: 0.02, unit: "ratio" },
    ],
    tags: ["panel","exterior","thin","SCC/hand-packed"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
  {
    id: "cur-gfrc-tile",
    title: "GFRC decorative wall tile",
    process: "GFRC_BACK",
    summary: "Backer with AR glass; tune fiber 3–5% for stiffness.",
    densityKgM3: 2200,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Silica fume", amount: 0.2, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.6, unit: "ratio" },
      { materialName: "Water", amount: 0.33, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.006, unit: "ratio" },
      { materialName: "AR Glass fibers (chopped)", amount: 0.05, unit: "ratio" },
    ],
    tags: ["tile","gfrc","backer"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
  {
    id: "cur-scc-slab",
    title: "SCC cast-in-place slab",
    process: "SCC",
    summary: "Pumpable SCC; target slump-flow 650–700 mm in trials.",
    densityKgM3: 2400,
    lines: [
      { materialName: "Cement (GP)", amount: 1.0, unit: "ratio" },
      { materialName: "Fly ash (Class F)", amount: 0.20, unit: "ratio" },
      { materialName: "Limestone powder", amount: 0.10, unit: "ratio" },
      { materialName: "Sand (0–2 mm)", amount: 1.90, unit: "ratio" },
      { materialName: "Coarse 5–10 mm", amount: 0.80, unit: "ratio" },
      { materialName: "Coarse 10–20 mm", amount: 0.80, unit: "ratio" },
      { materialName: "Water", amount: 0.32, unit: "ratio" },
      { materialName: "PCE Superplasticizer (product)", amount: 0.010, "unit": "ratio" },
    ],
    tags: ["slab","pump","flow"],
    source: "curated",
    createdAt: "2025-01-01T00:00:00.000Z",
    bookmarked: false,
  },
];

export default function Ideas(){
  const [state,setState] = useState<AppState>(()=> {
    const s = load();
    // Seed curated once (if empty) — avoids duplicates
    if (!s.ideas || s.ideas.filter(i=>i.source==="curated").length === 0) {
      s.ideas = [...CURATED, ...(s.ideas||[])];
      // No auto-save
    }
    return s;
  });
  const [loading, setLoading] = useState(false);

  const curated = useMemo(()=> state.ideas.filter(i=>i.source==="curated"), [state.ideas]);
  const feed    = useMemo(()=> state.ideas.filter(i=>i.source==="ai").sort((a,b)=> (b.createdAt.localeCompare(a.createdAt))), [state.ideas]);

  function saveIdeas(next: Idea[]){
    const nextState = { ...state, ideas: next };
    setState(nextState);
    // No auto-save
  }

  async function getFresh(count = 3){
    try {
      setLoading(true);
      const fresh = await generateAIIdeas(count);
      // de-dup by title+process
      const key = (x:Idea)=> (x.title.trim().toLowerCase()+"|"+x.process);
      const existingKeys = new Set(state.ideas.map(key));
      const unique = fresh.filter(f => !existingKeys.has(key(f)));
      saveIdeas([...unique, ...state.ideas]);
    } finally {
      setLoading(false);
    }
  }

  function toggleBookmark(idStr:string){
    saveIdeas(state.ideas.map(x => x.id===idStr ? {...x, bookmarked: !x.bookmarked} : x));
  }

  function dismiss(idStr:string){
    if (!confirm("Remove this idea from the feed?")) return;
    saveIdeas(state.ideas.filter(x=>x.id!==idStr));
  }

  function addAsRecipe(it: Idea){
    // map material names -> ids (create if missing)
    const mats = [...state.materials];
    const findOrCreate = (name:string): string => {
      const exist = mats.find(m=>m.name===name);
      if (exist) return exist.id;
      const m = { id:id(), name } as any;
      mats.push(m); return m.id;
    };

    const r: Recipe = {
      id: id(),
      name: `${it.title} (Idea)`,
      process: it.process,
      version: "v0.1",
      densityKgM3: it.densityKgM3,
      lines: it.lines.map(l => ({
        id: id(),
        materialId: findOrCreate(l.materialName),
        amount: l.amount,
        unit: l.unit
      })),
      createdAt: now(), updatedAt: now(),
      tags: it.tags,
    };

    const next = { ...state, materials: mats, recipes: [r, ...state.recipes] };
    setState(next);
    alert("Added to Recipes: " + r.name);
  }

  function Section({title,items}:{title:string; items: Idea[]}){
    return (
      <section className="space-y-3">
        <div className="text-xs font-medium tracking-widest uppercase text-gray-400">{title}</div>
        {items.length===0 ? (
          <div className="text-sm text-gray-500">No items.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map(idea=>(
              <div key={idea.id} className="rounded-2xl border border-white/10 p-5 bg-black/20 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-medium">{idea.title}</div>
                    <div className="text-xs text-gray-400">{new Date(idea.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-gray-300">
                      {idea.source === "ai" ? "AI" : "Curated"}
                    </span>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-gray-300">
                      {getProcessLabel(state, idea.process)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{idea.summary}</p>
                {idea.densityKgM3 && <div className="text-xs text-gray-400">Baseline density: {idea.densityKgM3} kg/m³</div>}
                <div className="text-xs text-gray-400">Ingredients (ratio unless noted):</div>
                <ul className="text-sm text-gray-200 list-disc pl-5">
                  {idea.lines.map((l,i)=><li key={i}>{l.materialName} — {l.amount} {l.unit}</li>)}
                </ul>
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-400">{(idea.tags||[]).join(" • ")}</div>
                  <div className="flex gap-2">
                    <button className={`rounded-lg px-3 py-2 text-sm border border-white/10 ${idea.bookmarked ? "bg-white text-black" : "bg-black/20 hover:bg-white/10"}`}
                            onClick={()=>toggleBookmark(idea.id)}>
                      {idea.bookmarked ? "Bookmarked" : "Bookmark"}
                    </button>
                    <button className="rounded-lg px-3 py-2 text-sm border border-white/10 bg-black/20 hover:bg-white/10"
                            onClick={()=>addAsRecipe(idea)}>Add as recipe</button>
                    <button className="rounded-lg px-3 py-2 text-sm border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-200"
                            onClick={()=>dismiss(idea.id)}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-0 duration-700">
      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-transparent to-gray-600/5 rounded-2xl blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">Recipe Ideas</p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Ideas & Starters
            </h1>
            <p className="text-sm text-gray-300 max-w-xl leading-relaxed">
              Explore curated baseline recipes and AI-generated suggestions. Promote any idea into a full recipe.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
            <button 
              className="px-4 py-2 rounded-xl bg-white text-gray-900 text-sm font-bold hover:bg-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center gap-2 disabled:opacity-60"
              onClick={()=>getFresh(3)} 
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {loading ? "Fetching…" : "Get Fresh Ideas"}
            </button>
          </div>
        </div>
      </header>

      <Section title="Fresh from AI" items={feed} />
      <Section title="Curated starters" items={curated} />
    </div>
  );
}
