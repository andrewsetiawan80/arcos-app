import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import crypto from 'crypto';

const router = Router();
router.use(authenticateToken);
router.use(requireRole('admin'));

const ALLOWED_EVENTS = ['contact.new', 'quote.created', 'quote.approved', 'quote.rejected', 'quote.updated'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length > 500) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

function isValidEvents(events: unknown): events is string[] {
  if (!Array.isArray(events)) return false;
  return events.every(e => typeof e === 'string' && ALLOWED_EVENTS.includes(e));
}

// GET /api/webhooks — list webhooks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM webhooks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Get webhooks error:', err);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// POST /api/webhooks
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, url, events, active } = req.body;
  if (!name || typeof name !== 'string' || name.length > 100) return res.status(400).json({ error: 'name required (max 100 chars)' });
  if (!url || !isValidUrl(url)) return res.status(400).json({ error: 'url required (http(s) only, max 500 chars)' });
  const safeEvents = isValidEvents(events) ? events : ['contact.new', 'quote.created', 'quote.approved'];
  const id = crypto.randomUUID();
  try {
    const result = await pool.query(
      `INSERT INTO webhooks (id, name, url, events, active) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id, name, url, safeEvents, active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create webhook error:', err);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// PUT /api/webhooks/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (!UUID_REGEX.test(id)) return res.status(400).json({ error: 'Invalid webhook id' });
  const { name, url, events, active } = req.body;
  if (name !== undefined && (typeof name !== 'string' || name.length > 100)) return res.status(400).json({ error: 'name max 100 chars' });
  if (url !== undefined && !isValidUrl(url)) return res.status(400).json({ error: 'url must be http(s), max 500 chars' });
  if (events !== undefined && !isValidEvents(events)) return res.status(400).json({ error: 'events must be array of allowed event strings' });
  try {
    const result = await pool.query(
      `UPDATE webhooks SET name=COALESCE($1,name), url=COALESCE($2,url), events=COALESCE($3,events), active=COALESCE($4,active), updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [name, url, events, active, id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Webhook not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update webhook error:', err);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// DELETE /api/webhooks/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = req.params.id;
  if (!UUID_REGEX.test(id)) return res.status(400).json({ error: 'Invalid webhook id' });
  try {
    await pool.query('DELETE FROM webhooks WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete webhook error:', err);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

export default router;

// ---- Utility: fire webhook ----
export async function fireWebhook(event: string, payload: any) {
  try {
    const result = await pool.query(
      `SELECT url FROM webhooks WHERE active=true AND $1=ANY(events)`,
      [event]
    );
    for (const row of result.rows) {
      fetch(row.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, timestamp: new Date().toISOString(), data: payload }),
      }).catch(err => console.error(`Webhook to ${row.url} failed:`, err));
    }
  } catch (err) {
    console.error('fireWebhook error:', err);
  }
}
