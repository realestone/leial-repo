import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Seeding…");
    await client.query("BEGIN");

    // Create a demo customer user
    const { rows: [user] } = await client.query(
      `INSERT INTO users (role, display_name, email)
       VALUES ('customer', 'Demo User', 'demo@leial.local')
       ON CONFLICT (email) DO UPDATE SET display_name='Demo User'
       RETURNING id, email`
    );

    // Insert two receipts for that user
    const r1 = await client.query(
      `INSERT INTO receipts (user_id, merchant_name, total_cents, currency, purchased_at, dedupe_hash)
       VALUES ($1,$2,$3,'NOK', NOW() - INTERVAL '2 days', md5($1||$2||$3||date_trunc('day', NOW()-INTERVAL '2 days')::text))
       ON CONFLICT (dedupe_hash) DO NOTHING
       RETURNING id, total_cents`,
      [user.id, "Cafe Java", 12900]
    );

    const r2 = await client.query(
      `INSERT INTO receipts (user_id, merchant_name, total_cents, currency, purchased_at, dedupe_hash)
       VALUES ($1,$2,$3,'NOK', NOW() - INTERVAL '1 days', md5($1||$2||$3||date_trunc('day', NOW()-INTERVAL '1 days')::text))
       ON CONFLICT (dedupe_hash) DO NOTHING
       RETURNING id, total_cents`,
      [user.id, "SuperMart", 45900]
    );

    // Backfill rewards for inserted receipts (simple rule: cents/100 rounded)
    const inserted = [r1.rows[0], r2.rows[0]].filter(Boolean);
    for (const rec of inserted) {
      const points = Math.round(rec.total_cents / 100);
      await client.query(
        `INSERT INTO rewards (user_id, receipt_id, points)
         VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [user.id, rec.id, points]
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded user ${user.email} (${user.id}) with ${inserted.length} receipts.`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
