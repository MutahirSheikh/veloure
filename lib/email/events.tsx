import "server-only";

import { AdminNewOrderEmail } from "@/emails/admin-new-order";
import { CartAlertEmail } from "@/emails/cart-alert";
import { OrderConfirmationEmail } from "@/emails/order-confirmation";
import { getAdminEmailSet } from "@/lib/auth/admin-emails";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import type { CartLine, OrderWithItems, Profile, SiteSettings } from "@/lib/db/types";
import { getSiteSettings } from "@/lib/queries/settings";
import { sendTransactionalEmail, logEmailSend } from "@/lib/email/send";

function adminRecipients(settings: SiteSettings) {
  const configured = settings.admin_notification_emails.map((email) => email.toLowerCase());
  const envEmails = Array.from(getAdminEmailSet());
  return [...new Set([...configured, ...envEmails])];
}

async function hasRecentCartAlert(profileId: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_logs")
    .select("id")
    .eq("event_type", "cart.added")
    .eq("profile_id", profileId)
    .gte("created_at", since)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function sendCartAlertEmail(profile: Profile, line: CartLine) {
  const settings = await getSiteSettings();
  const throttled = await hasRecentCartAlert(profile.id);
  const recipients = [
    ...(settings.cart_alert_customer_enabled ? [profile.email] : []),
    ...(settings.cart_alert_admin_enabled ? adminRecipients(settings) : [])
  ].filter(Boolean);

  const uniqueRecipients = [...new Set(recipients)];
  const subject = `Veloure cart activity: ${line.product.name}`;

  if (throttled) {
    await Promise.all(
      uniqueRecipients.map((recipient) =>
        logEmailSend({
          eventType: "cart.added",
          profileId: profile.id,
          recipientEmail: recipient,
          subject,
          status: "skipped",
          payloadSummary: { reason: "throttled", product_id: line.product_id, variant_id: line.variant_id }
        })
      )
    );
    return;
  }

  await Promise.all(
    uniqueRecipients.map((recipient) =>
      sendTransactionalEmail({
        eventType: "cart.added",
        to: recipient,
        subject,
        profileId: profile.id,
        react: (
          <CartAlertEmail
            customerName={profile.full_name ?? "there"}
            productName={line.product.name}
            variantName={`${line.variant.color} / ${line.variant.size}`}
            quantity={line.quantity}
            amount={line.line_total}
          />
        ),
        payloadSummary: {
          product_id: line.product_id,
          variant_id: line.variant_id,
          quantity: line.quantity
        }
      })
    )
  );
}

export async function sendOrderPlacedEmails(order: OrderWithItems) {
  const settings = await getSiteSettings();
  const adminEmails = adminRecipients(settings);

  await sendTransactionalEmail({
    eventType: "order.placed.customer",
    to: order.customer_email,
    subject: `Your Veloure order ${order.order_number}`,
    orderId: order.id,
    profileId: order.profile_id,
    react: <OrderConfirmationEmail order={order} settings={settings} />,
    payloadSummary: { order_number: order.order_number, total_amount: order.total_amount }
  });

  await Promise.all(
    adminEmails.map((email) =>
      sendTransactionalEmail({
        eventType: "order.placed.admin",
        to: email,
        subject: `New Veloure COD order ${order.order_number}`,
        orderId: order.id,
        profileId: order.profile_id,
        react: <AdminNewOrderEmail order={order} settings={settings} />,
        payloadSummary: { order_number: order.order_number, total_amount: order.total_amount }
      })
    )
  );
}

export async function sendOrderStatusEmail(order: OrderWithItems, label: string) {
  await sendTransactionalEmail({
    eventType: "order.status",
    to: order.customer_email,
    subject: `Veloure order ${order.order_number}: ${label}`,
    orderId: order.id,
    profileId: order.profile_id,
    react: (
      <CartAlertEmail
        customerName={order.customer_name}
        productName={`Order ${order.order_number}`}
        variantName={label}
        quantity={1}
        amount={order.total_amount}
      />
    ),
    payloadSummary: { order_number: order.order_number, status: label }
  });
}
