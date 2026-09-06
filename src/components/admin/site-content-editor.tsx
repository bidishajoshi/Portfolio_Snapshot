"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateHomepageSection, updateSiteContent } from "@/lib/actions/site-content";

const SECTION_LABELS: Record<string, { name: string; desc: string }> = {
  hero: { name: "Hero Section Header", desc: "Top banner supporting text and heading configuration." },
  selected_works: { name: "Portfolio / Selected Works", desc: "Curated portfolio grid heading, badge, and description." },
  featured_albums: { name: "Featured Albums", desc: "Photographic album collections section headers." },
  about: { name: "About Section", desc: "Title and subhead for the About section." },
  services: { name: "Services", desc: "Expertise and service offerings section headers." },
  stories: { name: "Visual Stories", desc: "Editorial journal section heading, subhead, and description." },
  latest_work: { name: "Process / How I Work", desc: "Work process timeline section headers." },
  testimonials: { name: "Client Stories & Testimonials", desc: "Reviews and client feedback section headers." },
  social: { name: "Social & Community", desc: "Follow along and social media section headers." },
  contact_cta: { name: "Contact & Booking CTA", desc: "Inquiry form section title, subhead, and introduction text." },
};

export function SiteContentEditor({
  table,
  record,
  fields,
}: {
  table: "site_settings" | "about_content";
  record: Record<string, unknown>;
  fields: Array<{ key: string; label: string }>;
}) {
  const [values, setValues] = useState(record);
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      try {
        await updateSiteContent(table, record.id as boolean | string, values);
        toast.success("Settings saved.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save settings.");
      }
    });

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      {fields.map((field) => (
        <div key={field.key}>
          <Input
            label={field.label}
            value={String(values[field.key] ?? "")}
            onChange={(event) =>
              setValues((current) => ({ ...current, [field.key]: event.target.value }))
            }
          />
        </div>
      ))}
      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

export function HeroTextEditor({
  settings,
}: {
  settings: {
    id: boolean;
    brand_name: string;
    photographer_name: string;
    tagline: string;
  };
}) {
  const [values, setValues] = useState({
    brand_name: settings?.brand_name ?? "DR DSLR",
    photographer_name: settings?.photographer_name ?? "Himal Shrestha",
    tagline: settings?.tagline ?? "Capturing Moments Beyond Vision",
  });
  const [pending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      try {
        await updateSiteContent("site_settings", true, values);
        toast.success("Hero text saved.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save hero text.");
      }
    });

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-sm">
      <div>
        <h3 className="font-display text-lg text-ivory font-semibold">Hero Brand & Photographer Text</h3>
        <p className="text-xs text-stone mt-0.5">Edit main title, photographer name, and tagline shown on hero section.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="Photographer Name"
          value={values.photographer_name}
          onChange={(e) => setValues({ ...values, photographer_name: e.target.value })}
        />
        <Input
          label="Brand / Business Name"
          value={values.brand_name}
          onChange={(e) => setValues({ ...values, brand_name: e.target.value })}
        />
        <Input
          label="Tagline"
          value={values.tagline}
          onChange={(e) => setValues({ ...values, tagline: e.target.value })}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : "Save Hero Text"}
        </Button>
      </div>
    </div>
  );
}

export function HomepageSectionEditor({
  section,
}: {
  section: {
    id: string;
    section_key: string;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    enabled: boolean;
  };
}) {
  const [values, setValues] = useState(section);
  const [pending, startTransition] = useTransition();

  const meta = SECTION_LABELS[section.section_key] || {
    name: section.section_key.replace(/_/g, " ").toUpperCase(),
    desc: "Homepage section heading and visibility settings.",
  };

  const save = () =>
    startTransition(async () => {
      try {
        await updateHomepageSection(section.id, {
          title: values.title || null,
          subtitle: values.subtitle || null,
          description: values.description || null,
          enabled: values.enabled,
        });
        toast.success(`${meta.name} saved.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save section.");
      }
    });

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display text-base font-semibold text-ivory">{meta.name}</h4>
          <p className="text-xs text-stone">{meta.desc}</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs text-stone bg-ink/40 px-3 py-1.5 rounded-full border border-border">
          <input
            type="checkbox"
            checked={values.enabled}
            onChange={(event) =>
              setValues((current) => ({ ...current, enabled: event.target.checked }))
            }
            className="rounded accent-amber-500"
          />
          <span>{values.enabled ? "Section Visible" : "Section Hidden"}</span>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Input
          label="Main Heading (Title)"
          value={values.title ?? ""}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="e.g. Selected Stories"
        />
        <Input
          label="Badge / Subhead (Subtitle)"
          value={values.subtitle ?? ""}
          onChange={(event) =>
            setValues((current) => ({ ...current, subtitle: event.target.value }))
          }
          placeholder="e.g. Curated Portfolio"
        />
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-stone mb-1.5">
          Description Paragraph
        </label>
        <textarea
          rows={2}
          value={values.description ?? ""}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Brief intro text for this section on the homepage..."
          className="w-full bg-ink/60 border border-border rounded-lg p-3 text-sm text-ivory placeholder:text-stone-dim focus:border-cyan-glow outline-none transition-all resize-y"
        />
      </div>

      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? "Saving..." : `Save ${meta.name}`}
        </Button>
      </div>
    </div>
  );
}
