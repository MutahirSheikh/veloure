import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Category } from "@/lib/db/types";

const swatchFallbacks = ["#000000", "#7cb7d3", "#4ab8ac", "#f5b2c3", "#ff9275", "#85d8c1", "#b48bff", "#ef5c84"];

function swatchFor(color: string, index: number) {
  const value = color.trim().toLowerCase();
  const named: Record<string, string> = {
    black: "#101010",
    white: "#f4f4f4",
    cream: "#f0e5cc",
    beige: "#d6b48e",
    tan: "#b68d62",
    brown: "#7a4d2a",
    red: "#ef4444",
    blue: "#4f8ae9",
    navy: "#233873",
    green: "#2faa74",
    yellow: "#f5c347",
    pink: "#ea4c89",
    purple: "#8b5cf6",
    orange: "#ff8c42",
    grey: "#8f8f94",
    gray: "#8f8f94"
  };

  return named[value] ?? swatchFallbacks[index % swatchFallbacks.length];
}

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
    <form action={action} className="space-y-8 rounded-lg border border-black/8 bg-white p-6">
      <input type="hidden" name="sort" value={current.sort ?? "newest"} />
      <input type="hidden" name="view" value={current.view ?? "grid"} />

      <div className="flex items-center gap-3 text-lg font-black text-[#141414]">
        <SlidersHorizontal className="h-4.5 w-4.5" />
        <span>Filter</span>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-[#141414]">Search Product</label>
        <div className="relative">
          <Input
            name="q"
            defaultValue={current.q}
            placeholder="Search Product"
            className="h-12 rounded-2xl border-black/12 bg-white pr-12 focus-visible:ring-black"
          />
          <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#141414]">Price</p>
        <div className="grid grid-cols-2 gap-3">
          <Input name="min" type="number" min="0" step="0.01" defaultValue={current.min} placeholder="Min" className="h-11 rounded-2xl border-black/12 bg-white" />
          <Input name="max" type="number" min="0" step="0.01" defaultValue={current.max} placeholder="Max" className="h-11 rounded-2xl border-black/12 bg-white" />
        </div>
      </div>

      {colors.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[#141414]">Color</legend>
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer">
              <input type="radio" name="color" value="" defaultChecked={!current.color} className="peer sr-only" />
              <span className="flex h-9 min-w-9 items-center justify-center rounded-full border border-black/12 bg-white px-3 text-xs font-semibold text-black/55 peer-checked:border-black peer-checked:text-black">
                Any
              </span>
            </label>
            {colors.map((color, index) => (
              <label key={color} className="cursor-pointer">
                <input type="radio" name="color" value={color} defaultChecked={current.color === color} className="peer sr-only" />
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent bg-white peer-checked:border-black">
                  <span className="h-5 w-5 rounded-full border border-white shadow" style={{ backgroundColor: swatchFor(color, index) }} />
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {sizes.length > 0 ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-[#141414]">Size</legend>
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer">
              <input type="radio" name="size" value="" defaultChecked={!current.size} className="peer sr-only" />
              <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-black/12 bg-white px-3 text-sm font-semibold text-black/60 peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
                All
              </span>
            </label>
            {sizes.map((size) => (
              <label key={size} className="cursor-pointer">
                <input type="radio" name="size" value={size} defaultChecked={current.size === size} className="peer sr-only" />
                <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-black/12 bg-white px-3 text-sm font-semibold text-black/60 peer-checked:border-black peer-checked:bg-black peer-checked:text-white">
                  {size}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[#141414]">Category</legend>
        <div className="grid gap-3 text-sm text-black/65">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>All categories</span>
            <input type="radio" name="category" value="" defaultChecked={!current.category} />
          </label>
          {categories.map((category) => (
            <label key={category.id} className="flex cursor-pointer items-center justify-between gap-3">
              <span>{category.name}</span>
              <input type="radio" name="category" value={category.slug} defaultChecked={current.category === category.slug} />
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[#141414]">Product state</legend>
        <div className="grid gap-3 text-sm text-black/65">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="stock" value="in" defaultChecked={current.stock === "in"} />
            In stock only
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="featured" value="true" defaultChecked={current.featured === "true"} />
            Featured pieces
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="new" value="true" defaultChecked={current.new === "true"} />
            New arrivals
          </label>
        </div>
      </fieldset>

      <div className="grid gap-3">
        <Button type="submit" className="h-12 rounded-full bg-black text-white hover:bg-black/90">
          Apply filters
        </Button>
        <Button variant="outline" asChild className="h-12 rounded-full border-black/12 bg-white">
          <a href={action}>Reset</a>
        </Button>
      </div>
    </form>
  );
}
