DO $$
BEGIN
  ALTER TABLE merchants ADD COLUMN owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_column THEN
    NULL;
END $$;
