import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import type { SearchProductRow, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: SearchProductRow;
  settings: SiteSettings;
  layout?: "grid" | "list";
};

export function ProductCard({ product, settings, layout = "grid" }: ProductCardProps) {
  const price = Number(product.min_price ?? product.base_price);
  const compareAt = product.compare_at_price ? Number(product.compare_at_price) : null;
  const sale = compareAt && compareAt > price ? Math.max(5, Math.round(((compareAt - price) / compareAt) * 100)) : 20;

  if (layout === "list") {
    return (
      <article className="grid gap-5 rounded-lg border border-black/8 bg-white p-4 shadow-[0_18px_40px_rgba(31,24,18,0.05)] md:grid-cols-[220px_1fr]">
        <Link href={`/product/${product.slug}`} className="group relative block overflow-hidden rounded-lg bg-[#f5f5f5]">
          <div className="relative aspect-[4/5]">
            <Image
              src={product.main_image_url || FALLBACK_PRODUCT_IMAGE}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="220px"
            />
          </div>
          <Badge className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#141414]">
            Get {sale}% off
          </Badge>
        </Link>
        <div className="flex flex-col justify-between gap-5 py-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#b78f62]">{product.category_name}</p>
            <Link href={`/product/${product.slug}`} className="mt-2 block text-2xl font-black tracking-tight text-[#141414] hover:text-[#d4a017]">
              {product.name}
            </Link>
            {product.short_description ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/58">{product.short_description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/8 pt-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black text-[#141414]">{formatMoney(price, settings)}</span>
              {compareAt && compareAt > price ? (
                <span className="text-base text-black/35 line-through">{formatMoney(compareAt, settings)}</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <ActionIcon href={`/product/${product.slug}`} label="View product">
                <Eye className="h-4 w-4" />
              </ActionIcon>
              <ActionIcon href={`/product/${product.slug}`} label="Shop product">
                <ShoppingBag className="h-4 w-4" />
              </ActionIcon>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group">
      <div className="relative overflow-hidden rounded-[22px] bg-[#f5f5f5]">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative aspect-[0.82] overflow-hidden">
            <Image
              src={product.main_image_url || FALLBACK_PRODUCT_IMAGE}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 100vw"
            />
          </div>
        </Link>

        <Badge className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#141414]">
          Get {sale}% off
        </Badge>

        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-100 md:opacity-0 md:transition md:duration-300 md:group-hover:opacity-100">
          <ActionIcon href={`/product/${product.slug}`} label="View product">
            <Eye className="h-4 w-4" />
          </ActionIcon>
          <ActionIcon href={`/product/${product.slug}`} label="Shop product">
            <ShoppingBag className="h-4 w-4" />
          </ActionIcon>
        </div>

        {product.total_stock <= 0 ? (
          <Badge variant="destructive" className="absolute bottom-4 left-4 rounded-full px-3 py-1">
            Out of stock
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#b78f62]">{product.category_name}</p>
          <Link href={`/product/${product.slug}`} className="mt-2 block text-lg font-black leading-7 tracking-tight text-[#141414] hover:text-[#d4a017]">
            {product.name}
          </Link>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-black text-[#141414]">{formatMoney(price, settings)}</p>
          {compareAt && compareAt > price ? <p className="text-sm text-black/35 line-through">{formatMoney(compareAt, settings)}</p> : null}
        </div>
      </div>
    </article>
  );
}

function ActionIcon({
  href,
  label,
  children
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(42,32,24,0.18)] text-white backdrop-blur transition",
        "hover:bg-black"
      )}
    >
      {children}
    </Link>
  );
}
