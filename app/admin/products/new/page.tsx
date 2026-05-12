import { ProductForm } from "@/components/admin/product-form";
import { getCategories } from "@/lib/queries/catalog";

export default async function NewProductPage() {
  const categories = await getCategories(true);

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">New product</h1>
      <p className="mt-2 text-muted-foreground">Create product content, images, variants, and inventory.</p>
      <div className="mt-8">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
