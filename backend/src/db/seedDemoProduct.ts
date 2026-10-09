import pool from './client';

const id = () => Math.random().toString(36).slice(2, 10);

async function seedDemoProducts() {
  try {
    // Get admin user
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@arcos.com']
    );
    
    if (userResult.rows.length === 0) {
      console.error('Admin user not found. Run seed.ts first.');
      return;
    }
    
    const userId = userResult.rows[0].id;

    // Get or create 3D Tiles category
    const categoryResult = await pool.query(
      'SELECT id FROM categories WHERE slug = $1 AND user_id = $2',
      ['3d-tiles', userId]
    );

    let categoryId;
    if (categoryResult.rows.length === 0) {
      const newCat = await pool.query(
        'INSERT INTO categories (id, user_id, name, slug) VALUES ($1, $2, $3, $4) RETURNING id',
        [id(), userId, '3D Wall Tiles', '3d-tiles']
      );
      categoryId = newCat.rows[0].id;
      console.log('✅ Created 3D Tiles category');
    } else {
      categoryId = categoryResult.rows[0].id;
      console.log('✅ Using existing 3D Tiles category');
    }

    // Add columns if they don't exist
    console.log('Ensuring texture_url, normal_map_url, and size columns exist...');
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS texture_url TEXT`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS normal_map_url TEXT`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS size JSONB`);
    console.log('✅ Columns verified');

    // Create demo product 1: Relief Panel (keep existing)
    const product1Id = id();
    const existingProduct1 = await pool.query(
      'SELECT id FROM products WHERE slug = $1',
      ['demo-relief-panel']
    );

    if (existingProduct1.rows.length === 0) {
      await pool.query(
        `INSERT INTO products (id, user_id, name, slug, description, category_slug, public, featured, cover_image_url, texture_url, size, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          product1Id,
          userId,
          'Relief Panel - Capsule Pattern',
          'demo-relief-panel',
          'Sculptural GFRC wall panel with 3D capsule relief pattern. Creates depth and visual interest with integrated lighting grooves.',
          '3d-tiles',
          true,
          true,
          '/images/ai-demo-wall-texture.png',
          '/images/ai-demo-wall-texture.png',
          JSON.stringify({ w_mm: 600, h_mm: 600, t_mm: 20 }),
        ]
      );
      console.log('✅ Created demo product 1: Relief Panel');

      // Insert color variants
      const colors1 = [
        { name: 'Natural Beige', color: '#e8e4dc' },
        { name: 'Cloud White', color: '#f5f2ed' },
        { name: 'Warm Sand', color: '#d4c4a8' },
        { name: 'Slate Gray', color: '#7a7d80' },
        { name: 'Charcoal', color: '#3d3d3d' },
        { name: 'Terracotta', color: '#c67b5c' },
        { name: 'Sage Green', color: '#8a9a7b' },
        { name: 'Ocean Blue', color: '#5b7e96' },
      ];
      for (const v of colors1) {
        await pool.query(
          `INSERT INTO product_variants (id, product_id, name, color)
           VALUES ($1, $2, $3, $4)`,
          [id(), product1Id, v.name, v.color]
        );
      }
      console.log('✅ Created Relief Panel color variants');
    } else {
      console.log('✅ Relief Panel already exists');
      const existingId1 = existingProduct1.rows[0].id;
      // Update texture_url and size for existing product
      await pool.query(
        `UPDATE products 
         SET texture_url = $1, size = $2::jsonb
         WHERE slug = $3`,
        [
          '/images/ai-demo-wall-texture.png',
          JSON.stringify({ w_mm: 600, h_mm: 600, t_mm: 20 }),
          'demo-relief-panel'
        ]
      );
      // Upsert color variants
      const colors1 = [
        { name: 'Natural Beige', color: '#e8e4dc' },
        { name: 'Cloud White', color: '#f5f2ed' },
        { name: 'Warm Sand', color: '#d4c4a8' },
        { name: 'Slate Gray', color: '#7a7d80' },
        { name: 'Charcoal', color: '#3d3d3d' },
        { name: 'Terracotta', color: '#c67b5c' },
        { name: 'Sage Green', color: '#8a9a7b' },
        { name: 'Ocean Blue', color: '#5b7e96' },
      ];
      for (const v of colors1) {
        await pool.query(
          `INSERT INTO product_variants (id, product_id, name, color)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [id(), existingId1, v.name, v.color]
        );
      }
      console.log('✅ Updated Relief Panel with texture, size, and colors');
    }

    // Create demo product 2: Hexagonal 3D Tiles (NEW)
    const product2Id = id();
    const existingProduct2 = await pool.query(
      'SELECT id FROM products WHERE slug = $1',
      ['hex-3d-tiles']
    );

    if (existingProduct2.rows.length === 0) {
      await pool.query(
        `INSERT INTO products (id, user_id, name, slug, description, category_slug, public, featured, cover_image_url, texture_url, size, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          product2Id,
          userId,
          'Hexagonal 3D Tiles',
          'hex-3d-tiles',
          'Modern geometric GFRC hexagonal tiles with dimensional relief. Creates a contemporary honeycomb pattern with striking depth and shadows.',
          '3d-tiles',
          true,
          true,
          '/images/hex-3d-tile.png',
          '/images/hex-3d-tile.png',
          JSON.stringify({ w_mm: 300, h_mm: 300, t_mm: 25 }),
        ]
      );
      console.log('✅ Created demo product 2: Hexagonal 3D Tiles');

      // Insert color variants
      const colors2 = [
        { name: 'Concrete Gray', color: '#8a8a8a' },
        { name: 'Pure White', color: '#f0ede8' },
        { name: 'Midnight Black', color: '#2a2a2a' },
        { name: 'Dusty Rose', color: '#c4929b' },
        { name: 'Olive Green', color: '#6b7c5e' },
        { name: 'Warm Taupe', color: '#b5a48f' },
        { name: 'Steel Blue', color: '#6b8ba4' },
        { name: 'Rust', color: '#a65d3f' },
      ];
      for (const v of colors2) {
        await pool.query(
          `INSERT INTO product_variants (id, product_id, name, color)
           VALUES ($1, $2, $3, $4)`,
          [id(), product2Id, v.name, v.color]
        );
      }
      console.log('✅ Created Hexagonal color variants');
    } else {
      console.log('✅ Hexagonal tiles already exist');
      const existingId2 = existingProduct2.rows[0].id;
      // Update texture_url and size for existing product
      await pool.query(
        `UPDATE products 
         SET texture_url = $1, size = $2::jsonb
         WHERE slug = $3`,
        [
          '/images/hex-3d-tile.png',
          JSON.stringify({ w_mm: 300, h_mm: 300, t_mm: 25 }),
          'hex-3d-tiles'
        ]
      );
      // Upsert color variants
      const colors2 = [
        { name: 'Concrete Gray', color: '#8a8a8a' },
        { name: 'Pure White', color: '#f0ede8' },
        { name: 'Midnight Black', color: '#2a2a2a' },
        { name: 'Dusty Rose', color: '#c4929b' },
        { name: 'Olive Green', color: '#6b7c5e' },
        { name: 'Warm Taupe', color: '#b5a48f' },
        { name: 'Steel Blue', color: '#6b8ba4' },
        { name: 'Rust', color: '#a65d3f' },
      ];
      for (const v of colors2) {
        await pool.query(
          `INSERT INTO product_variants (id, product_id, name, color)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [id(), existingId2, v.name, v.color]
        );
      }
      console.log('✅ Updated Hexagonal tiles with texture, size, and colors');
    }

    console.log('\n🎉 Demo product seeding completed!');
    console.log('Products:');
    console.log('  1. Relief Panel - Capsule Pattern');
    console.log('     URL: /product/demo-relief-panel');
    console.log('     Texture: /images/ai-demo-wall-texture.png');
    console.log('  2. Hexagonal 3D Tiles');
    console.log('     URL: /product/hex-3d-tiles');
    console.log('     Texture: /images/hex-3d-tile.png');
  } catch (error) {
    console.error('❌ Demo product seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDemoProducts()
    .then(() => {
      console.log('✅ Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

export default seedDemoProducts;
