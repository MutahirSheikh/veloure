"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { CartButton } from "@/components/cart/cart-button";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteSettings } from "@/lib/db/types";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function StoreHeader({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground">
        Cash on delivery available. {settings.free_shipping_threshold ? "Free shipping over " + settings.currency_symbol + settings.free_shipping_threshold : "Premium delivery nationwide"}.
      </div>
      <div className="container flex h-20 items-center gap-5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={submitSearch} className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-full border border-border bg-muted/50 px-3 md:flex">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="h-11 border-0 bg-transparent focus-visible:ring-0"
            aria-label="Search products"
          />
          <button aria-label="Search" className="rounded-full bg-primary p-2 text-primary-foreground">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <CartButton />
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <Button size="sm" variant="outline" className="hidden sm:inline-flex">
              Sign in
            </Button>
          </SignInButton>
        </SignedOut>
        <button className="rounded-md p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          <Logo />
          <button className="rounded-md p-2 hover:bg-muted" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-border px-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="border-0 focus-visible:ring-0"
              aria-label="Search products"
            />
            <button aria-label="Search" className="rounded-full bg-primary p-2 text-primary-foreground">
              <Search className="h-4 w-4" />
            </button>
          </form>
          <nav className="grid gap-2 text-lg font-medium">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-3 hover:bg-muted">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
