import { describe, it, expect, beforeAll } from "vitest";
import { pool } from "../db.js";
import { createReceiptAndReward, getTotalPoints } from "../services/receipts.service.js";

const userId = "21d2074a-561d-4a15-a75c-215de6abd5a4"; // use a valid UUID v4

beforeAll(async () => {
  await pool.query(`INSERT INTO users (id,email) VALUES ($1,$2) ON CONFLICT (id) DO NOTHING`, [userId, "test@leial.local"]);
});

describe("createReceiptAndReward", () => {
  it("creates receipt + reward", async () => {
    const { receipt, reward } = await createReceiptAndReward({
      user_id: userId,
      merchant_name: "Test Cafe",
      total_cents: 12300
    });
    expect(receipt.id).toBeTruthy();
    expect(reward.points).toBe(123);
  });

  it("prevents duplicate (same day + merchant + total)", async () => {
    const call = () => createReceiptAndReward({
      user_id: userId, merchant_name: "Test Cafe", total_cents: 12300
    });
    await expect(call()).rejects.toThrow(/duplicate/i);
  });

  it("sums total points", async () => {
    const total = await getTotalPoints(userId);
    expect(total).toBeGreaterThan(0);
  });
});
