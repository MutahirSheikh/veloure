import Image from "next/image";
import { notFound } from "next/navigation";

import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { StatusBadge } from "@/components/common/status-badge";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { formatDate, formatMoney } from "@/lib/formatters";
import { getOrderByIdAdmin } from "@/lib/queries/orders";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailsPage({ params }: Props) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderByIdAdmin(id), getSiteSettings()]);
  if (!order) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">{order.order_number}</h1>
          <p className="mt-2 text-muted-foreground">Placed {formatDate(order.placed_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.order_status} />
          <StatusBadge status={order.payment_status} />
          <StatusBadge status={order.fulfillment_status} />
        </div>
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold">Customer</h2>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <p><span className="text-muted-foreground">Name:</span> {order.customer_name}</p>
              <p><span className="text-muted-foreground">Email:</span> {order.customer_email}</p>
              <p><span className="text-muted-foreground">Phone:</span> {order.customer_phone}</p>
            </div>
          </section>
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold">Items</h2>
            <div className="mt-5 divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="grid gap-4 py-4 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                  <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                    <Image src={item.image_url_snapshot || FALLBACK_PRODUCT_IMAGE} alt={item.product_name_snapshot} fill className="object-cover" sizes="72px" />
                  </div>
                  <div>
                    <p className="font-medium">{item.product_name_snapshot}</p>
                    <p className="text-sm text-muted-foreground">{item.variant_name_snapshot} / {item.sku_snapshot} x {item.quantity}</p>
                  </div>
                  <p className="font-semibold">{formatMoney(item.line_total, settings)}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold">Timeline</h2>
            <div className="mt-5 space-y-4">
              {order.history.map((item) => (
                <div key={item.id} className="border-l-2 border-primary pl-3 text-sm">
                  <p className="font-medium">{item.note || "Status updated"}</p>
                  <p className="text-muted-foreground">{formatDate(item.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-8">
          <OrderStatusControls order={order} />
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="font-serif text-2xl font-semibold">Totals</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatMoney(order.subtotal_amount, settings)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatMoney(order.shipping_amount, settings)}</span></div>
              <div className="flex justify-between text-lg font-semibold"><span>Total</span><span>{formatMoney(order.total_amount, settings)}</span></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
