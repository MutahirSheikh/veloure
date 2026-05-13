import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Check, CreditCard, Edit3, PackageCheck, Store, UserRound } from "lucide-react";

import { InvoiceDownloadButton } from "@/components/admin/invoice-download-button";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { AdminCard, AdminPage, CardHeader, ProductThumb, StatusPill } from "@/components/admin/larkon-ui";
import { Button } from "@/components/ui/button";
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

  const customerAddress =
    typeof order.shipping_address === "object" && order.shipping_address && !Array.isArray(order.shipping_address)
      ? order.shipping_address
      : {};
  const shippingAddressText = [
    customerAddress.address_line_1 ?? "1344 Hershell Hollow Road",
    customerAddress.address_line_2,
    customerAddress.city ?? "Tukwila",
    customerAddress.state,
    customerAddress.postal_code,
    customerAddress.country ?? "United States"
  ]
    .filter(Boolean)
    .join(", ");
  const invoiceData = {
    orderNumber: order.order_number,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    shippingAddress: shippingAddressText,
    placedAt: order.placed_at,
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
    subtotal: Number(order.subtotal_amount),
    shipping: Number(order.shipping_amount),
    total: Number(order.total_amount),
    currencyCode: settings.currency_code,
    currencySymbol: settings.currency_symbol,
    storeName: settings.store_name,
    supportEmail: settings.support_email,
    contactPhone: settings.contact_phone,
    items: order.items.map((item) => ({
      name: item.product_name_snapshot,
      variant: item.variant_name_snapshot,
      sku: item.sku_snapshot,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total)
    }))
  };

  return (
    <AdminPage title="Order Details">
      <div className="grid gap-7 xl:grid-cols-[1fr_360px]">
        <div className="space-y-7">
          <AdminCard className="p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#142044]">{order.order_number}</h2>
                  <StatusPill status={order.payment_status === "paid" ? "Paid" : "Pending"} />
                  <StatusPill status={order.fulfillment_status === "delivered" ? "Ready" : "In Progress"} />
                </div>
                <p className="mt-4 text-sm text-[#53627d]">Order / Order Details / {order.order_number} - {formatDate(order.placed_at)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Refund</Button>
                <Button variant="outline">Return</Button>
                <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Edit Order</Button>
              </div>
            </div>
            <h3 className="mt-8 text-lg font-bold">Progress</h3>
            <div className="mt-7 grid gap-5 md:grid-cols-5">
              {["Order Confirming", "Payment Pending", "Processing", "Shipping", "Delivered"].map((step, index) => (
                <div key={step}>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2f8]">
                    <div className={index < 2 ? "h-full bg-[#25c56f]" : index === 2 ? "h-full w-3/5 bg-[#f8b638]" : "h-full w-0"} />
                  </div>
                  <p className="mt-3 text-sm">{step} {index === 2 ? <span className="text-[#f8b638]">C</span> : null}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-[#e9edf2] pt-5">
              <span className="rounded-lg border border-[#e1e6ef] bg-white px-4 py-2 text-sm">Estimated shipping date : Apr 25 , 2024</span>
              <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Make As Ready To Ship</Button>
            </div>
          </AdminCard>

          <AdminCard>
            <CardHeader title="Product" />
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[850px]">
                <thead><tr><th>Product Name & Size</th><th>Status</th><th>Quantity</th><th>Price</th><th>Text</th><th>Amount</th></tr></thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-4">
                          <ProductThumb src={item.image_url_snapshot || FALLBACK_PRODUCT_IMAGE} alt={item.product_name_snapshot} />
                          <div>
                            <p className="font-medium text-[#142044]">{item.product_name_snapshot}</p>
                            <p className="mt-1 text-sm">Size : {item.variant_name_snapshot || "M"}</p>
                          </div>
                        </div>
                      </td>
                      <td><StatusPill status={index % 2 ? "Packaging" : "Ready"} /></td>
                      <td>{item.quantity}</td>
                      <td>{formatMoney(item.unit_price, settings)}</td>
                      <td>{formatMoney(3 + index, settings)}</td>
                      <td>{formatMoney(item.line_total + 3 + index, settings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>

          <AdminCard>
            <CardHeader title="Order Timeline" />
            <div className="space-y-8 p-7">
              {[
                "The packing has been started",
                "The Invoice has been sent to the customer",
                "The Invoice has been created",
                "Order Payment",
                `4 Order conform by ${order.customer_name}`
              ].map((item, index) => (
                <div key={item} className="relative grid gap-4 border-l border-[#dbe3ee] pl-10 md:grid-cols-[1fr_auto]">
                  <span className="absolute -left-4 top-0 grid h-8 w-8 place-items-center rounded-full bg-[#eef4fa] text-[#19bd62]">
                    {index === 0 ? "C" : <Check className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="font-medium text-[#142044]">{item}</p>
                    <p className="mt-1 text-sm text-[#53627d]">{index === 1 ? `Invoice email was sent to ${order.customer_email}` : `Confirmed by ${order.customer_name}`}</p>
                    {index === 1 ? <Button className="mt-4 bg-[#edf3f9] text-[#142044] hover:bg-[#e4ecf5]">Resend Invoice</Button> : null}
                    {index === 2 ? <InvoiceDownloadButton invoice={invoiceData} /> : null}
                  </div>
                  <p className="text-sm text-[#53627d]">April 23 , 2024, 09:40 am</p>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard className="grid gap-5 p-7 md:grid-cols-4">
            <InfoTile icon={Store} label="Vender" value="Catpiller" />
            <InfoTile icon={CalendarDays} label="Date" value="April 23 , 2024" />
            <InfoTile icon={UserRound} label="Paid By" value={order.customer_name} />
            <InfoTile icon={PackageCheck} label="Reference #IMEMO" value={order.order_number} />
          </AdminCard>
        </div>

        <div className="space-y-7">
          <OrderStatusControls order={order} />
          <AdminCard>
            <CardHeader title="Order Summary" />
            <div className="space-y-5 p-6 text-sm">
              <Line label="Sub Total :" value={formatMoney(order.subtotal_amount, settings)} />
              <Line label="Discount :" value="-60.00" />
              <Line label="Delivery Charge :" value={formatMoney(order.shipping_amount, settings)} />
              <Line label="Estimated Tax (15.5%) :" value="$20.00" />
              <Line label="Total Amount" value={formatMoney(order.total_amount, settings)} bold />
            </div>
          </AdminCard>
          <AdminCard>
            <CardHeader title="Payment Information" />
            <div className="p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef4fa]"><CreditCard className="h-6 w-6 text-[#ff6c2f]" /></span>
                <div>
                  <p className="font-medium">Master Card</p>
                  <p className="mt-1 text-sm">xxxx xxxx xxxx 7812</p>
                </div>
                <Check className="ml-auto h-5 w-5 rounded-full text-[#19bd62]" />
              </div>
              <p className="mt-5 text-sm">Transaction ID : #IDN768139059</p>
              <p className="mt-2 text-sm">Card Holder Name : {order.customer_name}</p>
            </div>
          </AdminCard>
          <AdminCard>
            <CardHeader title="Customer Details" />
            <div className="space-y-5 p-6 text-sm">
              <div className="flex items-center gap-3">
                <Image src="/images/lady-1.png" alt="" width={42} height={42} className="h-11 w-11 rounded-full object-cover" />
                <div><p>{order.customer_name}</p><p className="text-[#ff6c2f]">{order.customer_email}</p></div>
              </div>
              <Detail label="Contact Number" value={order.customer_phone} />
              <Detail label="Shipping Address" value={shippingAddressText} />
              <Detail label="Billing Address" value="Same as shipping address" />
            </div>
          </AdminCard>
          <AdminCard className="overflow-hidden">
            <div className="h-72 bg-[#d9efe8] p-5">
              <div className="grid h-full place-items-center rounded-lg bg-[#c8e6dd] text-center text-[#266b60]">
                <div>
                  <p className="text-lg font-bold">Open in Maps</p>
                  <p className="mt-2">University of Oxford</p>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminPage>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between border-b border-[#e9edf2] pb-4 ${bold ? "text-base font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-bold text-[#142044]">{label}</p>
        <Edit3 className="h-4 w-4 text-[#7d86a1]" />
      </div>
      <p className="mt-2 leading-7 text-[#53627d]">{value}</p>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-r border-[#e9edf2] last:border-r-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-2 text-sm text-[#53627d]">{value}</p>
      </div>
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef4fa] text-[#ff6c2f]"><Icon className="h-6 w-6" /></span>
    </div>
  );
}
