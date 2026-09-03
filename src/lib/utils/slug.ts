import slugify from "slugify";
import type { SupabaseClient } from "@supabase/supabase-js";

export function slugifyTitle(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

/**
 * Generates a unique slug for `title` within `table`, appending -2, -3, ...
 * as needed. Used by every entity the admin names by hand (media, photos,
 * albums, categories, services, films, stories) so the admin never has to
 * think about slugs colliding — see spec section 10.
 */
export async function generateUniqueSlug(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  table: string,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugifyTitle(title) || "untitled";
  let candidate = base;
  let suffix = 2;

  while (true) {
    let query = supabase.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data || data.length === 0) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
