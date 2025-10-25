import crypto from "crypto";
import { z } from "zod";
import { pool } from "../db.js";
import { AppError, ValidationError, ConflictError, InternalError } from "../errors.js";
import { insertReceipt, listReceipts as repoListReceipts, insertReward, getTotalPoints as repoGetTotalPoints } from "../repositories/receipts.repo.js";

const ReceiptInputSchema = z.object({
  user_id: z.string().uuid(),
  merchant_name: z.string().trim().min(1).max(200).optional().nullable(),
  total_cents: z.number().int().positive(),
  currency: z.string().trim().length(3).default("NOK"),
  purchased_at: z.union([z.string().datetime(), z.date()]).optional(),
});

function normalizeDate(input) {
  if (!input) return new Date();
  if (input instanceof Date) return input;
  const d = new Date(input);
  if (isNaN(d.getTime())) throw new ValidationError("purchased_at is not a valid date");
  return d;
}

function computeDedupeHash({ user_id, merchant_name, total_cents, purchased_at }) {
  const dateOnly = purchased_at.toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${user_id}|${merchant_name || ""}|${total_cents}|${dateOnly}`).digest("hex");
}

function computePoints(total_cents) {
  return Math.max(1, Math.round(total_cents / 100)); // v0: 1 point per NOK
}

export async function createReceiptAndReward(input) {
  const parsed = ReceiptInputSchema.safeParse({
    ...input,
    total_cents: typeof input.total_cents === "string" ? Number.parseInt(input.total_cents, 10) : input.total_cents,
  });
  if (!parsed.success) {
    const msg = parsed.error.issues?.[0]?.message || "Invalid payload";
    throw new ValidationError(msg);
  }

  const data = parsed.data;
  const purchasedAt = normalizeDate(data.purchased_at);
  const dedupe_hash = computeDedupeHash({
    user_id: data.user_id,
    merchant_name: data.merchant_name || null,
    total_cents: data.total_cents,
    purchased_at: purchasedAt,
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const receiptRes = await insertReceipt(client, {
      user_id: data.user_id,
      merchant_name: data.merchant_name || null,
      total_cents: data.total_cents,
      currency: data.currency || "NOK",
      purchased_at: purchasedAt.toISOString(),
      dedupe_hash,
    });

    if (receiptRes.rowCount === 0) {
      throw new ConflictError("Duplicate receipt detected (already saved)");
    }

    const receipt = receiptRes.rows[0];

    const points = computePoints(receipt.total_cents);
    const rewardRes = await insertReward(client, {
      user_id: receipt.user_id,
      receipt_id: receipt.id,
      points,
    });
    const reward = rewardRes.rows[0];

    await client.query("COMMIT");
    return { receipt, reward };
  } catch (err) {
    await client.query("ROLLBACK");

    if (err instanceof AppError) throw err;
    if (String(err.code) === "23505" || String(err.message || "").includes("duplicate key")) {
      throw new ConflictError("Duplicate receipt detected (already saved)");
    }

    console.error("createReceiptAndReward error:", err);
    throw new InternalError("Failed to create receipt");
  } finally {
    client.release();
  }
}

export async function listReceipts(limit = 100) {
  return repoListReceipts(limit);
}

export async function getTotalPoints(user_id) {
  try {
    z.string().uuid().parse(user_id);
  } catch {
    throw new ValidationError("user_id must be a UUID");
  }
  return repoGetTotalPoints(user_id);
}
