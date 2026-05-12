"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { updateSettingsAction } from "@/actions/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/db/types";
import type { StorefrontContent } from "@/lib/storefront";
import { settingsSchema, type SettingsInput } from "@/lib/validators/settings";

function toJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function parseJsonField<T>(label: string, value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Invalid JSON in ${label}.`);
  }
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [admins, setAdmins] = React.useState(settings.admin_notification_emails.join(", "));

  const [heroSpotlightsJson, setHeroSpotlightsJson] = React.useState(toJson(settings.storefront_content.home_hero.spotlight_cards));
  const [collectionTilesJson, setCollectionTilesJson] = React.useState(toJson(settings.storefront_content.collection_section.tiles));
  const [popularTabsJson, setPopularTabsJson] = React.useState(toJson(settings.storefront_content.popular_products.tabs));
  const [editorialPromosJson, setEditorialPromosJson] = React.useState(toJson(settings.storefront_content.editorial_promos));
  const [offerBannersJson, setOfferBannersJson] = React.useState(toJson(settings.storefront_content.offer_section.banners));
  const [journalStoriesJson, setJournalStoriesJson] = React.useState(toJson(settings.storefront_content.journal_section.stories));
  const [aboutParagraphsJson, setAboutParagraphsJson] = React.useState(toJson(settings.storefront_content.about_page.paragraphs));
  const [contactCardsJson, setContactCardsJson] = React.useState(toJson(settings.storefront_content.contact_page.cards));
  const [footerPostsJson, setFooterPostsJson] = React.useState(toJson(settings.storefront_content.footer.recent_posts));
  const [footerStoresJson, setFooterStoresJson] = React.useState(toJson(settings.storefront_content.footer.stores));
  const [footerLinkGroupsJson, setFooterLinkGroupsJson] = React.useState(toJson(settings.storefront_content.footer.link_groups));
  const [acceptedPaymentsJson, setAcceptedPaymentsJson] = React.useState(toJson(settings.storefront_content.footer.accepted_payments));

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as unknown as Resolver<SettingsInput>,
    defaultValues: {
      store_name: settings.store_name,
      support_email: settings.support_email,
      contact_phone: settings.contact_phone ?? "",
      currency_code: settings.currency_code,
      currency_symbol: settings.currency_symbol,
      flat_shipping_charge: settings.flat_shipping_charge,
      free_shipping_threshold: settings.free_shipping_threshold,
      cod_instructions: settings.cod_instructions,
      admin_notification_emails: settings.admin_notification_emails,
      default_seo_title: settings.default_seo_title,
      default_seo_description: settings.default_seo_description,
      cart_alert_customer_enabled: settings.cart_alert_customer_enabled,
      cart_alert_admin_enabled: settings.cart_alert_admin_enabled,
      homepage_heading: settings.homepage_heading,
      homepage_subheading: settings.homepage_subheading,
      storefront_content: settings.storefront_content
    }
  });

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      try {
        const storefrontContent: StorefrontContent = {
          ...values.storefront_content,
          home_hero: {
            ...values.storefront_content.home_hero,
            spotlight_cards: parseJsonField("Hero spotlight cards", heroSpotlightsJson)
          },
          collection_section: {
            ...values.storefront_content.collection_section,
            tiles: parseJsonField("Collection tiles", collectionTilesJson)
          },
          popular_products: {
            ...values.storefront_content.popular_products,
            tabs: parseJsonField("Popular product tabs", popularTabsJson)
          },
          editorial_promos: parseJsonField("Editorial promos", editorialPromosJson),
          arrivals_section: values.storefront_content.arrivals_section,
          offer_section: {
            ...values.storefront_content.offer_section,
            banners: parseJsonField("Offer banners", offerBannersJson)
          },
          journal_section: {
            ...values.storefront_content.journal_section,
            stories: parseJsonField("Journal stories", journalStoriesJson)
          },
          about_page: {
            ...values.storefront_content.about_page,
            paragraphs: parseJsonField("About page paragraphs", aboutParagraphsJson)
          },
          contact_page: {
            ...values.storefront_content.contact_page,
            cards: parseJsonField("Contact cards", contactCardsJson)
          },
          footer: {
            ...values.storefront_content.footer,
            recent_posts: parseJsonField("Footer posts", footerPostsJson),
            stores: parseJsonField("Footer stores", footerStoresJson),
            link_groups: parseJsonField("Footer link groups", footerLinkGroupsJson),
            accepted_payments: parseJsonField("Accepted payments", acceptedPaymentsJson)
          }
        };

        const result = await updateSettingsAction({
          ...values,
          admin_notification_emails: admins.split(",").map((email) => email.trim()).filter(Boolean),
          storefront_content: storefrontContent
        });

        toast({
          title: result.ok ? "Settings saved" : "Settings failed",
          description: result.ok ? result.message : result.error,
          variant: result.ok ? "default" : "destructive"
        });
      } catch (error) {
        toast({
          title: "Content JSON is invalid",
          description: error instanceof Error ? error.message : "Check the CMS JSON blocks and try again.",
          variant: "destructive"
        });
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 rounded-md border border-border bg-card p-6">
      <Section title="General Settings" description="Store identity, shipping, SEO, and notification behavior.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Store name">
            <Input {...form.register("store_name")} />
          </Field>
          <Field label="Support email">
            <Input {...form.register("support_email")} type="email" />
          </Field>
          <Field label="Contact phone">
            <Input {...form.register("contact_phone")} />
          </Field>
          <Field label="Admin notification emails">
            <Input value={admins} onChange={(event) => setAdmins(event.target.value)} placeholder="ops@example.com, owner@example.com" />
          </Field>
          <Field label="Currency code">
            <Input {...form.register("currency_code")} />
          </Field>
          <Field label="Currency symbol">
            <Input {...form.register("currency_symbol")} />
          </Field>
          <Field label="Flat shipping charge">
            <Input type="number" step="0.01" min="0" {...form.register("flat_shipping_charge")} />
          </Field>
          <Field label="Free shipping threshold">
            <Input type="number" step="0.01" min="0" {...form.register("free_shipping_threshold")} />
          </Field>
          <Field label="Homepage heading">
            <Input {...form.register("homepage_heading")} />
          </Field>
          <Field label="Homepage subheading">
            <Input {...form.register("homepage_subheading")} />
          </Field>
          <Field label="Default SEO title">
            <Input {...form.register("default_seo_title")} />
          </Field>
          <Field label="Default SEO description">
            <Input {...form.register("default_seo_description")} />
          </Field>
          <Field label="COD instructions" className="lg:col-span-2">
            <Textarea {...form.register("cod_instructions")} />
          </Field>
          <div className="flex flex-wrap gap-5 lg:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("cart_alert_customer_enabled")} />
              Email customers on cart add
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...form.register("cart_alert_admin_enabled")} />
              Email admins on cart add
            </label>
          </div>
        </div>
      </Section>

      <Section title="Home Hero" description="Primary hero content, calls to action, and spotlight cards.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Hero supporting text">
            <Textarea {...form.register("storefront_content.home_hero.supporting_text")} />
          </Field>
          <Field label="Hero accent word">
            <Input {...form.register("storefront_content.home_hero.accent_word")} />
          </Field>
          <Field label="Hero avatar image">
            <Input {...form.register("storefront_content.home_hero.avatar_image")} />
          </Field>
          <Field label="Hero image">
            <Input {...form.register("storefront_content.home_hero.hero_image")} />
          </Field>
          <Field label="Hero circle text">
            <Input {...form.register("storefront_content.home_hero.circle_text")} />
          </Field>
          <Field label="Primary CTA label">
            <Input {...form.register("storefront_content.home_hero.primary_cta_label")} />
          </Field>
          <Field label="Primary CTA href">
            <Input {...form.register("storefront_content.home_hero.primary_cta_href")} />
          </Field>
          <Field label="Secondary CTA label">
            <Input {...form.register("storefront_content.home_hero.secondary_cta_label")} />
          </Field>
          <Field label="Secondary CTA href">
            <Input {...form.register("storefront_content.home_hero.secondary_cta_href")} />
          </Field>
          <Field label="Hero spotlight cards JSON" className="lg:col-span-2">
            <JsonEditor value={heroSpotlightsJson} onChange={setHeroSpotlightsJson} />
          </Field>
        </div>
      </Section>

      <Section title="Homepage Sections" description="Collection, popular tabs, promos, arrivals, offers, and journal.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Collection eyebrow">
            <Input {...form.register("storefront_content.collection_section.eyebrow")} />
          </Field>
          <Field label="Collection title">
            <Input {...form.register("storefront_content.collection_section.title")} />
          </Field>
          <Field label="Collection featured image">
            <Input {...form.register("storefront_content.collection_section.featured_image")} />
          </Field>
          <Field label="Collection CTA href">
            <Input {...form.register("storefront_content.collection_section.cta_href")} />
          </Field>
          <Field label="Collection tiles JSON" className="lg:col-span-2">
            <JsonEditor value={collectionTilesJson} onChange={setCollectionTilesJson} />
          </Field>

          <Field label="Popular products eyebrow">
            <Input {...form.register("storefront_content.popular_products.eyebrow")} />
          </Field>
          <Field label="Popular products title">
            <Input {...form.register("storefront_content.popular_products.title")} />
          </Field>
          <Field label="Popular tabs JSON" className="lg:col-span-2">
            <JsonEditor value={popularTabsJson} onChange={setPopularTabsJson} />
          </Field>

          <Field label="Editorial promos JSON" className="lg:col-span-2">
            <JsonEditor value={editorialPromosJson} onChange={setEditorialPromosJson} />
          </Field>

          <Field label="Arrivals eyebrow">
            <Input {...form.register("storefront_content.arrivals_section.eyebrow")} />
          </Field>
          <Field label="Arrivals title">
            <Input {...form.register("storefront_content.arrivals_section.title")} />
          </Field>
          <Field label="Arrivals CTA label">
            <Input {...form.register("storefront_content.arrivals_section.cta_label")} />
          </Field>
          <Field label="Arrivals CTA href">
            <Input {...form.register("storefront_content.arrivals_section.cta_href")} />
          </Field>
          <Field label="Arrivals featured image">
            <Input {...form.register("storefront_content.arrivals_section.featured_image")} />
          </Field>

          <Field label="Offer section eyebrow">
            <Input {...form.register("storefront_content.offer_section.eyebrow")} />
          </Field>
          <Field label="Offer section title">
            <Input {...form.register("storefront_content.offer_section.title")} />
          </Field>
          <Field label="Offer section CTA label">
            <Input {...form.register("storefront_content.offer_section.cta_label")} />
          </Field>
          <Field label="Offer section CTA href">
            <Input {...form.register("storefront_content.offer_section.cta_href")} />
          </Field>
          <Field label="Offer banners JSON" className="lg:col-span-2">
            <JsonEditor value={offerBannersJson} onChange={setOfferBannersJson} />
          </Field>

          <Field label="Journal eyebrow">
            <Input {...form.register("storefront_content.journal_section.eyebrow")} />
          </Field>
          <Field label="Journal title">
            <Input {...form.register("storefront_content.journal_section.title")} />
          </Field>
          <Field label="Journal CTA label">
            <Input {...form.register("storefront_content.journal_section.cta_label")} />
          </Field>
          <Field label="Journal CTA href">
            <Input {...form.register("storefront_content.journal_section.cta_href")} />
          </Field>
          <Field label="Journal stories JSON" className="lg:col-span-2">
            <JsonEditor value={journalStoriesJson} onChange={setJournalStoriesJson} />
          </Field>
        </div>
      </Section>

      <Section title="About and Contact Pages" description="Control the editorial copy and contact cards.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="About hero title">
            <Input {...form.register("storefront_content.about_page.hero_title")} />
          </Field>
          <Field label="About crumb">
            <Input {...form.register("storefront_content.about_page.hero_crumb")} />
          </Field>
          <Field label="About eyebrow">
            <Input {...form.register("storefront_content.about_page.eyebrow")} />
          </Field>
          <Field label="About title">
            <Input {...form.register("storefront_content.about_page.title")} />
          </Field>
          <Field label="About paragraphs JSON" className="lg:col-span-2">
            <JsonEditor value={aboutParagraphsJson} onChange={setAboutParagraphsJson} />
          </Field>

          <Field label="Contact hero title">
            <Input {...form.register("storefront_content.contact_page.hero_title")} />
          </Field>
          <Field label="Contact crumb">
            <Input {...form.register("storefront_content.contact_page.hero_crumb")} />
          </Field>
          <Field label="Contact cards JSON" className="lg:col-span-2">
            <JsonEditor value={contactCardsJson} onChange={setContactCardsJson} />
          </Field>
        </div>
      </Section>

      <Section title="Footer Content" description="Footer editorial content, stores, links, and payment badges.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Footer address">
            <Input {...form.register("storefront_content.footer.address")} />
          </Field>
          <Field label="Newsletter heading">
            <Input {...form.register("storefront_content.footer.newsletter_heading")} />
          </Field>
          <Field label="Newsletter placeholder">
            <Input {...form.register("storefront_content.footer.newsletter_placeholder")} />
          </Field>
          <Field label="Copyright label">
            <Input {...form.register("storefront_content.footer.copyright_label")} />
          </Field>
          <Field label="Footer posts JSON" className="lg:col-span-2">
            <JsonEditor value={footerPostsJson} onChange={setFooterPostsJson} />
          </Field>
          <Field label="Footer stores JSON" className="lg:col-span-2">
            <JsonEditor value={footerStoresJson} onChange={setFooterStoresJson} />
          </Field>
          <Field label="Footer link groups JSON" className="lg:col-span-2">
            <JsonEditor value={footerLinkGroupsJson} onChange={setFooterLinkGroupsJson} />
          </Field>
          <Field label="Accepted payments JSON" className="lg:col-span-2">
            <JsonEditor value={acceptedPaymentsJson} onChange={setAcceptedPaymentsJson} />
          </Field>
        </div>
      </Section>

      <Button className="mt-2" disabled={isPending}>
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-background p-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function JsonEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-[220px] font-mono text-xs leading-6"
    />
  );
}
