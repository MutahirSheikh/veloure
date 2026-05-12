import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Store settings</h1>
      <p className="mt-2 text-muted-foreground">Configure storefront metadata, shipping, COD copy, email behavior, and CMS-driven section content.</p>
      <div className="mt-8">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
