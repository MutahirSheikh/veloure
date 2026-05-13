import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { AdminPage } from "@/components/admin/larkon-ui";
import { getCategories, getProductById } from "@/lib/queries/catalog";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(true), getProductById(id)]);
  if (!product) notFound();

  return (
    <AdminPage title="Edit Product">
      <ProductForm categories={categories} product={product} />
    </AdminPage>
  );
}
