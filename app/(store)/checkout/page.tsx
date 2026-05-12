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
          <div className="rounded-md border border-border p-10 text-center">
            <h1 className="font-serif text-3xl font-semibold">Your cart is empty.</h1>
            <p className="mt-3 text-muted-foreground">Add a product before placing a COD order.</p>
            <Button className="mt-6" asChild>
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
