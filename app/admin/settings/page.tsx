import { AdminPage } from "@/components/admin/larkon-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <AdminPage title="Store Settings">
      <SettingsForm settings={settings} />
    </AdminPage>
  );
}
