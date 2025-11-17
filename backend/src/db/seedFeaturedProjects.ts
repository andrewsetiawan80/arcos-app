import pool from './client';

// Featured projects data - extracted from PublicHome.tsx
const FEATURED_PROJECTS = [
  {
    title: "Residential Microcement",
    titleId: "Microcement Residensial",
    category: "Residential",
    categoryId: "Residensial",
    imageUrl: "/assets/images/minimalist-concrete-interior-with-black-sphere-concrete-stairs-3d-rendering.jpg",
    displayOrder: 1,
  },
  {
    title: "Commercial Facade",
    titleId: "Fasad Komersial",
    category: "Commercial & Institutional",
    categoryId: "Komersial & Institusional",
    imageUrl: "/assets/images/landmark-installation.jpg",
    displayOrder: 2,
  },
  {
    title: "Hospitality & Spa",
    titleId: "Hospitality & Spa",
    category: "Hospitality",
    categoryId: "Hospitality",
    imageUrl: "/assets/images/concrete-finish.jpg",
    displayOrder: 3,
  },
  {
    title: "Terrazzo Flooring",
    titleId: "Lantai Terrazzo",
    category: "Commercial & Institutional",
    categoryId: "Komersial & Institusional",
    imageUrl: "/assets/images/concrete-texture-2.jpg",
    displayOrder: 4,
  },
  {
    title: "Structural Panels",
    titleId: "Panel Struktural",
    category: "Architectural",
    categoryId: "Arsitektural",
    imageUrl: "/assets/images/structural-panels.jpg",
    displayOrder: 5,
  },
  {
    title: "Outdoor Terrace",
    titleId: "Teras Luar Ruangan",
    category: "Outdoor",
    categoryId: "Luar Ruangan",
    imageUrl: "/assets/images/mosaic-facade-detail.jpg",
    displayOrder: 6,
  },
];

export async function seedFeaturedProjects() {
  const client = await pool.connect();
  try {
    // Clear existing data (outside transaction)
    try {
      await client.query('DELETE FROM featured_projects');
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.warn('Warning clearing featured projects:', e.message);
      }
    }

    await client.query('BEGIN');

    // Insert featured projects
    console.log('🌱 Seeding featured projects...');
    for (const project of FEATURED_PROJECTS) {
      await client.query(
        `INSERT INTO featured_projects (title, title_id, category, category_id, image_url, display_order, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [project.title, project.titleId, project.category, project.categoryId, project.imageUrl, project.displayOrder, true]
      );
    }
    console.log(`✅ Seeded ${FEATURED_PROJECTS.length} featured projects`);

    await client.query('COMMIT');
    console.log('🎉 Featured projects seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Featured projects seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  seedFeaturedProjects()
    .then(() => {
      console.log('✅ Featured projects seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Featured projects seeding error:', error);
      process.exit(1);
    });
}

