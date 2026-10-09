import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import pool from '../db/client';
import crypto from 'crypto';

const router = Router();

// PUBLIC: view project by share token
router.get('/share/:token', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, COALESCE(json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants
       FROM products p
       LEFT JOIN product_variants pv ON p.id = pv.product_id
       WHERE p.share_token = $1
       GROUP BY p.id`,
      [req.params.token]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Project not found' });

    const row = result.rows[0];
    const variants = (row.variants || []).filter((v: any) => v.id);
    res.json({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      categorySlug: row.category_slug,
      coverImageUrl: row.cover_image_url,
      variants,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('Get shared project error:', err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects/:id/share — generate share token (auth required)
router.post('/:id/share', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const result = await pool.query(
      `UPDATE products SET share_token = $1, updated_at = NOW() WHERE id = $2 RETURNING id, share_token`,
      [token, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Product not found' });
    const baseUrl = process.env.PUBLIC_URL || `http://${req.get('host') || 'localhost'}`;
    res.json({ shareToken: result.rows[0].share_token, shareUrl: `${baseUrl.replace(/\/$/, '')}/project/${token}` });
  } catch (err) {
    console.error('Create share token error:', err);
    res.status(500).json({ error: 'Failed to create share link' });
  }
});

export default router;
