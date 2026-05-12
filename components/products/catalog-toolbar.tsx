"use client";

import { Grid2x2, LayoutList } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PRODUCT_SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function labelFor(key: string, value: string) {
  if (key === "new") return "New arrivals";
  if (key === "featured") return "Featured";
  if (key === "stock") return "In stock";
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function CatalogToolbar({
  page,
  pageSize,
  total,
  current
}: {
  page: number;
  pageSize: number;
  total: number;
  current: Record<string, string | undefined>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = current.view === "list" ? "list" : "grid";
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  function updateParams(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    params.delete("page");
    router.push(`${pathname}${params.size ? `?${params.toString()}` : ""}`);
  }

  const chips = Object.entries(current)
    .filter(([key, value]) => value && !["sort", "view", "q", "min", "max"].includes(key))
    .map(([key, value]) => ({ key, value: labelFor(key, value as string) }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-lg border border-black/8 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => updateParams({ [chip.key]: null })}
                className="store-pill inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#141414]"
              >
                {chip.value}
                <span className="text-black/35">x</span>
              </button>
            ))
          ) : (
            <span className="text-sm text-black/55">All products</span>
          )}
          <p className="text-sm text-black/60">
            Showing {start}-{end} of {total} results
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-black/60">
            <span>Sort</span>
            <select
              value={current.sort ?? "newest"}
              onChange={(event) => updateParams({ sort: event.target.value })}
              className="h-10 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-[#141414] outline-none"
            >
              {PRODUCT_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2 rounded-full border border-black/10 p-1">
            <button
              type="button"
              aria-label="Grid view"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
                view === "grid" ? "bg-black text-white" : "text-black/45 hover:bg-black/5"
              )}
              onClick={() => updateParams({ view: "grid" })}
            >
              <Grid2x2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition",
                view === "list" ? "bg-black text-white" : "text-black/45 hover:bg-black/5"
              )}
              onClick={() => updateParams({ view: "list" })}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {current.q ? (
        <p className="text-sm text-black/55">
          Search term: <span className="font-semibold text-[#141414]">{current.q}</span>
        </p>
      ) : null}
    </div>
  );
}
