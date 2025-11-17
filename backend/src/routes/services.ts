import { Router } from 'express';
import pool from '../db/client';

const router = Router();

// Get all active services, optionally filtered by category
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT 
        id, 
        title, 
        title_id AS "titleId",
        description, 
        description_id AS "descriptionId",
        category, 
        category_id AS "categoryId",
        accent, 
        accent_id AS "accentId",
        image_url AS "imageUrl", 
        points, 
        points_id AS "pointsId",
        display_order AS "displayOrder"
      FROM services
      WHERE active = TRUE
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' AND category = $1';
      params.push(category);
    }
    query += ' ORDER BY display_order';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get a single service by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        id, 
        title, 
        title_id AS "titleId",
        description, 
        description_id AS "descriptionId",
        category, 
        category_id AS "categoryId",
        accent, 
        accent_id AS "accentId",
        image_url AS "imageUrl", 
        points, 
        points_id AS "pointsId",
        display_order AS "displayOrder"
      FROM services 
      WHERE id = $1 AND active = TRUE`,
      [id]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Service not found' });
    }
  } catch (error) {
    console.error('Failed to fetch service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

export default router;

