import Link from "next/link";

import { Button } from "@/components/ui/button";

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

  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button variant="outline" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? <Link href={href(page - 1)}>Previous</Link> : <span>Previous</span>}
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button variant="outline" disabled={page >= totalPages} asChild={page < totalPages}>
        {page < totalPages ? <Link href={href(page + 1)}>Next</Link> : <span>Next</span>}
      </Button>
    </div>
  );
}
