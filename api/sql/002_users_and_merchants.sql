-- 🧩 Roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer','merchant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE merchant_member_role AS ENUM ('owner','staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 🧍 Users table additions
DO $$
BEGIN
  ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'customer';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE users ADD COLUMN display_name TEXT;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$
BEGIN
  ALTER TABLE users ADD COLUMN device_key TEXT UNIQUE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Add unique constraint for email (ignore if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_unique'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
  END IF;
END $$;

-- 🏪 Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 👥 Merchant members join table
CREATE TABLE IF NOT EXISTS merchant_members (
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role merchant_member_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (merchant_id, user_id)
);
