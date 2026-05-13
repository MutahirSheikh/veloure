import { AlertCircle, Minus, Plus, ShoppingBasket } from "lucide-react";

import { AdminCard, AdminPage } from "@/components/admin/larkon-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewInvoicePage() {
  return (
    <AdminPage title="Invoices Create">
      <AdminCard className="mx-auto max-w-[1300px] p-7">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-20 inline-flex h-16 min-w-64 items-center gap-3 rounded-lg border border-dashed border-[#ff6c2f] px-5 text-2xl font-black text-[#142044]">
              <ShoppingBasket className="h-7 w-7 text-[#ff6c2f]" /> Veloure
            </div>
            <InvoiceField label="Sender Name"><Input className="admin-input" placeholder="First name" /></InvoiceField>
            <InvoiceField label="Sender Full Address"><Textarea className="min-h-20 rounded-md border-[#d9e0ea]" placeholder="Enter address" /></InvoiceField>
            <InvoiceField label="Phone number"><Input className="admin-input" placeholder="Number" /></InvoiceField>
          </div>
          <div>
            <InvoiceField label="Invoice Number :"><Input className="admin-input" value="#INV-0758267/90" readOnly /></InvoiceField>
            <InvoiceField label="Issue Date :"><Input className="admin-input" placeholder="dd-mm-yyyy" /></InvoiceField>
            <InvoiceField label="Due Date :"><Input className="admin-input" placeholder="dd-mm-yyyy" /></InvoiceField>
            <InvoiceField label="Amount :"><MoneyInput /></InvoiceField>
            <InvoiceField label="Status :"><select className="admin-input"><option>Paid</option><option>Pending</option><option>Cancel</option></select></InvoiceField>
          </div>
        </div>

        <div className="mt-10 grid gap-12 border-t border-[#e9edf2] pt-9 lg:grid-cols-2">
          <ContactBlock title="Issue From :" />
          <ContactBlock title="Issue For :" />
        </div>

        <div className="mt-10 overflow-x-auto">
          <table className="admin-table min-w-[900px]">
            <thead><tr><th>Product Name</th><th>Quantity</th><th>Price</th><th>Tax</th><th>Total</th></tr></thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex gap-5">
                    <span className="h-12 w-12 rounded-xl bg-[#eef3f8]" />
                    <div className="space-y-4"><Input className="admin-input w-48" placeholder="Product Name" /><Input className="admin-input w-48" placeholder="Product Size" /></div>
                  </div>
                </td>
                <td><div className="inline-flex items-center gap-5 rounded-lg border border-[#d9e0ea] px-3 py-2"><Minus className="h-4 w-4" />1<Plus className="h-4 w-4" /></div></td>
                <td><MoneyInput /></td>
                <td><MoneyInput /></td>
                <td><MoneyInput /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-7 grid gap-7 border-t border-[#e9edf2] pt-6 lg:grid-cols-[1fr_390px]">
          <div />
          <div>
            <div className="mb-6 flex justify-end gap-2">
              <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Clear Product</Button>
              <Button variant="outline" className="border-[#ff6c2f] text-[#ff6c2f]">Add More</Button>
            </div>
            {["Sub Total :", "Discount :", "Estimated Tax (15.5%) :", "Grand Amount :"].map((label) => (
              <InvoiceField key={label} label={label}><MoneyInput /></InvoiceField>
            ))}
          </div>
        </div>

        <div className="mt-10 flex gap-4 rounded-lg bg-[#ffd7d7] p-4 text-sm text-[#743119]">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#f05b61] text-white"><AlertCircle className="h-5 w-5" /></span>
          <p>All accounts are to be paid within 7 days from receipt of invoice. To be paid by cheque or credit card or direct payment online.</p>
        </div>
      </AdminCard>
    </AdminPage>
  );
}

function InvoiceField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mb-5 block text-sm font-medium text-[#142044]">{label}<span className="mt-2 block">{children}</span></label>;
}

function ContactBlock({ title }: { title: string }) {
  return (
    <div>
      <h2 className="mb-6 text-lg font-bold">{title}</h2>
      <div className="space-y-4">
        <Input className="admin-input" placeholder="First name" />
        <Textarea className="min-h-20 rounded-md border-[#d9e0ea]" placeholder="Enter address" />
        <Input className="admin-input" placeholder="Number" />
        <Input className="admin-input" placeholder="Email Address" />
      </div>
    </div>
  );
}

function MoneyInput() {
  return (
    <div className="flex overflow-hidden rounded-md border border-[#d9e0ea] bg-white">
      <span className="grid w-12 place-items-center border-r border-[#d9e0ea] bg-[#f1f5f9] font-bold">$</span>
      <Input className="h-10 border-0 focus-visible:ring-0" placeholder="000" />
    </div>
  );
}
