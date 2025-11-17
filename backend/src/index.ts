import express from 'express';
import cors from 'cors';
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

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:8081'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/inspiration', inspirationRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/featured-projects', featuredProjectsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/about', aboutRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
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
