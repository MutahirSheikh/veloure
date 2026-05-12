import Link from "next/link";

import { ArchiveCategoryButton } from "@/components/admin/archive-category-button";
import { CategoryForm } from "@/components/admin/category-form";
import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { getCategories } from "@/lib/queries/catalog";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const categories = await getCategories(true);
  const editingId = value(params, "edit");
  const editing = categories.find((category) => category.id === editingId) ?? null;

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Categories</h1>
      <p className="mt-2 text-muted-foreground">Manage category and subcategory hierarchy.</p>
      <div className="mt-8 grid gap-8 xl:grid-cols-[420px_1fr]">
        <CategoryForm categories={categories} category={editing} />
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="font-medium">{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{categories.find((item) => item.id === category.parent_id)?.name ?? "None"}</td>
                  <td>
                    <StatusBadge status={category.archived_at ? "archived" : category.is_active ? "published" : "draft"} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/categories?edit=${category.id}`}>Edit</Link>
                    </Button>
                    {!category.archived_at ? <ArchiveCategoryButton categoryId={category.id} /> : null}
                  </div>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
