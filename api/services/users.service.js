import { z } from "zod";
import { pool } from "../db.js";
import { AppError, ValidationError } from "../errors.js";
import {
  insertUser, selectUserByIdRepo, listUsersRepo, countUsersRepo,
  insertMerchant, insertMerchantMember, updateUserRepo, softDeleteUserRepo
} from "../repositories/users.repo.js";

const CreateUserSchema = z.object({
  role: z.enum(["customer", "merchant"]),
  display_name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().optional(),
  merchant_name: z.string().trim().min(1).max(200).optional(),
  device_key: z.string().trim().min(8).max(200).optional()
});

export async function createUserFlow(input) {
  const data = CreateUserSchema.parse(input);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const user = await insertUser(client, {
      role: data.role,
      display_name: data.display_name ?? null,
      email: data.email ?? null,
      device_key: data.device_key ?? null
    });

    let merchant = null;
    if (data.role === "merchant") {
      if (!data.merchant_name) throw new ValidationError("merchant_name is required for merchant role");
      merchant = await insertMerchant(client, { name: data.merchant_name, owner_user_id: user.id });
      await insertMerchantMember(client, { merchant_id: merchant.id, user_id: user.id, role: "owner" });
    }
    await client.query("COMMIT");
    return merchant ? { user, merchant } : user;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function getUserById(id) {
  return selectUserByIdRepo(id);
}

const ListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().optional()
});

export async function listUsersWithMeta(query) {
  const { page, pageSize, q } = ListQuerySchema.parse(query);
  const limit = pageSize;
  const offset = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    listUsersRepo({ limit, offset, q }),
    countUsersRepo({ q })
  ]);

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  };
}

const UpdateSchema = z.object({
  display_name: z.string().trim().min(1).max(100).optional(),
  email: z.string().email().optional()
});

export async function updateUser(id, patch) {
  const data = UpdateSchema.parse(patch);
  const updated = await updateUserRepo(id, data);
  if (!updated) throw new AppError("Not found", 404, "NOT_FOUND");
  return updated;
}

export async function softDeleteUser(id) {
  const ok = await softDeleteUserRepo(id);
  if (!ok) throw new AppError("Not found", 404, "NOT_FOUND");
  return { ok: true };
}
