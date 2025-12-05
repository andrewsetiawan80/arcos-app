import pool from './client';

// Milestones data converted from PublicAbout.tsx
const MILESTONES = [
  {
    year: "2023",
    headline: "Pilot Innovations",
    detail: "Prototype microtopping and terrazzo systems rolled out across flagship projects in Jakarta and Singapore.",
    displayOrder: 1,
  },
  {
    year: "2024",
    headline: "Fabrication Lab",
    detail: "Robotic milling, precision molds, and 24/7 curing suites commissioned to support bespoke façade programs.",
    displayOrder: 2,
  },
  {
    year: "2025",
    headline: "Arcos Launch",
    detail: "Full-service partner for architectural concrete surfaces—interiors, exteriors, and structural components.",
    displayOrder: 3,
  },
];

// Highlights data converted from PublicAbout.tsx
const HIGHLIGHTS = [
  {
    title: "Where We Work",
    detail: "Jakarta • Singapore • Melbourne",
    displayOrder: 1,
  },
  {
    title: "What We Craft",
    detail: "Seamless microcement • Terrazzo systems • Polished concrete • 3D tiles • Architectural panels",
    displayOrder: 2,
  },
  {
    title: "How We Deliver",
    detail: "One integrated team from concept, mix design, fabrication to on-site installation",
    displayOrder: 3,
  },
];

export async function seedAbout() {
  const client = await pool.connect();
  try {
    // Clear existing data (outside transaction to avoid abort issues)
    try {
      await client.query('DELETE FROM about_milestones');
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.warn('Warning clearing milestones:', e.message);
      }
    }
    try {
      await client.query('DELETE FROM about_highlights');
    } catch (e: any) {
      if (e.code !== '42P01') {
        console.warn('Warning clearing highlights:', e.message);
      }
    }

    await client.query('BEGIN');

    // Insert milestones
    console.log('🌱 Seeding about milestones...');
    for (const milestone of MILESTONES) {
      await client.query(
        `INSERT INTO about_milestones (year, headline, detail, display_order)
         VALUES ($1, $2, $3, $4)`,
        [milestone.year, milestone.headline, milestone.detail, milestone.displayOrder]
      );
    }
    console.log(`✅ Seeded ${MILESTONES.length} milestones`);

    // Insert highlights
    console.log('🌱 Seeding about highlights...');
    for (const highlight of HIGHLIGHTS) {
      await client.query(
        `INSERT INTO about_highlights (title, detail, display_order)
         VALUES ($1, $2, $3)`,
        [highlight.title, highlight.detail, highlight.displayOrder]
      );
    }
    console.log(`✅ Seeded ${HIGHLIGHTS.length} highlights`);

    await client.query('COMMIT');
    console.log('🎉 About data seeding completed!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ About seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

