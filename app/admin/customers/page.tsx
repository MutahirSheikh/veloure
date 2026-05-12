import { formatMoney, formatShortDate } from "@/lib/formatters";
import { listCustomers } from "@/lib/queries/admin";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminCustomersPage() {
  const [customers, settings] = await Promise.all([listCustomers(), getSiteSettings()]);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Customers</h1>
      <p className="mt-2 text-muted-foreground">Customer profiles synced from Clerk and enriched by order history.</p>
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Paid spend</th>
              <th>Last order</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(({ profile, orderCount, totalSpend, lastOrderDate }) => (
              <tr key={profile.id}>
                <td>
                  <p className="font-medium">{profile.full_name || profile.email}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </td>
                <td>{profile.role}</td>
                <td>{orderCount}</td>
                <td>{formatMoney(totalSpend, settings)}</td>
                <td>{lastOrderDate ? formatShortDate(lastOrderDate) : "None"}</td>
                <td>{formatShortDate(profile.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
