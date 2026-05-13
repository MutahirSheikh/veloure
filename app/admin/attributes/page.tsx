import { ActionButtons, AdminCard, AdminPage, CardHeader, DateFilter, Pager } from "@/components/admin/larkon-ui";

const attributes = [
  ["BR-3922", "Brand", "Dyson , H&M, Nike , GoPro , Huawei , Rolex , Zara , Thenorthface", "Dropdown", "10 Sep 2023", true],
  ["CL-3721", "Color", "Black , Blue , Green , Yellow , White", "Dropdown", "16 May 2024", true],
  ["SZ-2291", "Size", "XS , S , M , XL , XXL , 3XL", "Radio", "27 Jan 2024", true],
  ["WG-3212", "Weight", "500gm , 1kg ,2kg ,3kg , up to 4kg", "Radio", "12 March 2024", true],
  ["PC-1022", "Packaging", "Paper Box , Plastic Box , Heard Box , Tin", "Dropdown", "02 Jan 2024", false],
  ["ML-0022", "Material", "Cotton , Polyester , Leather , Chiffon , Denim , Linen , Satin", "Dropdown", "20 April 2024", false],
  ["MM-9011", "Memory", "64 , 128 , 250 , 512 , 1TB", "Radio", "29 March 2024", true],
  ["SZ-2911", "Shoes Size", "18 to 22 , 38 to 44", "Radio", "03 Dec 2023", true],
  ["ST-4525", "Style", "Classic , Modern , Ethnic , Western", "Dropdown", "30 Jun 2024", false]
] as const;

export default function AttributesPage() {
  return (
    <AdminPage title="Attribute List">
      <AdminCard>
        <CardHeader title="All Attribute List" actions={<DateFilter />} />
        <div className="overflow-x-auto">
          <table className="admin-table min-w-[1080px]">
            <thead>
              <tr>
                <th><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></th>
                <th>ID</th>
                <th>Variant</th>
                <th>Value</th>
                <th>Option</th>
                <th>Created On</th>
                <th>Published</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute) => (
                <tr key={attribute[0]}>
                  <td><input type="checkbox" className="h-4 w-4 rounded border-[#cfd7e3]" /></td>
                  <td>{attribute[0]}</td>
                  <td>{attribute[1]}</td>
                  <td>{attribute[2]}</td>
                  <td>{attribute[3]}</td>
                  <td>{attribute[4]}</td>
                  <td>
                    <span className={`block h-4 w-8 rounded-full p-0.5 ${attribute[5] ? "bg-[#ff6c2f]" : "bg-[#e4e8ee]"}`}>
                      <span className={`block h-3 w-3 rounded-full bg-white ${attribute[5] ? "ml-auto" : ""}`} />
                    </span>
                  </td>
                  <td><ActionButtons editHref="/admin/attributes/new" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager />
      </AdminCard>
    </AdminPage>
  );
}
