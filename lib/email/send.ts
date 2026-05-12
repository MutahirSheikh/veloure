import "server-only";

import type * as React from "react";
import { Resend } from "resend";

import { getSupabaseAdminClient } from "@/lib/db/admin";
import type { Json } from "@/lib/db/types";
import { getErrorMessage } from "@/lib/utils";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function logEmailSend(input: {
  eventType: string;
  orderId?: string | null;
  profileId?: string | null;
  recipientEmail: string;
  subject: string;
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  payloadSummary?: Json;
  errorMessage?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("email_logs").insert({
    event_type: input.eventType,
    order_id: input.orderId ?? null,
    profile_id: input.profileId ?? null,
    recipient_email: input.recipientEmail,
    subject: input.subject,
    status: input.status,
    provider: "resend",
    provider_message_id: input.providerMessageId ?? null,
    payload_summary: input.payloadSummary ?? {},
    error_message: input.errorMessage ?? null
  });

  if (error) throw error;
}

export async function sendTransactionalEmail(input: {
  eventType: string;
  to: string;
  subject: string;
  react: React.ReactElement;
  orderId?: string | null;
  profileId?: string | null;
  payloadSummary?: Json;
}) {
  const from = process.env.EMAIL_FROM;
  const resend = getResendClient();

  if (!from || !resend) {
    await logEmailSend({
      ...input,
      recipientEmail: input.to,
      status: "skipped",
      errorMessage: "Resend is not configured."
    });
    return { status: "skipped" as const };
  }

  try {
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: input.subject,
      react: input.react
    });

    if (result.error) {
      await logEmailSend({
        ...input,
        recipientEmail: input.to,
        status: "failed",
        errorMessage: result.error.message
      });
      return { status: "failed" as const };
    }

    await logEmailSend({
      ...input,
      recipientEmail: input.to,
      status: "sent",
      providerMessageId: result.data?.id ?? null
    });

    return { status: "sent" as const, id: result.data?.id ?? null };
  } catch (error) {
    const message = getErrorMessage(error);
    await logEmailSend({
      ...input,
      recipientEmail: input.to,
      status: "failed",
      errorMessage: message
    });
    return { status: "failed" as const };
  }
}
