import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const router = Router();
router.use(authenticateToken);
router.use(requireRole('admin'));

const BACKUP_DIR = process.env.BACKUP_DIR || '/opt/arcos-app/backups';

const SAFE_FILENAME = /^[a-zA-Z0-9_\-]+\.(sql|sql\.gz)$/;

function isSafeFilename(filename: string): boolean {
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;
  return SAFE_FILENAME.test(filename);
}

// GET /api/backups — list backups
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql') || f.endsWith('.sql.gz'))
      .map(f => {
        const stats = fs.statSync(path.join(BACKUP_DIR, f));
        return { name: f, size: stats.size, created: stats.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    res.json(files);
  } catch (err: any) {
    console.error('List backups error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backups — create backup
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `arcos-backup-${ts}.sql`;
    const filepath = path.join(BACKUP_DIR, filename);
    const dbUrl = process.env.DATABASE_URL || '';

    await execAsync(`pg_dump "${dbUrl}" > "${filepath}"`);

    const stats = fs.statSync(filepath);
    res.json({ success: true, backup: { name: filename, size: stats.size, created: stats.mtime.toISOString() } });
  } catch (err: any) {
    console.error('Create backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backups/restore — restore from backup
router.post('/restore', async (req: AuthRequest, res: Response) => {
  const { filename } = req.body;
  if (!filename || typeof filename !== 'string') return res.status(400).json({ error: 'filename required' });
  if (!isSafeFilename(filename)) return res.status(400).json({ error: 'Invalid filename' });

  const filepath = path.join(BACKUP_DIR, filename);
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(path.resolve(BACKUP_DIR))) return res.status(400).json({ error: 'Invalid filename' });
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Backup file not found' });

  try {
    const dbUrl = process.env.DATABASE_URL || '';
    await execAsync(`psql "${dbUrl}" < "${filepath}"`);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Restore backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/backups/:filename
router.delete('/:filename', async (req: AuthRequest, res: Response) => {
  const filename = req.params.filename;
  if (!isSafeFilename(filename)) return res.status(400).json({ error: 'Invalid filename' });

  const filepath = path.join(BACKUP_DIR, filename);
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(path.resolve(BACKUP_DIR))) return res.status(400).json({ error: 'Invalid filename' });
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (err: any) {
    console.error('Delete backup error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
