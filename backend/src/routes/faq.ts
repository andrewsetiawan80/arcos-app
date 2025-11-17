import express, { Request, Response } from 'express';
import pool from '../db/client';

const router = express.Router();

// Get all FAQ categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, name_id as "nameId", display_order as "displayOrder"
       FROM faq_categories
       ORDER BY display_order ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ categories' });
  }
});

// Get FAQ items (optionally filtered by category)
router.get('/items', async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;

    let query = `
      SELECT 
        id,
        category_id as "categoryId",
        question,
        question_id as "questionId",
        answer,
        answer_id as "answerId",
        display_order as "displayOrder"
      FROM faq_items
    `;

    const params: any[] = [];
    if (categoryId) {
      query += ' WHERE category_id = $1';
      params.push(categoryId);
    }

    query += ' ORDER BY display_order ASC';

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get FAQ items error:', error);
    res.status(500).json({ error: 'Failed to fetch FAQ items' });
  }
});

export default router;

