import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, Medal, ShoppingBasket, WalletCards } from "lucide-react";

import { AdminCard, AdminPage, CardHeader, MetricCard, Pager, StatusPill } from "@/components/admin/larkon-ui";
import { Button } from "@/components/ui/button";
import { formatMoney, formatShortDate } from "@/lib/formatters";
import { getAdminDashboardStats } from "@/lib/queries/admin";
import { getSiteSettings } from "@/lib/queries/settings";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const bars = [33, 64, 45, 67, 48, 60, 41, 43, 77, 51, 62, 66];
const demoRows = [
  ["#RB5625", "29 April 2024", "/images/1.png", "Anna M. Hines", "anna.hines@mail.com", "(+1)-555-1564-261", "Burr Ridge/Illinois", "Credit Card", "Completed"],
  ["#RB9652", "25 April 2024", "/images/2.png", "Judith H. Fritsche", "judith.fritsche.com", "(+57)-305-5579-759", "SULLIVAN/Kentucky", "Credit Card", "Completed"],
  ["#RB5984", "25 April 2024", "/images/3.png", "Peter T. Smith", "peter.smith@mail.com", "(+33)-655-5187-93", "Yreka/California", "Pay Pal", "Completed"],
  ["#RB3625", "21 April 2024", "/images/4.png", "Emmanuel J. Delcid", "emmanuel.delcid@mail.com", "(+30)-693-5553-637", "Atlanta/Georgia", "Pay Pal", "Processing"],
  ["#RB8652", "18 April 2024", "/images/5.png", "William J. Cook", "william.cook@mail.com", "(+91)-855-5446-150", "Rosenberg/Texas", "Credit Card", "Processing"]
];

export default async function AdminDashboardPage() {
  const [stats, settings] = await Promise.all([getAdminDashboardStats(), getSiteSettings()]);
  const recentRows = stats.recentOrders.length
    ? stats.recentOrders.map((order, index) => [
        order.order_number,
        formatShortDate(order.placed_at),
        `/images/${(index % 7) + 1}.png`,
        order.customer_name,
        order.customer_email,
        order.customer_phone,
        "Customer address",
        order.payment_method.toUpperCase(),
        order.order_status
      ])
    : demoRows;

  return (
    <AdminPage title="Welcome!">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.25fr]">
        <div>
          <div className="mb-6 rounded-lg bg-[#ffdcca] px-6 py-3 text-sm font-medium text-[#743119]">
            We regret to inform you that our server is currently experiencing technical difficulties.
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <MetricCard label="Total Orders" value={stats.totalOrders || "13, 647"} icon={ShoppingBasket} />
            <MetricCard label="New Leads" value={stats.totalCustomers || "9, 526"} icon={Medal} />
            <MetricCard label="Deals" value={stats.totalProducts || "976"} icon={BriefcaseBusiness} />
            <MetricCard label="Booked Revenue" value={stats.paidRevenue ? formatMoney(stats.paidRevenue, settings) : "$123.6k"} icon={WalletCards} />
          </div>
        </div>
        <AdminCard className="p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#142044]">Performance</h2>
            <div className="flex gap-2">
              {["All", "1M", "6M", "1Y"].map((item) => (
                <button key={item} className="rounded-lg border border-[#e5e9f1] px-3 py-2 text-sm last:bg-[#eef3f9]">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-[250px]">
            <div className="absolute inset-x-0 bottom-9 top-2 grid grid-rows-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className="border-t border-dashed border-[#e9edf4]" />
              ))}
            </div>
            <div className="absolute inset-x-8 bottom-9 flex h-[210px] items-end justify-between">
              {bars.map((height, index) => (
                <div key={months[index]} className="relative flex h-full w-8 items-end justify-center">
                  <span className="w-5 rounded bg-[#ff6c2f]" style={{ height: `${height}%` }} />
                  <span
                    className="absolute bottom-0 h-1 w-14 rounded-full bg-[#20c66b]"
                    style={{ transform: `translateY(-${Math.max(8, height / 2)}px) rotate(${index % 3 === 0 ? "-18deg" : "12deg"})` }}
                  />
                </div>
              ))}
            </div>
            <div className="absolute inset-x-8 bottom-0 flex justify-between text-xs text-[#73809a]">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-6 text-sm">
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ff6c2f]" />Page Views</span>
            <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#20c66b]" />Clicks</span>
          </div>
        </AdminCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
        <AdminCard className="p-7">
          <h2 className="text-lg font-bold">Conversions</h2>
          <div className="mx-auto mt-8 grid h-52 w-52 place-items-center rounded-full border-[22px] border-[#eaf0f6] border-l-[#ff6c2f] border-t-[#ff6c2f] text-center">
            <div>
              <p className="text-2xl font-bold">65.2%</p>
              <p className="text-sm">Returning Customer</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 text-center">
            <div><p className="text-sm">This Week</p><p className="mt-2 text-2xl font-bold">23.5k</p></div>
            <div><p className="text-sm">Last Week</p><p className="mt-2 text-2xl font-bold">41.05k</p></div>
          </div>
          <Button className="mt-7 w-full bg-[#edf3f9] text-[#142044] hover:bg-[#e4ecf5]">View Details</Button>
        </AdminCard>
        <AdminCard className="p-7">
          <h2 className="text-lg font-bold">Sessions by Country</h2>
          <div className="mt-10 h-48 rounded-lg bg-[#eef2f6] p-6 text-[#8995a6]">
            <div className="grid h-full place-items-center text-center">
              <p className="text-5xl">◌</p>
              <p>Canada · United States · Brazil · Russia · China</p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 text-center">
            <div><p className="text-sm">This Week</p><p className="mt-2 text-2xl font-bold">23.5k</p></div>
            <div><p className="text-sm">Last Week</p><p className="mt-2 text-2xl font-bold">41.05k</p></div>
          </div>
        </AdminCard>
        <AdminCard>
          <CardHeader title="Top Pages" actions={<Button className="bg-[#fff0eb] text-[#ff6c2f] hover:bg-[#ffe4d8]">View All</Button>} />
          <table className="admin-table">
            <thead><tr><th>Page Path</th><th>Page Views</th><th>Exit Rate</th></tr></thead>
            <tbody>
              {["larkon/ecommerce.html", "larkon/dashboard.html", "larkon/chat.html", "larkon/auth-login.html", "larkon/email.html", "larkon/social.html", "larkon/blog.html"].map((page, index) => (
                <tr key={page}>
                  <td>{page}</td>
                  <td>{[465, 426, 254, 3369, 985, 653, 478][index]}</td>
                  <td><StatusPill status={["4.4%", "20.4%", "12.25%", "5.2%", "64.2%", "2.4%", "1.4%"][index]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      </div>

      <AdminCard className="mt-6">
        <CardHeader title="Recent Orders" actions={<Button asChild className="bg-[#fff0eb] text-[#ff6c2f] hover:bg-[#ffe4d8]"><Link href="/admin/orders">+ Create Order</Link></Button>} />
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[1100px]">
            <thead>
              <tr>
                <th>Order ID.</th><th>Date</th><th>Product</th><th>Customer Name</th><th>Email ID</th><th>Phone No.</th><th>Address</th><th>Payment Type</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRows.slice(0, 5).map((row) => (
                <tr key={row[0]}>
                  <td className="font-medium text-[#7b85a4]">{row[0]}</td>
                  <td>{row[1]}</td>
                  <td><Image src={row[2]} alt="" width={34} height={34} className="h-8 w-8 object-contain" /></td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                  <td>{row[5]}</td>
                  <td>{row[6]}</td>
                  <td>{row[7]}</td>
                  <td><span className={row[8] === "Processing" || row[8] === "processing" ? "text-[#ff6c2f]" : "text-[#19bd62]"}>●</span> {row[8]}</td>
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
