import { pool } from "../db.js";


export async function insertReceipt(client, { user_id, merchant_name, total_cents, currency, purchased_at, dedupe_hash }) {
  const sql = `
    INSERT INTO receipts (user_id, merchant_name, total_cents, currency, purchased_at, dedupe_hash)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (dedupe_hash) DO NOTHING
    RETURNING id, user_id, merchant_name, total_cents, currency, purchased_at, created_at
  `;
  const vals = [user_id, merchant_name || null, total_cents, currency, purchased_at, dedupe_hash];
  return client.query(sql, vals);
}

export async function listReceipts(limit = 100) {
  const { rows } = await pool.query(
      `
    SELECT
      id,
      user_id,
      merchant_name,
      total_cents,
      currency,
      purchased_at,
      created_at,
      -- 1 point per NOK (cents/100), integer
      ROUND(total_cents / 100.0)::int AS points
    FROM receipts
    ORDER BY created_at DESC
    LIMIT $1
    `,
    [Math.max(1, Math.min(limit, 500))]
  );
  return rows;
}


export async function insertReward(client, { user_id, receipt_id, points }) {
  const sql = `
    INSERT INTO rewards (user_id, receipt_id, points)
    VALUES ($1,$2,$3)
    RETURNING id, user_id, receipt_id, points, created_at
  `;
  return client.query(sql, [user_id, receipt_id, points]);
}

export async function getTotalPoints(user_id) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(points),0) AS total FROM rewards WHERE user_id = $1`,
    [user_id]
  );
  return Number(rows[0].total);
}
