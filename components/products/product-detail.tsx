"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Facebook, Instagram, Minus, Plus, ShieldCheck, ShoppingBag, Star, Truck, Twitter, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { MarkdownPreview } from "@/components/common/markdown-preview";
import { ProductCard } from "@/components/products/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import type { ProductWithRelations, SearchProductRow, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type DetailTab = "description" | "details";
const DESKTOP_THUMBNAIL_WINDOW = 5;
const DESKTOP_THUMBNAIL_SIZE = 80;
const DESKTOP_THUMBNAIL_GAP = 12;

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
  const [tab, setTab] = React.useState<DetailTab>("description");
  const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId) ?? firstVariant;
  const uniqueImages = React.useMemo(() => {
    const imageList = [
      selectedVariant?.image_url,
      product.main_image_url,
      ...product.images.map((image) => image.image_url)
    ].filter(Boolean) as string[];

    return [...new Set(imageList.length ? imageList : [FALLBACK_PRODUCT_IMAGE])];
  }, [product.images, product.main_image_url, selectedVariant?.image_url]);
  const [activeImage, setActiveImage] = React.useState(uniqueImages[0] || FALLBACK_PRODUCT_IMAGE);
  const [thumbnailStart, setThumbnailStart] = React.useState(0);
  const activeImageIndex = Math.max(0, uniqueImages.findIndex((image) => image === activeImage));
  const maxThumbnailStart = Math.max(0, uniqueImages.length - DESKTOP_THUMBNAIL_WINDOW);
  const desktopThumbnailHeight =
    Math.min(uniqueImages.length, DESKTOP_THUMBNAIL_WINDOW) * DESKTOP_THUMBNAIL_SIZE +
    (Math.min(uniqueImages.length, DESKTOP_THUMBNAIL_WINDOW) - 1) * DESKTOP_THUMBNAIL_GAP;
  const desktopThumbnailOffset = thumbnailStart * (DESKTOP_THUMBNAIL_SIZE + DESKTOP_THUMBNAIL_GAP);

  React.useEffect(() => {
    if (selectedVariant?.image_url) setActiveImage(selectedVariant.image_url);
  }, [selectedVariant?.image_url]);

  React.useEffect(() => {
    if (!uniqueImages.includes(activeImage)) {
      setActiveImage(uniqueImages[0] || FALLBACK_PRODUCT_IMAGE);
    }
  }, [activeImage, uniqueImages]);

  React.useEffect(() => {
    setThumbnailStart((current) => {
      if (uniqueImages.length <= DESKTOP_THUMBNAIL_WINDOW) return 0;
      if (activeImageIndex < current) return activeImageIndex;
      if (activeImageIndex >= current + DESKTOP_THUMBNAIL_WINDOW) {
        return Math.min(activeImageIndex - DESKTOP_THUMBNAIL_WINDOW + 1, maxThumbnailStart);
      }
      return current;
    });
  }, [activeImageIndex, maxThumbnailStart, uniqueImages.length]);

  if (!selectedVariant) {
    return (
      <div className="container py-16">
        <div className="store-card p-10 text-center">
          <h1 className="text-3xl font-black tracking-tight text-[#141414]">{product.name}</h1>
          <p className="mt-3 text-black/55">This product is not currently available.</p>
        </div>
      </div>
    );
  }

  const price = Number(selectedVariant.price ?? product.base_price);
  const compareAt = selectedVariant.compare_at_price ?? product.compare_at_price;
  const colors = [...new Set(activeVariants.map((variant) => variant.color))];
  const sizesForColor = activeVariants.filter((variant) => variant.color === selectedVariant.color);
  const inStock = selectedVariant.stock_quantity > 0;
  const sale = compareAt && Number(compareAt) > price ? Math.max(5, Math.round(((Number(compareAt) - price) / Number(compareAt)) * 100)) : 20;

  const specificationEntries =
    product.custom_attributes && typeof product.custom_attributes === "object" && !Array.isArray(product.custom_attributes)
      ? Object.entries(product.custom_attributes)
      : [
          ["SKU", selectedVariant.sku],
          ["Category", product.category?.name ?? "Veloure"],
          ["Color", selectedVariant.color],
          ["Size", selectedVariant.size],
          ["Stock", selectedVariant.stock_quantity]
        ];

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
    <div className="container py-8 md:py-12">
      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-black/45">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>{">"}</span>
        <Link href="/shop" className="hover:text-black">
          Shop
        </Link>
        <span>{">"}</span>
        <span className="text-[#141414]">{product.name}</span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.14fr)_minmax(460px,0.86fr)] 2xl:grid-cols-[minmax(0,1.2fr)_minmax(500px,0.8fr)]">
        <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:hidden">
            {uniqueImages.map((image) => (
              <button
                key={image}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white",
                  activeImage === image ? "border-black" : "border-black/10"
                )}
                onClick={() => setActiveImage(image)}
                aria-label="Select product image"
              >
                <Image src={image} alt={product.name} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>

          <div className="order-2 hidden lg:flex lg:flex-col lg:items-center lg:gap-2">
            {uniqueImages.length > DESKTOP_THUMBNAIL_WINDOW ? (
              <button
                type="button"
                onClick={() => setThumbnailStart((value) => Math.max(0, value - 1))}
                disabled={thumbnailStart === 0}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#141414] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Show previous product images"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            ) : null}

            <div className="overflow-hidden" style={{ height: `${desktopThumbnailHeight}px` }}>
              <div
                className="flex flex-col gap-3 transition-transform duration-300 ease-out"
                style={{ transform: `translateY(-${desktopThumbnailOffset}px)` }}
              >
                {uniqueImages.map((image) => (
                  <button
                    key={image}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-white",
                      activeImage === image ? "border-black" : "border-black/10"
                    )}
                    onClick={() => setActiveImage(image)}
                    aria-label="Select product image"
                  >
                    <Image src={image} alt={product.name} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            </div>

            {uniqueImages.length > DESKTOP_THUMBNAIL_WINDOW ? (
              <button
                type="button"
                onClick={() => setThumbnailStart((value) => Math.min(maxThumbnailStart, value + 1))}
                disabled={thumbnailStart === maxThumbnailStart}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-[#141414] transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Show more product images"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="relative order-1 overflow-hidden rounded-[24px] bg-[#d8edf8] lg:order-2">
            <div className="relative aspect-[1] xl:aspect-[1.08] 2xl:aspect-[1.12]">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1536px) 57vw, (min-width: 1280px) 55vw, (min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="w-full max-w-[600px]">
            <Badge className="rounded-full bg-black px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white">
              Sale {sale}% off
            </Badge>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#141414] md:text-5xl">{product.name}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/55">
              <div className="flex items-center gap-1 text-[#f59e0b]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={cn("h-4 w-4", index < 4 ? "fill-current" : "")} />
                ))}
              </div>
              <p>4.7 Rating</p>
              <p>(5 customer reviews)</p>
            </div>

            <p className="mt-4 max-w-[34rem] text-base leading-7 text-black/60">
              {product.short_description || "This comfortable collection piece brings a bold editorial energy to every day dressing."}
            </p>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-4xl font-black text-[#141414]">{formatMoney(price, settings)}</p>
              {compareAt && Number(compareAt) > price ? (
                <p className="text-xl text-black/30 line-through">{formatMoney(Number(compareAt), settings)}</p>
              ) : null}
            </div>

            <div className="mt-6 grid gap-x-5 gap-y-4 sm:grid-cols-[148px_132px_minmax(0,1fr)]">
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#141414]">Quantity</p>
                <div className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/12 bg-white px-1.5">
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
                    onClick={() => setQuantity((value) => Math.min(selectedVariant.stock_quantity || 99, value + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#141414]">Size</p>
                <div className="flex flex-wrap gap-1.5">
                  {sizesForColor.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={cn(
                        "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
                        selectedVariant.id === variant.id
                          ? "border-black bg-black text-white"
                          : "border-black/12 bg-white text-black/65",
                        variant.stock_quantity <= 0 && "opacity-40"
                      )}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#141414]">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {colors.map((color) => {
                    const variant = activeVariants.find((item) => item.color === color) ?? selectedVariant;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={cn(
                          "inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold transition",
                          selectedVariant.color === color ? "border-black bg-black text-white" : "border-black/12 bg-white text-black/65"
                        )}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                disabled={!inStock}
                onClick={() => addToCart(false)}
                className="h-12 min-w-[170px] justify-center rounded-full bg-black px-7 text-white hover:bg-black/90"
              >
                <ShoppingBag className="h-4 w-4" />
                Add to cart
              </Button>
              <Button
                disabled={!inStock}
                onClick={() => addToCart(true)}
                variant="outline"
                className="h-12 min-w-[170px] justify-center rounded-full border-black/15 bg-white px-7 text-[#141414] hover:bg-black hover:text-white"
              >
                <Zap className="h-4 w-4" />
                Buy now
              </Button>
            </div>

            <div className="mt-6 border-t border-black/8 pt-5">
              <div className="space-y-2.5 text-sm text-black/60">
                <p>
                  <span className="font-semibold text-[#141414]">SKU:</span> {selectedVariant.sku}
                </p>
                <p>
                  <span className="font-semibold text-[#141414]">Category:</span> {product.category?.name ?? "Veloure"}
                </p>
                {product.tags?.length ? (
                  <p>
                    <span className="font-semibold text-[#141414]">Tags:</span> {product.tags.join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-3 text-black">
                {[Facebook, Instagram, Twitter].map((Icon, index) => (
                  <span key={index} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white">
                    <Icon className="h-4 w-4" />
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Truck className="h-7 w-7 text-[#b78f62]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">Free</p>
                      <p className="font-semibold text-[#141414]">Shipping</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-[#b78f62]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">Easy Returns</p>
                      <p className="font-semibold text-[#141414]">30 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-14">
        <div className="flex flex-wrap items-center justify-center gap-6 border-b border-black/8">
          <button
            type="button"
            onClick={() => setTab("description")}
            className={cn(
              "border-b-2 px-2 pb-4 text-sm font-semibold transition",
              tab === "description" ? "border-black text-[#141414]" : "border-transparent text-black/45"
            )}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setTab("details")}
            className={cn(
              "border-b-2 px-2 pb-4 text-sm font-semibold transition",
              tab === "details" ? "border-black text-[#141414]" : "border-transparent text-black/45"
            )}
          >
            Specifications
          </button>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#141414]">
              {tab === "description" ? "Fits Women" : "Product specifications"}
            </h2>
            <div className="mt-5 text-black/60">
              {tab === "description" ? (
                <MarkdownPreview value={product.description_markdown} />
              ) : (
                <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
                  {specificationEntries.map(([key, value]) => (
                    <div key={key} className="grid gap-2 border-b border-black/8 px-5 py-4 text-sm last:border-b-0 sm:grid-cols-[200px_1fr]">
                      <span className="font-medium text-black/45">{key}</span>
                      <span className="font-semibold text-[#141414]">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {["All-in-one dress", "Looking wise good", "100% Made In India", "100% Cotton"].map((item) => (
                <div key={item} className="rounded-2xl border border-black/10 bg-white p-5">
                  <p className="text-lg font-black tracking-tight text-[#141414]">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-black/50">
                    Lorem ipsum is simply dummy text of the printing and typesetting industry.
                  </p>
                </div>
              ))}
            </div>
            <div className="relative overflow-hidden rounded-[24px] bg-[#d8edf8]">
              <div className="relative aspect-[1.02]">
                <Image src={activeImage} alt={product.name} fill className="object-cover" sizes="(min-width: 1280px) 42vw, 100vw" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-20">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/38">Related Products</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-[#141414]">You may also like</h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-[#141414] hover:text-[#d4a017]">
              See all products -&gt;
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} settings={settings} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
