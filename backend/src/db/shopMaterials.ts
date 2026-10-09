/** Shared shop material schema — Mix Lab + Arcos. */

export type ShopKind =
  | 'cement'
  | 'pozzolan'
  | 'sand'
  | 'polymer'
  | 'admix'
  | 'fiber'
  | 'pigment'
  | 'water'
  | 'other';

export type ShopMaterial = {
  id: string;
  name: string;
  amount: number;
  packKg: number;
  densityKgM3?: number;
  kind: ShopKind;
  brand?: string | null;
  color?: string | null;
  sortOrder?: number;
};

export type ShopPrice = {
  amount: number;
  packKg: number;
};

/** Core catalog (seed / defaults). Extra pigments & custom materials live only in DB. */
export const SHOP_MATERIAL_DEFS: ShopMaterial[] = [
  { id: 'portlandGrey', name: 'Grey Portland cement', densityKgM3: 1500, amount: 70000, packKg: 40, kind: 'cement' },
  { id: 'portlandWhite', name: 'White Portland cement', densityKgM3: 1500, amount: 125000, packKg: 40, kind: 'cement' },
  { id: 'pozzolan', name: 'Silica fume / metakaolin', densityKgM3: 400, amount: 303030, packKg: 50, kind: 'pozzolan' },
  { id: 'm25', name: '20-40 mesh', densityKgM3: 1600, amount: 5000, packKg: 1, kind: 'sand' },
  { id: 'm40', name: '30-60 mesh', densityKgM3: 1600, amount: 5000, packKg: 1, kind: 'sand' },
  { id: 'm60', name: '60-80 mesh', densityKgM3: 1600, amount: 5000, packKg: 1, kind: 'sand' },
  { id: 'm80', name: '80-100 mesh', densityKgM3: 1600, amount: 5000, packKg: 1, kind: 'sand' },
  { id: 'm200', name: '200 mesh', densityKgM3: 1600, amount: 7500, packKg: 1, kind: 'sand' },
  { id: 'm300', name: '300 mesh', densityKgM3: 1600, amount: 7500, packKg: 1, kind: 'sand' },
  { id: 'acrylic', name: 'Acrylic polymer (liquid)', densityKgM3: 1050, amount: 0, packKg: 1, kind: 'polymer' },
  { id: 'rdp', name: 'VAE RDP (dry)', densityKgM3: 500, amount: 2400000, packKg: 50, kind: 'polymer' },
  { id: 'water', name: 'Water', densityKgM3: 1000, amount: 0, packKg: 1, kind: 'water' },
  { id: 'plasticizer', name: 'Plasticizer', densityKgM3: 1050, amount: 25000, packKg: 1, kind: 'admix' },
  { id: 'defoamer', name: 'Defoamer', densityKgM3: 1000, amount: 120000, packKg: 1, kind: 'admix' },
  { id: 'accelerator', name: 'Accelerator', densityKgM3: 1200, amount: 0, packKg: 1, kind: 'admix' },
  { id: 'retarder', name: 'Retarder', densityKgM3: 1200, amount: 0, packKg: 1, kind: 'admix' },
  { id: 'expander', name: 'Expander / shrinkage', densityKgM3: 900, amount: 0, packKg: 1, kind: 'admix' },
  { id: 'wetting', name: 'Wetting agent', densityKgM3: 1000, amount: 0, packKg: 1, kind: 'admix' },
  { id: 'hpmc', name: 'HPMC', densityKgM3: 600, amount: 125000, packKg: 1, kind: 'admix' },
  { id: 'fiber', name: 'Glass fiber', densityKgM3: 2600, amount: 30000, packKg: 1, kind: 'fiber' },
  // Generic fallback for Mix Lab ticket "pigment %" — add color/brand SKUs separately
  { id: 'pigment', name: 'Pigment (generic)', densityKgM3: 450, amount: 80000, packKg: 1, kind: 'pigment', brand: null, color: null },
];

export const CORE_MATERIAL_IDS = new Set(SHOP_MATERIAL_DEFS.map((d) => d.id));

export function pricePerKg(amount: number, packKg: number): number {
  const pack = packKg > 0 ? packKg : 1;
  return (Number(amount) || 0) / pack;
}

export function hydrateShopPrice(raw: unknown): ShopPrice {
  if (typeof raw === 'number') return { amount: raw, packKg: 1 };
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (o.amount == null && o.perKg != null && o.packKg == null) {
      return { amount: Number(o.perKg) || 0, packKg: 1 };
    }
    return {
      amount: Number(o.amount) || 0,
      packKg: Number(o.packKg) > 0 ? Number(o.packKg) : 1,
    };
  }
  return { amount: 0, packKg: 1 };
}

export function slugifyMaterialId(name: string, kind?: string): string {
  const base = String(name || 'material')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'material';
  const prefix = kind === 'pigment' ? 'pigment-' : '';
  const id = (prefix + base).replace(/--+/g, '-');
  return id.slice(0, 50);
}

export function normalizeKind(raw: unknown): ShopKind {
  const k = String(raw || 'other').toLowerCase();
  const allowed: ShopKind[] = [
    'cement', 'pozzolan', 'sand', 'polymer', 'admix', 'fiber', 'pigment', 'water', 'other',
  ];
  return (allowed.includes(k as ShopKind) ? k : 'other') as ShopKind;
}

export function rowToClient(row: Record<string, unknown>): ShopMaterial {
  const amount = Number(row.amount) || 0;
  const packKg = Number(row.pack_kg) > 0 ? Number(row.pack_kg) : 1;
  return {
    id: String(row.id),
    name: String(row.name || row.id),
    amount,
    packKg,
    densityKgM3: row.density_kg_m3 != null ? Number(row.density_kg_m3) : undefined,
    kind: normalizeKind(row.kind),
    brand: row.brand != null ? String(row.brand) : null,
    color: row.color != null ? String(row.color) : null,
    sortOrder: row.sort_order != null ? Number(row.sort_order) : undefined,
  };
}
