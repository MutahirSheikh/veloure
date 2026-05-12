import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { HERO_IMAGE } from "@/lib/constants";
import { getCategories, getFeaturedProducts, getNewArrivals } from "@/lib/queries/catalog";
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
  const [settings, categories, featured, arrivals] = await Promise.all([
    getSiteSettings(),
    getCategories(false),
    getFeaturedProducts(4),
    getNewArrivals(8)
  ]);

  return (
    <>
      <section className="relative isolate min-h-[620px] overflow-hidden">
        <Image src={HERO_IMAGE} alt="Elegant Veloure interior collection" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/88 to-background/15" />
        <div className="container relative z-10 flex min-h-[620px] items-center">
          <div className="max-w-xl py-20">
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Veloure atelier</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-tight md:text-7xl">{settings.homepage_heading}</h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">{settings.homepage_subheading}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/shop">
                  Shop collection <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">About Veloure</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container grid gap-6 py-8 md:grid-cols-3">
          {[
            { icon: Truck, title: "Cash on delivery", text: "Simple COD checkout with order confirmation." },
            { icon: ShieldCheck, title: "Curated quality", text: "Inventory-managed product variants and reliable snapshots." },
            { icon: Sparkles, title: "Premium styling", text: "Minimal, polished shopping across every device." }
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Categories</p>
            <h2 className="mt-2 font-serif text-4xl font-semibold">Featured edits</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href="/shop">View all</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {categories.slice(0, 3).map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group relative min-h-52 overflow-hidden rounded-md bg-muted p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(179,138,94,0.25),transparent_35%)]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Collection</p>
                <h3 className="mt-2 font-serif text-3xl font-semibold">{category.name}</h3>
                <p className="mt-3 max-w-xs text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container pb-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Selection</p>
          <h2 className="mt-2 font-serif text-4xl font-semibold">Featured products</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} settings={settings} />
          ))}
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Just arrived</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold">New arrivals</h2>
            </div>
            <Button asChild>
              <Link href="/shop?new=true">Shop new</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {arrivals.map((product) => (
              <ProductCard key={product.id} product={product} settings={settings} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
