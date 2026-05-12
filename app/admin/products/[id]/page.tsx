import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getProductById } from "@/lib/queries/catalog";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [categories, product] = await Promise.all([getCategories(true), getProductById(id)]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Edit product</h1>
      <p className="mt-2 text-muted-foreground">{product.name}</p>
      <div className="mt-8">
        <ProductForm categories={categories} product={product} />
      </div>
    </div>
  );
}
