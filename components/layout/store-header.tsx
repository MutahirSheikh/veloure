"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Search, UserRound, X } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

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
  { href: "/contact", label: "Contact" },
  { href: "/account", label: "My Account" }
];

export function StoreHeader({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search${params.size ? `?${params.toString()}` : ""}`);
    setSearchOpen(false);
    setMobileOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/8 bg-white/95 backdrop-blur">
        <div className="container flex h-20 items-center gap-4">
        <Logo />

        <nav className="ml-4 hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="group inline-flex items-center gap-1 text-sm font-semibold text-[#141414]">
              <span>{item.label}</span>
              <span className="text-black/25 transition group-hover:text-[#d4a017]">+</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <SignedOut>
            <div className="flex items-center gap-2 text-sm font-medium text-black/70">
              <Link href="/sign-in" className="hover:text-black">
                Login
              </Link>
              <span>/</span>
              <Link href="/sign-up" className="hover:text-black">
                Register
              </Link>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2">
              <UserRound className="h-4 w-4 text-black/65" />
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
          <button
            type="button"
            aria-label="Toggle search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:border-black hover:bg-black hover:text-white"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <CartButton />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label="Toggle search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <Search className="h-4.5 w-4.5" />
          </button>
          <CartButton />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        </div>

        <div className={cn("border-t border-black/6 bg-white transition", searchOpen ? "block" : "hidden")}>
          <div className="container py-4">
            <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search product"
                  className="h-12 rounded-full border-black/10 bg-white pl-5 pr-12 focus-visible:ring-black"
                  aria-label="Search products"
                />
                <Search className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              </div>
              <Button type="submit" className="h-12 rounded-full bg-black px-7 text-white hover:bg-black/90">
                Search
              </Button>
            </form>
          </div>
        </div>
      </header>

      {mounted
        ? createPortal(
            <div
              className={cn(
                "fixed inset-0 z-[90] lg:hidden",
                mobileOpen ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              <button
                type="button"
                aria-label="Close menu backdrop"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "absolute inset-0 bg-black/25 transition-opacity duration-300",
                  mobileOpen ? "opacity-100" : "opacity-0"
                )}
              />

              <div
                className={cn(
                  "absolute inset-y-0 right-0 flex min-h-dvh w-full max-w-full flex-col overflow-y-auto bg-white shadow-[0_18px_60px_rgba(20,20,20,0.18)] transition-transform duration-300 sm:max-w-[420px]",
                  mobileOpen ? "translate-x-0" : "translate-x-full"
                )}
              >
                <div className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-black/8 bg-white px-5">
                  <Logo />
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 space-y-6 bg-white px-5 py-6">
                  <div className="rounded-2xl bg-[#c79d6a] px-5 py-4 text-sm text-white">
                    Cash on delivery available.{" "}
                    {settings.free_shipping_threshold
                      ? `Free shipping over ${settings.currency_symbol}${settings.free_shipping_threshold}.`
                      : "Premium delivery nationwide."}
                  </div>

                  <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 shadow-sm">
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search product"
                      className="h-12 border-0 bg-transparent px-0 focus-visible:ring-0"
                      aria-label="Search products"
                    />
                    <button type="submit" aria-label="Search">
                      <Search className="h-4 w-4 text-black/50" />
                    </button>
                  </form>

                  <nav className="grid gap-2 text-lg font-semibold text-[#141414]">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl border border-transparent bg-[#fafafa] px-4 py-3 transition hover:border-black/8 hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>

                  <SignedOut>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button asChild className="h-12 rounded-full bg-black text-white hover:bg-black/90">
                        <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                          Login
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="h-12 rounded-full border-black/15 bg-white">
                        <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                          Register
                        </Link>
                      </Button>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
