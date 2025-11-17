import express, { Request, Response } from 'express';
import pool from '../db/client';

const router = express.Router();

// Get all inspiration categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, name_id as "nameId", display_order as "displayOrder"
       FROM inspiration_categories
       ORDER BY display_order ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get inspiration images (optionally filtered by category)
router.get('/images', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;

    let query = `
      SELECT 
        id,
        category_id as "categoryId",
        image_url as "imageUrl",
        title,
        title_id as "titleId",
        display_order as "displayOrder"
      FROM inspiration_images
    `;

    const params: any[] = [];
    if (categoryId && categoryId !== 'all') {
      query += ' WHERE category_id = $1';
      params.push(categoryId);
    }

    query += ' ORDER BY display_order ASC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Get single inspiration image by ID
router.get('/images/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid image ID' });
    }

    const result = await pool.query(
      `SELECT 
        id,
        category_id as "categoryId",
        image_url as "imageUrl",
        title,
        title_id as "titleId",
        display_order as "displayOrder"
      FROM inspiration_images
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

export default router;

