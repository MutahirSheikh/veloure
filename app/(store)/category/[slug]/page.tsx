import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogToolbar } from "@/components/products/catalog-toolbar";
import { Pagination } from "@/components/common/pagination";
import { PageHero } from "@/components/layout/page-hero";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryBySlug, getFilterOptions, listProducts } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, settings] = await Promise.all([getCategoryBySlug(slug), getSiteSettings()]);
  if (!category) return { title: "Category" };
  return {
    title: category.seo_title || category.name,
    description: category.seo_description || category.description || settings.default_seo_description,
    alternates: { canonical: `/category/${category.slug}` }
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, queryParams] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const page = Number(value(queryParams, "page") ?? 1);
  const current = {
    q: value(queryParams, "q"),
    category: category.slug,
    color: value(queryParams, "color"),
    size: value(queryParams, "size"),
    min: value(queryParams, "min"),
    max: value(queryParams, "max"),
    stock: value(queryParams, "stock"),
    featured: value(queryParams, "featured"),
    new: value(queryParams, "new"),
    sort: value(queryParams, "sort"),
    view: value(queryParams, "view") ?? "grid"
  };
  const [settings, options, result] = await Promise.all([
    getSiteSettings(),
    getFilterOptions(),
    listProducts({
      query: current.q,
      categorySlug: category.slug,
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
      <PageHero title={category.name} crumb={category.name} />
      <div className="container py-8 md:py-12">
        <div className="grid gap-5 xl:grid-cols-[260px_1fr] 2xl:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            {category.description ? <p className="text-sm leading-7 text-black/55">{category.description}</p> : null}
            <ProductFilters action={`/category/${category.slug}`} categories={options.categories} colors={options.colors} sizes={options.sizes} current={current} />
          </aside>

          <div>
            <CatalogToolbar page={result.page} pageSize={result.pageSize} total={result.total} current={current} />
            <div className="mt-6">
              <ProductGrid products={result.products} settings={settings} view={current.view === "list" ? "list" : "grid"} />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Pagination page={result.page} totalPages={result.totalPages} basePath={`/category/${category.slug}`} searchParams={queryParams} />
        </div>
      </div>
    </>
  );
}
