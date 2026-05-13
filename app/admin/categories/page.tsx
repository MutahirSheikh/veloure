import Link from "next/link";

import { ArchiveCategoryButton } from "@/components/admin/archive-category-button";
import { CategoryForm } from "@/components/admin/category-form";
import { ActionButtons, AdminCard, AdminPage, CardHeader, DateFilter, Pager, ProductThumb } from "@/components/admin/larkon-ui";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/queries/catalog";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

const heroCategories = [
  ["Fashion Categories", "/images/1.png", "#e5ebf0"],
  ["Electronics Headphone", "/images/6.png", "#ffddcf"],
  ["Foot Wares", "/images/7.png", "#fff1ce"],
  ["Eye Ware & Sunglass", "/images/4.png", "#d8f3f1"]
] as const;

const demoCategories = [
  ["Fashion Men , Women & Kid's", "/images/1.png", "$80 to $400", "Seller", "FS16276", "46233"],
  ["Women Hand Bag", "/images/2.png", "$120 to $500", "Admin", "HB73029", "2739"],
  ["Cap and Hat", "/images/4.png", "$50 to $200", "Admin", "CH492-9", "1829"],
  ["Electronics Headphone", "/images/6.png", "$100 to $700", "Seller", "EC23818", "1902"],
  ["Foot Wares", "/images/7.png", "$70 to $400", "Seller", "FW11009", "2733"],
  ["Wallet Categories", "/images/5.png", "$120 to $300", "Admin", "WL38299", "890"],
  ["Electronics Watch", "/images/3.png", "$60 to $400", "Seller", "SM37817", "250"],
  ["Eye Ware & Sunglass", "/images/4.png", "$70 to $500", "Admin", "EG37878", "1900"]
] as const;

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const categories = await getCategories(true);
  const editingId = value(params, "edit");
  const editing = categories.find((category) => category.id === editingId) ?? null;

  return (
    <AdminPage title="Categories List">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {heroCategories.map((category) => (
          <AdminCard key={category[0]} className="p-7 text-center">
            <div className="relative h-28 overflow-hidden rounded-lg" style={{ backgroundColor: category[2] }}>
              <ProductThumb src={category[1]} alt={category[0]} className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 bg-transparent" />
            </div>
            <h2 className="mt-7 text-xl font-bold text-[#142044]">{category[0]}</h2>
          </AdminCard>
        ))}
      </div>

      <div className="mt-7">
        <CategoryForm categories={categories} category={editing} />
      </div>

      <AdminCard className="mt-7">
        <CardHeader
          title="All Categories List"
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
          <table className="admin-table min-w-[1050px]">
            <thead>
              <tr>
                <th><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></th>
                <th>Categories</th>
                <th>Starting Price</th>
                <th>Create by</th>
                <th>ID</th>
                <th>Product Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.length
                ? categories.map((category, index) => (
                    <tr key={category.id}>
                      <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                      <td>
                        <div className="flex items-center gap-4">
                          <ProductThumb src={category.image_url || `/images/${(index % 7) + 1}.png`} alt={category.name} />
                          <span className="text-lg font-medium text-[#142044]">{category.name}</span>
                        </div>
                      </td>
                      <td>$80 to $400</td>
                      <td>{index % 2 ? "Admin" : "Seller"}</td>
                      <td>{category.slug.slice(0, 2).toUpperCase()}16276</td>
                      <td>{46233 - index * 317}</td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          <ActionButtons editHref={`/admin/categories?edit=${category.id}`} />
                          {!category.archived_at ? <ArchiveCategoryButton categoryId={category.id} /> : null}
                        </div>
                      </td>
                    </tr>
                  ))
                : demoCategories.map((category) => (
                    <tr key={category[4]}>
                      <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                      <td>
                        <div className="flex items-center gap-4">
                          <ProductThumb src={category[1]} alt={category[0]} />
                          <span className="text-lg font-medium text-[#142044]">{category[0]}</span>
                        </div>
                      </td>
                      <td>{category[2]}</td>
                      <td>{category[3]}</td>
                      <td>{category[4]}</td>
                      <td>{category[5]}</td>
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
