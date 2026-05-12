import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { getSiteSettings } from "@/lib/queries/settings";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const accountNav = [
  { href: "/account", label: "Overview" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" }
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [profile, settings] = await Promise.all([redirectIfNotSignedIn(), getSiteSettings()]);

  return (
    <>
      <StoreHeader settings={settings} />
      <main className="container grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
        <aside className="h-fit rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="font-medium">{profile.full_name || profile.email}</p>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
          <nav className="mt-4 grid gap-1">
            {accountNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn("rounded-md px-3 py-2 text-sm font-medium hover:bg-muted")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </main>
      <StoreFooter settings={settings} />
    </>
  );
}
