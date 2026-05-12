import type { Metadata } from "next";

import { CatalogToolbar } from "@/components/products/catalog-toolbar";
import { Pagination } from "@/components/common/pagination";
import { PageHero } from "@/components/layout/page-hero";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { getFilterOptions, listProducts } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "Shop",
    description: settings.default_seo_description,
    alternates: { canonical: "/shop" }
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(value(params, "page") ?? 1);
  const current = {
    q: value(params, "q"),
    category: value(params, "category"),
    color: value(params, "color"),
    size: value(params, "size"),
    min: value(params, "min"),
    max: value(params, "max"),
    stock: value(params, "stock"),
    featured: value(params, "featured"),
    new: value(params, "new"),
    sort: value(params, "sort"),
    view: value(params, "view") ?? "grid"
  };
  const [settings, options, result] = await Promise.all([
    getSiteSettings(),
    getFilterOptions(),
    listProducts({
      query: current.q,
      categorySlug: current.category,
      color: current.color,
      size: current.size,
      minPrice: current.min ? Number(current.min) : undefined,
      maxPrice: current.max ? Number(current.max) : undefined,
      inStock: current.stock === "in" ? true : undefined,
      featured: current.featured === "true" ? true : undefined,
      newArrival: current.new === "true" ? true : undefined,
      sort: current.sort,
      page
    })
  ]);

  return (
    <>
      <PageHero title="Shop Standard" crumb="Shop Standard" />
      <div className="container py-8 md:py-12">
        <div className="grid gap-5 xl:grid-cols-[260px_1fr] 2xl:grid-cols-[280px_1fr]">
          <aside>
            <ProductFilters action="/shop" categories={options.categories} colors={options.colors} sizes={options.sizes} current={current} />
          </aside>

          <div>
            <CatalogToolbar page={result.page} pageSize={result.pageSize} total={result.total} current={current} />
            <div className="mt-6">
              <ProductGrid products={result.products} settings={settings} view={current.view === "list" ? "list" : "grid"} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Pagination page={result.page} totalPages={result.totalPages} basePath="/shop" searchParams={params} />
        </div>
      </div>
    </>
  );
}
