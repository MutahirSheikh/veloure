"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatMoney } from "@/lib/formatters";

const cartBenefits = [
  { title: "Bank offer 5% cashback", text: "Available on select orders", icon: ShieldCheck },
  { title: "Enjoy the product", text: "Cash on delivery with concierge confirmation", icon: Truck },
  { title: "Secure checkout", text: "Inventory is reserved once your order is placed", icon: ShieldCheck }
];

export function CartPageClient() {
  const { lines, subtotal, shipping, total, updateLine, removeLine, clear } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto max-w-xl rounded-[28px] border border-black/8 bg-white p-12 shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
          <p className="text-4xl font-black tracking-tight text-[#141414]">Your cart is waiting.</p>
          <p className="mx-auto mt-4 max-w-md text-base leading-8 text-black/55">
            Explore the Veloure shop and add editorial pieces that suit your mood and moment.
          </p>
          <Button className="mt-8 h-12 rounded-full bg-black px-8 text-white hover:bg-black/90" asChild>
            <Link href="/shop">Shop collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="grid gap-10 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
          <div className="hidden grid-cols-[1.5fr_140px_180px_140px_60px] border-b border-black/8 px-8 py-5 text-sm font-bold text-[#141414] md:grid">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span />
          </div>

          {lines.map((line) => (
            <div
              key={line.itemId}
              className="grid gap-4 border-b border-black/8 px-5 py-5 md:grid-cols-[1.5fr_140px_180px_140px_60px] md:items-center md:px-8"
            >
              <div className="grid grid-cols-[72px_1fr] gap-4">
                <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full bg-[#f5f5f5]">
                  <Image src={line.imageUrl || FALLBACK_PRODUCT_IMAGE} alt={line.name} fill className="object-cover" sizes="72px" />
                </div>
                <div>
                  <Link href={`/product/${line.slug}`} className="text-lg font-black tracking-tight text-[#141414] hover:text-[#d4a017]">
                    {line.name}
                  </Link>
                  <p className="mt-1 text-sm text-black/45">{line.variantName}</p>
                </div>
              </div>

              <p className="text-lg font-semibold text-black/70">{formatMoney(line.unitPrice)}</p>

              <div className="inline-flex h-12 w-fit items-center gap-2 rounded-full border border-black/12 bg-white px-2">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
                  onClick={() => updateLine(line.itemId, Math.max(1, line.quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{line.quantity}</span>
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black text-white"
                  onClick={() => updateLine(line.itemId, Math.min(99, line.quantity + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <p className="text-lg font-black text-[#141414]">{formatMoney(line.lineTotal)}</p>

              <button
                aria-label={`Remove ${line.name}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black text-white transition hover:bg-[#ea4c89]"
                onClick={() => removeLine(line.itemId)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <Button asChild variant="outline" className="h-12 rounded-full border-black/12 bg-white px-6">
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <Button className="h-12 rounded-full bg-black px-6 text-white hover:bg-black/90" onClick={clear}>
              Clear cart
            </Button>
          </div>
        </div>

        <aside className="h-fit rounded-[28px] border border-black/12 bg-white p-6 shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
          <h2 className="text-3xl font-black tracking-tight text-[#141414]">Cart total</h2>

          <div className="mt-5 space-y-4">
            {cartBenefits.map((item) => (
              <div key={item.title} className="rounded-[22px] border border-black/10 bg-white p-4">
                <div className="flex items-start gap-3">
                  <item.icon className="mt-1 h-6 w-6 text-[#b78f62]" />
                  <div>
                    <p className="font-semibold text-[#141414]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-black/50">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 rounded-[22px] border border-black/10 bg-white p-5">
            <div className="flex items-center justify-between text-sm text-black/55">
              <span>Subtotal</span>
              <span className="font-semibold text-[#141414]">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-black/55">
              <span>Shipping</span>
              <span className="font-semibold text-[#141414]">{shipping > 0 ? formatMoney(shipping) : "Free"}</span>
            </div>
            <div className="border-t border-black/8 pt-4">
              <div className="flex items-center justify-between text-3xl font-black tracking-tight text-[#141414]">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </div>
          </div>

          <Button className="mt-6 h-12 w-full rounded-full bg-black text-white hover:bg-black/90" asChild>
            <Link href="/checkout">Place order</Link>
          </Button>

          <p className="mt-4 text-sm text-black/50">You will see the final shipping note and cash-on-delivery instructions at checkout.</p>
        </aside>
      </div>
    </div>
  );
}
