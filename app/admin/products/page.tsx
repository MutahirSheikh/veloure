import Link from "next/link";

import { ArchiveProductButton } from "@/components/admin/archive-product-button";
import { ActionButtons, AdminCard, AdminPage, CardHeader, DateFilter, Pager, ProductThumb, Rating } from "@/components/admin/larkon-ui";
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

const demoProducts = [
  ["Black T-shirt", "/images/1.png", "Size : S , M , L , XI", "$80.00", "486 Item Left", "155 Sold", "Fashion", "4.5", 55],
  ["Olive Green Leather Bag", "/images/2.png", "Size : S , M", "$136.00", "784 Item Left", "674 Sold", "Hand Bag", "4.1", 143],
  ["Women Golden Dress", "/images/3.png", "Size : S , M", "$219.00", "769 Item Left", "180 Sold", "Fashion", "4.4", 174],
  ["Gray Cap For Men", "/images/4.png", "Size : S , M , L", "$76.00", "571 Item Left", "87 Sold", "Cap", "4.2", 23],
  ["Dark Green Cargo Pent", "/images/5.png", "Size : S , M , L , XI", "$110.00", "241 Item Left", "342 Sold", "Fashion", "4.4", 109],
  ["Orange Multi Color Headphone", "/images/6.png", "Size : S , M", "$231.00", "821 Item Left", "231 Sold", "Electronics", "4.2", 200],
  ["Kid's Yellow Shoes", "/images/7.png", "Size : 18 , 19 , 20 , 21", "$89.00", "321 Item Left", "681 Sold", "Shoes", "4.5", 321]
] as const;

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const [settings, result] = await Promise.all([
    getSiteSettings(),
    listAdminProducts({
      query: value(params, "q"),
      status: value(params, "status"),
      page: Number(value(params, "page") ?? 1),
      pageSize: 12
    })
  ]);

  return (
    <AdminPage title="Product List">
      <form className="admin-card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_220px_auto]">
        <Input name="q" className="admin-input" placeholder="Search name, slug, SKU" defaultValue={value(params, "q")} />
        <select name="status" defaultValue={value(params, "status") ?? ""} className="admin-input">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Filter</Button>
      </form>
      <AdminCard>
        <CardHeader
          title="All Product List"
          actions={
            <div className="flex gap-2">
              <Button asChild className="bg-[#ff6c2f] hover:bg-[#ec5c20]">
                <Link href="/admin/products/new">Add Product</Link>
              </Button>
              <DateFilter />
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[1100px]">
            <thead>
              <tr>
                <th><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></th>
                <th>Product Name & Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {result.products.length
                ? result.products.map((product, index) => (
                    <tr key={product.id}>
                      <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                      <td>
                        <div className="flex items-center gap-4">
                          <ProductThumb src={product.main_image_url || `/images/${(index % 7) + 1}.png`} alt={product.name} />
                          <div>
                            <p className="text-lg font-medium text-[#142044]">{product.name}</p>
                            <p className="mt-1 text-sm text-[#52617b]">Size : S , M , L , XI</p>
                          </div>
                        </div>
                      </td>
                      <td>{formatMoney(product.base_price, settings)}</td>
                      <td><p className="font-medium">486 Item Left</p><p className="mt-1">155 Sold</p></td>
                      <td>{product.category?.name ?? "Fashion"}</td>
                      <td><Rating value={(4 + (index % 6) / 10).toFixed(1)} reviews={55 + index * 21} /></td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          <ActionButtons viewHref={`/admin/products/${product.id}`} editHref={`/admin/products/${product.id}`} />
                          {product.status !== "archived" ? <ArchiveProductButton productId={product.id} /> : null}
                        </div>
                      </td>
                    </tr>
                  ))
                : demoProducts.map((product) => (
                    <tr key={product[0]}>
                      <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                      <td>
                        <div className="flex items-center gap-4">
                          <ProductThumb src={product[1]} alt={product[0]} />
                          <div>
                            <p className="text-lg font-medium text-[#142044]">{product[0]}</p>
                            <p className="mt-1 text-sm text-[#52617b]">{product[2]}</p>
                          </div>
                        </div>
                      </td>
                      <td>{product[3]}</td>
                      <td><p className="font-medium">{product[4]}</p><p className="mt-1">{product[5]}</p></td>
                      <td>{product[6]}</td>
                      <td><Rating value={product[7]} reviews={product[8]} /></td>
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
