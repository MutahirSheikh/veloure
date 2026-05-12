"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";

import { MarkdownPreview } from "@/components/common/markdown-preview";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import type { ProductWithRelations, SearchProductRow, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";

export function ProductDetail({
  product,
  related,
  settings
}: {
  product: ProductWithRelations;
  related: SearchProductRow[];
  settings: SiteSettings;
}) {
  const router = useRouter();
  const { addLine } = useCart();
  const activeVariants = product.variants.filter((variant) => variant.is_active);
  const firstVariant = activeVariants.find((variant) => variant.stock_quantity > 0) ?? activeVariants[0];
  const [selectedVariantId, setSelectedVariantId] = React.useState(firstVariant?.id ?? "");
  const [quantity, setQuantity] = React.useState(1);
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? firstVariant;
  const imageList = [
    selectedVariant?.image_url,
    product.main_image_url,
    ...product.images.map((image) => image.image_url)
  ].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = React.useState(imageList[0] || FALLBACK_PRODUCT_IMAGE);

  React.useEffect(() => {
    if (selectedVariant?.image_url) setActiveImage(selectedVariant.image_url);
  }, [selectedVariant?.image_url]);

  if (!selectedVariant) {
    return (
      <div className="container py-16">
        <div className="rounded-md border border-border p-10 text-center">
          <h1 className="font-serif text-3xl font-semibold">{product.name}</h1>
          <p className="mt-3 text-muted-foreground">This product is not currently available.</p>
        </div>
      </div>
    );
  }

  const price = Number(selectedVariant.price ?? product.base_price);
  const compareAt = selectedVariant.compare_at_price ?? product.compare_at_price;
  const colors = [...new Set(activeVariants.map((variant) => variant.color))];
  const sizesForColor = activeVariants.filter((variant) => variant.color === selectedVariant.color);
  const inStock = selectedVariant.stock_quantity > 0;

  async function addToCart(goToCheckout = false) {
    await addLine({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      slug: product.slug,
      imageUrl: selectedVariant.image_url ?? product.main_image_url,
      variantName: `${selectedVariant.color} / ${selectedVariant.size}`,
      sku: selectedVariant.sku,
      unitPrice: price,
      quantity,
      stock: selectedVariant.stock_quantity
    });
    if (goToCheckout) router.push("/checkout");
  }

  return (
    <div className="container py-14">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-[92px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:block md:space-y-3">
            {[...new Set(imageList.length ? imageList : [FALLBACK_PRODUCT_IMAGE])].map((image) => (
              <button
                key={image}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted",
                  activeImage === image ? "border-primary" : "border-border"
                )}
                onClick={() => setActiveImage(image)}
                aria-label="Select product image"
              >
                <Image src={image} alt={product.name} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
          <div className="relative order-1 aspect-square overflow-hidden rounded-md bg-muted md:order-2">
            <Image src={activeImage} alt={product.name} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{product.category?.name ?? "Veloure"}</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-3xl font-semibold">{formatMoney(price, settings)}</p>
            {compareAt && Number(compareAt) > price ? (
              <p className="text-lg text-muted-foreground line-through">{formatMoney(compareAt, settings)}</p>
            ) : null}
          </div>
          <p className="mt-5 max-w-xl leading-7 text-muted-foreground">{product.short_description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {inStock ? <Badge variant="success">{selectedVariant.stock_quantity} in stock</Badge> : <Badge variant="destructive">Out of stock</Badge>}
            {product.is_new_arrival ? <Badge>New arrival</Badge> : null}
            {product.is_featured ? <Badge variant="secondary">Featured</Badge> : null}
          </div>

          <div className="mt-8 space-y-6">
            <div>
              <p className="mb-3 text-sm font-semibold">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const variant = activeVariants.find((item) => item.color === color) ?? selectedVariant;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm",
                        selectedVariant.color === color ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      )}
                    >
                      {selectedVariant.color === color ? <Check className="h-4 w-4" /> : null}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-medium",
                      selectedVariant.id === variant.id ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      variant.stock_quantity <= 0 && "opacity-50"
                    )}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 items-center overflow-hidden rounded-md border border-border">
                <button className="px-4" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  className="px-4"
                  onClick={() => setQuantity((value) => Math.min(selectedVariant.stock_quantity || 99, value + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button disabled={!inStock} onClick={() => addToCart(false)}>
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </Button>
              <Button disabled={!inStock} variant="secondary" onClick={() => addToCart(true)}>
                <Zap className="h-4 w-4" />
                Buy now
              </Button>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
            <p>SKU: {selectedVariant.sku}</p>
            <p>Payment: cash on delivery</p>
          </div>
        </div>
      </div>

      <section className="mt-16 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="space-y-3">
          <div className="rounded-md bg-primary px-5 py-4 font-semibold text-primary-foreground">Description</div>
          <div className="rounded-md border border-border px-5 py-4 font-semibold">Additional information</div>
        </div>
        <div>
          <MarkdownPreview value={product.description_markdown} />
          {product.custom_attributes && typeof product.custom_attributes === "object" && !Array.isArray(product.custom_attributes) ? (
            <div className="mt-8 grid gap-3 rounded-md border border-border p-5 sm:grid-cols-2">
              {Object.entries(product.custom_attributes).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{key}</p>
                  <p className="mt-1 font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-16">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">You may also like</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">Related pieces</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} settings={settings} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
