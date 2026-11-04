import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the SERVICE ROLE key. This bypasses RLS
 * entirely, so it must:
 *   - only ever be imported from server-only code (the `server-only`
 *     import above makes Next.js fail the build if a client component
 *     ever imports this file)
 *   - only be used AFTER the caller has independently verified the
 *     request is the authenticated admin (see requireAdmin() in
 *     src/lib/supabase/auth.ts)
 *
 * Do not use this client to serve public reads — the anon client in
 * server.ts already does that correctly and safely through RLS. This
 * client exists for admin writes (and any admin reads of draft/hidden
 * content) where RLS's own is_admin() check is the second line of
 * defense, not the first.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
