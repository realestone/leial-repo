import { Router } from "express";
import { createReceiptAndReward, listReceipts, getTotalPoints } from "../services/receipts.service.js";
import { AppError } from "../errors.js";

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateReceipt:
 *       type: object
 *       required: [user_id, total_cents]
 *       properties:
 *         user_id: { type: string, format: uuid }
 *         merchant_name: { type: string }
 *         total_cents: { type: integer, minimum: 0 }
 *         currency: { type: string, default: NOK }
 *         purchased_at: { type: string, format: date-time }
 */

/**
 * @openapi
 * /receipts:
 *   get:
 *     summary: List receipts (latest first)
 *     responses:
 *       200:
 *         description: Array of receipts with computed points
 *   post:
 *     summary: Create receipt (and reward)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReceipt'
 *     responses:
 *       201: { description: Created (receipt + reward) }
 *       409: { description: Duplicate receipt (dedupe conflict) }
 */


/**
 * @openapi
 * /receipts/rewards/{userId}/total:
 *   get:
 *     summary: Total points for a user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Total points
 */


const router = Router();


router.post("/", async (req, res) => {   
  try {
    const result = await createReceiptAndReward(req.body);
    res.status(201).json(result); // { receipt, reward }
  } catch (err) {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.get("/", async (_req, res) => {
  const rows = await listReceipts(100);
  res.json(rows);
});

// total points for a given user
router.get("/rewards/:userId/total", async (req, res) => {
  try {
    const total_points = await getTotalPoints(req.params.userId);
    res.json({ total_points });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
