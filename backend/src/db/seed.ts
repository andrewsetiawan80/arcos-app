import pool from './client';
import bcrypt from 'bcryptjs';
import { runMigrations } from './migrate';
import { SHOP_MATERIAL_DEFS, pricePerKg } from './shopMaterials';

const id = () => Math.random().toString(36).slice(2, 10);

async function seed() {
  try {
    await runMigrations();
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@arcos.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2 RETURNING id',
      [adminEmail, passwordHash, 'admin']
    );

    const userId = userResult.rows[0].id;
    console.log(`✅ Created/updated admin user: ${adminEmail} (ID: ${userId})`);

    const existingShop = await pool.query('SELECT count(*)::int AS n FROM shop_prices');
    if (existingShop.rows[0].n === 0) {
      for (let i = 0; i < SHOP_MATERIAL_DEFS.length; i++) {
        const def = SHOP_MATERIAL_DEFS[i];
        await pool.query(
          `INSERT INTO shop_prices (id, name, amount, pack_kg, sort_order, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [def.id, def.name, def.amount, def.packKg, i]
        );
        const ppk = pricePerKg(def.amount, def.packKg);
        await pool.query(
          `INSERT INTO materials (id, user_id, name, density_kg_m3, price_per_kg, price_currency, amount, pack_kg, sort_order)
           VALUES ($1, $2, $3, $4, $5, 'IDR', $6, $7, $8)
           ON CONFLICT (id) DO NOTHING`,
          [def.id, userId, def.name, def.densityKgM3 ?? null, ppk, def.amount, def.packKg, i]
        );
      }
      console.log(`✅ Seeded ${SHOP_MATERIAL_DEFS.length} Mix Lab shop materials`);
    } else {
      console.log('✅ shop_prices already present — skip material seed');
    }

    const categories = [
      { id: id(), name: 'UHPC Systems', slug: 'uhpc-systems' },
      { id: id(), name: 'GFRC Systems', slug: 'gfrc-systems' },
      { id: id(), name: 'Modular Tiles', slug: 'modular-tiles' },
      { id: id(), name: 'Finishes', slug: 'finishes' },
    ];

    for (const category of categories) {
      const existing = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category.id, userId]
      );
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO categories (id, user_id, name, slug) VALUES ($1, $2, $3, $4)`,
          [category.id, userId, category.name, category.slug]
        );
      }
    }
    console.log('✅ Seeded categories');

    const existingSettings = await pool.query('SELECT id FROM settings WHERE user_id = $1', [userId]);
    if (existingSettings.rows.length === 0) {
      await pool.query(
        `INSERT INTO settings (user_id, settings) VALUES ($1, $2::jsonb)`,
        [
          userId,
          JSON.stringify({
            units: 'metric',
            defaultSparePct: 7,
            site: {
              heroTitle: 'ARCHITECTURAL CONCRETE, REFINED.',
              heroSubtitle:
                'UHPC & GFRC panels, modular tiles, and microcement finishes — engineered for strength, durability, and beauty.',
              contactEmail: 'hello@arcos.com',
            },
          }),
        ]
      );
      console.log('✅ Seeded settings');
    } else {
      console.log('✅ Settings already exist');
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`\nLogin credentials:`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding error:', error);
      process.exit(1);
    });
}

export default seed;
