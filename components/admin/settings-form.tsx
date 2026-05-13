"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronDown, Plus, Save, Trash2, UploadCloud } from "lucide-react";

import { updateSettingsAction, uploadSettingsImageAction } from "@/actions/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/db/types";
import type { StorefrontContent } from "@/lib/storefront";
import type { SettingsInput } from "@/lib/validators/settings";

type CollectionTile = StorefrontContent["collection_section"]["tiles"][number];
type PromoBanner = StorefrontContent["editorial_promos"][number];
type Story = StorefrontContent["journal_section"]["stories"][number];
type ContactCard = StorefrontContent["contact_page"]["cards"][number];
type FooterPost = StorefrontContent["footer"]["recent_posts"][number];
type FooterLinkGroup = StorefrontContent["footer"]["link_groups"][number];
type FooterLink = FooterLinkGroup["links"][number];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { toast } = useToast();
  const [pendingSection, setPendingSection] = React.useState<string | null>(null);
  const [general, setGeneral] = React.useState({
    store_name: settings.store_name,
    support_email: settings.support_email,
    contact_phone: settings.contact_phone ?? "",
    currency_code: settings.currency_code,
    currency_symbol: settings.currency_symbol,
    flat_shipping_charge: String(settings.flat_shipping_charge),
    free_shipping_threshold: settings.free_shipping_threshold == null ? "" : String(settings.free_shipping_threshold),
    cod_instructions: settings.cod_instructions,
    default_seo_title: settings.default_seo_title,
    default_seo_description: settings.default_seo_description,
    cart_alert_customer_enabled: settings.cart_alert_customer_enabled,
    cart_alert_admin_enabled: settings.cart_alert_admin_enabled,
    homepage_heading: settings.homepage_heading,
    homepage_subheading: settings.homepage_subheading
  });
  const [adminEmails, setAdminEmails] = React.useState(settings.admin_notification_emails);
  const [content, setContent] = React.useState<StorefrontContent>(settings.storefront_content);

  function updateGeneral<K extends keyof typeof general>(key: K, value: (typeof general)[K]) {
    setGeneral((current) => ({ ...current, [key]: value }));
  }

  function updateContent<K extends keyof StorefrontContent>(key: K, value: StorefrontContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  async function saveSection(section: string) {
    setPendingSection(section);
    const payload: SettingsInput = {
      ...general,
      contact_phone: general.contact_phone || null,
      flat_shipping_charge: Number(general.flat_shipping_charge || 0),
      free_shipping_threshold: general.free_shipping_threshold === "" ? null : Number(general.free_shipping_threshold),
      currency_code: general.currency_code.toUpperCase(),
      admin_notification_emails: adminEmails,
      storefront_content: content
    };

    const result = await updateSettingsAction(payload);
    setPendingSection(null);
    toast({
      title: result.ok ? `${section} saved` : "Settings failed",
      description: result.ok ? result.message : result.error,
      variant: result.ok ? "default" : "destructive"
    });
  }

  return (
    <div className="space-y-5">
      <Accordion title="Store Basics" description="Brand identity, support details, currency, shipping, SEO, and alert behavior." defaultOpen>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Store name"><Input className="admin-input" value={general.store_name} onChange={(event) => updateGeneral("store_name", event.target.value)} /></Field>
          <Field label="Support email"><Input className="admin-input" type="email" value={general.support_email} onChange={(event) => updateGeneral("support_email", event.target.value)} /></Field>
          <Field label="Contact phone"><Input className="admin-input" value={general.contact_phone} onChange={(event) => updateGeneral("contact_phone", event.target.value)} /></Field>
          <Field label="Currency code"><Input className="admin-input" value={general.currency_code} onChange={(event) => updateGeneral("currency_code", event.target.value)} /></Field>
          <Field label="Currency symbol"><Input className="admin-input" value={general.currency_symbol} onChange={(event) => updateGeneral("currency_symbol", event.target.value)} /></Field>
          <Field label="Flat shipping charge"><Input className="admin-input" type="number" min="0" step="0.01" value={general.flat_shipping_charge} onChange={(event) => updateGeneral("flat_shipping_charge", event.target.value)} /></Field>
          <Field label="Free shipping threshold"><Input className="admin-input" type="number" min="0" step="0.01" value={general.free_shipping_threshold} onChange={(event) => updateGeneral("free_shipping_threshold", event.target.value)} /></Field>
          <Field label="Homepage heading"><Input className="admin-input" value={general.homepage_heading} onChange={(event) => updateGeneral("homepage_heading", event.target.value)} /></Field>
          <Field label="Homepage subheading"><Input className="admin-input" value={general.homepage_subheading} onChange={(event) => updateGeneral("homepage_subheading", event.target.value)} /></Field>
          <Field label="Default SEO title"><Input className="admin-input" value={general.default_seo_title} onChange={(event) => updateGeneral("default_seo_title", event.target.value)} /></Field>
          <Field label="Default SEO description"><Input className="admin-input" value={general.default_seo_description} onChange={(event) => updateGeneral("default_seo_description", event.target.value)} /></Field>
          <Field label="Cash on delivery instructions" className="lg:col-span-2">
            <Textarea className="rounded-md border-[#d9e0ea]" value={general.cod_instructions} onChange={(event) => updateGeneral("cod_instructions", event.target.value)} />
          </Field>
          <Field label="Admin notification emails" className="lg:col-span-2">
            <StringList values={adminEmails} onChange={setAdminEmails} placeholder="ops@example.com" />
          </Field>
          <div className="flex flex-wrap gap-5 lg:col-span-2">
            <Toggle label="Email customers when they add to cart" checked={general.cart_alert_customer_enabled} onChange={(checked) => updateGeneral("cart_alert_customer_enabled", checked)} />
            <Toggle label="Email admins when customers add to cart" checked={general.cart_alert_admin_enabled} onChange={(checked) => updateGeneral("cart_alert_admin_enabled", checked)} />
          </div>
        </div>
        <SectionSave section="Store basics" pendingSection={pendingSection} onSave={saveSection} />
      </Accordion>

      <Accordion title="Home Hero" description="Main first-screen copy, images, buttons, and product spotlight cards.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Supporting text"><Textarea className="rounded-md border-[#d9e0ea]" value={content.home_hero.supporting_text} onChange={(event) => updateContent("home_hero", { ...content.home_hero, supporting_text: event.target.value })} /></Field>
          <Field label="Accent word"><Input className="admin-input" value={content.home_hero.accent_word} onChange={(event) => updateContent("home_hero", { ...content.home_hero, accent_word: event.target.value })} /></Field>
          <ImageField label="Avatar image" value={content.home_hero.avatar_image} onChange={(avatar_image) => updateContent("home_hero", { ...content.home_hero, avatar_image })} />
          <ImageField label="Hero image" value={content.home_hero.hero_image} onChange={(hero_image) => updateContent("home_hero", { ...content.home_hero, hero_image })} />
          <Field label="Circle text"><Input className="admin-input" value={content.home_hero.circle_text} onChange={(event) => updateContent("home_hero", { ...content.home_hero, circle_text: event.target.value })} /></Field>
          <Field label="Primary button text"><Input className="admin-input" value={content.home_hero.primary_cta_label} onChange={(event) => updateContent("home_hero", { ...content.home_hero, primary_cta_label: event.target.value })} /></Field>
          <Field label="Primary button link"><Input className="admin-input" value={content.home_hero.primary_cta_href} onChange={(event) => updateContent("home_hero", { ...content.home_hero, primary_cta_href: event.target.value })} /></Field>
          <Field label="Secondary button text"><Input className="admin-input" value={content.home_hero.secondary_cta_label} onChange={(event) => updateContent("home_hero", { ...content.home_hero, secondary_cta_label: event.target.value })} /></Field>
          <Field label="Secondary button link"><Input className="admin-input" value={content.home_hero.secondary_cta_href} onChange={(event) => updateContent("home_hero", { ...content.home_hero, secondary_cta_href: event.target.value })} /></Field>
        </div>
        <RepeatableCards
          title="Spotlight cards"
          items={content.home_hero.spotlight_cards}
          createItem={() => ({ title: "New product", price: "$80", compare_at: "$100", image: "/images/1.png" })}
          onChange={(items) => updateContent("home_hero", { ...content.home_hero, spotlight_cards: items })}
          renderItem={(item, index, update) => (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
              <ImageField label="Image" value={item.image} onChange={(image) => update(index, { ...item, image })} />
              <Field label="Price"><Input className="admin-input" value={item.price} onChange={(event) => update(index, { ...item, price: event.target.value })} /></Field>
              <Field label="Compare at"><Input className="admin-input" value={item.compare_at} onChange={(event) => update(index, { ...item, compare_at: event.target.value })} /></Field>
            </div>
          )}
        />
        <SectionSave section="Home hero" pendingSection={pendingSection} onSave={saveSection} />
      </Accordion>

      <Accordion title="Homepage Sections" description="Collections, popular product tabs, promotional banners, arrivals, offers, and journal stories.">
        <SectionTitle title="Latest collection" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Eyebrow"><Input className="admin-input" value={content.collection_section.eyebrow} onChange={(event) => updateContent("collection_section", { ...content.collection_section, eyebrow: event.target.value })} /></Field>
          <Field label="Title"><Input className="admin-input" value={content.collection_section.title} onChange={(event) => updateContent("collection_section", { ...content.collection_section, title: event.target.value })} /></Field>
          <ImageField label="Featured image" value={content.collection_section.featured_image} onChange={(featured_image) => updateContent("collection_section", { ...content.collection_section, featured_image })} />
          <Field label="Button link"><Input className="admin-input" value={content.collection_section.cta_href} onChange={(event) => updateContent("collection_section", { ...content.collection_section, cta_href: event.target.value })} /></Field>
        </div>
        <TilesEditor items={content.collection_section.tiles} onChange={(items) => updateContent("collection_section", { ...content.collection_section, tiles: items })} />

        <SectionTitle title="Popular products" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Eyebrow"><Input className="admin-input" value={content.popular_products.eyebrow} onChange={(event) => updateContent("popular_products", { ...content.popular_products, eyebrow: event.target.value })} /></Field>
          <Field label="Title"><Input className="admin-input" value={content.popular_products.title} onChange={(event) => updateContent("popular_products", { ...content.popular_products, title: event.target.value })} /></Field>
          <Field label="Product tab labels" className="lg:col-span-2"><StringList values={content.popular_products.tabs} onChange={(tabs) => updateContent("popular_products", { ...content.popular_products, tabs })} placeholder="Dresses" /></Field>
        </div>

        <PromoList title="Editorial promos" items={content.editorial_promos} onChange={(items) => updateContent("editorial_promos", items)} />

        <SectionTitle title="New arrivals" />
        <TitledSectionEditor
          value={content.arrivals_section}
          includeImage
          onChange={(value) => updateContent("arrivals_section", value)}
        />

        <SectionTitle title="Offers" />
        <TitledSectionEditor value={content.offer_section} onChange={(value) => updateContent("offer_section", value)} />
        <PromoList title="Offer banners" items={content.offer_section.banners} onChange={(banners) => updateContent("offer_section", { ...content.offer_section, banners })} />

        <SectionTitle title="Journal" />
        <TitledSectionEditor value={content.journal_section} onChange={(value) => updateContent("journal_section", value)} />
        <StoriesEditor items={content.journal_section.stories} onChange={(stories) => updateContent("journal_section", { ...content.journal_section, stories })} />
        <SectionSave section="Homepage sections" pendingSection={pendingSection} onSave={saveSection} />
      </Accordion>

      <Accordion title="About and Contact Pages" description="Plain page copy and customer-facing contact cards.">
        <SectionTitle title="About page" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Hero title"><Input className="admin-input" value={content.about_page.hero_title} onChange={(event) => updateContent("about_page", { ...content.about_page, hero_title: event.target.value })} /></Field>
          <Field label="Breadcrumb label"><Input className="admin-input" value={content.about_page.hero_crumb} onChange={(event) => updateContent("about_page", { ...content.about_page, hero_crumb: event.target.value })} /></Field>
          <Field label="Eyebrow"><Input className="admin-input" value={content.about_page.eyebrow} onChange={(event) => updateContent("about_page", { ...content.about_page, eyebrow: event.target.value })} /></Field>
          <Field label="Title"><Input className="admin-input" value={content.about_page.title} onChange={(event) => updateContent("about_page", { ...content.about_page, title: event.target.value })} /></Field>
          <Field label="Paragraphs" className="lg:col-span-2"><StringList multiline values={content.about_page.paragraphs} onChange={(paragraphs) => updateContent("about_page", { ...content.about_page, paragraphs })} placeholder="Write a paragraph..." /></Field>
        </div>

        <SectionTitle title="Contact page" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Hero title"><Input className="admin-input" value={content.contact_page.hero_title} onChange={(event) => updateContent("contact_page", { ...content.contact_page, hero_title: event.target.value })} /></Field>
          <Field label="Breadcrumb label"><Input className="admin-input" value={content.contact_page.hero_crumb} onChange={(event) => updateContent("contact_page", { ...content.contact_page, hero_crumb: event.target.value })} /></Field>
        </div>
        <ContactCardsEditor items={content.contact_page.cards} onChange={(cards) => updateContent("contact_page", { ...content.contact_page, cards })} />
        <SectionSave section="About and contact" pendingSection={pendingSection} onSave={saveSection} />
      </Accordion>

      <Accordion title="Footer" description="Newsletter text, store list, footer posts, navigation links, and accepted payments.">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Address"><Input className="admin-input" value={content.footer.address} onChange={(event) => updateContent("footer", { ...content.footer, address: event.target.value })} /></Field>
          <Field label="Newsletter heading"><Input className="admin-input" value={content.footer.newsletter_heading} onChange={(event) => updateContent("footer", { ...content.footer, newsletter_heading: event.target.value })} /></Field>
          <Field label="Newsletter placeholder"><Input className="admin-input" value={content.footer.newsletter_placeholder} onChange={(event) => updateContent("footer", { ...content.footer, newsletter_placeholder: event.target.value })} /></Field>
          <Field label="Copyright label"><Input className="admin-input" value={content.footer.copyright_label} onChange={(event) => updateContent("footer", { ...content.footer, copyright_label: event.target.value })} /></Field>
          <Field label="Store locations" className="lg:col-span-2"><StringList values={content.footer.stores} onChange={(stores) => updateContent("footer", { ...content.footer, stores })} placeholder="London" /></Field>
          <Field label="Accepted payments" className="lg:col-span-2"><StringList values={content.footer.accepted_payments} onChange={(accepted_payments) => updateContent("footer", { ...content.footer, accepted_payments })} placeholder="Visa" /></Field>
        </div>
        <FooterPostsEditor items={content.footer.recent_posts} onChange={(recent_posts) => updateContent("footer", { ...content.footer, recent_posts })} />
        <FooterLinksEditor items={content.footer.link_groups} onChange={(link_groups) => updateContent("footer", { ...content.footer, link_groups })} />
        <SectionSave section="Footer" pendingSection={pendingSection} onSave={saveSection} />
      </Accordion>
    </div>
  );
}

function Accordion({ title, description, defaultOpen, children }: { title: string; description: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details className="admin-card group overflow-hidden" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 border-b border-[#e9edf2] px-6 py-5">
        <span>
          <span className="block text-lg font-bold text-[#142044]">{title}</span>
          <span className="mt-1 block text-sm text-[#53627d]">{description}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-7 p-5 sm:p-7">{children}</div>
    </details>
  );
}

function SectionSave({ section, pendingSection, onSave }: { section: string; pendingSection: string | null; onSave: (section: string) => void }) {
  return (
    <div className="flex justify-end border-t border-[#e9edf2] pt-5">
      <Button type="button" className="bg-[#ff6c2f] hover:bg-[#ec5c20]" disabled={pendingSection !== null} onClick={() => onSave(section)}>
        <Save className="h-4 w-4" />
        {pendingSection === section ? "Saving..." : `Save ${section}`}
      </Button>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="border-b border-[#e9edf2] pb-3 text-base font-bold text-[#142044]">{title}</h3>;
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { toast } = useToast();
  const [preview, setPreview] = React.useState(value);
  const [isUploading, startUpload] = React.useTransition();

  React.useEffect(() => {
    setPreview(value);
  }, [value]);

  function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.set("image", file);

    startUpload(async () => {
      const result = await uploadSettingsImageAction(formData);
      URL.revokeObjectURL(localPreview);
      if (result.ok) {
        onChange(result.data.url);
        setPreview(result.data.url);
        toast({ title: "Image uploaded", description: "Save this section to publish the new image." });
        return;
      }

      setPreview(value);
      toast({ title: "Upload failed", description: result.error, variant: "destructive" });
    });
  }

  return (
    <Field label={label}>
      <div className="rounded-lg border border-[#e9edf2] bg-white p-3">
        <div className="grid gap-3 sm:grid-cols-[112px_1fr]">
          <div className="relative h-28 overflow-hidden rounded-lg bg-[#eef3f8]">
            {preview ? (
              <Image src={preview} alt={label} fill className="object-cover" unoptimized={preview.startsWith("blob:")} sizes="112px" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-[#70809b]">No image</div>
            )}
          </div>
          <div className="min-w-0 space-y-3">
            <Input className="admin-input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="/images/example.png" />
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-[#d9e0ea] bg-white px-4 text-sm font-semibold text-[#142044] hover:bg-[#f8fafc]">
              <UploadCloud className="h-4 w-4 text-[#ff6c2f]" />
              {isUploading ? "Uploading..." : "Upload image"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={upload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </div>
    </Field>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-[#e9edf2] bg-white px-4 py-3 text-sm font-medium">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function StringList({ values, onChange, placeholder, multiline }: { values: string[]; onChange: (values: string[]) => void; placeholder: string; multiline?: boolean }) {
  function update(index: number, value: string) {
    onChange(values.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  return (
    <div className="space-y-3">
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          {multiline ? (
            <Textarea className="min-h-24 rounded-md border-[#d9e0ea]" value={value} onChange={(event) => update(index, event.target.value)} />
          ) : (
            <Input className="admin-input" value={value} placeholder={placeholder} onChange={(event) => update(index, event.target.value)} />
          )}
          <IconButton label="Remove" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></IconButton>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange([...values, ""])}>
        <Plus className="h-4 w-4" />
        Add item
      </Button>
    </div>
  );
}

function RepeatableCards<T>({ title, items, createItem, onChange, renderItem }: { title: string; items: T[]; createItem: () => T; onChange: (items: T[]) => void; renderItem: (item: T, index: number, update: (index: number, item: T) => void) => React.ReactNode }) {
  function update(index: number, item: T) {
    onChange(items.map((current, itemIndex) => (itemIndex === index ? item : current)));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title={title} />
        <Button type="button" variant="outline" onClick={() => onChange([...items, createItem()])}><Plus className="h-4 w-4" />Add</Button>
      </div>
      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-lg border border-[#e9edf2] bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-[#142044]">Item {index + 1}</p>
              <IconButton label="Remove" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /></IconButton>
            </div>
            {renderItem(item, index, update)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TilesEditor({ items, onChange }: { items: CollectionTile[]; onChange: (items: CollectionTile[]) => void }) {
  return (
    <RepeatableCards
      title="Collection tiles"
      items={items}
      createItem={() => ({ title: "New tile", image: "/images/1.png", href: "/shop" })}
      onChange={onChange}
      renderItem={(item, index, update) => (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
          <ImageField label="Image" value={item.image} onChange={(image) => update(index, { ...item, image })} />
          <Field label="Link"><Input className="admin-input" value={item.href} onChange={(event) => update(index, { ...item, href: event.target.value })} /></Field>
        </div>
      )}
    />
  );
}

function PromoList({ title, items, onChange }: { title: string; items: PromoBanner[]; onChange: (items: PromoBanner[]) => void }) {
  return (
    <RepeatableCards
      title={title}
      items={items}
      createItem={() => ({ title: "New promo", eyebrow: "Special offer", image: "/images/1.png", cta_label: "Shop now", cta_href: "/shop", background: "bg-[#f9cad7]" })}
      onChange={onChange}
      renderItem={(item, index, update) => <PromoFields item={item} index={index} update={update} />}
    />
  );
}

function PromoFields({ item, index, update }: { item: PromoBanner; index: number; update: (index: number, item: PromoBanner) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
      <Field label="Small label"><Input className="admin-input" value={item.eyebrow} onChange={(event) => update(index, { ...item, eyebrow: event.target.value })} /></Field>
      <ImageField label="Image" value={item.image} onChange={(image) => update(index, { ...item, image })} />
      <Field label="Background class"><Input className="admin-input" value={item.background} onChange={(event) => update(index, { ...item, background: event.target.value })} /></Field>
      <Field label="Button text"><Input className="admin-input" value={item.cta_label} onChange={(event) => update(index, { ...item, cta_label: event.target.value })} /></Field>
      <Field label="Button link"><Input className="admin-input" value={item.cta_href} onChange={(event) => update(index, { ...item, cta_href: event.target.value })} /></Field>
    </div>
  );
}

function TitledSectionEditor<T extends { eyebrow: string; title: string; cta_label: string; cta_href: string; featured_image?: string }>({ value, onChange, includeImage }: { value: T; onChange: (value: T) => void; includeImage?: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Field label="Eyebrow"><Input className="admin-input" value={value.eyebrow} onChange={(event) => onChange({ ...value, eyebrow: event.target.value })} /></Field>
      <Field label="Title"><Input className="admin-input" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></Field>
      <Field label="Button text"><Input className="admin-input" value={value.cta_label} onChange={(event) => onChange({ ...value, cta_label: event.target.value })} /></Field>
      <Field label="Button link"><Input className="admin-input" value={value.cta_href} onChange={(event) => onChange({ ...value, cta_href: event.target.value })} /></Field>
      {includeImage ? <ImageField label="Featured image" value={value.featured_image ?? ""} onChange={(featured_image) => onChange({ ...value, featured_image })} /> : null}
    </div>
  );
}

function StoriesEditor({ items, onChange }: { items: Story[]; onChange: (items: Story[]) => void }) {
  return (
    <RepeatableCards
      title="Journal stories"
      items={items}
      createItem={() => ({ title: "New story", image: "/images/1.png", category: "May 2026", href: "/about" })}
      onChange={onChange}
      renderItem={(item, index, update) => (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
          <Field label="Category/date"><Input className="admin-input" value={item.category} onChange={(event) => update(index, { ...item, category: event.target.value })} /></Field>
          <ImageField label="Image" value={item.image} onChange={(image) => update(index, { ...item, image })} />
          <Field label="Link"><Input className="admin-input" value={item.href} onChange={(event) => update(index, { ...item, href: event.target.value })} /></Field>
        </div>
      )}
    />
  );
}

function ContactCardsEditor({ items, onChange }: { items: ContactCard[]; onChange: (items: ContactCard[]) => void }) {
  return (
    <RepeatableCards
      title="Contact cards"
      items={items}
      createItem={(): ContactCard => ({ title: "Email", body: "support@example.com", icon: "mail" })}
      onChange={onChange}
      renderItem={(item, index, update) => (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
          <Field label="Body"><Input className="admin-input" value={item.body} onChange={(event) => update(index, { ...item, body: event.target.value })} /></Field>
          <Field label="Icon">
            <select className="admin-input" value={item.icon} onChange={(event) => update(index, { ...item, icon: event.target.value as ContactCard["icon"] })}>
              <option value="mail">Email</option>
              <option value="phone">Phone</option>
              <option value="map-pin">Map pin</option>
            </select>
          </Field>
        </div>
      )}
    />
  );
}

function FooterPostsEditor({ items, onChange }: { items: FooterPost[]; onChange: (items: FooterPost[]) => void }) {
  return (
    <RepeatableCards
      title="Footer posts"
      items={items}
      createItem={() => ({ title: "New post", date: "May 13, 2026", image: "/images/1.png" })}
      onChange={onChange}
      renderItem={(item, index, update) => (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Title"><Input className="admin-input" value={item.title} onChange={(event) => update(index, { ...item, title: event.target.value })} /></Field>
          <Field label="Date"><Input className="admin-input" value={item.date} onChange={(event) => update(index, { ...item, date: event.target.value })} /></Field>
          <ImageField label="Image" value={item.image} onChange={(image) => update(index, { ...item, image })} />
        </div>
      )}
    />
  );
}

function FooterLinksEditor({ items, onChange }: { items: FooterLinkGroup[]; onChange: (items: FooterLinkGroup[]) => void }) {
  function updateGroup(index: number, group: FooterLinkGroup) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? group : item)));
  }

  function updateLink(groupIndex: number, linkIndex: number, link: FooterLink) {
    const group = items[groupIndex];
    updateGroup(groupIndex, {
      ...group,
      links: group.links.map((item, itemIndex) => (itemIndex === linkIndex ? link : item))
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="Footer link groups" />
        <Button type="button" variant="outline" onClick={() => onChange([...items, { title: "New Links", links: [{ label: "Shop", href: "/shop" }] }])}><Plus className="h-4 w-4" />Add group</Button>
      </div>
      {items.map((group, groupIndex) => (
        <div key={groupIndex} className="rounded-lg border border-[#e9edf2] bg-white p-4">
          <div className="mb-4 flex gap-2">
            <Input className="admin-input" value={group.title} onChange={(event) => updateGroup(groupIndex, { ...group, title: event.target.value })} />
            <IconButton label="Remove group" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== groupIndex))}><Trash2 className="h-4 w-4" /></IconButton>
          </div>
          <div className="space-y-3">
            {group.links.map((link, linkIndex) => (
              <div key={linkIndex} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <Input className="admin-input" value={link.label} placeholder="Label" onChange={(event) => updateLink(groupIndex, linkIndex, { ...link, label: event.target.value })} />
                <Input className="admin-input" value={link.href} placeholder="/shop" onChange={(event) => updateLink(groupIndex, linkIndex, { ...link, href: event.target.value })} />
                <IconButton label="Remove link" onClick={() => updateGroup(groupIndex, { ...group, links: group.links.filter((_, itemIndex) => itemIndex !== linkIndex) })}><Trash2 className="h-4 w-4" /></IconButton>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => updateGroup(groupIndex, { ...group, links: [...group.links, { label: "New link", href: "/shop" }] })}><Plus className="h-4 w-4" />Add link</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#fff0eb] text-[#ff6c2f]">
      {children}
    </button>
  );
}
