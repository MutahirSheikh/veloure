"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";

export function CartDrawer() {
  const { lines, isOpen, closeCart, subtotal, shipping, total, updateLine, removeLine } = useCart();

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <button
        className={cn("absolute inset-0 bg-black/40 transition-opacity", isOpen ? "opacity-100" : "opacity-0")}
        aria-label="Close cart"
        onClick={closeCart}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-soft transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2 font-serif text-xl font-semibold">
            <ShoppingBag className="h-5 w-5" />
            Cart
          </div>
          <button className="rounded-md p-2 hover:bg-muted" onClick={closeCart} aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">Your cart is empty.</p>
              <p className="mt-2 text-sm text-muted-foreground">Add a refined piece from the shop.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {lines.map((line) => (
                <div key={line.itemId} className="grid grid-cols-[76px_1fr] gap-4">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <Image
                      src={line.imageUrl || FALLBACK_PRODUCT_IMAGE}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="76px"
                    />
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/product/${line.slug}`} className="font-medium hover:text-primary" onClick={closeCart}>
                          {line.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{line.variantName}</p>
                      </div>
                      <button
                        className="rounded-sm p-1 text-muted-foreground hover:text-foreground"
                        onClick={() => removeLine(line.itemId)}
                        aria-label={`Remove ${line.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex h-9 items-center overflow-hidden rounded-md border border-border">
                        <button
                          className="px-3"
                          onClick={() => updateLine(line.itemId, Math.max(1, line.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm">{line.quantity}</span>
                        <button
                          className="px-3"
                          onClick={() => updateLine(line.itemId, Math.min(99, line.quantity + 1))}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="font-medium">{formatMoney(line.lineTotal)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-border p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated shipping</span>
              <span>{formatMoney(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <Link href="/cart" onClick={closeCart}>
                View cart
              </Link>
            </Button>
            <Button asChild>
              <Link href="/checkout" onClick={closeCart}>
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
