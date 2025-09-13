import type { Idea } from "../types";

const id = () => "ai_" + Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const PICK = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const processes = [
  { key: "UHPC", label: "UHPC" },
  { key: "GFRC_FACE", label: "GFRC — Facecoat" },
  { key: "GFRC_BACK", label: "GFRC — Backer" },
  { key: "SCC", label: "Self-Compacting (SCC)" },
  { key: "MICROCEMENT", label: "Microcement" },
  { key: "CONCRETE", label: "General Concrete" },
  { key: "ECC", label: "ECC" },
];

const topics = [
  {
    title: "Carbon-Negative Binder (calcined clay + CO₂-cured aggregates)",
    process: "CONCRETE",
    summary:
      "Binder system swapping 40–60% OPC with calcined clays and limestone; aggregates pre-cured in CO₂ chamber to mineralize carbon.",
    density: 2250,
    lines: [
      ["Cement (GP)", 1.0, "ratio"],
      ["Calcined clay", 0.35, "ratio"],
      ["Limestone powder", 0.15, "ratio"],
      ["Sand (0–2 mm)", 1.8, "ratio"],
      ["Coarse 10–20 mm", 1.2, "ratio"],
      ["Water", 0.30, "ratio"],
      ["PCE Superplasticizer (product)", 0.009, "ratio"],
    ],
    tags: ["sustainability", "carbon-negative"],
  },
  {
    title: "Metallic Microcement (aluminum/bronze powder finish)",
    process: "MICROCEMENT",
    summary:
      "Fine metallic powder blended into polymer-rich microcement; burnish then seal with clear polyurethane.",
    density: 1800,
    lines: [
      ["Cement (white)", 1.0, "ratio"],
      ["Limestone powder (micro)", 1.2, "ratio"],
      ["Polymer emulsion", 0.12, "ratio"],
      ["Metallic powder (aluminum/bronze)", 0.10, "ratio"],
      ["Water", 0.34, "ratio"],
    ],
    tags: ["decorative", "metallic", "floor/wall"],
  },
  {
    title: "Microclay Finish (clay-lime cementitious skim)",
    process: "MICROCEMENT",
    summary:
      "Hybrid microcement with plasticized clay and lime for warm, tactile finish; low sheen.",
    density: 1750,
    lines: [
      ["Cement (white)", 0.8, "ratio"],
      ["Hydrated lime", 0.3, "ratio"],
      ["Clay (plasticized micro)", 0.5, "ratio"],
      ["Limestone powder", 0.8, "ratio"],
      ["Water", 0.38, "ratio"],
      ["Polymer emulsion", 0.08, "ratio"],
    ],
    tags: ["microclay", "matte"],
  },
  {
    title: "Interlocking UHPC Blocks (no-mortar assembly)",
    process: "UHPC",
    summary:
      "Precision-cast UHPC with interlocking geometry; steam/heat cure to accelerate demold; low shrinkage target.",
    density: 2400,
    lines: [
      ["Cement (GP)", 1.0, "ratio"],
      ["Silica fume", 0.25, "ratio"],
      ["Quartz powder", 0.20, "ratio"],
      ["Sand (0–2 mm)", 1.1, "ratio"],
      ["Water", 0.19, "ratio"],
      ["PCE Superplasticizer (product)", 0.014, "ratio"],
      ["Steel fibers", 0.02, "ratio"],
    ],
    tags: ["modular", "prefab"],
  },
  {
    title: "ECC Thin Shell (high ductility microfiber system)",
    process: "ECC",
    summary:
      "Engineered Cementitious Composite with high micro-fiber volume; target strain-hardening with fine sand.",
    density: 2200,
    lines: [
      ["Cement (GP)", 1.0, "ratio"],
      ["Fly ash (Class F)", 1.2, "ratio"],
      ["Fine sand (0–0.5 mm)", 0.8, "ratio"],
      ["Water", 0.26, "ratio"],
      ["PVA fibers (short)", 0.02, "ratio"],
      ["PCE Superplasticizer (product)", 0.010, "ratio"],
    ],
    tags: ["ductile", "thin-shell"],
  },
];

export async function generateAIIdeas(count = 3): Promise<Idea[]> {
  // Simulate latency
  await new Promise(r => setTimeout(r, 600));
  const out: Idea[] = [];
  const N = Math.min(count, topics.length);
  const picks = [...topics].sort(() => Math.random() - 0.5).slice(0, N);
  for (const t of picks) {
    out.push({
      id: id(),
      title: t.title,
      process: t.process,
      summary: t.summary,
      densityKgM3: t.density,
      lines: t.lines.map(([name, amount, unit]) => ({
        materialName: String(name),
        amount: Number(amount),
        unit: unit as any,
      })),
      tags: t.tags,
      source: "ai",
      createdAt: now(),
      bookmarked: false,
    });
  }
  // small chance to add a random twist to show variability
  if (Math.random() < 0.4) {
    out.push({
      id: id(),
      title: "Bio-aggregate Lightweight Panel (hemp/lime UHPC skin)",
      process: PICK(processes).key,
      summary:
        "Composite panel with lightweight bio-aggregate core and thin UHPC skins; tune interface bonding with polymer.",
      densityKgM3: 1500,
      lines: [
        { materialName: "Cement (GP)", amount: 0.8, unit: "ratio" },
        { materialName: "Lime (hydrated)", amount: 0.2, unit: "ratio" },
        { materialName: "Hemp shiv (dry)", amount: 0.3, unit: "ratio" },
        { materialName: "Quartz powder", amount: 0.15, unit: "ratio" },
        { materialName: "Water", amount: 0.32, unit: "ratio" },
        { materialName: "Polymer emulsion", amount: 0.06, unit: "ratio" },
      ],
      tags: ["lightweight", "bio"],
      source: "ai",
      createdAt: now(),
      bookmarked: false,
    });
  }
  return out;
}
