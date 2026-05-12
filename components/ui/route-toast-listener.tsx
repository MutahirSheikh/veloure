"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useToast } from "@/components/ui/toast";
import {
  ROUTE_TOAST_DESCRIPTION_PARAM,
  ROUTE_TOAST_TITLE_PARAM,
  ROUTE_TOAST_VARIANT_PARAM
} from "@/lib/toast-query";

export function RouteToastListener() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const lastHandled = React.useRef<string | null>(null);

  React.useEffect(() => {
    const title = searchParams.get(ROUTE_TOAST_TITLE_PARAM);
    if (!title) return;

    const description = searchParams.get(ROUTE_TOAST_DESCRIPTION_PARAM) ?? undefined;
    const variant = searchParams.get(ROUTE_TOAST_VARIANT_PARAM) === "destructive" ? "destructive" : "default";
    const signature = `${pathname}?${searchParams.toString()}`;

    if (lastHandled.current === signature) return;
    lastHandled.current = signature;

    toast({ title, description, variant });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete(ROUTE_TOAST_TITLE_PARAM);
    nextParams.delete(ROUTE_TOAST_DESCRIPTION_PARAM);
    nextParams.delete(ROUTE_TOAST_VARIANT_PARAM);

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, toast]);

  return null;
}
