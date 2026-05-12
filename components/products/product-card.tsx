import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import type { SearchProductRow, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";

export function ProductCard({ product, settings }: { product: SearchProductRow; settings: SiteSettings }) {
  const price = Number(product.min_price ?? product.base_price);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;

  return (
    <article className="group">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden rounded-md bg-muted">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.main_image_url || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute left-3 top-3 flex gap-2">
            {product.is_new_arrival ? <Badge>New</Badge> : null}
            {product.total_stock <= 0 ? <Badge variant="destructive">Out of stock</Badge> : null}
          </div>
        </div>
      </Link>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{product.category_name}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 block font-medium hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-semibold">{formatMoney(price, settings)}</span>
          {compareAt && compareAt > price ? (
            <span className="text-muted-foreground line-through">{formatMoney(compareAt, settings)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
