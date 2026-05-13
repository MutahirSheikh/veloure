import { ProductForm } from "@/components/admin/product-form";
import { AdminPage } from "@/components/admin/larkon-ui";
import { getCategories } from "@/lib/queries/catalog";

export default async function NewProductPage() {
  const categories = await getCategories(true);

  return (
    <AdminPage title="Create Product">
      <ProductForm categories={categories} />
    </AdminPage>
  );
}
