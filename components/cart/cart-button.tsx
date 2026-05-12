"use client";

import { ShoppingBag } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { lines, openCart } = useCart();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <button
      type="button"
      aria-label="Open cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background hover:bg-muted"
      onClick={openCart}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}
