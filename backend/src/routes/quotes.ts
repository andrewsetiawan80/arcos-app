import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import crypto from 'crypto';
import { fireWebhook } from './webhooks';
import { createNotification } from './notifications';

const router = Router();

const DEFAULT_PPN = 11;

function num(v: any, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function itemsSubtotal(items: any[]): number {
  return (items || []).reduce((sum, i) => sum + num(i.qty) * num(i.unit_price), 0);
}

function grandTotal(subtotal: number, ppnPct: number): number {
  return subtotal + (subtotal * Math.max(0, ppnPct)) / 100;
}

function normalizeItem(row: any) {
  return {
    ...row,
    qty: num(row.qty, 1),
    unit_price: num(row.unit_price),
    unit: row.unit || "pcs",
    description: row.description || "",
  };
}

function normalizeQuote(row: any, items: any[]) {
  const ppnPct = row.ppn_pct == null ? DEFAULT_PPN : num(row.ppn_pct, DEFAULT_PPN);
  const normalizedItems = (items || []).map(normalizeItem);
  const subtotal = itemsSubtotal(normalizedItems);
  const termsRaw = row.terms != null ? String(row.terms).trim() : "";
  return {
    ...row,
    ppn_pct: ppnPct,
    terms: termsRaw,
    notes: row.notes ?? "",
    total: num(row.total, grandTotal(subtotal, ppnPct)),
    subtotal,
    ppn_amount: (subtotal * ppnPct) / 100,
    items: normalizedItems,
  };
}

// PUBLIC: view quote by share token (no auth)
router.get('/share/:token', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.name as client_name, c.company as client_company,
              c.email as client_email, c.phone as client_phone, c.address as client_address
       FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
       WHERE q.share_token = $1`,
      [req.params.token]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Quote not found' });

    const quote = result.rows[0];
    const items = await pool.query('SELECT * FROM quote_items WHERE quote_id = $1 ORDER BY display_order', [quote.id]);
    res.json(normalizeQuote(quote, items.rows));
  } catch (err) {
    console.error('Get shared quote error:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// PUBLIC: respond to quote (approve/reject)
router.post('/share/:token/respond', async (req: Request, res: Response) => {
  const { action } = req.body; // 'approved' or 'rejected'
  if (!['approved', 'rejected'].includes(action)) {
    return res.status(400).json({ error: 'action must be approved or rejected' });
  }
  try {
    const result = await pool.query(
      `UPDATE quotes SET status=$1, updated_at=NOW() WHERE share_token=$2 AND status='sent' RETURNING id, title, status`,
      [action, req.params.token]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Quote not found or not actionable' });
    const row = result.rows[0];
    const event = action === 'approved' ? 'quote.approved' : 'quote.rejected';
    fireWebhook(event, { id: row.id, title: row.title, status: row.status }).catch(() => {});
    createNotification('quote', `Quote ${action}`, row.title || '', `/app/quotes/${row.id}`).catch(() => {});
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Respond to quote error:', err);
    res.status(500).json({ error: 'Failed to update quote' });
  }
});

// ---- Auth required from here ----
router.use(authenticateToken);
router.use(requireRole('admin', 'sales'));

// GET /api/quotes
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.name as client_name, c.company as client_company
       FROM quotes q LEFT JOIN clients c ON q.client_id = c.id
       ORDER BY q.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get quotes error:', err);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// GET /api/quotes/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT q.*, c.name as client_name, c.company as client_company,
              c.email as client_email, c.phone as client_phone, c.address as client_address
       FROM quotes q LEFT JOIN clients c ON q.client_id = c.id WHERE q.id=$1`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Quote not found' });

    const quote = result.rows[0];
    const items = await pool.query('SELECT * FROM quote_items WHERE quote_id=$1 ORDER BY display_order', [quote.id]);
    res.json(normalizeQuote(quote, items.rows));
  } catch (err) {
    console.error('Get quote error:', err);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// POST /api/quotes
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, client_id, notes, terms, items } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const ppnPct = req.body.ppn_pct == null ? DEFAULT_PPN : Math.max(0, num(req.body.ppn_pct, DEFAULT_PPN));
  const id = crypto.randomUUID();
  const shareToken = crypto.randomBytes(16).toString('hex');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const subtotal = itemsSubtotal(items || []);
    const total = grandTotal(subtotal, ppnPct);

    await client.query(
      `INSERT INTO quotes (id, title, client_id, status, total, currency, share_token, notes, ppn_pct, terms)
       VALUES ($1,$2,$3,'draft',$4,'IDR',$5,$6,$7,$8)`,
      [id, title, client_id || null, total, shareToken, notes || null, ppnPct, terms || null]
    );

    for (let idx = 0; idx < (items || []).length; idx++) {
      const it = items[idx];
      await client.query(
        `INSERT INTO quote_items (id, quote_id, description, qty, unit, unit_price, display_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [crypto.randomUUID(), id, it.description || '', num(it.qty), it.unit || 'pcs', num(it.unit_price), idx]
      );
    }

    await client.query('COMMIT');

    const result = await pool.query('SELECT * FROM quotes WHERE id=$1', [id]);
    const itemRows = await pool.query('SELECT * FROM quote_items WHERE quote_id=$1 ORDER BY display_order', [id]);
    const quote = normalizeQuote(result.rows[0], itemRows.rows);
    fireWebhook('quote.created', quote).catch(() => {});
    createNotification('quote', `Quote created: ${title}`, '', `/app/quotes/${id}`).catch(() => {});
    res.status(201).json(quote);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create quote error:', err);
    res.status(500).json({ error: 'Failed to create quote' });
  } finally {
    client.release();
  }
});

// PUT /api/quotes/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { title, client_id, status, notes, terms, items } = req.body;
  const ppnPct = req.body.ppn_pct == null ? DEFAULT_PPN : Math.max(0, num(req.body.ppn_pct, DEFAULT_PPN));

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    const existing = await dbClient.query('SELECT id FROM quotes WHERE id=$1', [req.params.id]);
    if (!existing.rows.length) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Quote not found' });
    }

    let subtotal = 0;
    if (items) {
      subtotal = itemsSubtotal(items);
    } else {
      const currentItems = await dbClient.query(
        'SELECT qty, unit_price FROM quote_items WHERE quote_id=$1',
        [req.params.id]
      );
      subtotal = itemsSubtotal(currentItems.rows);
    }
    const total = grandTotal(subtotal, ppnPct);

    await dbClient.query(
      `UPDATE quotes SET title=COALESCE($1,title), client_id=$2, status=COALESCE($3,status),
       total=$4, notes=$5, ppn_pct=$6, terms=$7, updated_at=NOW() WHERE id=$8`,
      [title, client_id ?? null, status, total, notes ?? null, ppnPct, terms ?? null, req.params.id]
    );

    if (items) {
      await dbClient.query('DELETE FROM quote_items WHERE quote_id=$1', [req.params.id]);
      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx];
        await dbClient.query(
          `INSERT INTO quote_items (id, quote_id, description, qty, unit, unit_price, display_order)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [crypto.randomUUID(), req.params.id, it.description || '', num(it.qty), it.unit || 'pcs', num(it.unit_price), idx]
        );
      }
    }

    await dbClient.query('COMMIT');

    const result = await pool.query('SELECT * FROM quotes WHERE id=$1', [req.params.id]);
    const itemRows = await pool.query('SELECT * FROM quote_items WHERE quote_id=$1 ORDER BY display_order', [req.params.id]);
    res.json(normalizeQuote(result.rows[0], itemRows.rows));
  } catch (err) {
    await dbClient.query('ROLLBACK');
    console.error('Update quote error:', err);
    res.status(500).json({ error: 'Failed to update quote' });
  } finally {
    dbClient.release();
  }
});

// DELETE /api/quotes/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM quotes WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete quote error:', err);
    res.status(500).json({ error: 'Failed to delete quote' });
  }
});

export default router;
