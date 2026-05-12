import { StoreFooter } from "@/components/layout/store-footer";
import { StoreHeader } from "@/components/layout/store-header";
import { getSiteSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <>
      <StoreHeader settings={settings} />
      <main>{children}</main>
      <StoreFooter settings={settings} />
    </>
  );
}
