"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  Boxes,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  Gift,
  Grid2X2,
  Heart,
  Menu,
  Moon,
  Package,
  PackageOpen,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  Tags,
  UserCircle,
  Users,
  UsersRound,
  WalletCards
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ href: string; label: string }>;
  badge?: string;
};

const groups: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "General",
    items: [
      { id: "dashboard", href: "/admin", label: "Dashboard", icon: Grid2X2 },
      {
        id: "products",
        href: "/admin/products",
        label: "Products",
        icon: Package,
        children: [
          { href: "/admin/products", label: "List" },
          { href: "/admin/products", label: "Grid" },
          { href: "/admin/products", label: "Details" },
          { href: "/admin/products", label: "Edit" },
          { href: "/admin/products/new", label: "Create" }
        ]
      },
      {
        id: "category",
        href: "/admin/categories",
        label: "Category",
        icon: ClipboardCheck,
        children: [
          { href: "/admin/categories", label: "List" },
          { href: "/admin/categories", label: "Edit" },
          { href: "/admin/categories", label: "Create" }
        ]
      },
      { id: "inventory", href: "/admin/inventory", label: "Inventory", icon: Boxes },
      {
        id: "orders",
        href: "/admin/orders",
        label: "Orders",
        icon: ShoppingBag,
        children: [
          { href: "/admin/orders", label: "List" },
          { href: "/admin/orders", label: "Details" },
          { href: "/admin/orders", label: "Cart" },
          { href: "/admin/orders", label: "Check Out" }
        ]
      },
      { id: "purchases", href: "/admin/inventory", label: "Purchases", icon: WalletCards },
      {
        id: "attributes",
        href: "/admin/attributes",
        label: "Attributes",
        icon: Tags,
        children: [
          { href: "/admin/attributes", label: "List" },
          { href: "/admin/attributes/new", label: "Create" }
        ]
      },
      {
        id: "invoices",
        href: "/admin/invoices",
        label: "Invoices",
        icon: FileText,
        children: [
          { href: "/admin/invoices", label: "List" },
          { href: "/admin/invoices", label: "Details" },
          { href: "/admin/invoices/new", label: "Create" }
        ]
      },
      { id: "settings", href: "/admin/settings", label: "Settings", icon: Settings }
    ]
  },
  {
    title: "Users",
    items: [
      { id: "profile", href: "/admin/customers", label: "Profile", icon: UserCircle },
      { id: "roles", href: "/admin/customers", label: "Roles", icon: UsersRound },
      { id: "permissions", href: "/admin/settings", label: "Permissions", icon: ShieldCheck },
      { id: "customers", href: "/admin/customers", label: "Customers", icon: Users },
      { id: "sellers", href: "/admin/customers", label: "Sellers", icon: PackageOpen }
    ]
  },
  {
    title: "Other",
    items: [
      { id: "coupons", href: "/admin/settings", label: "Coupons", icon: Gift },
      { id: "reviews", href: "/admin/settings", label: "Reviews", icon: Heart }
    ]
  }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="admin-shell min-h-screen overflow-x-hidden bg-[#f7f4f3] text-[#23304f]">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 h-screen overflow-y-auto bg-[#232b34] text-[#99a6b8] transition-all duration-200",
          collapsed ? "lg:w-[84px]" : "lg:w-[280px]",
          "w-[280px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("sticky top-0 z-10 flex h-[86px] items-center justify-between bg-[#232b34]", collapsed ? "px-4" : "px-7")}>
          <Link href="/admin" className={cn("flex items-center gap-2 text-2xl font-black text-white", collapsed && "justify-center")}>
            <ShoppingBasket className="h-7 w-7 fill-[#ff6c2f] text-[#ff6c2f]" />
            {!collapsed ? <span>Veloure</span> : null}
          </Link>
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="grid h-9 w-9 place-items-center rounded-md text-[#7c8798] hover:bg-white/5 hover:text-white"
            onClick={() => setCollapsed((value) => !value)}
          >
            <ChevronRight className={cn("h-5 w-5 transition-transform", !collapsed && "rotate-180")} />
          </button>
        </div>

        <nav className={cn("space-y-6 pb-8", collapsed ? "px-3" : "px-5")}>
          {groups.map((group) => (
            <div key={group.title}>
              {!collapsed ? <p className="mb-3 px-2 text-[11px] font-bold uppercase text-[#687481]">{group.title}</p> : null}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = isNavItemActive(item, pathname);
                  const Icon = item.icon;

                  return (
                    <div key={`${group.title}-${item.label}`}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "relative flex h-10 items-center gap-3 rounded-md px-2 text-[15px] font-medium transition-colors hover:bg-white/5 hover:text-white",
                          collapsed && "justify-center",
                          isActive && "text-white"
                        )}
                      >
                        {isActive ? <span className="absolute -left-5 h-10 w-1 bg-[#ff6c2f]" /> : null}
                        <Icon className={cn("h-5 w-5 text-[#7e8999]", isActive && "text-[#ff6c2f]")} />
                        {!collapsed ? <span className="min-w-0 flex-1">{item.label}</span> : null}
                        {!collapsed && item.badge ? <span className="rounded bg-[#56d2c4] px-1.5 text-[10px] font-bold text-white">{item.badge}</span> : null}
                        {!collapsed && item.children ? <ChevronDown className="h-4 w-4" /> : null}
                      </Link>

                      {item.children && isActive && !collapsed ? (
                        <div className="ml-10 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const childActive = pathname === child.href;
                            return (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  "block rounded px-1 py-1.5 text-[13px] hover:text-white",
                                  childActive ? "font-bold text-white" : "text-[#a7b1bf]"
                                )}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className={cn("flex min-h-screen min-w-0 flex-col transition-[padding] duration-200", collapsed ? "lg:pl-[84px]" : "lg:pl-[280px]")}>
        <header className="sticky top-0 z-30 flex h-[86px] items-center justify-between gap-3 bg-[#f7f4f3]/95 px-4 backdrop-blur lg:px-10">
          <button
            type="button"
            aria-label="Open navigation"
            className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#142044] shadow-sm lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2 text-xl font-black text-[#142044] lg:hidden">
            <ShoppingBasket className="h-6 w-6 fill-[#ff6c2f] text-[#ff6c2f]" />
            <span>Veloure</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <IconButton icon={Moon} />
            <button className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8a94aa] hover:bg-white">
              <Bell className="h-5 w-5 fill-[#8a94aa]/30" />
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#f05b61] text-[11px] font-bold text-white">3</span>
            </button>
            <IconButton icon={Settings} />
            <IconButton icon={Clock3} />
            <UserButton afterSignOutUrl="/" />
            <label className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#74809b]" />
              <input
                className="h-12 w-[180px] rounded-lg border-0 bg-[#ebe8e7] pl-11 pr-4 text-sm outline-none placeholder:text-[#67728c] xl:w-[230px]"
                placeholder="Search..."
              />
            </label>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-4 pb-9 sm:px-5 lg:px-10">{children}</main>
        <footer className="py-7 text-center text-sm text-[#818aa7]">
          2026 © Veloure. Crafted by <span className="text-[#ff6c2f]">Techzaa</span>
        </footer>
      </div>
    </div>
  );
}

function IconButton({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#8a94aa] hover:bg-white">
      <Icon className="h-5 w-5 fill-[#8a94aa]/20" />
    </button>
  );
}

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.id === "dashboard") return pathname === "/admin";
  if (item.id === "settings") return pathname === "/admin/settings";
  if (item.href === "/admin/settings") return false;
  if (item.href === "/admin/customers") return item.id === "customers" && pathname.startsWith("/admin/customers");
  if (item.href === "/admin/inventory") return item.id === "inventory" && pathname.startsWith("/admin/inventory");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
