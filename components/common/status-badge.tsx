import { Badge } from "@/components/ui/badge";
import { humanizeStatus } from "@/lib/formatters";

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid" || status === "published" || status === "delivered"
      ? "success"
      : status === "pending" || status === "draft" || status === "processing" || status === "unfulfilled"
        ? "warning"
        : status === "cancelled" || status === "archived" || status === "refunded"
          ? "destructive"
          : "secondary";

  return <Badge variant={variant}>{humanizeStatus(status)}</Badge>;
}
