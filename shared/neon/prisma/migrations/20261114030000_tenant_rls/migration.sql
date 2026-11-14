-- The app switches to folio_app inside every tenant transaction. It has no BYPASSRLS and owns no table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'folio_app') THEN
    CREATE ROLE folio_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
  END IF;
END
$$;

GRANT folio_app TO CURRENT_USER;

GRANT USAGE ON SCHEMA public TO folio_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "organizations", "users" TO folio_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO folio_app;

ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

-- NULLIF makes an unset or reset setting match no rows.
CREATE POLICY "tenant_isolation" ON "organizations"
  USING ("id" = NULLIF(current_setting('app.org_id', true), ''))
  WITH CHECK ("id" = NULLIF(current_setting('app.org_id', true), ''));

CREATE POLICY "tenant_isolation" ON "users"
  USING ("org_id" = NULLIF(current_setting('app.org_id', true), ''))
  WITH CHECK ("org_id" = NULLIF(current_setting('app.org_id', true), ''));

-- Before the firm is known, a caller may read only their own user row.
CREATE POLICY "own_identity" ON "users" FOR SELECT
  USING ("cognito_sub" = NULLIF(current_setting('app.cognito_sub', true), ''));
