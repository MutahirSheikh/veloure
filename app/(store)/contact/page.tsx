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

  return (
    <>
      <PageHero title="Contact" crumb="Contact" />
      <section className="container grid gap-8 py-16 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            {settings.support_email}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Phone</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-muted-foreground">
            <Phone className="h-5 w-5 text-primary" />
            {settings.contact_phone || "Configured in store settings"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Studio</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Manchester showroom and fulfillment desk
          </CardContent>
        </Card>
      </section>
    </>
  );
}
