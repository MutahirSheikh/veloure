import type { Metadata } from "next";
import Link from "next/link";

import { CheckoutForm } from "@/components/forms/checkout-form";
import { PageHero } from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { getCartSnapshot } from "@/lib/queries/cart";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Place a cash-on-delivery Veloure order."
};

export default async function CheckoutPage() {
  const [profile, settings] = await Promise.all([redirectIfNotSignedIn(), getSiteSettings()]);
  const cart = await getCartSnapshot(profile.id);

  return (
    <>
      <PageHero title="Checkout" crumb="Checkout" />
      <div className="container py-12">
        {cart.lines.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[28px] border border-black/8 bg-white p-12 text-center shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
            <h1 className="text-4xl font-black tracking-tight text-[#141414]">Your cart is empty.</h1>
            <p className="mt-4 leading-7 text-black/55">Add a product before placing a COD order.</p>
            <Button className="mt-8 h-12 rounded-full bg-black px-8 text-white hover:bg-black/90" asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <CheckoutForm profile={profile} cart={cart} settings={settings} />
        )}
      </div>
    </>
  );
}
