import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { PageHero } from "@/components/layout/page-hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Veloure support."
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const content = settings.storefront_content.contact_page;
  const iconMap = {
    mail: Mail,
    phone: Phone,
    "map-pin": MapPin
  } as const;

  return (
    <>
      <PageHero title={content.hero_title} crumb={content.hero_crumb} />
      <section className="container grid gap-8 py-16 lg:grid-cols-3">
        {content.cards.map((card) => {
          const Icon = iconMap[card.icon];
          const body =
            card.icon === "mail"
              ? settings.support_email
              : card.icon === "phone"
                ? settings.contact_phone || card.body
                : card.body;

          return (
            <Card key={`${card.icon}-${card.title}`}>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3 text-muted-foreground">
                <Icon className="h-5 w-5 text-primary" />
                {body}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
