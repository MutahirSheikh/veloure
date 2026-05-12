import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/db/types";
import { PRODUCT_SORT_OPTIONS } from "@/lib/constants";

export function ProductFilters({
  action,
  categories,
  colors,
  sizes,
  current
}: {
  action: string;
  categories: Category[];
  colors: string[];
  sizes: string[];
  current: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="rounded-md border border-border bg-card p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="grid gap-2 text-sm">
          Search
          <Input name="q" defaultValue={current.q} placeholder="Product, SKU, color..." />
        </label>
        <label className="grid gap-2 text-sm">
          Category
          <select name="category" defaultValue={current.category ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Color
          <select name="color" defaultValue={current.color ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Any color</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Size
          <select name="size" defaultValue={current.size ?? ""} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Any size</option>
            {sizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Min price
          <Input name="min" type="number" min="0" step="0.01" defaultValue={current.min} />
        </label>
        <label className="grid gap-2 text-sm">
          Max price
          <Input name="max" type="number" min="0" step="0.01" defaultValue={current.max} />
        </label>
        <label className="grid gap-2 text-sm">
          Sort
          <select name="sort" defaultValue={current.sort ?? "newest"} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
            {PRODUCT_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="stock" value="in" defaultChecked={current.stock === "in"} />
            In stock
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" value="true" defaultChecked={current.featured === "true"} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="new" value="true" defaultChecked={current.new === "true"} />
            New
          </label>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit">Apply filters</Button>
        <Button variant="outline" asChild>
          <a href={action}>Reset</a>
        </Button>
      </div>
    </form>
  );
}
