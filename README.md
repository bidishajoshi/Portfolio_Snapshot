# DR DSLR

Photography portfolio + private CMS for **Himal Shrestha** -- *"Capturing Moments Beyond Vision"*.

A single-admin, code-free content system: log in, upload photos, name them, organize them into albums/films/stories, publish, and the public site updates immediately -- no redeploy, no touching the database or Cloudinary directly.

---

## 1. Status

This project is being built in phases. **What's real and working right now:**

- Full Postgres schema + Row Level Security, migrated and verified against a live Postgres instance
- Supabase Auth (single admin), protected `/admin` routes via `src/proxy.ts`
- Cloudinary signed direct-upload flow, with server-side verification of every upload before it's saved (the app never trusts client-reported file metadata)
- Media Library: drag-and-drop multi-upload, human-readable renaming, auto-slugging, search/filter, safe delete (checks references first) and archive
- Reusable Media Picker used anywhere the CMS needs "Add Photos"
- Categories: full CRUD, drag-to-reorder, publish/hide, safe delete
- Admin dashboard with real (not fake) counts from the database

**Not built yet:** Albums, Homepage curation, Films, Stories, Services, Testimonials, Contact form, the public-facing cinematic site (hero slider, galleries, lightbox), SEO/structured data, analytics wiring. These follow the same patterns already established (Server Actions + Zod validation + RLS + Media Picker), so they're mechanical to add -- see `supabase/migrations/0001_init_schema.sql` for every table already in place waiting for a CMS screen.

TypeScript, ESLint, and `next build` all pass clean as of this export.

---

## 2. Stack

Next.js (App Router, Server Components/Actions) - TypeScript - Tailwind CSS - Supabase (Postgres + Auth) - Cloudinary - GSAP + Framer Motion - Zod - Vercel

## 3. Local setup

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

### Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migrations in order from `supabase/migrations/`:
   - `0001_init_schema.sql`
   - `0002_rls_policies.sql`
   - `0003_seed_homepage_sections.sql`
3. Copy **Project Settings -> API** into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep this secret -- never expose it to the browser)
4. Create the one admin user: **Authentication -> Users -> Add user** (email + password). Then, in the SQL Editor:
   ```sql
   insert into admin_profile (id, display_name)
   values ('<the new user''s UUID from the Users table>', 'Himal Shrestha');
   ```
   Only a user with a matching row in `admin_profile` can sign in to `/admin` or write any data -- everyone else is read-only, and only for published content (see `0002_rls_policies.sql`).

### Cloudinary

1. Create an account at [cloudinary.com](https://cloudinary.com).
2. From the Dashboard, copy your **Cloud name**, **API key**, and **API secret** into `.env.local` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` to the same cloud name.
3. Nothing else to configure -- uploads are signed server-side per-request (`/api/cloudinary/sign`), so no upload preset is needed.

## 4. Deployment

Push to GitHub, import into Vercel, add the same environment variables from `.env.local` in the Vercel project settings, deploy. No filesystem persistence is used anywhere -- all media lives in Cloudinary, all data in Supabase, so this is fully serverless-safe.

## 5. Using the CMS

Sign in at `/admin/login`. From there:

- **Media** -- drag in as many photos as you like, name them, and they're immediately reusable everywhere else in the CMS.
- **Categories** -- create the categories you want (Wedding, Portrait, Night, etc.), drag to reorder.
- More sections (Albums, Homepage, Films, Stories, ...) will appear here as they're built.

The admin never sees a Cloudinary ID, a database UUID, or a URL -- only names and thumbnails.

## 6. Security notes

- `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` are read only in server-only files (`src/lib/supabase/admin.ts`, `src/lib/cloudinary/config.ts`, both guarded with the `server-only` package) and are never sent to the browser.
- Every Server Action that mutates data calls `requireAdmin()` first (`src/lib/supabase/auth.ts`), independent of the proxy/middleware check -- so even if a route were misconfigured, the database itself still enforces who can write.
- Row Level Security is enabled on every table; public (anon) reads are restricted to published/enabled content only. Draft and hidden content never leaves the server to an unauthenticated visitor.
