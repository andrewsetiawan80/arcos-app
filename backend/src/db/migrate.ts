import pool from './client';

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Materials table
  `CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    density_kg_m3 DECIMAL(10, 2),
    price_per_kg DECIMAL(10, 2),
    price_currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Recipes table
  `CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    process VARCHAR(50),
    version VARCHAR(50),
    density_kg_m3 DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Recipe lines table
  `CREATE TABLE IF NOT EXISTS recipe_lines (
    id VARCHAR(50) PRIMARY KEY,
    recipe_id VARCHAR(50) REFERENCES recipes(id) ON DELETE CASCADE,
    material_id VARCHAR(50) REFERENCES materials(id) ON DELETE CASCADE,
    amount DECIMAL(10, 4),
    unit VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Products table
  `CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    category_slug VARCHAR(255),
    public BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    cover_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Product variants table
  `CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255),
    color VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Product recipes table
  `CREATE TABLE IF NOT EXISTS product_recipes (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    variant_id VARCHAR(50) REFERENCES product_variants(id) ON DELETE CASCADE,
    process VARCHAR(50),
    recipe_id VARCHAR(50) REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Categories table
  `CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Lab entries table
  `CREATE TABLE IF NOT EXISTS lab_entries (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    notes TEXT,
    base_recipe_id VARCHAR(50) REFERENCES recipes(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Proposals table
  `CREATE TABLE IF NOT EXISTS proposals (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    total DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'IDR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Pages table (CMS)
  `CREATE TABLE IF NOT EXISTS pages (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    cover_image_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Settings table
  `CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Inspiration categories table
  `CREATE TABLE IF NOT EXISTS inspiration_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_id VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Inspiration images table
  `CREATE TABLE IF NOT EXISTS inspiration_images (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES inspiration_categories(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_id VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // FAQ categories table
  `CREATE TABLE IF NOT EXISTS faq_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_id VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // FAQ items table
  `CREATE TABLE IF NOT EXISTS faq_items (
    id SERIAL PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_id TEXT,
    answer TEXT NOT NULL,
    answer_id TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Featured projects table
  `CREATE TABLE IF NOT EXISTS featured_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_id VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    category_id VARCHAR(255),
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Services table
  `CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_id VARCHAR(255),
    description TEXT NOT NULL,
    description_id TEXT,
    category VARCHAR(255) NOT NULL,
    category_id VARCHAR(255),
    accent VARCHAR(255),
    accent_id VARCHAR(255),
    image_url TEXT,
    points TEXT[],
    points_id TEXT[],
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // About milestones table
  `CREATE TABLE IF NOT EXISTS about_milestones (
    id SERIAL PRIMARY KEY,
    year VARCHAR(10) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    headline_id VARCHAR(255),
    detail TEXT NOT NULL,
    detail_id TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // About highlights table
  `CREATE TABLE IF NOT EXISTS about_highlights (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_id VARCHAR(255),
    detail TEXT NOT NULL,
    detail_id TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_products_public ON products(public)`,
  `CREATE INDEX IF NOT EXISTS idx_recipe_lines_recipe_id ON recipe_lines(recipe_id)`,
  `CREATE INDEX IF NOT EXISTS idx_lab_entries_user_id ON lab_entries(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_proposals_user_id ON proposals(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_inspiration_images_category_id ON inspiration_images(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_inspiration_images_display_order ON inspiration_images(display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_faq_items_category_id ON faq_items(category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_faq_items_display_order ON faq_items(display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_featured_projects_active ON featured_projects(active)`,
  `CREATE INDEX IF NOT EXISTS idx_featured_projects_display_order ON featured_projects(display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_services_active ON services(active)`,
  `CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)`,
  `CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_about_milestones_display_order ON about_milestones(display_order)`,
  `CREATE INDEX IF NOT EXISTS idx_about_highlights_display_order ON about_highlights(display_order)`,
];

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const migration of migrations) {
      try {
        await client.query(migration);
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists') || error.code === '42P07') {
          continue;
        }
        throw error;
      }
    }
    
    await client.query('COMMIT');
    console.log('✅ All migrations completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ Migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration error:', error);
      process.exit(1);
    });
}