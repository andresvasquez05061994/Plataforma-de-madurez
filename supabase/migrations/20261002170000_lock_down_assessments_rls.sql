-- Lock down public.assessments.
--
-- Apply this manually in the Supabase SQL editor after review.
-- Do not apply it to production from this repository automatically.
--
-- Respondents may INSERT a new diagnosis with the anon key.
-- anon and authenticated may not SELECT, UPDATE, or DELETE.
-- The admin panel reads with the service role key (bypasses RLS) only after
-- the application checks that the session email is in ADMIN_EMAILS.
--
-- The app insert does not chain .select(), so it does not need a SELECT grant.
-- The table owner (dashboard SQL editor) is unchanged and can still query.

BEGIN;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'assessments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessments', pol.policyname);
  END LOOP;
END $$;

REVOKE ALL ON TABLE public.assessments FROM anon, authenticated;
GRANT INSERT ON TABLE public.assessments TO anon, authenticated;
GRANT ALL ON TABLE public.assessments TO service_role;

CREATE POLICY "Respondents can submit an assessment"
  ON public.assessments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMIT;
