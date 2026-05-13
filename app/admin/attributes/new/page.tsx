import { AdminCard, AdminPage, CardHeader } from "@/components/admin/larkon-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewAttributePage() {
  return (
    <AdminPage title="Attribute Add">
      <AdminCard>
        <CardHeader title="Add Attribute" />
        <div className="grid gap-7 p-7 lg:grid-cols-2">
          <label className="text-sm font-medium">
            Attribute Variant
            <Input className="admin-input mt-2" placeholder="Enter Name" />
          </label>
          <label className="text-sm font-medium">
            Attribute Value
            <Input className="admin-input mt-2" placeholder="Enter Value" />
          </label>
          <label className="text-sm font-medium">
            Attribute ID
            <Input className="admin-input mt-2" placeholder="Enter ID" />
          </label>
          <label className="text-sm font-medium">
            Option
            <select className="admin-input mt-2">
              <option>Dropdown</option>
              <option>Radio</option>
              <option>Checkbox</option>
            </select>
          </label>
        </div>
        <div className="border-t border-[#e9edf2] p-7">
          <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]">Save Change</Button>
        </div>
      </AdminCard>
    </AdminPage>
  );
}
