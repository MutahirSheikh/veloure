import Link from "next/link";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { formatMoney, formatShortDate } from "@/lib/formatters";
import { listCustomerOrders } from "@/lib/queries/orders";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AccountPage() {
  const [profile, settings] = await Promise.all([redirectIfNotSignedIn(), getSiteSettings()]);
  const orders = await listCustomerOrders(profile.id);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Account</h1>
      <p className="mt-2 text-muted-foreground">Welcome back, {profile.full_name || profile.email}.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Orders" value={orders.length.toString()} />
        <Metric
          label="Paid spend"
          value={formatMoney(
            orders.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total_amount), 0),
            settings
          )}
        />
        <Metric label="Last order" value={orders[0] ? formatShortDate(orders[0].placed_at) : "None yet"} />
      </div>
      <section className="mt-8 rounded-md border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-2xl font-semibold">Recent orders</h2>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View all</Link>
          </Button>
        </div>
        <div className="mt-5 divide-y divide-border">
          {orders.slice(0, 5).map((order) => (
            <Link key={order.id} href={`/account/orders/${order.order_number}`} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="font-medium">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">{formatShortDate(order.placed_at)}</p>
              </div>
              <StatusBadge status={order.order_status} />
              <p className="font-semibold">{formatMoney(order.total_amount, settings)}</p>
            </Link>
          ))}
          {orders.length === 0 ? <p className="py-6 text-muted-foreground">No orders yet.</p> : null}
        </div>
      </section>
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
