import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import crypto from 'crypto';

const router = Router();
router.use(authenticateToken);

// GET /api/notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM notifications WHERE read=false');
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    res.json({ count: 0 });
  }
});

// POST /api/notifications/:id/read
router.post('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('UPDATE notifications SET read=true WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// POST /api/notifications/read-all
router.post('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('UPDATE notifications SET read=true WHERE read=false');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

export default router;

// Utility: create notification
export async function createNotification(type: string, title: string, message: string, link?: string) {
  try {
    await pool.query(
      `INSERT INTO notifications (id, type, title, message, link) VALUES ($1,$2,$3,$4,$5)`,
      [crypto.randomUUID(), type, title, message, link || null]
    );
  } catch (err) {
    console.error('createNotification error:', err);
  }
}
