import { AdminShell } from "@/components/admin/admin-shell";
import { redirectIfNotAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await redirectIfNotAdmin();

  return <AdminShell>{children}</AdminShell>;
}
