import { pool } from "../db.js";

export async function listUsersRepo({ limit, offset, q }) {
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    // use the same param index twice
    where.push(`(LOWER(display_name) LIKE $${params.length} OR LOWER(COALESCE(email,'')) LIKE $${params.length})`);
  }
  where.push("deleted_at IS NULL");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const sql = `
    SELECT id, email, role, display_name, device_key, created_at, updated_at
    FROM users
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT $${limitIdx} OFFSET $${offsetIdx}
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function countUsersRepo({ q }) {
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    where.push(`(LOWER(display_name) LIKE $1 OR LOWER(COALESCE(email,'')) LIKE $1)`);
  }
  where.push("deleted_at IS NULL");
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM users ${whereSql}`,
    params
  );
  return rows[0].count;
}

export async function insertUser(client, { role, display_name, email, device_key }) {
  const { rows } = await client.query(
    `INSERT INTO users (role, display_name, email, device_key)
     VALUES ($1,$2,$3,$4)
     RETURNING id, email, role, display_name, device_key, created_at, updated_at`,
    [role, display_name, email, device_key]
  );
  return rows[0];
}

export async function selectUserByIdRepo(id) {
  const { rows } = await pool.query(
    `SELECT id, email, role, display_name, device_key, created_at, updated_at
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return rows[0] || null;
}

export async function updateUserRepo(id, { display_name, email }) {
  const fields = [];
  const params = [];
  let idx = 1;

  if (display_name !== undefined) { fields.push(`display_name = $${idx++}`); params.push(display_name); }
  if (email !== undefined)        { fields.push(`email = $${idx++}`);        params.push(email); }

  if (!fields.length) return selectUserByIdRepo(id);

  params.push(id);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(", ")}
     WHERE id = $${idx} AND deleted_at IS NULL
     RETURNING id, email, role, display_name, device_key, created_at, updated_at`,
    params
  );
  return rows[0] || null;
}

export async function softDeleteUserRepo(id) {
  const { rows } = await pool.query(
    `UPDATE users SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL
     RETURNING id`,
    [id]
  );
  return rows[0]?.id || null;
}

// merchants helpers (already used by service)
export async function insertMerchant(client, { name, owner_user_id }) {
  const { rows } = await client.query(
    `INSERT INTO merchants (name, owner_user_id)
     VALUES ($1,$2)
     RETURNING id, name, owner_user_id, created_at`,
    [name, owner_user_id]
  );
  return rows[0];
}

export async function insertMerchantMember(client, { merchant_id, user_id, role }) {
  const { rows } = await client.query(
    `INSERT INTO merchant_members (merchant_id, user_id, role)
     VALUES ($1,$2,$3)
     RETURNING merchant_id, user_id, role, created_at`,
    [merchant_id, user_id, role]
  );
  return rows[0];
}
