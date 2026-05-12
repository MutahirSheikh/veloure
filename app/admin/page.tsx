import Link from "next/link";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { formatMoney, formatShortDate } from "@/lib/formatters";
import { getAdminDashboardStats } from "@/lib/queries/admin";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminDashboardPage() {
  const [stats, settings] = await Promise.all([getAdminDashboardStats(), getSiteSettings()]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Admin</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Dashboard</h1>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Orders" value={stats.totalOrders.toString()} />
        <Metric label="Paid revenue" value={formatMoney(stats.paidRevenue, settings)} />
        <Metric label="Pending COD" value={stats.pendingCodOrders.toString()} />
        <Metric label="Products" value={stats.totalProducts.toString()} />
        <Metric label="Customers" value={stats.totalCustomers.toString()} />
        <Metric label="Low stock" value={stats.lowStockVariants.length.toString()} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Recent orders</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-primary">
                        {order.order_number}
                      </Link>
                    </td>
                    <td>{order.customer_name}</td>
                    <td>
                      <StatusBadge status={order.order_status} />
                    </td>
                    <td>{formatMoney(order.total_amount, settings)}</td>
                    <td>{formatShortDate(order.placed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Low stock variants</h2>
          <div className="mt-5 space-y-4">
            {stats.lowStockVariants.map((variant) => (
              <div key={variant.id} className="rounded-md border border-border p-4">
                <p className="font-medium">{variant.product_name}</p>
                <p className="text-sm text-muted-foreground">{variant.sku} / {variant.color} / {variant.size}</p>
                <p className="mt-2 text-sm font-semibold text-destructive">{variant.stock_quantity} left</p>
              </div>
            ))}
            {stats.lowStockVariants.length === 0 ? <p className="text-sm text-muted-foreground">No low-stock variants.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold">{value}</p>
    </div>
  );
}
