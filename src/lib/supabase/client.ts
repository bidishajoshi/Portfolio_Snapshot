import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Uses only the public anon key — safe to
 * bundle into client components. RLS policies (see
 * supabase/migrations/0002_rls_policies.sql) are what actually restrict
 * what this client can read/write; never treat this client as trusted.
 *
 * Note: we intentionally don't parameterize this with our hand-written
 * `Database` type. The installed postgrest-js version's generic query
 * builder expects a Database shape produced by the Supabase CLI generator
 * (`supabase gen types typescript`), which is significantly more elaborate
 * than a hand-authored Row/Insert/Update map. Once a real Supabase project
 * exists, run that generator and wire its output in here for full
 * query-level type inference. Until then, every action in src/lib/actions
 * already validates inputs with Zod and casts query results to the types
 * in src/types/database.ts, so this doesn't reduce runtime safety.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
