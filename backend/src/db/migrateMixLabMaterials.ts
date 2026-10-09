/**
 * One-shot: wipe old Arcos materials, seed shop_prices from Mix Lab, sync materials.
 * Run: DATABASE_URL=... npx tsx src/db/migrateMixLabMaterials.ts
 */
import pool from './client';
import { runMigrations } from './migrate';
import { SHOP_MATERIAL_DEFS, hydrateShopPrice } from './shopMaterials';
import { syncMaterialsFromShopPrices } from '../routes/shopPrices';

async function fetchLiveMixLabPrices(): Promise<Record<string, { amount: number; packKg: number }>> {
  const url = process.env.MIX_LAB_PRICES_URL || 'http://192.168.2.103/api/prices';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const out: Record<string, { amount: number; packKg: number }> = {};
    if (data && typeof data === 'object') {
      for (const [id, raw] of Object.entries(data as Record<string, unknown>)) {
        out[id] = hydrateShopPrice(raw);
      }
    }
    console.log(`Loaded live Mix Lab prices from ${url} (${Object.keys(out).length} keys)`);
    return out;
  } catch (e) {
    console.warn('Could not fetch Mix Lab prices, using catalog defaults:', e);
    return {};
  }
}

async function main() {
  await runMigrations();
  const live = await fetchLiveMixLabPrices();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM recipe_lines');
    await client.query('DELETE FROM materials');
    console.log('Deleted old materials');

    for (let i = 0; i < SHOP_MATERIAL_DEFS.length; i++) {
      const def = SHOP_MATERIAL_DEFS[i];
      const p = live[def.id] || { amount: def.amount, packKg: def.packKg };
      await client.query(
        `INSERT INTO shop_prices (id, name, amount, pack_kg, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           amount = EXCLUDED.amount,
           pack_kg = EXCLUDED.pack_kg,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
        [def.id, def.name, p.amount, p.packKg, i]
      );
    }
    for (const [id, p] of Object.entries(live)) {
      if (SHOP_MATERIAL_DEFS.some((d) => d.id === id)) continue;
      await client.query(
        `INSERT INTO shop_prices (id, name, amount, pack_kg, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, 999, NOW())
         ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, pack_kg = EXCLUDED.pack_kg, updated_at = NOW()`,
        [id, id, p.amount, p.packKg]
      );
    }
    console.log('Upserted shop_prices');
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  await syncMaterialsFromShopPrices();
  const count = await pool.query('SELECT count(*)::int AS n FROM materials');
  const sample = await pool.query(
    `SELECT id, name, amount, pack_kg, price_per_kg FROM materials ORDER BY sort_order NULLS LAST, id LIMIT 8`
  );
  console.log(`Materials now: ${count.rows[0].n}`);
  console.table(
    sample.rows.map((r) => ({
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      pack_kg: Number(r.pack_kg),
      price_per_kg: Number(r.price_per_kg),
    }))
  );
  console.log('Done. Old Arcos materials removed; Mix Lab catalog is live.');
  await pool.end();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
