import Link from "next/link";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { formatMoney, formatShortDate } from "@/lib/formatters";
import { listCustomerOrders } from "@/lib/queries/orders";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AccountOrdersPage() {
  const [profile, settings] = await Promise.all([redirectIfNotSignedIn(), getSiteSettings()]);
  const orders = await listCustomerOrders(profile.id);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Orders</h1>
      <p className="mt-2 text-muted-foreground">Track COD payment and fulfillment status.</p>
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="font-medium">{order.order_number}</td>
                <td>{formatShortDate(order.placed_at)}</td>
                <td>
                  <StatusBadge status={order.order_status} />
                </td>
                <td>
                  <StatusBadge status={order.payment_status} />
                </td>
                <td>{formatMoney(order.total_amount, settings)}</td>
                <td>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/account/orders/${order.order_number}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
