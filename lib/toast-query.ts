export type ToastVariant = "default" | "destructive";

export const ROUTE_TOAST_TITLE_PARAM = "toastTitle";
export const ROUTE_TOAST_DESCRIPTION_PARAM = "toastDescription";
export const ROUTE_TOAST_VARIANT_PARAM = "toastVariant";

export type RouteToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

export function withToastQuery(href: string, input: RouteToastInput) {
  const [withoutHash, hash = ""] = href.split("#", 2);
  const [pathname, queryString = ""] = withoutHash.split("?", 2);
  const params = new URLSearchParams(queryString);

  params.set(ROUTE_TOAST_TITLE_PARAM, input.title);

  if (input.description) {
    params.set(ROUTE_TOAST_DESCRIPTION_PARAM, input.description);
  } else {
    params.delete(ROUTE_TOAST_DESCRIPTION_PARAM);
  }

  if (input.variant && input.variant !== "default") {
    params.set(ROUTE_TOAST_VARIANT_PARAM, input.variant);
  } else {
    params.delete(ROUTE_TOAST_VARIANT_PARAM);
  }

  const nextQuery = params.toString();
  return `${pathname}${nextQuery ? `?${nextQuery}` : ""}${hash ? `#${hash}` : ""}`;
}
