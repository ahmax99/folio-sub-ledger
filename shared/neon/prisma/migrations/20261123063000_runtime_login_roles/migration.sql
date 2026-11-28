-- The API logs in as one of two runtime roles, rotated in turn; neither owns a table nor can bypass RLS.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'folio_runtime_a') THEN
    CREATE ROLE folio_runtime_a LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT PASSWORD NULL;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'folio_runtime_b') THEN
    CREATE ROLE folio_runtime_b LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE NOREPLICATION NOINHERIT PASSWORD NULL;
  END IF;
END
$$;

-- Runtime roles may only become folio_app; they hold no table privilege themselves.
GRANT folio_app TO folio_runtime_a, folio_runtime_b WITH INHERIT FALSE, SET TRUE;
