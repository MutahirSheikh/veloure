import Image from "next/image";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/common/status-badge";
import { FALLBACK_PRODUCT_IMAGE } from "@/lib/constants";
import { redirectIfNotSignedIn } from "@/lib/auth/guards";
import { formatDate, formatMoney } from "@/lib/formatters";
import { getOrderByNumberForProfile } from "@/lib/queries/orders";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  params: Promise<{ orderNumber: string }>;
};

export default async function AccountOrderDetailsPage({ params }: Props) {
  const [{ orderNumber }, profile, settings] = await Promise.all([params, redirectIfNotSignedIn(), getSiteSettings()]);
  const order = await getOrderByNumberForProfile(orderNumber, profile.id);
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
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
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
                  <p className="text-sm text-muted-foreground">{item.variant_name_snapshot} x {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatMoney(item.line_total, settings)}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="h-fit rounded-md border border-border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Timeline</h2>
          <div className="mt-5 space-y-4">
            {order.history.map((item) => (
              <div key={item.id} className="border-l-2 border-primary pl-3 text-sm">
                <p className="font-medium">{item.note || "Status updated"}</p>
                <p className="text-muted-foreground">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatMoney(order.subtotal_amount, settings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatMoney(order.shipping_amount, settings)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.total_amount, settings)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
