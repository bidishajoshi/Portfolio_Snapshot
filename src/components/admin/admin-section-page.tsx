import { createClient } from "@/lib/supabase/server";

export async function AdminSectionPage({
  title,
  description,
  table,
}: {
  title: string;
  description: string;
  table: string;
}) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ivory">{title}</h1>
        <p className="text-stone text-sm mt-1">{description}</p>
      </div>

      <div className="rounded-sm border border-border bg-surface px-5 py-6">
        <p className="text-xs uppercase tracking-wide text-stone-dim">{title} records</p>
        <p className="mt-2 font-display text-4xl text-ivory">{error ? 0 : count ?? 0}</p>
        <p className="mt-1 text-sm text-stone">
          {error || count === 0
            ? `No ${title.toLowerCase()} have been added yet.`
            : `${count} ${title.toLowerCase()} available.`}
        </p>
      </div>
    </div>
  );
}
