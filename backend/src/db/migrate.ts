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
    full_image_url TEXT,
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

  // Clients table
  `CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Quotes table
  `CREATE TABLE IF NOT EXISTS quotes (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    share_token VARCHAR(64) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Quote items table
  `CREATE TABLE IF NOT EXISTS quote_items (
    id VARCHAR(50) PRIMARY KEY,
    quote_id VARCHAR(50) REFERENCES quotes(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    qty DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'pcs',
    unit_price DECIMAL(15, 2) DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Webhooks table
  `CREATE TABLE IF NOT EXISTS webhooks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] DEFAULT ARRAY['contact.new','quote.created','quote.approved'],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Notifications table
  `CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Indexes for performance
  `CREATE INDEX IF NOT EXISTS idx_materials_user_id ON materials(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_products_public ON products(public)`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS share_token VARCHAR(64) UNIQUE`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS texture_url TEXT`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS normal_map_url TEXT`,
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS size JSONB`,
  `CREATE INDEX IF NOT EXISTS idx_products_share_token ON products(share_token)`,
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
  `CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name)`,
  `CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)`,
  `CREATE INDEX IF NOT EXISTS idx_quotes_share_token ON quotes(share_token)`,
  `CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active)`,

  // App settings (key-value for SMTP, etc.)
  `CREATE TABLE IF NOT EXISTS app_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Mix Lab shop prices (source of truth for material costs — amount + pack size)
  `CREATE TABLE IF NOT EXISTS shop_prices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    pack_kg NUMERIC NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `ALTER TABLE materials ADD COLUMN IF NOT EXISTS amount NUMERIC DEFAULT 0`,
  `ALTER TABLE materials ADD COLUMN IF NOT EXISTS pack_kg NUMERIC DEFAULT 1`,
  `ALTER TABLE materials ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,

  `ALTER TABLE shop_prices ADD COLUMN IF NOT EXISTS density_kg_m3 NUMERIC`,
  `ALTER TABLE shop_prices ADD COLUMN IF NOT EXISTS kind VARCHAR(40) DEFAULT 'other'`,
  `ALTER TABLE shop_prices ADD COLUMN IF NOT EXISTS brand VARCHAR(120)`,
  `ALTER TABLE shop_prices ADD COLUMN IF NOT EXISTS color VARCHAR(80)`,

  // Shared floor jobs (Mix Lab + Arcos) — one record for trial/customer projects
  `CREATE TABLE IF NOT EXISTS mix_projects (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    client_name VARCHAR(255),
    status VARCHAR(40) NOT NULL DEFAULT 'trial',
    mix_recipe_id VARCHAR(80),
    base_recipe_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS mix_batches (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) REFERENCES mix_projects(id) ON DELETE SET NULL,
    recipe_id VARCHAR(80),
    recipe_name VARCHAR(255),
    dry_weight NUMERIC DEFAULT 0,
    weighed_by VARCHAR(120),
    source VARCHAR(40) DEFAULT 'staff',
    at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_mix_projects_status ON mix_projects(status)`,
  `CREATE INDEX IF NOT EXISTS idx_mix_projects_client ON mix_projects(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_mix_batches_project ON mix_batches(project_id)`,
  `CREATE INDEX IF NOT EXISTS idx_mix_batches_at ON mix_batches(at DESC)`,

  // Link Quotes → Mix Projects (custom jobs like Pak Teja)
  `ALTER TABLE mix_projects ADD COLUMN IF NOT EXISTS quote_id VARCHAR(50) REFERENCES quotes(id) ON DELETE SET NULL`,
  `CREATE INDEX IF NOT EXISTS idx_mix_projects_quote ON mix_projects(quote_id)`,

  // Quote commercial fields
  `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS ppn_pct DECIMAL(5, 2) DEFAULT 11`,
  `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS terms TEXT`,

  // Commercial jobs (client project → priced custom lines → quote). Not catalog products.
  `CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client_id VARCHAR(50) REFERENCES clients(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft',
    notes TEXT,
    quote_id VARCHAR(50) REFERENCES quotes(id) ON DELETE SET NULL,
    default_waste_pct DECIMAL(6, 2) DEFAULT 3,
    default_overhead_pct DECIMAL(6, 2) DEFAULT 10,
    default_markup_pct DECIMAL(6, 2) DEFAULT 40,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS job_items (
    id VARCHAR(50) PRIMARY KEY,
    job_id VARCHAR(50) REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    kind VARCHAR(20) DEFAULT 'piece',
    qty DECIMAL(12, 3) DEFAULT 1,
    unit VARCHAR(30) DEFAULT 'pcs',
    unit_cost DECIMAL(15, 2) DEFAULT 0,
    waste_pct DECIMAL(6, 2) DEFAULT 3,
    overhead_pct DECIMAL(6, 2) DEFAULT 10,
    markup_pct DECIMAL(6, 2) DEFAULT 40,
    unit_price DECIMAL(15, 2) DEFAULT 0,
    price_override BOOLEAN DEFAULT false,
    notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE INDEX IF NOT EXISTS idx_jobs_client ON jobs(client_id)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)`,
  `CREATE INDEX IF NOT EXISTS idx_jobs_quote ON jobs(quote_id)`,
  `CREATE INDEX IF NOT EXISTS idx_job_items_job ON job_items(job_id)`,

  `ALTER TABLE quotes ADD COLUMN IF NOT EXISTS job_id VARCHAR(50)`,
  `CREATE INDEX IF NOT EXISTS idx_quotes_job ON quotes(job_id)`,

  `ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(15, 2)`,
  `ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS markup_pct DECIMAL(6, 2)`,
  `ALTER TABLE quote_items ADD COLUMN IF NOT EXISTS job_item_id VARCHAR(50)`,

  // Material + labour split on job lines; labour = hours × hourly rate by complexity
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS material_cost DECIMAL(15, 2) DEFAULT 0`,
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS labour_complexity VARCHAR(20) DEFAULT 'none'`,
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS labour_cost DECIMAL(15, 2) DEFAULT 0`,
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS labour_hours DECIMAL(10, 2) DEFAULT 0`,
  `UPDATE job_items SET material_cost = COALESCE(unit_cost, 0) WHERE material_cost IS NULL OR material_cost = 0 AND COALESCE(unit_cost, 0) > 0 AND COALESCE(labour_cost, 0) = 0`,

  `CREATE TABLE IF NOT EXISTS job_labour_presets (
    id VARCHAR(50) PRIMARY KEY,
    scope VARCHAR(20) NOT NULL DEFAULT 'shop',
    complexity VARCHAR(20) NOT NULL,
    label VARCHAR(100) NOT NULL,
    amount_idr DECIMAL(15, 2),
    hourly_rate_idr DECIMAL(15, 2),
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (scope, complexity)
  )`,

  `ALTER TABLE job_labour_presets ADD COLUMN IF NOT EXISTS hourly_rate_idr DECIMAL(15, 2)`,

  // Migrate old piece/area fixed-amount presets → single shop hourly-rate presets (empty rates)
  `INSERT INTO job_labour_presets (id, scope, complexity, label, amount_idr, hourly_rate_idr, sort_order) VALUES
    ('shop_simple', 'shop', 'simple', 'Simple', NULL, NULL, 1),
    ('shop_medium', 'shop', 'medium', 'Medium', NULL, NULL, 2),
    ('shop_complex', 'shop', 'complex', 'Complex', NULL, NULL, 3)
   ON CONFLICT (id) DO NOTHING`,

  `INSERT INTO job_labour_presets (id, scope, complexity, label, amount_idr, hourly_rate_idr, sort_order) VALUES
    ('piece_simple', 'piece', 'simple', 'Simple', NULL, NULL, 1),
    ('piece_medium', 'piece', 'medium', 'Medium', NULL, NULL, 2),
    ('piece_complex', 'piece', 'complex', 'Complex', NULL, NULL, 3),
    ('area_simple', 'area', 'simple', 'Simple', NULL, NULL, 1),
    ('area_medium', 'area', 'medium', 'Medium', NULL, NULL, 2),
    ('area_complex', 'area', 'complex', 'Complex', NULL, NULL, 3)
   ON CONFLICT (id) DO NOTHING`,

  // Production meta for Job lines (Staff weigh-out from Job Production sheet)
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS mix_recipe_id VARCHAR(100)`,
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS mix_dry_kg DECIMAL(12, 4)`,
  `ALTER TABLE job_items ADD COLUMN IF NOT EXISTS cast_meta JSONB`,
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