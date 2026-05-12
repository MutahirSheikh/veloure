import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/cart-page-client";
import { PageHero } from "@/components/layout/page-hero";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Veloure cart before checkout."
};

export default function CartPage() {
  return (
    <>
      <PageHero title="Shop Cart" crumb="Shop Cart" />
      <CartPageClient />
    </>
  );
}
