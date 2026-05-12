import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-serif text-2xl font-bold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
        V
      </span>
      {APP_NAME}
    </Link>
  );
}
