import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import type { SearchProductRow, SiteSettings } from "@/lib/db/types";

export function ProductGrid({
  products,
  settings,
  view = "grid"
}: {
  products: SearchProductRow[];
  settings: SiteSettings;
  view?: "grid" | "list";
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-black/8 bg-white p-10">
        <EmptyState
          icon={PackageSearch}
          title="No products found"
          description="Try adjusting your search or filters to discover more Veloure pieces."
          action={
            <Button variant="outline" asChild className="rounded-full border-black/15 bg-white">
              <a href="/shop">Reset filters</a>
            </Button>
          }
        />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} settings={settings} layout="list" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} settings={settings} />
      ))}
    </div>
  );
}
