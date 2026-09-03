import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Reads the visitor/admin's session from cookies and runs
 * every query through RLS with the anon key — this is the client public
 * pages and the admin CMS should use for anything scoped to "am I logged
 * in as the admin". It never sees the service role key.
 *
 * See the note in client.ts about why this isn't parameterized with our
 * hand-written Database type.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from a Server Component where cookies
            // can't be mutated. Safe to ignore when the proxy (src/proxy.ts)
            // is also refreshing the session.
          }
        },
      },
    }
  );
}
