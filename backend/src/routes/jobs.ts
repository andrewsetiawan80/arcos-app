import { Router, Response } from "express";
import crypto from "crypto";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import pool from "../db/client";
import { calcLineEconomics, calcUnitSellPrice, combinedUnitCost, defaultUnitForKind, num } from "../lib/jobPricing";
import { fireWebhook } from "./webhooks";
import { createNotification } from "./notifications";

const router = Router();
router.use(authenticateToken);
router.use(requireRole("admin", "sales"));

const DEFAULT_PPN = 11;

function parseCastMeta(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, unknown>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      /* ignore */
    }
  }
  return null;
}

function normalizeItem(row: any) {
  const eco = calcLineEconomics({
    ...row,
    material_cost: row.material_cost != null ? row.material_cost : row.unit_cost,
    labour_cost: row.labour_cost,
  });
  return {
    id: row.id,
    job_id: row.job_id,
    description: row.description || "",
    kind: row.kind || "piece",
    qty: eco.qty,
    unit: row.unit || defaultUnitForKind(row.kind || "piece"),
    material_cost: eco.materialCost,
    labour_complexity: row.labour_complexity || "none",
    labour_hours: num(row.labour_hours),
    labour_cost: eco.labourCost,
    unit_cost: eco.unitCost,
    waste_pct: eco.wastePct,
    overhead_pct: eco.overheadPct,
    markup_pct: eco.markupPct,
    unit_price: eco.unitPrice,
    price_override: Boolean(row.price_override),
    notes: row.notes || "",
    display_order: num(row.display_order),
    mix_recipe_id: row.mix_recipe_id || null,
    mix_dry_kg: row.mix_dry_kg == null ? null : num(row.mix_dry_kg),
    cast_meta: parseCastMeta(row.cast_meta),
    cost_per_unit: eco.costPerUnit,
    line_cost: eco.lineCost,
    line_sell: eco.lineSell,
    profit: eco.profit,
    margin_pct: eco.marginPct,
    created_at: row.created_at,
  };
}

function normalizeJob(row: any, items: any[] = []) {
  const normalizedItems = (items || []).map(normalizeItem);
  const costTotal = normalizedItems.reduce((s, i) => s + i.line_cost, 0);
  const sellTotal = normalizedItems.reduce((s, i) => s + i.line_sell, 0);
  const profit = sellTotal - costTotal;
  return {
    id: row.id,
    title: row.title,
    client_id: row.client_id || null,
    client_name: row.client_name || null,
    client_company: row.client_company || null,
    status: row.status || "draft",
    notes: row.notes || "",
    quote_id: row.quote_id || null,
    default_waste_pct: num(row.default_waste_pct, 3),
    default_overhead_pct: num(row.default_overhead_pct, 10),
    default_markup_pct: num(row.default_markup_pct, 40),
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: normalizedItems,
    cost_total: costTotal,
    sell_total: sellTotal,
    profit,
    margin_pct: sellTotal > 0 ? (profit / sellTotal) * 100 : 0,
  };
}

async function fetchJob(id: string) {
  const result = await pool.query(
    `SELECT j.*, c.name as client_name, c.company as client_company
     FROM jobs j LEFT JOIN clients c ON j.client_id = c.id WHERE j.id=$1`,
    [id],
  );
  if (!result.rows.length) return null;
  const items = await pool.query(
    `SELECT * FROM job_items WHERE job_id=$1 ORDER BY display_order, created_at`,
    [id],
  );
  return normalizeJob(result.rows[0], items.rows);
}

function prepareItemRow(
  it: any,
  jobDefaults: { waste: number; overhead: number; markup: number },
  idx: number,
) {
  const kind = ["piece", "area", "manual"].includes(it.kind) ? it.kind : "piece";
  const waste = it.waste_pct == null ? jobDefaults.waste : Math.max(0, num(it.waste_pct));
  const overhead = it.overhead_pct == null ? jobDefaults.overhead : Math.max(0, num(it.overhead_pct));
  const markup = it.markup_pct == null ? jobDefaults.markup : Math.max(0, num(it.markup_pct));
  const materialCost =
    it.material_cost != null && it.material_cost !== ""
      ? Math.max(0, num(it.material_cost))
      : Math.max(0, num(it.unit_cost));
  const labourCost = Math.max(0, num(it.labour_cost));
  const labourHours = Math.max(0, num(it.labour_hours));
  const unitCost = combinedUnitCost(materialCost, labourCost);
  const complexity = ["none", "simple", "medium", "complex", "custom"].includes(it.labour_complexity)
    ? it.labour_complexity
    : "none";
  const priceOverride = Boolean(it.price_override) || kind === "manual";
  const computed = calcUnitSellPrice(unitCost, waste, overhead, markup);
  const unitPrice = priceOverride ? Math.max(0, num(it.unit_price, computed)) : computed;
  let castMeta: Record<string, unknown> | null = null;
  if (it.cast_meta != null) {
    if (typeof it.cast_meta === "string") {
      try {
        castMeta = JSON.parse(it.cast_meta);
      } catch {
        castMeta = null;
      }
    } else if (typeof it.cast_meta === "object") {
      castMeta = it.cast_meta;
    }
  }
  return {
    description: String(it.description || "").trim() || "Untitled item",
    kind,
    qty: Math.max(0, num(it.qty, 1)),
    unit: (it.unit || defaultUnitForKind(kind)).trim() || defaultUnitForKind(kind),
    material_cost: materialCost,
    labour_complexity: complexity,
    labour_hours: labourHours,
    labour_cost: labourCost,
    unit_cost: unitCost,
    waste_pct: waste,
    overhead_pct: overhead,
    markup_pct: markup,
    unit_price: unitPrice,
    price_override: priceOverride,
    notes: it.notes != null ? String(it.notes) : null,
    display_order: idx,
    mix_recipe_id: it.mix_recipe_id ? String(it.mix_recipe_id) : null,
    mix_dry_kg: it.mix_dry_kg == null || it.mix_dry_kg === "" ? null : Math.max(0, num(it.mix_dry_kg)),
    cast_meta: castMeta,
  };
}

const ITEM_INSERT = `INSERT INTO job_items
  (id, job_id, description, kind, qty, unit, material_cost, labour_complexity, labour_hours, labour_cost, unit_cost,
   waste_pct, overhead_pct, markup_pct, unit_price, price_override, notes, display_order,
   mix_recipe_id, mix_dry_kg, cast_meta)
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`;

function itemInsertParams(jobId: string, row: ReturnType<typeof prepareItemRow>) {
  return [
    crypto.randomUUID(),
    jobId,
    row.description,
    row.kind,
    row.qty,
    row.unit,
    row.material_cost,
    row.labour_complexity,
    row.labour_hours,
    row.labour_cost,
    row.unit_cost,
    row.waste_pct,
    row.overhead_pct,
    row.markup_pct,
    row.unit_price,
    row.price_override,
    row.notes,
    row.display_order,
    row.mix_recipe_id,
    row.mix_dry_kg,
    row.cast_meta ? JSON.stringify(row.cast_meta) : null,
  ];
}

// GET /api/jobs/labour-presets
router.get("/labour-presets", async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, scope, complexity, label, amount_idr, hourly_rate_idr, sort_order, updated_at
       FROM job_labour_presets ORDER BY scope, sort_order, complexity`,
    );
    res.json(
      result.rows.map((r) => ({
        ...r,
        amount_idr: r.amount_idr == null ? null : num(r.amount_idr),
        hourly_rate_idr: r.hourly_rate_idr == null ? null : num(r.hourly_rate_idr),
      })),
    );
  } catch (err) {
    console.error("Get labour presets error:", err);
    res.status(500).json({ error: "Failed to fetch labour presets" });
  }
});

// PUT /api/jobs/labour-presets — shop hourly rates + area Rp/m² (empty until filled)
router.put("/labour-presets", async (req: AuthRequest, res: Response) => {
  const rows = Array.isArray(req.body) ? req.body : req.body?.presets;
  if (!Array.isArray(rows)) return res.status(400).json({ error: "presets array required" });

  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    for (const row of rows) {
      if (!row?.id) continue;
      const existing = await db.query(
        `SELECT hourly_rate_idr, amount_idr, label FROM job_labour_presets WHERE id=$1`,
        [row.id],
      );
      if (!existing.rows[0]) continue;

      const hourly =
        row.hourly_rate_idr === undefined
          ? existing.rows[0].hourly_rate_idr
          : row.hourly_rate_idr === null || row.hourly_rate_idr === ""
            ? null
            : Math.max(0, num(row.hourly_rate_idr));
      const amount =
        row.amount_idr === undefined
          ? existing.rows[0].amount_idr
          : row.amount_idr === null || row.amount_idr === ""
            ? null
            : Math.max(0, num(row.amount_idr));
      const label = row.label != null ? String(row.label) : existing.rows[0].label;

      await db.query(
        `UPDATE job_labour_presets SET hourly_rate_idr=$1, amount_idr=$2, label=$3, updated_at=NOW() WHERE id=$4`,
        [hourly, amount, label, row.id],
      );
    }
    await db.query("COMMIT");
    const result = await pool.query(
      `SELECT id, scope, complexity, label, amount_idr, hourly_rate_idr, sort_order FROM job_labour_presets ORDER BY scope, sort_order`,
    );
    res.json(
      result.rows.map((r) => ({
        ...r,
        amount_idr: r.amount_idr == null ? null : num(r.amount_idr),
        hourly_rate_idr: r.hourly_rate_idr == null ? null : num(r.hourly_rate_idr),
      })),
    );
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Update labour presets error:", err);
    res.status(500).json({ error: "Failed to save labour presets" });
  } finally {
    db.release();
  }
});

// GET /api/jobs
router.get("/", async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name as client_name, c.company as client_company,
        (SELECT COALESCE(SUM(qi.qty * qi.unit_price), 0) FROM job_items qi WHERE qi.job_id = j.id) as sell_total,
        (SELECT COUNT(*)::int FROM job_items qi WHERE qi.job_id = j.id) as item_count
       FROM jobs j
       LEFT JOIN clients c ON j.client_id = c.id
       ORDER BY j.updated_at DESC NULLS LAST, j.created_at DESC`,
    );
    res.json(
      result.rows.map((r) => ({
        ...normalizeJob(r, []),
        sell_total: num(r.sell_total),
        item_count: num(r.item_count),
        items: undefined,
      })),
    );
  } catch (err) {
    console.error("Get jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const job = await fetchJob(req.params.id);
    if (!job) return res.status(404).json({ error: "Job not found" });
    res.json(job);
  } catch (err) {
    console.error("Get job error:", err);
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// POST /api/jobs
router.post("/", async (req: AuthRequest, res: Response) => {
  const { title, client_id, notes, items } = req.body;
  if (!title || !String(title).trim()) return res.status(400).json({ error: "title is required" });

  const defaults = {
    waste: req.body.default_waste_pct == null ? 3 : Math.max(0, num(req.body.default_waste_pct, 3)),
    overhead: req.body.default_overhead_pct == null ? 10 : Math.max(0, num(req.body.default_overhead_pct, 10)),
    markup: req.body.default_markup_pct == null ? 40 : Math.max(0, num(req.body.default_markup_pct, 40)),
  };

  const id = crypto.randomUUID();
  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    await db.query(
      `INSERT INTO jobs (id, title, client_id, status, notes, default_waste_pct, default_overhead_pct, default_markup_pct)
       VALUES ($1,$2,$3,'draft',$4,$5,$6,$7)`,
      [id, String(title).trim(), client_id || null, notes || null, defaults.waste, defaults.overhead, defaults.markup],
    );

    for (let idx = 0; idx < (items || []).length; idx++) {
      const row = prepareItemRow(items[idx], defaults, idx);
      await db.query(ITEM_INSERT, itemInsertParams(id, row));
    }

    await db.query("COMMIT");
    const job = await fetchJob(id);
    res.status(201).json(job);
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Create job error:", err);
    res.status(500).json({ error: "Failed to create job" });
  } finally {
    db.release();
  }
});

// PUT /api/jobs/:id
router.put("/:id", async (req: AuthRequest, res: Response) => {
  const { title, client_id, status, notes, items } = req.body;
  const defaults = {
    waste: req.body.default_waste_pct == null ? 3 : Math.max(0, num(req.body.default_waste_pct, 3)),
    overhead: req.body.default_overhead_pct == null ? 10 : Math.max(0, num(req.body.default_overhead_pct, 10)),
    markup: req.body.default_markup_pct == null ? 40 : Math.max(0, num(req.body.default_markup_pct, 40)),
  };

  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    const existing = await db.query("SELECT id FROM jobs WHERE id=$1", [req.params.id]);
    if (!existing.rows.length) {
      await db.query("ROLLBACK");
      return res.status(404).json({ error: "Job not found" });
    }

    await db.query(
      `UPDATE jobs SET
         title=COALESCE($1, title),
         client_id=$2,
         status=COALESCE($3, status),
         notes=$4,
         default_waste_pct=$5,
         default_overhead_pct=$6,
         default_markup_pct=$7,
         updated_at=NOW()
       WHERE id=$8`,
      [
        title != null ? String(title).trim() : null,
        client_id ?? null,
        status || null,
        notes ?? null,
        defaults.waste,
        defaults.overhead,
        defaults.markup,
        req.params.id,
      ],
    );

    if (Array.isArray(items)) {
      await db.query("DELETE FROM job_items WHERE job_id=$1", [req.params.id]);
      for (let idx = 0; idx < items.length; idx++) {
        const row = prepareItemRow(items[idx], defaults, idx);
        await db.query(ITEM_INSERT, itemInsertParams(req.params.id, row));
      }
    }

    await db.query("COMMIT");
    const job = await fetchJob(req.params.id);
    res.json(job);
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Update job error:", err);
    res.status(500).json({ error: "Failed to update job" });
  } finally {
    db.release();
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    await pool.query("DELETE FROM jobs WHERE id=$1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Delete job error:", err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

/** POST /api/jobs/:id/quote — create (or refresh draft) quote from priced job lines */
router.post("/:id/quote", async (req: AuthRequest, res: Response) => {
  const job = await fetchJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (!job.items.length) return res.status(400).json({ error: "Add at least one priced item before creating a quote" });

  const ppnPct = req.body.ppn_pct == null ? DEFAULT_PPN : Math.max(0, num(req.body.ppn_pct, DEFAULT_PPN));
  const replaceExisting = Boolean(req.body.replace);

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    let quoteId = job.quote_id;
    if (quoteId && !replaceExisting) {
      const q = await db.query("SELECT id, status FROM quotes WHERE id=$1", [quoteId]);
      if (q.rows[0] && q.rows[0].status !== "draft") {
        // Linked quote already sent — create a new quote
        quoteId = null;
      }
    }

    const subtotal = job.items.reduce((s, i) => s + i.line_sell, 0);
    const total = subtotal + (subtotal * ppnPct) / 100;

    if (!quoteId) {
      quoteId = crypto.randomUUID();
      const shareToken = crypto.randomBytes(16).toString("hex");
      await db.query(
        `INSERT INTO quotes (id, title, client_id, status, total, currency, share_token, notes, ppn_pct, terms, job_id)
         VALUES ($1,$2,$3,'draft',$4,'IDR',$5,$6,$7,$8,$9)`,
        [
          quoteId,
          job.title,
          job.client_id,
          total,
          shareToken,
          job.notes || null,
          ppnPct,
          null,
          job.id,
        ],
      );
    } else {
      await db.query(
        `UPDATE quotes SET title=$1, client_id=$2, total=$3, notes=$4, ppn_pct=$5, job_id=$6, updated_at=NOW()
         WHERE id=$7`,
        [job.title, job.client_id, total, job.notes || null, ppnPct, job.id, quoteId],
      );
      await db.query("DELETE FROM quote_items WHERE quote_id=$1", [quoteId]);
    }

    for (let idx = 0; idx < job.items.length; idx++) {
      const it = job.items[idx];
      await db.query(
        `INSERT INTO quote_items
         (id, quote_id, description, qty, unit, unit_price, display_order, unit_cost, markup_pct, job_item_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          crypto.randomUUID(),
          quoteId,
          it.description,
          it.qty,
          it.unit,
          it.unit_price,
          idx,
          it.cost_per_unit ?? it.unit_cost,
          it.markup_pct,
          it.id,
        ],
      );
    }

    await db.query(`UPDATE jobs SET quote_id=$1, status='quoted', updated_at=NOW() WHERE id=$2`, [
      quoteId,
      job.id,
    ]);

    await db.query("COMMIT");

    const quoteRow = await pool.query("SELECT * FROM quotes WHERE id=$1", [quoteId]);
    const itemRows = await pool.query(
      "SELECT * FROM quote_items WHERE quote_id=$1 ORDER BY display_order",
      [quoteId],
    );
    const quote = {
      ...quoteRow.rows[0],
      items: itemRows.rows,
      job_id: job.id,
    };
    fireWebhook("quote.created", quote).catch(() => {});
    createNotification("quote", `Quote from job: ${job.title}`, "", `/app/quotes/${quoteId}`).catch(() => {});

    res.status(201).json({ quote_id: quoteId, job_id: job.id, quote });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Create quote from job error:", err);
    res.status(500).json({ error: "Failed to create quote from job" });
  } finally {
    db.release();
  }
});

export default router;
