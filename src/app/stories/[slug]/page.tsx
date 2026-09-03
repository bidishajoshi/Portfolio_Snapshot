import { createClient } from "@/lib/supabase/server";
import { stories as localStories } from "@/data/stories";
import Link from "next/link";

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase.from("stories").select("id, title, introduction, location, story_date").eq("slug", slug).maybeSingle();
  const item = story ?? localStories.find((entry) => entry.slug === slug);
  if (!item) return <main className="min-h-screen bg-ink p-10 text-ivory">Story not found.</main>;
  return <main className="min-h-screen bg-ink p-8 md:p-16"><Link href="/#stories" className="text-gold">Back to stories</Link><article className="mx-auto mt-10 max-w-3xl"><p className="text-sm text-gold">{item.location}</p><h1 className="mt-3 font-display text-5xl text-ivory">{item.title}</h1><p className="mt-6 text-lg leading-relaxed text-stone">{"introduction" in item ? item.introduction : item.excerpt}</p><div className="mt-10 space-y-6 text-stone">{"blocks" in item && item.blocks.map((block, index) => <p key={index} className="leading-relaxed">{block.content}</p>)}</div></article></main>;
}