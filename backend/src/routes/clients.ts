import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import crypto from 'crypto';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('admin', 'sales'));

// GET /api/clients
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clients ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get clients error:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// GET /api/clients/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get client error:', err);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// POST /api/clients
router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, company, email, phone, address, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const id = crypto.randomUUID();
  try {
    const result = await pool.query(
      `INSERT INTO clients (id, name, company, email, phone, address, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, name, company || null, email || null, phone || null, address || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// PUT /api/clients/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { name, company, email, phone, address, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clients SET name=COALESCE($1,name), company=$2, email=$3, phone=$4, address=$5, notes=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, company ?? null, email ?? null, phone ?? null, address ?? null, notes ?? null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Client not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/clients/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM clients WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;
