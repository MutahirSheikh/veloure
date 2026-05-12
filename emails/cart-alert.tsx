import * as React from "react";
import { Text } from "@react-email/components";

import { EmailShell, paragraph } from "@/emails/shared";
import { formatMoney } from "@/lib/formatters";

export function CartAlertEmail({
  customerName,
  productName,
  variantName,
  quantity,
  amount
}: {
  customerName: string;
  productName: string;
  variantName: string;
  quantity: number;
  amount: number;
}) {
  return (
    <EmailShell preview={`${productName} was added to a Veloure cart.`} title="Cart activity">
      <Text style={paragraph}>Hello {customerName},</Text>
      <Text style={paragraph}>
        {productName} ({variantName}) was added to your Veloure cart. Quantity: {quantity}. Current
        line value: {formatMoney(amount)}.
      </Text>
      <Text style={paragraph}>
        Your cart will be ready when you return, and checkout is available with cash on delivery.
      </Text>
    </EmailShell>
  );
}
