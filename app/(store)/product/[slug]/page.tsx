import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/products/product-detail";
import { APP_URL, FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { getProductBySlug, listProducts } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) return { title: "Product" };
  const title = product.seo_title || product.name;
  const description = product.seo_description || product.short_description || settings.default_seo_description;
  const image = product.main_image_url || FALLBACK_PRODUCT_IMAGE;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `${APP_URL}/product/${product.slug}`,
      images: [{ url: image, alt: product.name }]
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);
  if (!product) notFound();

  const related = await listProducts({
    categorySlug: product.category?.slug,
    pageSize: 5
  });

  return <ProductDetail product={product} related={related.products.filter((item) => item.id !== product.id).slice(0, 4)} settings={settings} />;
}
