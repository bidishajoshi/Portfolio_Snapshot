import { createClient } from "@/lib/supabase/server";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Categories from "@/components/Categories";
import Gallery from "@/components/Gallery";
import Albums from "@/components/Albums";
import Stories from "@/components/Stories";
import Services from "@/components/Services";
import Experience from "@/components/Experience";
import Testimonials from "@/components/Testimonials";
import Social from "@/components/Social";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

// We read site settings just to ensure we don't break the existing build if it relies on it,
// though our components currently use local data to ensure a fully beautiful render out-of-the-box.
export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: dbServices }, { data: dbStories }, { data: dbTestimonials }] = await Promise.all([
    supabase.from("site_settings").select("brand_name, photographer_name, tagline, contact_email, contact_phone").maybeSingle(),
    supabase.from("services").select("id, title, description").eq("published", true).order("display_order"),
    supabase.from("stories").select("id, title, introduction, location, story_date").eq("published", true).order("display_order"),
    supabase.from("testimonials").select("id, client_name, review, event_type").eq("published", true).order("display_order"),
  ]);

  return (
    <main className="flex flex-col min-h-screen relative w-full overflow-x-hidden bg-ink">
      <Navbar />
      <Hero brandOverride={settings ? { name: settings.brand_name, photographer: settings.photographer_name, tagline: settings.tagline } : undefined} />
      <About />
      <Categories />
      <Gallery />
      <Albums />
      <Stories stories={dbStories?.length ? dbStories : undefined} />
      <Services services={dbServices?.length ? dbServices : undefined} />
      <Experience />
      <Testimonials testimonials={dbTestimonials?.length ? dbTestimonials : undefined} />
      <Social />
      <Contact contactOverride={settings ? { email: settings.contact_email, phone: settings.contact_phone } : undefined} />
      <Footer />
    </main>
  );
}
