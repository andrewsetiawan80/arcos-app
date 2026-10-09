import { Router, Request, Response } from "express";
import pool from "../db/client";
import { randomBytes } from "crypto";

const router = Router();

function newId(prefix = "mp") {
  return `${prefix}_${randomBytes(4).toString("hex")}`;
}

function rowProject(r: any) {
  return {
    id: r.id,
    title: r.title,
    clientId: r.client_id || null,
    clientName: r.client_name || null,
    status: r.status || "trial",
    mixRecipeId: r.mix_recipe_id || null,
    baseRecipeId: r.base_recipe_id || null,
    quoteId: r.quote_id || null,
    notes: r.notes || "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowBatch(r: any) {
  return {
    id: r.id,
    projectId: r.project_id || null,
    recipeId: r.recipe_id || "",
    recipeName: r.recipe_name || "Untitled",
    dryWeight: Number(r.dry_weight) || 0,
    weighedBy: r.weighed_by || "—",
    source: r.source || "staff",
    at: r.at,
    createdAt: r.created_at,
  };
}

/** GET / — list projects (newest first). ?status=trial & ?quoteId= */
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : "";
    const quoteId = typeof req.query.quoteId === "string" ? req.query.quoteId : "";
    let result;
    if (quoteId && status) {
      result = await pool.query(
        `SELECT * FROM mix_projects WHERE quote_id = $1 AND status = $2 ORDER BY updated_at DESC`,
        [quoteId, status]
      );
    } else if (quoteId) {
      result = await pool.query(
        `SELECT * FROM mix_projects WHERE quote_id = $1 ORDER BY updated_at DESC`,
        [quoteId]
      );
    } else if (status) {
      result = await pool.query(
        `SELECT * FROM mix_projects WHERE status = $1 ORDER BY updated_at DESC`,
        [status]
      );
    } else {
      result = await pool.query(`SELECT * FROM mix_projects ORDER BY updated_at DESC`);
    }
    res.json(result.rows.map(rowProject));
  } catch (e: any) {
    console.error("mix-projects list", e);
    res.status(500).json({ error: e.message || "failed" });
  }
});

/** GET /:id */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM mix_projects WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: "not found" });
    const batches = await pool.query(
      `SELECT * FROM mix_batches WHERE project_id = $1 ORDER BY at DESC`,
      [req.params.id]
    );
    res.json({ ...rowProject(result.rows[0]), batches: batches.rows.map(rowBatch) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "failed" });
  }
});

/** POST / — create or upsert project */
router.post("/", async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const id = String(b.id || newId("mp")).slice(0, 50);
    const title = String(b.title || "").trim();
    if (!title) return res.status(400).json({ error: "title required" });
    const status = ["trial", "active", "done", "cancelled"].includes(b.status)
      ? b.status
      : "trial";

    await pool.query(
      `INSERT INTO mix_projects
         (id, title, client_id, client_name, status, mix_recipe_id, base_recipe_id, quote_id, notes, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10::timestamp, NOW()), NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         client_id = EXCLUDED.client_id,
         client_name = EXCLUDED.client_name,
         status = EXCLUDED.status,
         mix_recipe_id = EXCLUDED.mix_recipe_id,
         base_recipe_id = EXCLUDED.base_recipe_id,
         quote_id = COALESCE(EXCLUDED.quote_id, mix_projects.quote_id),
         notes = EXCLUDED.notes,
         updated_at = NOW()`,
      [
        id,
        title,
        b.clientId || null,
        b.clientName || null,
        status,
        b.mixRecipeId || null,
        b.baseRecipeId || null,
        b.quoteId || null,
        b.notes || "",
        b.createdAt || null,
      ]
    );
    const result = await pool.query(`SELECT * FROM mix_projects WHERE id = $1`, [id]);
    res.json(rowProject(result.rows[0]));
  } catch (e: any) {
    console.error("mix-projects save", e);
    res.status(500).json({ error: e.message || "failed" });
  }
});

/** DELETE /:id */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query(`UPDATE mix_batches SET project_id = NULL WHERE project_id = $1`, [req.params.id]);
    await pool.query(`DELETE FROM mix_projects WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "failed" });
  }
});

export default router;

/** Separate router for batches / mix-log compatibility */
export const mixBatchesRouter = Router();

mixBatchesRouter.get("/", async (req: Request, res: Response) => {
  try {
    const projectId = typeof req.query.projectId === "string" ? req.query.projectId : "";
    const result = projectId
      ? await pool.query(
          `SELECT * FROM mix_batches WHERE project_id = $1 ORDER BY at DESC LIMIT 500`,
          [projectId]
        )
      : await pool.query(`SELECT * FROM mix_batches ORDER BY at DESC LIMIT 500`);
    res.json(result.rows.map(rowBatch));
  } catch (e: any) {
    res.status(500).json({ error: e.message || "failed" });
  }
});

mixBatchesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const b = req.body || {};
    const id = String(b.id || newId("mb")).slice(0, 50);
    const at = b.at ? new Date(b.at) : new Date();
    await pool.query(
      `INSERT INTO mix_batches
         (id, project_id, recipe_id, recipe_name, dry_weight, weighed_by, source, at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         project_id = EXCLUDED.project_id,
         recipe_id = EXCLUDED.recipe_id,
         recipe_name = EXCLUDED.recipe_name,
         dry_weight = EXCLUDED.dry_weight,
         weighed_by = EXCLUDED.weighed_by,
         source = EXCLUDED.source,
         at = EXCLUDED.at`,
      [
        id,
        b.projectId || null,
        String(b.recipeId || ""),
        String(b.recipeName || "Untitled"),
        Number(b.dryWeight) || 0,
        String(b.weighedBy || "").trim() || "—",
        String(b.source || "staff"),
        at,
      ]
    );
    // Touch project updated_at
    if (b.projectId) {
      await pool.query(`UPDATE mix_projects SET updated_at = NOW() WHERE id = $1`, [b.projectId]);
    }
    const result = await pool.query(`SELECT * FROM mix_batches WHERE id = $1`, [id]);
    res.json({ ok: true, entry: rowBatch(result.rows[0]) });
  } catch (e: any) {
    console.error("mix-batches save", e);
    res.status(500).json({ error: e.message || "failed" });
  }
});
