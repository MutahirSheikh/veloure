import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Veloure's premium fashion and lifestyle point of view."
};

export default function AboutPage() {
  return (
    <>
      <PageHero title="About Veloure" crumb="About" />
      <section className="container grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Our point of view</p>
          <h1 className="mt-3 font-serif text-5xl font-semibold">Quiet luxury for everyday rituals.</h1>
        </div>
        <div className="space-y-5 leading-8 text-muted-foreground">
          <p>
            Veloure is a fashion and lifestyle ecommerce experience built around considered materials,
            calm silhouettes, and practical service. Every product is managed with variants, inventory,
            imagery, and order workflows that support a polished retail operation.
          </p>
          <p>
            This first release focuses on cash-on-delivery shopping, customer accounts, and complete admin
            operations so the brand can launch quickly while staying ready for future online payments.
          </p>
        </div>
      </section>
    </>
  );
}
