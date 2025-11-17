import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import pool from '../db/client';

const router = Router();

// Public endpoint for public products (no auth required)
router.get('/public/products', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             COALESCE(json_agg(pv.*) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.public = true
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    const variantsByProduct = result.rows.reduce((acc: Record<string, any[]>, row: any) => {
      if (!acc[row.id]) acc[row.id] = [];
      acc[row.id].push(...row.variants);
      return acc;
    }, {});
    
    const products = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      categorySlug: row.category_slug,
      public: row.public,
      featured: row.featured,
      coverImageUrl: row.cover_image_url,
      variants: variantsByProduct[row.id] || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Get public products error:', error);
    res.status(500).json({ error: 'Failed to fetch public products' });
  }
});

// Public endpoint for site settings (no auth required)
router.get('/public/settings', async (req: Request, res: Response) => {
  try {
    // Get settings from first user (assuming single-tenant for now)
    const result = await pool.query('SELECT settings FROM settings LIMIT 1');
    const settings = result.rows[0]?.settings || {};
    res.json(settings);
  } catch (error) {
    console.error('Get public settings error:', error);
    res.json({ site: {}, units: 'metric', defaultSparePct: 7 });
  }
});

// All other routes require authentication
router.use(authenticateToken);

// Helper to transform snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Get all app state (for initial load)
router.get('/state', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Fetch all data for the user
    const [materials, recipes, products, categories, labEntries, proposals, pages, settings] = await Promise.all([
      pool.query('SELECT * FROM materials WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM recipes WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM products WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM categories WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM lab_entries WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM proposals WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM pages WHERE user_id = $1', [userId]),
      pool.query('SELECT settings FROM settings WHERE user_id = $1', [userId]),
    ]);

    // Get recipe lines for user's recipes
    const recipeIds = recipes.rows.map(r => r.id);
    const recipeLines = recipeIds.length > 0 
      ? await pool.query('SELECT * FROM recipe_lines WHERE recipe_id = ANY($1)', [recipeIds])
      : { rows: [] };

    // Get product variants and recipes for user's products
    const productIds = products.rows.map(p => p.id);
    const [variants, productRecipes] = productIds.length > 0
      ? await Promise.all([
          pool.query('SELECT * FROM product_variants WHERE product_id = ANY($1)', [productIds]),
          pool.query('SELECT * FROM product_recipes WHERE product_id = ANY($1)', [productIds]),
        ])
      : [{ rows: [] }, { rows: [] }];

    // Transform data to match frontend AppState format
    const recipeLinesByRecipe = recipeLines.rows.reduce((acc, line) => {
      if (!acc[line.recipe_id]) acc[line.recipe_id] = [];
      acc[line.recipe_id].push({
        id: line.id,
        materialId: line.material_id,
        amount: line.amount ? parseFloat(line.amount) : undefined,
        unit: line.unit,
      });
      return acc;
    }, {} as Record<string, any[]>);

    const recipesWithLines = recipes.rows.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      process: recipe.process,
      version: recipe.version,
      densityKgM3: recipe.density_kg_m3 ? parseFloat(recipe.density_kg_m3) : undefined,
      lines: recipeLinesByRecipe[recipe.id] || [],
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
    }));

    const variantsByProduct = variants.rows.reduce((acc: Record<string, any[]>, variant: any) => {
      if (!acc[variant.product_id]) acc[variant.product_id] = [];
      acc[variant.product_id].push({
        id: variant.id,
        name: variant.name,
        color: variant.color,
        recipeByProcess: {}, // Will be populated from product_recipes
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Map product recipes to variants
    productRecipes.rows.forEach((pr: any) => {
      const variantList = variantsByProduct[pr.product_id] || [];
      variantList.forEach((v: any) => {
        if (v.id === pr.variant_id) {
          if (!v.recipeByProcess) v.recipeByProcess = {};
          v.recipeByProcess[pr.process] = pr.recipe_id;
        }
      });
    });

    const productsWithVariants = products.rows.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      categorySlug: product.category_slug,
      public: product.public,
      featured: product.featured,
      coverImageUrl: product.cover_image_url,
      variants: variantsByProduct[product.id] || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json({
      materials: materials.rows.map(m => ({
        id: m.id,
        name: m.name,
        densityKgM3: m.density_kg_m3 ? parseFloat(m.density_kg_m3) : undefined,
        pricePerKg: m.price_per_kg ? parseFloat(m.price_per_kg) : undefined,
        priceCurrency: m.price_currency,
      })),
      recipes: recipesWithLines,
      productRecipes: productRecipes.rows.map(pr => ({
        id: pr.id,
        productId: pr.product_id,
        variantId: pr.variant_id,
        process: pr.process,
        recipeId: pr.recipe_id,
      })),
      products: productsWithVariants,
      categories: categories.rows.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
      })),
      labEntries: labEntries.rows.map(le => ({
        id: le.id,
        title: le.title,
        status: le.status,
        notes: le.notes,
        baseRecipeId: le.base_recipe_id,
        createdAt: le.created_at,
        updatedAt: le.updated_at,
      })),
      proposals: proposals.rows.map(p => ({
        id: p.id,
        title: p.title,
        client: p.client,
        status: p.status,
        total: p.total ? parseFloat(p.total) : undefined,
        currency: p.currency,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      pages: pages.rows.map(p => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        content: p.content,
        status: p.status,
        coverImageUrl: p.cover_image_url,
        tags: p.tags || [],
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      settings: {
        ...(settings.rows[0]?.settings || {}),
        site: {},
      },
      siteConfig: {},
      batches: [], // Empty for now
    });
  } catch (error) {
    console.error('Get state error:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Save entire app state (for sync)
router.post('/state', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const state = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Save materials
      if (state.materials) {
        for (const material of state.materials) {
          await client.query(
            `INSERT INTO materials (id, user_id, name, density_kg_m3, price_per_kg, price_currency)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET
               name = $3,
               density_kg_m3 = $4,
               price_per_kg = $5,
               price_currency = $6,
               updated_at = CURRENT_TIMESTAMP`,
            [material.id, userId, material.name, material.densityKgM3, material.pricePerKg, material.priceCurrency]
          );
        }
      }

      // Save recipes
      if (state.recipes) {
        for (const recipe of state.recipes) {
          await client.query(
            `INSERT INTO recipes (id, user_id, name, process, version, density_kg_m3, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamp, CURRENT_TIMESTAMP), COALESCE($8::timestamp, CURRENT_TIMESTAMP))
             ON CONFLICT (id) DO UPDATE SET
               name = $3,
               process = $4,
               version = $5,
               density_kg_m3 = $6,
               updated_at = CURRENT_TIMESTAMP`,
            [recipe.id, userId, recipe.name, recipe.process, recipe.version, recipe.densityKgM3, recipe.createdAt, recipe.updatedAt]
          );

          // Delete old recipe lines
          await client.query('DELETE FROM recipe_lines WHERE recipe_id = $1', [recipe.id]);

          // Insert new recipe lines
          if (recipe.lines) {
            for (const line of recipe.lines) {
              await client.query(
                `INSERT INTO recipe_lines (id, recipe_id, material_id, amount, unit)
                 VALUES ($1, $2, $3, $4, $5)`,
                [line.id || `${recipe.id}-${line.materialId}`, recipe.id, line.materialId, line.amount, line.unit]
              );
            }
          }
        }
      }

      // Save products
      if (state.products) {
        for (const product of state.products) {
          await client.query(
            `INSERT INTO products (id, user_id, name, slug, description, category_slug, public, featured, cover_image_url, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, COALESCE($10::timestamp, CURRENT_TIMESTAMP), COALESCE($11::timestamp, CURRENT_TIMESTAMP))
             ON CONFLICT (id) DO UPDATE SET
               name = $3,
               slug = $4,
               description = $5,
               category_slug = $6,
               public = $7,
               featured = $8,
               cover_image_url = $9,
               updated_at = CURRENT_TIMESTAMP`,
            [product.id, userId, product.name, product.slug, product.description, product.categorySlug, product.public, product.featured, product.coverImageUrl, product.createdAt, product.updatedAt]
          );

          // Delete old variants and product recipes
          await client.query('DELETE FROM product_variants WHERE product_id = $1', [product.id]);
          await client.query('DELETE FROM product_recipes WHERE product_id = $1', [product.id]);

          // Insert variants
          if (product.variants) {
            for (const variant of product.variants) {
              await client.query(
                `INSERT INTO product_variants (id, product_id, name, color, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [variant.id || `${product.id}-${variant.name}`, product.id, variant.name, variant.color]
              );

              // Insert product recipes
              if (variant.recipeByProcess) {
                for (const [process, recipeId] of Object.entries(variant.recipeByProcess)) {
                  await client.query(
                    `INSERT INTO product_recipes (id, product_id, variant_id, process, recipe_id)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [`${variant.id}-${process}`, product.id, variant.id, process, recipeId]
                  );
                }
              }
            }
          }
        }
      }

      // Save categories
      if (state.categories) {
        for (const category of state.categories) {
          await client.query(
            `INSERT INTO categories (id, user_id, name, slug, description, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamp, CURRENT_TIMESTAMP), COALESCE($7::timestamp, CURRENT_TIMESTAMP))
             ON CONFLICT (id) DO UPDATE SET
               name = $3,
               slug = $4,
               description = $5,
               updated_at = CURRENT_TIMESTAMP`,
            [category.id, userId, category.name, category.slug, category.description, category.createdAt, category.updatedAt]
          );
        }
      }

      // Save settings
      if (state.settings) {
        await client.query(
          `INSERT INTO settings (user_id, settings, updated_at)
           VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id) DO UPDATE SET
             settings = $2::jsonb,
             updated_at = CURRENT_TIMESTAMP`,
          [userId, JSON.stringify(state.settings)]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Save state error:', error);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

export default router;