import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MoveRight } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, getNewArrivals } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.default_seo_title,
    description: settings.default_seo_description,
    alternates: { canonical: "/" }
  };
}

export default async function HomePage() {
  const [settings, featured, arrivals] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(8),
    getNewArrivals(4)
  ]);

  const content = settings.storefront_content;
  const spotlight = featured.slice(0, 4);
  const journalStories = content.journal_section.stories;

  return (
    <>
      <section className="overflow-hidden border-b border-black/8 bg-white">
        <div className="container grid gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-16">
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-white shadow-md">
                <Image src={content.home_hero.avatar_image} alt="Veloure muse" fill className="object-cover" sizes="64px" />
              </div>
              <p className="max-w-[180px] text-sm font-medium leading-6 text-black/55">
                {content.home_hero.supporting_text}
              </p>
            </div>

            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-[#141414] md:text-7xl">
              {settings.homepage_heading} <span className="text-[#d4a017]">{content.home_hero.accent_word}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-black/60">{settings.homepage_subheading}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full bg-black px-7 text-white hover:bg-black/90">
                <Link href={content.home_hero.primary_cta_href}>{content.home_hero.primary_cta_label}</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-black/15 bg-white px-7">
                <Link href={content.home_hero.secondary_cta_href}>{content.home_hero.secondary_cta_label}</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {content.home_hero.spotlight_cards.map((item) => (
                <div key={item.title} className="rounded-[28px] border border-black/8 bg-white p-4 shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-[#f8e1ea]">
                      <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#141414]">{item.title}</p>
                      <p className="mt-1 text-sm font-bold text-[#ea4c89]">
                        {item.price} <span className="font-medium text-black/30 line-through">{item.compare_at}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-[560px] overflow-hidden rounded-[40px] bg-[linear-gradient(180deg,#f7d4dd_0%,#f6bfcd_100%)] px-6 pt-10 shadow-[0_35px_80px_rgba(31,24,18,0.12)]">
              <div className="absolute bottom-8 right-6 inline-flex h-28 w-28 items-center justify-center rounded-full border border-black/10 bg-white/85 text-center text-[11px] font-bold uppercase tracking-[0.26em] text-black/65">
                {content.home_hero.circle_text}
              </div>
              <div className="relative mx-auto aspect-[0.78] max-w-[430px]">
                <Image src={content.home_hero.hero_image} alt="Veloure editorial hero" fill priority className="object-cover object-top" sizes="(min-width: 1024px) 38vw, 100vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container grid gap-8 lg:grid-cols-[360px_1fr] lg:items-center">
          <div className="relative mx-auto h-[360px] w-full max-w-[320px] overflow-hidden rounded-[36px] bg-white/35">
            <Image src={content.collection_section.featured_image} alt={content.collection_section.title} fill className="object-cover" sizes="320px" />
          </div>
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">{content.collection_section.eyebrow}</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">{content.collection_section.title}</h2>
              </div>
              <Link href={content.collection_section.cta_href} className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-sm">
                <MoveRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              {content.collection_section.tiles.map((item) => (
                <Link key={item.title} href={item.href} className="group space-y-3">
                  <div className="relative aspect-[0.88] overflow-hidden rounded-[24px] bg-[#f5f5f5]">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="220px" />
                  </div>
                  <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#141414]">
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="store-section">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">{content.popular_products.eyebrow}</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">{content.popular_products.title}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {content.popular_products.tabs.map((tab, index) => (
                <span
                  key={tab}
                  className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] ${
                    index === 0 ? "bg-black text-white" : "border border-black/10 bg-white text-black/55"
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {spotlight.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
            {featured.slice(4, 8).map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container grid gap-6 lg:grid-cols-2">
          {content.editorial_promos.map((promo) => (
            <div key={promo.title} className={`relative overflow-hidden rounded-[28px] ${promo.background}`}>
              <div className="grid min-h-[280px] gap-4 md:grid-cols-[1fr_0.95fr] md:items-center">
                <div className="p-8 md:p-10">
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-black/45">{promo.eyebrow}</p>
                  <h3 className="mt-4 max-w-sm text-4xl font-black tracking-tight text-[#141414]">{promo.title}</h3>
                  <Button asChild className="mt-6 h-11 rounded-full bg-black px-6 text-white hover:bg-black/90">
                    <Link href={promo.cta_href}>{promo.cta_label}</Link>
                  </Button>
                </div>
                <div className="relative min-h-[280px]">
                  <Image src={promo.image} alt={promo.title} fill className="object-cover" sizes="50vw" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="store-section">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">{content.arrivals_section.eyebrow}</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">{content.arrivals_section.title}</h2>
            </div>
            <Link href={content.arrivals_section.cta_href} className="text-sm font-semibold text-[#141414] hover:text-[#d4a017]">
              {content.arrivals_section.cta_label} -&gt;
            </Link>
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden rounded-[34px] bg-[#d8b8f1]">
              <div className="relative aspect-[1.35]">
                <Image src={content.arrivals_section.featured_image} alt={content.arrivals_section.title} fill className="object-cover" sizes="50vw" />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {arrivals.map((product) => (
                <ProductCard key={product.id} product={product} settings={settings} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">{content.offer_section.eyebrow}</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">{content.offer_section.title}</h2>
            </div>
            <Link href={content.offer_section.cta_href} className="text-sm font-semibold text-[#141414] hover:text-[#d4a017]">
              {content.offer_section.cta_label} -&gt;
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {content.offer_section.banners.map((banner) => (
              <div key={banner.title} className={`relative overflow-hidden rounded-[28px] ${banner.background}`}>
                <div className="absolute left-6 top-6 z-10 max-w-[210px]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">{banner.eyebrow}</p>
                  <h3 className="mt-3 text-4xl font-black tracking-tight text-[#141414]">{banner.title}</h3>
                  <Link href={banner.cta_href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#141414]">
                    {banner.cta_label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="relative aspect-[1.28]">
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" sizes="33vw" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="store-section pt-4">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/35">{content.journal_section.eyebrow}</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">{content.journal_section.title}</h2>
            </div>
            <Button asChild className="h-11 rounded-full bg-black px-5 text-white hover:bg-black/90">
              <Link href={content.journal_section.cta_href}>{content.journal_section.cta_label}</Link>
            </Button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
              <div className="relative aspect-[1.15]">
                <Image src={journalStories[0].image} alt={journalStories[0].title} fill className="object-cover" sizes="60vw" />
              </div>
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/35">{journalStories[0].category}</p>
                <h3 className="mt-3 text-3xl font-black tracking-tight text-[#141414]">{journalStories[0].title}</h3>
                <Link href={journalStories[0].href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#141414]">
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>

            <div className="space-y-6">
              {journalStories.slice(1).map((story) => (
                <article key={story.title} className="grid gap-4 overflow-hidden rounded-[24px] bg-white p-4 shadow-[0_18px_40px_rgba(31,24,18,0.05)] sm:grid-cols-[180px_1fr]">
                  <div className="relative aspect-[1.05] overflow-hidden rounded-[18px]">
                    <Image src={story.image} alt={story.title} fill className="object-cover" sizes="220px" />
                  </div>
                  <div className="py-2">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-black/35">{story.category}</p>
                    <h3 className="mt-3 text-2xl font-black tracking-tight text-[#141414]">{story.title}</h3>
                    <Link href={story.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#141414]">
                      Read more <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
