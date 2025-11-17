import { Router } from 'express';
import pool from '../db/client';

const router = Router();

// Get all milestones
router.get('/milestones', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        year, 
        headline, 
        headline_id AS "headlineId",
        detail, 
        detail_id AS "detailId",
        display_order AS "displayOrder"
      FROM about_milestones 
      ORDER BY display_order`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch milestones:', error);
    res.status(500).json({ error: 'Failed to fetch milestones' });
  }
});

// Get all highlights
router.get('/highlights', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        title, 
        title_id AS "titleId",
        detail, 
        detail_id AS "detailId",
        display_order AS "displayOrder"
      FROM about_highlights 
      ORDER BY display_order`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch highlights:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
});

export default router;

