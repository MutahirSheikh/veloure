import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/constants";
import { getCategories, listProducts } from "@/lib/queries/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productResult] = await Promise.all([
    getCategories(false),
    listProducts({ pageSize: 60 })
  ]);

  const staticRoutes = ["", "/shop", "/search", "/about", "/contact"].map((path) => ({
    url: `${APP_URL}${path}`,
    lastModified: new Date()
  }));

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${APP_URL}/category/${category.slug}`,
      lastModified: new Date(category.updated_at)
    })),
    ...productResult.products.map((product) => ({
      url: `${APP_URL}/product/${product.slug}`,
      lastModified: new Date(product.created_at)
    }))
  ];
}
