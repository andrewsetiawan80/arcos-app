import pool from './client';

// Inspiration categories data
const INSPIRATION_CATEGORIES = [
  { id: "all", name: "All", nameId: "Semua", displayOrder: 0 },
  { id: "3d-tiles", name: "3D Tiles", nameId: "Ubin 3D", displayOrder: 1 },
  { id: "concrete-panels", name: "Concrete Panels", nameId: "Panel Beton", displayOrder: 2 },
  { id: "microcement", name: "Microcement", nameId: "Microcement", displayOrder: 3 },
  { id: "textured", name: "Textured Microcement", nameId: "Microcement Bertekstur", displayOrder: 4 },
  { id: "bespoke", name: "Bespoke Projects", nameId: "Proyek Kustom", displayOrder: 5 },
];

// Inspiration images data - converted from static imports to URL paths
const INSPIRATION_IMAGES = [
  // 3D Tiles (105 images)
  ...Array.from({ length: 105 }, (_, i) => ({
    categoryId: "3d-tiles",
    imageUrl: `/assets/images/inspiration/3d-tile-${String(i + 1).padStart(2, '0')}.png`,
    title: `3D Tile Pattern ${String(i + 1).padStart(2, '0')}`,
    titleId: `Pola Ubin 3D ${String(i + 1).padStart(2, '0')}`,
    displayOrder: i + 1,
  })),
  // Concrete Panels (6 images)
  ...Array.from({ length: 6 }, (_, i) => ({
    categoryId: "concrete-panels",
    imageUrl: `/assets/images/inspiration/concrete-panel-${String(i + 1).padStart(2, '0')}.png`,
    title: `Concrete Panel ${String(i + 1).padStart(2, '0')}`,
    titleId: `Panel Beton ${String(i + 1).padStart(2, '0')}`,
    displayOrder: i + 1,
  })),
  // Microcement (3 images)
  ...Array.from({ length: 3 }, (_, i) => ({
    categoryId: "microcement",
    imageUrl: `/assets/images/inspiration/microcement-${String(i + 1).padStart(2, '0')}.png`,
    title: `Seamless Microcement ${String(i + 1).padStart(2, '0')}`,
    titleId: `Microcement Tanpa Sambungan ${String(i + 1).padStart(2, '0')}`,
    displayOrder: i + 1,
  })),
  // Textured Microcement (6 images)
  ...Array.from({ length: 6 }, (_, i) => ({
    categoryId: "textured",
    imageUrl: `/assets/images/inspiration/textured-microcement-${String(i + 1).padStart(2, '0')}.png`,
    title: `Textured Microcement ${String(i + 1).padStart(2, '0')}`,
    titleId: `Microcement Bertekstur ${String(i + 1).padStart(2, '0')}`,
    displayOrder: i + 1,
  })),
  // Bespoke Projects (6 images)
  ...Array.from({ length: 6 }, (_, i) => ({
    categoryId: "bespoke",
    imageUrl: `/assets/images/inspiration/bespoke-${String(i + 1).padStart(2, '0')}.png`,
    title: `Bespoke Project ${String(i + 1).padStart(2, '0')}`,
    titleId: `Proyek Kustom ${String(i + 1).padStart(2, '0')}`,
    displayOrder: i + 1,
  })),
];

export async function seedInspiration() {
  const client = await pool.connect();
  try {
    // Clear existing data (outside transaction to avoid abort issues)
    try {
      await client.query('DELETE FROM inspiration_images');
    } catch (e: any) {
      if (e.code !== '42P01') { // 42P01 = table does not exist
        console.warn('Warning clearing images:', e.message);
      }
    }
    try {
      await client.query('DELETE FROM inspiration_categories WHERE id != $1', ['all']);
    } catch (e: any) {
      if (e.code !== '42P01') { // 42P01 = table does not exist
        console.warn('Warning clearing categories:', e.message);
      }
    }

    await client.query('BEGIN');

    // Insert categories
    console.log('🌱 Seeding inspiration categories...');
    for (const category of INSPIRATION_CATEGORIES) {
      await client.query(
        `INSERT INTO inspiration_categories (id, name, name_id, display_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = $2,
           name_id = $3,
           display_order = $4,
           updated_at = CURRENT_TIMESTAMP`,
        [category.id, category.name, category.nameId, category.displayOrder]
      );
    }
    console.log(`✅ Seeded ${INSPIRATION_CATEGORIES.length} categories`);

    // Insert images
    console.log('🌱 Seeding inspiration images...');
    for (const image of INSPIRATION_IMAGES) {
      await client.query(
        `INSERT INTO inspiration_images (category_id, image_url, title, title_id, display_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [image.categoryId, image.imageUrl, image.title, image.titleId, image.displayOrder]
      );
    }
    console.log(`✅ Seeded ${INSPIRATION_IMAGES.length} images`);

    await client.query('COMMIT');
    console.log('🎉 Inspiration data seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Inspiration seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedInspiration()
    .then(() => {
      console.log('✅ Inspiration seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Inspiration seeding error:', error);
      process.exit(1);
    });
}

