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
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:border-black hover:bg-black hover:text-white"
      onClick={openCart}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea4c89] px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
