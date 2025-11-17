import express, { Request, Response } from 'express';
import pool from '../db/client';

const router = express.Router();

// Get all active featured projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        title,
        title_id as "titleId",
        category,
        category_id as "categoryId",
        image_url as "imageUrl",
        display_order as "displayOrder"
      FROM featured_projects
      WHERE active = true
      ORDER BY display_order ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get featured projects error:', error);
    res.status(500).json({ error: 'Failed to fetch featured projects' });
  }
});

export default router;

