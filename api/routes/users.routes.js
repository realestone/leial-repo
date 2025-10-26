import { Router } from "express";
import { AppError } from "../errors.js";
import {
  createUserFlow, getUserById, listUsersWithMeta, updateUser, softDeleteUser
} from "../services/users.service.js";

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users (paginated)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search display_name or email (contains, case-insensitive)
 *     responses:
 *       200:
 *         description: Paginated list of users
 *   post:
 *     summary: Create user (customer or merchant)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: Created
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid }
 *         role: { type: string, enum: [customer, merchant] }
 *         display_name: { type: string, nullable: true }
 *         email: { type: string, nullable: true }
 *         device_key: { type: string, nullable: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time, nullable: true }
 *     CreateUser:
 *       type: object
 *       required: [role]
 *       properties:
 *         role: { type: string, enum: [customer, merchant] }
 *         display_name: { type: string }
 *         email: { type: string }
 *         merchant_name: { type: string, description: "Required when role=merchant" }
 *     UpdateUser:
 *       type: object
 *       properties:
 *         display_name: { type: string }
 *         email: { type: string, format: email }
 */


/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: User }
 *       404: { description: Not found }
 *   patch:
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200: { description: Updated user }
 *   delete:
 *     summary: Soft-delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Deleted }
 */


const router = Router();

router.post("/", async (req, res) => {
  try {
    const result = await createUserFlow(req.body);
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// GET /users?page=1&pageSize=20&q=lukas
router.get("/", async (req, res) => {
  const data = await listUsersWithMeta(req.query);
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const user = await getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.patch("/:id", async (req, res) => {
  try {
    const updated = await updateUser(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const ok = await softDeleteUser(req.params.id);
    res.json(ok); // { ok: true }
  } catch (err) {
    if (err instanceof AppError) return res.status(err.status).json({ error: err.message, code: err.code });
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
