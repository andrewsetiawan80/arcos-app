import { Router, Request, Response } from 'express';
import pool from '../db/client';
import {
  SHOP_MATERIAL_DEFS,
  CORE_MATERIAL_IDS,
  hydrateShopPrice,
  pricePerKg,
  slugifyMaterialId,
  normalizeKind,
  rowToClient,
  type ShopMaterial,
} from '../db/shopMaterials';

const router = Router();

async function ensureCoreCatalog() {
  for (let i = 0; i < SHOP_MATERIAL_DEFS.length; i++) {
    const def = SHOP_MATERIAL_DEFS[i];
    await pool.query(
      `INSERT INTO shop_prices (id, name, amount, pack_kg, density_kg_m3, kind, brand, color, sort_order, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         sort_order = EXCLUDED.sort_order,
         density_kg_m3 = COALESCE(shop_prices.density_kg_m3, EXCLUDED.density_kg_m3),
         updated_at = NOW()`,
      [
        def.id,
        def.name,
        def.amount,
        def.packKg,
        def.densityKgM3 ?? null,
        def.kind,
        def.brand ?? null,
        def.color ?? null,
        i,
      ]
    );
  }
}

/** Full catalog as map keyed by id (Mix Lab + Arcos shared schema). */
export async function readShopCatalogMap(): Promise<Record<string, ShopMaterial>> {
  await ensureCoreCatalog();
  const result = await pool.query(
    `SELECT id, name, amount, pack_kg, density_kg_m3, kind, brand, color, sort_order
     FROM shop_prices ORDER BY sort_order NULLS LAST, kind, name, id`
  );
  const out: Record<string, ShopMaterial> = {};
  for (const row of result.rows) {
    out[row.id] = rowToClient(row);
  }
  return out;
}

/** Mirror shop_prices → materials (all rows). */
export async function syncMaterialsFromShopPrices() {
  const admin = await pool.query(`SELECT id FROM users ORDER BY id ASC LIMIT 1`);
  const userId = admin.rows[0]?.id;
  if (!userId) throw new Error('No users — cannot sync materials');

  const prices = await pool.query(`SELECT * FROM shop_prices`);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM materials WHERE id NOT IN (SELECT id FROM shop_prices)`
    );
    for (const row of prices.rows) {
      const amount = Number(row.amount) || 0;
      const packKg = Number(row.pack_kg) > 0 ? Number(row.pack_kg) : 1;
      const ppk = pricePerKg(amount, packKg);
      await client.query(
        `INSERT INTO materials (id, user_id, name, density_kg_m3, price_per_kg, price_currency, amount, pack_kg, sort_order)
         VALUES ($1,$2,$3,$4,$5,'IDR',$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           density_kg_m3 = EXCLUDED.density_kg_m3,
           price_per_kg = EXCLUDED.price_per_kg,
           price_currency = 'IDR',
           amount = EXCLUDED.amount,
           pack_kg = EXCLUDED.pack_kg,
           sort_order = EXCLUDED.sort_order,
           updated_at = CURRENT_TIMESTAMP`,
        [
          row.id,
          userId,
          row.name,
          row.density_kg_m3 != null ? Number(row.density_kg_m3) : null,
          ppk,
          amount,
          packKg,
          row.sort_order ?? 999,
        ]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function upsertShopRow(m: Partial<ShopMaterial> & { id: string }) {
  const amount = Number(m.amount) || 0;
  const packKg = Number(m.packKg) > 0 ? Number(m.packKg) : 1;
  const kind = normalizeKind(m.kind);
  const name = String(m.name || m.id).trim() || m.id;
  await pool.query(
    `INSERT INTO shop_prices (id, name, amount, pack_kg, density_kg_m3, kind, brand, color, sort_order, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,999),NOW())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       amount = EXCLUDED.amount,
       pack_kg = EXCLUDED.pack_kg,
       density_kg_m3 = COALESCE(EXCLUDED.density_kg_m3, shop_prices.density_kg_m3),
       kind = EXCLUDED.kind,
       brand = EXCLUDED.brand,
       color = EXCLUDED.color,
       sort_order = COALESCE(EXCLUDED.sort_order, shop_prices.sort_order),
       updated_at = NOW()`,
    [
      m.id,
      name,
      amount,
      packKg,
      m.densityKgM3 ?? null,
      kind,
      m.brand ?? null,
      m.color ?? null,
      m.sortOrder ?? null,
    ]
  );
}

// GET /api/shop-prices — full shared schema map
router.get('/', async (_req: Request, res: Response) => {
  try {
    const map = await readShopCatalogMap();
    res.json(map);
  } catch (err) {
    console.error('Get shop-prices error:', err);
    res.status(500).json({ error: 'Failed to fetch shop prices' });
  }
});

// GET /api/shop-prices/list — array form
router.get('/list', async (_req: Request, res: Response) => {
  try {
    const map = await readShopCatalogMap();
    res.json(Object.values(map));
  } catch (err) {
    console.error('Get shop-prices list error:', err);
    res.status(500).json({ error: 'Failed to fetch shop prices' });
  }
});

// POST /api/shop-prices — upsert many (Mix Lab save prices)
// Body: { [id]: { amount, packKg, name?, kind?, brand?, color?, densityKgM3? }, ... }
// Optional: { _replace: true } deletes ids not in body (except keep if _replace false)
router.post('/', async (req: Request, res: Response) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'prices must be an object' });
    }
    const body = { ...req.body } as Record<string, unknown>;
    const replace = body._replace === true;
    delete body._replace;
    delete body._delete;

    for (const [id, raw] of Object.entries(body)) {
      if (!id || id.startsWith('_')) continue;
      const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
      const p = hydrateShopPrice(raw);
      const existing = await pool.query(`SELECT name, kind, brand, color, density_kg_m3, sort_order FROM shop_prices WHERE id=$1`, [id]);
      const prev = existing.rows[0];
      const def = SHOP_MATERIAL_DEFS.find((d) => d.id === id);
      await upsertShopRow({
        id,
        name: String(o.name || prev?.name || def?.name || id),
        amount: p.amount,
        packKg: p.packKg,
        densityKgM3:
          o.densityKgM3 != null
            ? Number(o.densityKgM3)
            : prev?.density_kg_m3 != null
              ? Number(prev.density_kg_m3)
              : def?.densityKgM3,
        kind: normalizeKind(o.kind || prev?.kind || def?.kind || 'other'),
        brand: (o.brand as string) ?? prev?.brand ?? def?.brand ?? null,
        color: (o.color as string) ?? prev?.color ?? def?.color ?? null,
        sortOrder: prev?.sort_order ?? def ? SHOP_MATERIAL_DEFS.findIndex((d) => d.id === id) : 999,
      });
    }

    if (replace) {
      const keep = new Set(Object.keys(body).filter((k) => k && !k.startsWith('_')));
      const all = await pool.query(`SELECT id FROM shop_prices`);
      for (const row of all.rows) {
        if (!keep.has(row.id)) {
          await pool.query(`DELETE FROM shop_prices WHERE id=$1`, [row.id]);
        }
      }
    }

    await syncMaterialsFromShopPrices();
    res.json({ ok: true, catalog: await readShopCatalogMap() });
  } catch (err) {
    console.error('Post shop-prices error:', err);
    res.status(500).json({ error: 'Failed to save shop prices' });
  }
});

// POST /api/shop-prices/item — add or update one material
router.post('/item', async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const name = String(b.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name required' });
    const kind = normalizeKind(b.kind || (b.brand || b.color ? 'pigment' : 'other'));
    let id = String(b.id || '').trim();
    if (!id) id = slugifyMaterialId(name, kind);
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return res.status(400).json({ error: 'id must be alphanumeric, dash, underscore' });
    }

    // unique id if collision with different intent
    if (!b.id) {
      let candidate = id;
      let n = 2;
      while (true) {
        const exists = await pool.query(`SELECT 1 FROM shop_prices WHERE id=$1`, [candidate]);
        if (!exists.rows.length) {
          id = candidate;
          break;
        }
        candidate = `${id}-${n++}`.slice(0, 50);
      }
    }

    const maxSort = await pool.query(`SELECT COALESCE(MAX(sort_order),0)::int AS m FROM shop_prices`);
    await upsertShopRow({
      id,
      name,
      amount: Number(b.amount) || 0,
      packKg: Number(b.packKg) > 0 ? Number(b.packKg) : 1,
      densityKgM3: b.densityKgM3 != null ? Number(b.densityKgM3) : kind === 'pigment' ? 450 : undefined,
      kind,
      brand: b.brand ? String(b.brand) : null,
      color: b.color ? String(b.color) : null,
      sortOrder: b.sortOrder != null ? Number(b.sortOrder) : maxSort.rows[0].m + 1,
    });
    await syncMaterialsFromShopPrices();
    const map = await readShopCatalogMap();
    res.json({ ok: true, item: map[id], catalog: map });
  } catch (err) {
    console.error('Post shop-prices item error:', err);
    res.status(500).json({ error: 'Failed to save material' });
  }
});

// DELETE /api/shop-prices/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'id required' });
    // Allow deleting core too, but warn client — Mix Lab may still reference pigment key
    await pool.query(`DELETE FROM recipe_lines WHERE material_id=$1`, [id]);
    await pool.query(`DELETE FROM materials WHERE id=$1`, [id]);
    await pool.query(`DELETE FROM shop_prices WHERE id=$1`, [id]);
    // Re-seed core if they deleted a required seed id
    if (CORE_MATERIAL_IDS.has(id)) {
      await ensureCoreCatalog();
    }
    await syncMaterialsFromShopPrices();
    res.json({ ok: true, catalog: await readShopCatalogMap(), restoredCore: CORE_MATERIAL_IDS.has(id) });
  } catch (err) {
    console.error('Delete shop-prices error:', err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;
