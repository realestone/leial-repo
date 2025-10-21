import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (_req, res) => {
  const { rows } = await pool.query("SELECT NOW() AS now");
  res.json({ ok: true, now: rows[0].now });
});

app.get("/receipts", async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT id, merchant_name, total_cents, currency, purchased_at
     FROM receipts
     ORDER BY created_at DESC
     LIMIT 100`
  );
  res.json(rows);
});

app.post("/receipts", async (req, res) => {
  const { user_id, merchant_name, total_cents, currency = "NOK", purchased_at } = req.body;
  if (!user_id || !total_cents) {
    return res.status(400).json({ error: "user_id and total_cents are required" });
  }

  const { rows } = await pool.query(
    `INSERT INTO receipts (user_id, merchant_name, total_cents, currency, purchased_at)
     VALUES ($1,$2,$3,$4,COALESCE($5, NOW()))
     RETURNING id, merchant_name, total_cents, currency, purchased_at`,
    [user_id, merchant_name || null, total_cents, currency, purchased_at || null]
  );
  res.status(201).json(rows[0]);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ API on http://localhost:${PORT}`));
