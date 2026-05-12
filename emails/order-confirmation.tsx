import * as React from "react";
import { Section, Text } from "@react-email/components";

import { EmailShell, paragraph, tableText } from "@/emails/shared";
import type { OrderWithItems, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";

export function OrderConfirmationEmail({
  order,
  settings
}: {
  order: OrderWithItems;
  settings: SiteSettings;
}) {
  return (
    <EmailShell preview={`Your Veloure order ${order.order_number} has been placed.`} title="Order received">
      <Text style={paragraph}>Thank you, {order.customer_name}. We received your cash-on-delivery order.</Text>
      <Text style={paragraph}>
        Order <strong>{order.order_number}</strong> total:{" "}
        <strong>{formatMoney(order.total_amount, settings)}</strong>.
      </Text>
      <Section style={{ border: "1px solid #eee6dc", padding: "16px", margin: "20px 0" }}>
        {order.items.map((item) => (
          <Text key={item.id} style={tableText}>
            {item.product_name_snapshot} - {item.variant_name_snapshot} x {item.quantity}:{" "}
            {formatMoney(item.line_total, settings)}
          </Text>
        ))}
      </Section>
      <Text style={paragraph}>{settings.cod_instructions}</Text>
    </EmailShell>
  );
}
