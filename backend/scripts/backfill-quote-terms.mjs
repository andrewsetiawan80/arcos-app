import pg from "pg";

const terms = `1. Prices in IDR. PPN charged as stated.
2. Quote valid for 14 days from the date above unless otherwise noted.
3. Production lead time depends on quantity and current shop schedule.
4. 50% deposit to confirm order; balance before delivery / installation.
5. Custom pieces are made to order; deposit is non-refundable once production starts.
6. Colour and texture may vary slightly due to natural materials.`;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const r = await pool.query(
  `UPDATE quotes
   SET terms = CASE
         WHEN terms IS NULL OR TRIM(terms) = '' THEN $1
         ELSE terms
       END,
       ppn_pct = COALESCE(ppn_pct, 11),
       total = ROUND(
         (SELECT COALESCE(SUM(qty * unit_price), 0) FROM quote_items WHERE quote_id = quotes.id)
         * (1 + COALESCE(ppn_pct, 11) / 100.0),
         2
       )
   RETURNING id, title, total, ppn_pct, LEFT(terms, 40) AS terms_preview`,
  [terms],
);

console.log(JSON.stringify(r.rows, null, 2));
await pool.end();
