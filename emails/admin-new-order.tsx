import * as React from "react";
import { Section, Text } from "@react-email/components";

import { EmailShell, paragraph, tableText } from "@/emails/shared";
import type { OrderWithItems, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";

export function AdminNewOrderEmail({
  order,
  settings
}: {
  order: OrderWithItems;
  settings: SiteSettings;
}) {
  return (
    <EmailShell preview={`New Veloure COD order ${order.order_number}.`} title="New COD order">
      <Text style={paragraph}>
        {order.customer_name} placed order <strong>{order.order_number}</strong> for{" "}
        <strong>{formatMoney(order.total_amount, settings)}</strong>.
      </Text>
      <Text style={paragraph}>
        Customer: {order.customer_email} / {order.customer_phone}
      </Text>
      <Section style={{ border: "1px solid #eee6dc", padding: "16px", margin: "20px 0" }}>
        {order.items.map((item) => (
          <Text key={item.id} style={tableText}>
            {item.sku_snapshot}: {item.product_name_snapshot} - {item.variant_name_snapshot} x{" "}
            {item.quantity}
          </Text>
        ))}
      </Section>
    </EmailShell>
  );
}
