import Link from "next/link";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  function href(nextPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else if (value) params.set(key, value);
    });
    params.set("page", String(nextPage));
    return `${basePath}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, index) => {
    if (page <= 2) return index + 1;
    if (page >= totalPages - 1) return totalPages - 2 + index;
    return page - 1 + index;
  }).filter((value, index, array) => value >= 1 && value <= totalPages && array.indexOf(value) === index);

  return (
    <div className="mt-12 flex items-center justify-center gap-3">
      {pages.map((item) => (
        <Link
          key={item}
          href={href(item)}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition",
            item === page
              ? "border-black bg-black text-white"
              : "border-black/12 bg-white text-[#141414] hover:border-black"
          )}
        >
          {item}
        </Link>
      ))}
      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/12 bg-white px-5 text-sm font-semibold text-[#141414] transition hover:border-black"
        >
          Next
        </Link>
      ) : null}
    </div>
  );
}
