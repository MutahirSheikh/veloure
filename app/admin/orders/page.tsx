import Link from "next/link";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FULFILLMENT_STATUSES, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import { formatMoney, formatShortDate } from "@/lib/formatters";
import { listAdminOrders } from "@/lib/queries/orders";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const [settings, result] = await Promise.all([
    getSiteSettings(),
    listAdminOrders({
      query: value(params, "q"),
      orderStatus: value(params, "order_status"),
      paymentStatus: value(params, "payment_status"),
      fulfillmentStatus: value(params, "fulfillment_status"),
      from: value(params, "from"),
      to: value(params, "to")
    })
  ]);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Orders</h1>
      <p className="mt-2 text-muted-foreground">Manage cash-on-delivery order status, payment, and fulfillment.</p>
      <form className="mt-8 grid gap-3 rounded-md border border-border bg-card p-4 lg:grid-cols-[1fr_repeat(5,160px)_auto]">
        <Input name="q" placeholder="Search order, customer, email" defaultValue={value(params, "q")} />
        <Select name="order_status" values={ORDER_STATUSES} value={value(params, "order_status")} />
        <Select name="payment_status" values={PAYMENT_STATUSES} value={value(params, "payment_status")} />
        <Select name="fulfillment_status" values={FULFILLMENT_STATUSES} value={value(params, "fulfillment_status")} />
        <Input name="from" type="date" defaultValue={value(params, "from")} />
        <Input name="to" type="date" defaultValue={value(params, "to")} />
        <Button>Filter</Button>
      </form>
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Total</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result.orders.map((order) => (
              <tr key={order.id}>
                <td className="font-medium">{order.order_number}</td>
                <td>
                  <p>{order.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                </td>
                <td><StatusBadge status={order.order_status} /></td>
                <td><StatusBadge status={order.payment_status} /></td>
                <td><StatusBadge status={order.fulfillment_status} /></td>
                <td>{formatMoney(order.total_amount, settings)}</td>
                <td>{formatShortDate(order.placed_at)}</td>
                <td>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/orders/${order.id}`}>View</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Select({ name, values, value }: { name: string; values: readonly string[]; value?: string }) {
  return (
    <select name={name} defaultValue={value ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
      <option value="">Any</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
