import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './db/client';
import { runMigrations } from './db/migrate';
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';
import inspirationRoutes from './routes/inspiration';
import faqRoutes from './routes/faq';
import featuredProjectsRoutes from './routes/featuredProjects';
import servicesRoutes from './routes/services';
import aboutRoutes from './routes/about';
import contactRoutes from './routes/contact';
import clientsRoutes from './routes/clients';
import quotesRoutes from './routes/quotes';
import jobsRoutes from './routes/jobs';
import backupsRoutes from './routes/backups';
import webhooksRoutes from './routes/webhooks';
import notificationsRoutes from './routes/notifications';
import projectShareRoutes from './routes/projectShare';
import mailSettingsRoutes from './routes/mailSettings';
import shopPricesRoutes from './routes/shopPrices';
import mixProjectsRoutes, { mixBatchesRouter } from './routes/mixProjects';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8081'],
  credentials: true,
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    if (res.statusCode >= 500) console.error(log);
    else if (res.statusCode >= 400) console.warn(log);
    // Omit 2xx/3xx from logs to reduce noise; uncomment below for verbose logging:
    // else console.log(log);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database status (for dashboard)
app.get('/api/status', async (req, res) => {
  try {
    const ok = await testConnection();
    res.json({ database: ok ? 'online' : 'offline' });
  } catch {
    res.json({ database: 'offline' });
  }
});

// Cache middleware for public read-only endpoints (5 min)
const publicCache = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', 'public, max-age=300');
  }
  next();
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/inspiration', publicCache, inspirationRoutes);
app.use('/api/faq', publicCache, faqRoutes);
app.use('/api/featured-projects', publicCache, featuredProjectsRoutes);
app.use('/api/services', publicCache, servicesRoutes);
app.use('/api/about', publicCache, aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/quotes', quotesRoutes);

/** Public LAN board for Mix Lab Staff — job lines with mix + dry kg (no auth). */
app.get('/api/floor-jobs', async (_req, res) => {
  try {
    const { default: pool } = await import('./db/client');
    const result = await pool.query(
      `SELECT j.id AS job_id, j.title AS job_title, j.status, j.updated_at,
              c.name AS client_name,
              i.id AS item_id, i.description, i.qty, i.unit,
              i.mix_recipe_id, i.mix_dry_kg
       FROM job_items i
       JOIN jobs j ON j.id = i.job_id
       LEFT JOIN clients c ON c.id = j.client_id
       WHERE COALESCE(i.mix_recipe_id, '') <> ''
         AND COALESCE(i.mix_dry_kg, 0) > 0
         AND j.status IN ('draft', 'quoted', 'won')
       ORDER BY j.updated_at DESC NULLS LAST, i.display_order, i.created_at
       LIMIT 120`,
    );
    const byJob = new Map<string, any>();
    for (const row of result.rows) {
      if (!byJob.has(row.job_id)) {
        byJob.set(row.job_id, {
          id: row.job_id,
          title: row.job_title,
          status: row.status,
          clientName: row.client_name || null,
          updatedAt: row.updated_at,
          lines: [] as any[],
        });
      }
      const dryPer = Number(row.mix_dry_kg) || 0;
      const qty = Number(row.qty) || 1;
      byJob.get(row.job_id).lines.push({
        id: row.item_id,
        description: row.description || 'Line',
        qty,
        unit: row.unit || 'pcs',
        mixRecipeId: row.mix_recipe_id,
        mixDryKg: dryPer,
        batchDryKg: dryPer * qty,
        batchDryGrams: Math.round(dryPer * qty * 1000),
      });
    }
    res.json([...byJob.values()]);
  } catch (err) {
    console.error('floor-jobs', err);
    res.status(500).json({ error: 'Failed to load floor jobs' });
  }
});

app.use('/api/jobs', jobsRoutes);
app.use('/api/backups', backupsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/projects', projectShareRoutes);
app.use('/api/settings/mail', mailSettingsRoutes);
app.use('/api/shop-prices', shopPricesRoutes);
// Alias for Mix Lab clients that post to /api/prices
app.use('/api/prices', shopPricesRoutes);
// Shared Mix Lab ↔ Arcos floor jobs + batches
app.use('/api/mix-projects', mixProjectsRoutes);
app.use('/api/mix-batches', mixBatchesRouter);
app.use('/api/mix-log', mixBatchesRouter);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`${new Date().toISOString()} ERROR ${req.method} ${req.originalUrl}:`, err?.message || err);
  if (!res.headersSent) {
    res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
  }
});

// Start server
async function start() {
  try {
    // Test database connection (with retry logic for Docker)
    let connected = false;
    let retries = 10;
    while (!connected && retries > 0) {
      connected = await testConnection();
      if (!connected) {
        console.log(`⏳ Waiting for database... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      }
    }

    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your DATABASE_URL.');
      process.exit(1);
    }

    // Run migrations (skip if already run)
    try {
      console.log('Running database migrations...');
      await runMigrations();
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        console.log('✅ Migrations already applied');
      } else {
        throw error;
      }
    }

    // Seed inspiration data (idempotent - can run multiple times)
    try {
      const { seedInspiration } = await import('./db/seedInspiration');
      await seedInspiration();
    } catch (error: any) {
      console.log('⚠️  Inspiration seeding skipped (may already exist)');
    }

    // Seed FAQ data
    try {
      const { seedFAQ } = await import('./db/seedFAQ');
      await seedFAQ();
    } catch (error: any) {
      console.log('⚠️  FAQ seeding skipped (may already exist)');
    }

    // Seed featured projects data
    try {
      const { seedFeaturedProjects } = await import('./db/seedFeaturedProjects');
      await seedFeaturedProjects();
    } catch (error: any) {
      console.log('⚠️  Featured projects seeding skipped (may already exist)');
    }

    // Seed services data
    try {
      const { seedServices } = await import('./db/seedServices');
      await seedServices();
    } catch (error: any) {
      console.log('⚠️  Services seeding skipped (may already exist)');
    }

    // Seed about data
    try {
      const { seedAbout } = await import('./db/seedAbout');
      await seedAbout();
    } catch (error: any) {
      console.log('⚠️  About seeding skipped (may already exist)');
    }

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 API available at http://localhost:${PORT}/api`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`💾 Data endpoints: http://localhost:${PORT}/api/data`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
