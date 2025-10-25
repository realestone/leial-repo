-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (very simple for MVP)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Merchants (optional now; we also keep merchant_name on receipts)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  external_id TEXT UNIQUE, -- optional mapping to POS provider
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Receipts (truth layer)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  merchant_name TEXT, -- free text for now (e.g., "Cafe Java")
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NOK',
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dedupe_hash TEXT UNIQUE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_merchant ON receipts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_receipts_purchased_at ON receipts(purchased_at);

-- Rewards (generated when a receipt is saved)
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);

-- Seed a demo user (the same UUID you've been using in tests)
INSERT INTO users (id, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo@leial.local')
ON CONFLICT (id) DO NOTHING;
