import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import type { SiteSettings } from "@/lib/db/types";

export function StoreFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-[#171614] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            Veloure curates fashion and lifestyle pieces with a premium, minimal point of view.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Services</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <Link href="/account">Account</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/contact">Support</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Company</h3>
          <div className="mt-5 grid gap-3 text-sm text-white/65">
            <Link href="/">Home</Link>
            <Link href="/shop">Shop</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold">Contact</h3>
          <div className="mt-5 grid gap-4 text-sm text-white/65">
            <p className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary" />
              4517 Washington Ave, Manchester
            </p>
            {settings.contact_phone ? (
              <p className="flex gap-3">
                <Phone className="h-5 w-5 text-primary" />
                {settings.contact_phone}
              </p>
            ) : null}
            <p className="flex gap-3">
              <Mail className="h-5 w-5 text-primary" />
              {settings.support_email}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col justify-between gap-3 text-sm text-white/55 md:flex-row">
          <p>© {new Date().getFullYear()} Veloure. All rights reserved.</p>
          <p>Cash on delivery today. Online payment-ready architecture for tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}
