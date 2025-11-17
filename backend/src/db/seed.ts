import pool from './client';
import bcrypt from 'bcryptjs';
import { runMigrations } from './migrate';

const id = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

async function seed() {
  try {
    // Ensure migrations are run first
    await runMigrations();
    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@arqon.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET password_hash = $2 RETURNING id',
      [adminEmail, passwordHash, 'admin']
    );
    
    const userId = userResult.rows[0].id;
    console.log(`✅ Created/updated admin user: ${adminEmail} (ID: ${userId})`);

    // Seed materials
    const materials = [
      { id: id(), name: "Cement (OPC)", densityKgM3: 1500, pricePerKg: 2000, priceCurrency: "IDR" },
      { id: id(), name: "Silica Fume", densityKgM3: 400, pricePerKg: 1.8, priceCurrency: "USD" },
      { id: id(), name: "Metakaolin", densityKgM3: 500, pricePerKg: 2.1, priceCurrency: "USD" },
      { id: id(), name: "Quartz Sand 0–2mm", densityKgM3: 1600, pricePerKg: 1500, priceCurrency: "IDR" },
      { id: id(), name: "PCE Superplasticizer", densityKgM3: 1050, pricePerKg: 2.4, priceCurrency: "EUR" },
      { id: id(), name: "Water", densityKgM3: 1000, pricePerKg: 0, priceCurrency: "IDR" },
      { id: id(), name: "AR Glass Fiber", densityKgM3: 2600, pricePerKg: 4.0, priceCurrency: "USD" },
      { id: id(), name: "Pigment (Carbon Black)", densityKgM3: 450, pricePerKg: 3.0, priceCurrency: "USD" },
    ];

    for (const material of materials) {
      await pool.query(
        `INSERT INTO materials (id, user_id, name, density_kg_m3, price_per_kg, price_currency)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [material.id, userId, material.name, material.densityKgM3, material.pricePerKg, material.priceCurrency]
      );
    }
    console.log(`✅ Seeded ${materials.length} materials`);

    // Seed categories
    const categories = [
      { id: id(), name: "UHPC Systems", slug: "uhpc-systems" },
      { id: id(), name: "GFRC Systems", slug: "gfrc-systems" },
      { id: id(), name: "Modular Tiles", slug: "modular-tiles" },
      { id: id(), name: "Finishes", slug: "finishes" },
    ];

    for (const category of categories) {
      // Check if category exists for this user
      const existing = await pool.query(
        'SELECT id FROM categories WHERE id = $1 AND user_id = $2',
        [category.id, userId]
      );
      
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO categories (id, user_id, name, slug)
           VALUES ($1, $2, $3, $4)`,
          [category.id, userId, category.name, category.slug]
        );
      }
    }
    console.log(`✅ Seeded categories`);

    // Seed settings
    const existingSettings = await pool.query('SELECT id FROM settings WHERE user_id = $1', [userId]);
    if (existingSettings.rows.length === 0) {
      await pool.query(
        `INSERT INTO settings (user_id, settings)
         VALUES ($1, $2::jsonb)`,
        [userId, JSON.stringify({
          units: "metric",
          defaultSparePct: 7,
          site: {
            heroTitle: "ARCHITECTURAL CONCRETE, REFINED.",
            heroSubtitle: "UHPC & GFRC panels, modular tiles, and microcement finishes — engineered for strength, durability, and beauty.",
            contactEmail: "hello@arqon.com",
          },
        })]
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

// Run seed if called directly
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
