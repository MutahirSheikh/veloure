import { CircleDollarSign, Clock3, PackageCheck, PackageX, ShoppingCart, Truck, Undo2 } from "lucide-react";

import { ActionButtons, AdminCard, AdminPage, CardHeader, DateFilter, MetricCard, Pager, StatusPill } from "@/components/admin/larkon-ui";
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

const demoOrders = [
  ["#583488/80", "Apr 23 , 2024", "Gail C. Anderson", "Normal", "$1,230.00", "Unpaid", "4", "-", "Draft"],
  ["#456754/80", "Apr 20 , 2024", "Jung S. Ayala", "Normal", "$987.00", "Paid", "2", "-", "Packaging"],
  ["#578246/80", "Apr 19 , 2024", "David A. Arnold", "High", "$1,478.00", "Paid", "5", "#D-57837678", "Completed"],
  ["#348930/80", "Apr 04 , 2024", "Cecile D. Gordon", "Normal", "$720.00", "Refund", "4", "-", "Canceled"],
  ["#391367/80", "Apr 02 , 2024", "William Moreno", "Normal", "$1,909.00", "Paid", "6", "#D-89734235", "Completed"],
  ["#930447/80", "March 28 , 2024", "Alphonse Roy", "High", "$879.00", "Paid", "4", "#D-35227268", "Completed"],
  ["#462397/80", "March 20 , 2024", "Pierpont Marleau", "High", "$1,230.00", "Refund", "2", "-", "Canceled"],
  ["#472356/80", "March 12 , 2024", "Madeleine Gervais", "Normal", "$1,264.00", "Paid", "3", "#D-74922656", "Completed"],
  ["#448226/80", "March 02 , 2024", "Satordi Gaillou", "High", "$1,787.00", "Paid", "4", "-", "Packaging"]
] as const;

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
      to: value(params, "to"),
      pageSize: 12
    })
  ]);

  return (
    <AdminPage title="Orders List">
      <form className="admin-card mb-6 grid gap-3 p-4 lg:grid-cols-[1fr_repeat(5,160px)_auto]">
        <Input name="q" className="admin-input" placeholder="Search order, customer, email" defaultValue={value(params, "q")} />
        <Select name="order_status" values={ORDER_STATUSES} value={value(params, "order_status")} />
        <Select name="payment_status" values={PAYMENT_STATUSES} value={value(params, "payment_status")} />
        <Select name="fulfillment_status" values={FULFILLMENT_STATUSES} value={value(params, "fulfillment_status")} />
        <Input name="from" className="admin-input" type="date" defaultValue={value(params, "from")} />
        <Input name="to" className="admin-input" type="date" defaultValue={value(params, "to")} />
        <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Filter</Button>
      </form>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Payment Refund" value="490" icon={CircleDollarSign} />
        <MetricCard label="Order Cancel" value="241" icon={ShoppingCart} />
        <MetricCard label="Order Shipped" value="630" icon={PackageCheck} />
        <MetricCard label="Order Delivering" value="170" icon={Truck} />
        <MetricCard label="Pending Review" value="210" icon={PackageX} />
        <MetricCard label="Pending Payment" value="608" icon={Clock3} />
        <MetricCard label="Delivered" value="200" icon={PackageCheck} />
        <MetricCard label="In Progress" value="656" icon={Undo2} />
      </div>

      <AdminCard className="mt-7">
        <CardHeader title="All Order List" actions={<DateFilter />} />
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[1100px]">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Created at</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Items</th>
                <th>Delivery Number</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {result.orders.length
                ? result.orders.map((order, index) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.order_number}</td>
                      <td>{formatShortDate(order.placed_at)}</td>
                      <td className="font-medium text-[#ff6c2f]">{order.customer_name}</td>
                      <td>{index % 3 === 0 ? "High" : "Normal"}</td>
                      <td>{formatMoney(order.total_amount, settings)}</td>
                      <td><StatusPill status={order.payment_status === "paid" ? "Paid" : order.payment_status === "refunded" ? "Refund" : "Unpaid"} /></td>
                      <td>{index + 2}</td>
                      <td>{index % 2 ? `#D-${57837678 + index}` : "-"}</td>
                      <td><StatusPill status={order.order_status === "cancelled" ? "Canceled" : order.order_status === "delivered" ? "Completed" : "Packaging"} /></td>
                      <td><ActionButtons viewHref={`/admin/orders/${order.id}`} editHref={`/admin/orders/${order.id}`} /></td>
                    </tr>
                  ))
                : demoOrders.map((order) => (
                    <tr key={order[0]}>
                      <td className="font-medium">{order[0]}</td>
                      <td>{order[1]}</td>
                      <td className="font-medium text-[#ff6c2f]">{order[2]}</td>
                      <td>{order[3]}</td>
                      <td>{order[4]}</td>
                      <td><StatusPill status={order[5]} /></td>
                      <td>{order[6]}</td>
                      <td>{order[7]}</td>
                      <td><StatusPill status={order[8]} /></td>
                      <td><ActionButtons /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <Pager />
      </AdminCard>
    </AdminPage>
  );
}

function Select({ name, values, value }: { name: string; values: readonly string[]; value?: string }) {
  return (
    <select name={name} defaultValue={value ?? ""} className="admin-input">
      <option value="">Any</option>
      {values.map((item) => (
        <option key={item} value={item}>
          {item.replaceAll("_", " ")}
        </option>
      ))}
    </select>
  );
}
