import { Router } from "express";
import { createReceiptAndReward, listReceipts, getTotalPoints } from "../services/receipts.service.js";
import { AppError } from "../errors.js";

const router = Router();

router.post("/", async (req, res) => {
    console.log("POST /receipts payload:", req.body);
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
