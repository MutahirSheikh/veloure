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
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-[0_22px_70px_rgba(20,20,20,0.2)] transition-transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-black/8 p-5">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tight text-[#141414]">
            <ShoppingBag className="h-5 w-5" />
            Cart
          </div>
          <button className="rounded-full border border-black/10 bg-white p-2 hover:bg-black hover:text-white" onClick={closeCart} aria-label="Close cart">
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
                <div key={line.itemId} className="grid grid-cols-[76px_1fr] gap-4 rounded-[22px] border border-black/8 bg-white p-3">
                  <div className="relative aspect-square overflow-hidden rounded-[18px] bg-[#f5f5f5]">
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
                        className="rounded-full p-1 text-black/45 hover:bg-black hover:text-white"
                        onClick={() => removeLine(line.itemId)}
                        aria-label={`Remove ${line.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex h-10 items-center gap-2 rounded-full border border-black/12 bg-white px-2">
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white"
                          onClick={() => updateLine(line.itemId, Math.max(1, line.quantity - 1))}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-9 text-center text-sm">{line.quantity}</span>
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white"
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
        <div className="border-t border-black/8 p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/55">Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/55">Estimated shipping</span>
              <span>{formatMoney(shipping)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#141414]">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="outline" asChild className="rounded-full border-black/12 bg-white">
              <Link href="/cart" onClick={closeCart}>
                View cart
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-black text-white hover:bg-black/90">
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
