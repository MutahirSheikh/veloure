import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, Boxes, FolderTree, Package, Settings, ShoppingBag, Users } from "lucide-react";

import { Logo } from "@/components/layout/logo";
import { redirectIfNotAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings }
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await redirectIfNotAdmin();

  return (
    <div className="min-h-screen bg-muted/45 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-background">
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          <Logo href="/admin" />
          <UserButton afterSignOutUrl="/" />
        </div>
        <nav className="grid gap-1 p-4">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              <item.icon className="h-4 w-4 text-primary" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 p-5 lg:p-8">{children}</main>
    </div>
  );
}
