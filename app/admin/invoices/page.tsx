import Image from "next/image";
import { BadgeCent, FileCheck2, FileText, ReceiptText } from "lucide-react";

import { ActionButtons, AdminCard, AdminPage, CardHeader, DateFilter, MetricCard, Pager, StatusPill } from "@/components/admin/larkon-ui";

const invoices = [
  ["#INV2540", "/images/lady-1.png", "Michael A. Miner", "07 Jan, 2023", "$452", "Mastercard", "Completed"],
  ["#INV3924", "/images/lady-2.png", "Theresa T. Brose", "03 Dec, 2023", "$783", "Visa", "Cancel"],
  ["#INV5032", "/images/lady-3.png", "James L. Erickson", "28 Sep, 2023", "$134", "Paypal", "Completed"],
  ["#INV1695", "/images/lady-1.png", "Lily W. Wilson", "10 Aug, 2023", "$945", "Mastercard", "Pending"],
  ["#INV8473", "/images/lady-2.png", "Sarah M. Brooks", "22 May, 2023", "$421", "Visa", "Cancel"],
  ["#INV2150", "/images/lady-3.png", "Joe K. Hall", "15 Mar, 2023", "$251", "Paypal", "Completed"],
  ["#INV5636", "/images/lady-1.png", "Ralph Hueber", "15 Mar, 2023", "$310", "Visa", "Completed"],
  ["#INV2940", "/images/lady-2.png", "Sarah Drescher", "15 Mar, 2023", "$241", "Mastercard", "Completed"],
  ["#INV9027", "/images/lady-3.png", "Leonie Meister", "15 Mar, 2023", "$136", "Paypal", "Pending"]
] as const;

export default function InvoicesPage() {
  return (
    <AdminPage title="Invoices List">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Invoice" value="2310" icon={ReceiptText} />
        <MetricCard label="Pending Invoice" value="1000" icon={FileText} />
        <MetricCard label="Paid Invoice" value="1310" icon={FileCheck2} />
        <MetricCard label="Inactive Invoice" value="1243" icon={BadgeCent} />
      </div>
      <AdminCard className="mt-7">
        <CardHeader title="All Invoices List" actions={<DateFilter />} />
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[1000px]">
            <thead>
              <tr>
                <th><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></th>
                <th>Invoice ID</th>
                <th>Billing Name</th>
                <th>Order Date</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice[0]}>
                  <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                  <td>{invoice[0]}</td>
                  <td>
                    <div className="flex items-center gap-4">
                      <Image src={invoice[1]} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                      {invoice[2]}
                    </div>
                  </td>
                  <td>{invoice[3]}</td>
                  <td>{invoice[4]}</td>
                  <td>{invoice[5]}</td>
                  <td><StatusPill status={invoice[6]} /></td>
                  <td><ActionButtons editHref="/admin/invoices/new" /></td>
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
