import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { deleteClerkProfile, syncClerkProfile } from "@/lib/clerk/profile-sync";

type ClerkEmail = { id: string; email_address: string };
type ClerkPhone = { id: string; phone_number: string };
type ClerkUserEvent = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  primary_phone_number_id?: string | null;
  email_addresses?: ClerkEmail[];
  phone_numbers?: ClerkPhone[];
};

function profileFromEvent(data: ClerkUserEvent) {
  const email =
    data.email_addresses?.find((item) => item.id === data.primary_email_address_id)?.email_address ??
    data.email_addresses?.[0]?.email_address ??
    null;
  const phone =
    data.phone_numbers?.find((item) => item.id === data.primary_phone_number_id)?.phone_number ??
    data.phone_numbers?.[0]?.phone_number ??
    null;
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(" ") || null;

  return {
    clerkUserId: data.id,
    email,
    fullName,
    avatarUrl: data.image_url ?? null,
    phone
  };
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Clerk webhook secret is not configured." }, { status: 500 });
  }

  const payload = await req.text();
  const headerStore = await headers();
  const svixId = headerStore.get("svix-id");
  const svixTimestamp = headerStore.get("svix-timestamp");
  const svixSignature = headerStore.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers." }, { status: 400 });
  }

  let event: { type: string; data: ClerkUserEvent };
  try {
    event = new Webhook(secret).verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature
    }) as { type: string; data: ClerkUserEvent };
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    await syncClerkProfile(profileFromEvent(event.data));
  }

  if (event.type === "user.deleted") {
    await deleteClerkProfile(event.data.id);
  }

  return NextResponse.json({ received: true });
}
