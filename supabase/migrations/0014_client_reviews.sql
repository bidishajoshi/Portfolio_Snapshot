-- Migration: 0014_client_reviews.sql
-- Add email column to testimonials table and establish RLS policy for public review submissions.

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS email text;

-- Allow public to submit reviews (with published = false by default)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'testimonials'
      AND policyname = 'public insert pending testimonials'
  ) THEN
    CREATE POLICY "public insert pending testimonials"
      ON public.testimonials FOR INSERT
      WITH CHECK (published = false);
  END IF;
END $$;
