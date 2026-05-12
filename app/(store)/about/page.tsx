import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Veloure's premium fashion and lifestyle point of view."
};

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const content = settings.storefront_content.about_page;

  return (
    <>
      <PageHero title={content.hero_title} crumb={content.hero_crumb} />
      <section className="container grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{content.eyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">{content.title}</h1>
        </div>
        <div className="space-y-5 leading-8 text-muted-foreground">
          {content.paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  );
}
