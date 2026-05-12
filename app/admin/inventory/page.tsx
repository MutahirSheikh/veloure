import { InventoryTable } from "@/components/admin/inventory-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listInventory } from "@/lib/queries/admin";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function AdminInventoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const rows = await listInventory({
    query: value(params, "q"),
    lowStock: value(params, "low") === "true"
  });

  return (
    <div>
      <h1 className="font-serif text-4xl font-semibold">Inventory</h1>
      <p className="mt-2 text-muted-foreground">Adjust stock and monitor low inventory variants.</p>
      <form className="mt-8 grid gap-3 rounded-md border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto]">
        <Input name="q" placeholder="Search SKU, color, size" defaultValue={value(params, "q")} />
        <label className="flex items-center gap-2 text-sm">
          <input name="low" value="true" type="checkbox" defaultChecked={value(params, "low") === "true"} />
          Low stock only
        </label>
        <Button>Filter</Button>
      </form>
      <div className="mt-6">
        <InventoryTable rows={rows} />
      </div>
    </div>
  );
}
