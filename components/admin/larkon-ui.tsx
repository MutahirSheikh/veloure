import Image from "next/image";
import Link from "next/link";
import { Edit3, Eye, Star, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="mb-8 text-xl font-bold uppercase text-[#69748d]">{title}</h1>
      {children}
    </div>
  );
}

export function AdminCard({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("admin-card overflow-hidden", className)}>{children}</section>;
}

export function CardHeader({
  title,
  actions
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[66px] items-center justify-between gap-3 border-b border-[#e9edf2] px-6">
      <h2 className="text-base font-bold text-[#142044]">{title}</h2>
      {actions}
    </div>
  );
}

export function DateFilter() {
  return (
    <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 text-sm font-medium text-[#142044]">
      This Month
      <span className="text-xs">v</span>
    </button>
  );
}

export function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="admin-card flex min-h-[132px] items-center justify-between p-7">
      <div>
        <p className="text-lg font-bold text-[#142044]">{label}</p>
        <p className="mt-4 text-3xl font-medium text-[#586681]">{value}</p>
      </div>
      <div className="grid h-16 w-16 place-items-center rounded-xl bg-[#ffe9e1] text-[#ff6c2f]">
        <Icon className="h-8 w-8" />
      </div>
    </div>
  );
}

export function ProductThumb({
  src,
  alt,
  className
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative h-16 w-16 overflow-hidden rounded-xl bg-[#eef3f8]", className)}>
      <Image src={src || "/images/1.png"} alt={alt} fill className="object-contain p-1.5" sizes="80px" />
    </div>
  );
}

export function ActionButtons({ viewHref, editHref }: { viewHref?: string; editHref?: string }) {
  return (
    <div className="flex items-center gap-3">
      {viewHref ? (
        <Link href={viewHref} className="admin-action admin-action-view">
          <Eye className="h-4 w-4" />
        </Link>
      ) : (
        <button className="admin-action admin-action-view" type="button">
          <Eye className="h-4 w-4" />
        </button>
      )}
      {editHref ? (
        <Link href={editHref} className="admin-action admin-action-edit">
          <Edit3 className="h-4 w-4" />
        </Link>
      ) : (
        <button className="admin-action admin-action-edit" type="button">
          <Edit3 className="h-4 w-4" />
        </button>
      )}
      <button className="admin-action admin-action-delete" type="button">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Pager() {
  return (
    <div className="flex justify-end px-6 py-5">
      <div className="inline-flex overflow-hidden rounded-lg border border-[#e0e6ef] bg-white text-sm">
        <button className="px-4 py-2">Previous</button>
        <button className="bg-[#ff6c2f] px-4 py-2 font-bold text-white">1</button>
        <button className="border-l border-[#e0e6ef] px-4 py-2">2</button>
        <button className="border-l border-[#e0e6ef] px-4 py-2">3</button>
        <button className="border-l border-[#e0e6ef] px-4 py-2">Next</button>
      </div>
    </div>
  );
}

export function Rating({ value, reviews }: { value: string; reviews: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1 rounded bg-[#f2f5f8] px-2 py-1 text-sm font-bold">
        <Star className="h-4 w-4 fill-[#f8b327] text-[#f8b327]" />
        {value}
      </span>
      <span>{reviews} Review</span>
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  const className =
    key.includes("complete") || key.includes("paid") || key.includes("ready")
      ? "admin-status-green"
      : key.includes("pending") || key.includes("packaging") || key.includes("progress")
        ? "admin-status-orange"
        : key.includes("cancel")
          ? "admin-status-red"
          : "admin-status-gray";

  return <span className={className}>{status}</span>;
}
