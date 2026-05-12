import Image from "next/image";
import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import type { SiteSettings } from "@/lib/db/types";
import { acceptedPayments, footerLinkGroups, footerPosts, footerStores } from "@/lib/storefront";

export function StoreFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-black/8 bg-white">
      <div className="container grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <Logo />
          <div className="mt-6 space-y-2 text-sm leading-7 text-black/65">
            <p>Address : 451 Wall Street, UK, London</p>
            <p>E-mail : {settings.support_email}</p>
            <p>Phone : {settings.contact_phone || "(064) 332-1233"}</p>
          </div>
          <div className="mt-7">
            <p className="text-sm font-semibold text-[#141414]">Subscribe To Our Newsletter</p>
            <div className="mt-3 flex max-w-sm items-center rounded-full border border-black/10 bg-white px-4 py-1 shadow-sm">
              <input
                type="email"
                placeholder="Your Email Address"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-black/55"
              />
              <button type="button" aria-label="Subscribe" className="text-xl font-bold text-black">
                -&gt;
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#141414]">Recent Posts</h3>
          <div className="mt-5 space-y-4">
            {footerPosts.map((post) => (
              <div key={post.title} className="grid grid-cols-[60px_1fr] gap-3">
                <div className="relative h-[60px] w-[60px] overflow-hidden rounded-md">
                  <Image src={post.image} alt={post.title} fill className="object-cover" sizes="60px" />
                </div>
                <div>
                  <p className="line-clamp-2 text-sm font-semibold text-[#141414]">{post.title}</p>
                  <p className="mt-1 text-xs text-black/45">{post.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#141414]">Our Stores</h3>
          <div className="mt-5 grid gap-3 text-sm text-black/65">
            {footerStores.map((store) => (
              <p key={store}>{store}</p>
            ))}
          </div>
        </div>

        {footerLinkGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-lg font-bold text-[#141414]">{group.title}</h3>
            <div className="mt-5 grid gap-3 text-sm text-black/65">
              {group.links.map((link) => (
                <Link key={link.label} href={link.href} className="hover:text-black">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-black/8 py-6">
        <div className="container flex flex-col justify-between gap-4 text-sm text-black/60 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-[#ea4c89]">Veloure</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="mr-1 text-black/70">We Accept:</span>
            {acceptedPayments.map((item) => (
              <span key={item} className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[#141414]">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
