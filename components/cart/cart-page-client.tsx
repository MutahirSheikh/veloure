"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters";
import { useCart } from "@/components/cart/cart-provider";

export function CartPageClient() {
  const { lines, subtotal, shipping, total, updateLine, removeLine, clear } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <p className="font-serif text-3xl font-semibold">Your cart is waiting.</p>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Explore the Veloure shop and add pieces that suit your space and style.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/shop">Shop collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container grid gap-10 py-14 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-md border border-border">
        <div className="hidden grid-cols-[110px_1fr_140px_140px_120px_60px] bg-muted px-5 py-4 text-sm font-semibold md:grid">
          <span>Image</span>
          <span>Product</span>
          <span>Unit price</span>
          <span>Quantity</span>
          <span>Total</span>
          <span />
        </div>
        {lines.map((line) => (
          <div
            key={line.itemId}
            className="grid gap-4 border-t border-border p-5 md:grid-cols-[110px_1fr_140px_140px_120px_60px] md:items-center"
          >
            <div className="relative aspect-square w-24 overflow-hidden rounded-md bg-muted">
              <Image src={line.imageUrl || FALLBACK_PRODUCT_IMAGE} alt={line.name} fill className="object-cover" sizes="96px" />
            </div>
            <div>
              <Link href={`/product/${line.slug}`} className="font-medium hover:text-primary">
                {line.name}
              </Link>
              <p className="text-sm text-muted-foreground">{line.variantName}</p>
            </div>
            <p>{formatMoney(line.unitPrice)}</p>
            <div className="inline-flex h-10 w-fit items-center overflow-hidden rounded-md border border-border">
              <button className="px-3" onClick={() => updateLine(line.itemId, Math.max(1, line.quantity - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center">{line.quantity}</span>
              <button className="px-3" onClick={() => updateLine(line.itemId, Math.min(99, line.quantity + 1))}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="font-semibold">{formatMoney(line.lineTotal)}</p>
            <button
              aria-label={`Remove ${line.name}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
              onClick={() => removeLine(line.itemId)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-md border border-border p-6">
        <h2 className="font-serif text-2xl font-semibold">Cart totals</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping > 0 ? formatMoney(shipping) : "Calculated at checkout"}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
        <Button className="mt-6 w-full" asChild>
          <Link href="/checkout">Proceed to checkout</Link>
        </Button>
        <Button className="mt-3 w-full" variant="outline" onClick={clear}>
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
