import Link from "next/link";

import { ArchiveProductButton } from "@/components/admin/archive-product-button";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/formatters";
import { listAdminProducts } from "@/lib/queries/catalog";
import { getSiteSettings } from "@/lib/queries/settings";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [settings, result] = await Promise.all([
    getSiteSettings(),
    listAdminProducts({
      query: value(params, "q"),
      status: value(params, "status"),
      page: Number(value(params, "page") ?? 1)
    })
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-semibold">Products</h1>
          <p className="mt-2 text-muted-foreground">Create, edit, publish, and archive Veloure products.</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
      <form className="mt-8 grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[1fr_220px_auto]">
        <Input name="q" placeholder="Search name, slug, SKU" defaultValue={value(params, "q")} />
        <select name="status" defaultValue={value(params, "status") ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button>Filter</Button>
      </form>
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Status</th>
              <th>Price</th>
              <th>Flags</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {result.products.map((product) => (
              <tr key={product.id}>
                <td>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.base_sku}</p>
                </td>
                <td>{product.category?.name ?? "Unassigned"}</td>
                <td>
                  <StatusBadge status={product.status} />
                </td>
                <td>{formatMoney(product.base_price, settings)}</td>
                <td className="text-sm text-muted-foreground">
                  {product.is_featured ? "Featured " : ""}
                  {product.is_new_arrival ? "New" : ""}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/products/${product.id}`}>Edit</Link>
                    </Button>
                    {product.status !== "archived" ? <ArchiveProductButton productId={product.id} /> : null}
                  </div>
                </td>
              </tr>
            ))}
            {result.products.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted-foreground">
                  No products found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
