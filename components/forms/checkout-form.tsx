"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { placeOrderAction } from "@/actions/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { CartSnapshot, Profile, SiteSettings } from "@/lib/db/types";
import { formatMoney } from "@/lib/formatters";
import { withToastQuery } from "@/lib/toast-query";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";

export function CheckoutForm({
  profile,
  cart,
  settings
}: {
  profile: Profile;
  cart: CartSnapshot;
  settings: SiteSettings;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const idempotencyKey = React.useMemo(() => crypto.randomUUID(), []);
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema) as unknown as Resolver<CheckoutInput>,
    defaultValues: {
      idempotency_key: idempotencyKey,
      full_name: profile.full_name ?? "",
      email: profile.email,
      phone: profile.phone ?? "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "United States",
      delivery_notes: ""
    }
  });

  function onSubmit(values: CheckoutInput) {
    startTransition(async () => {
      const result = await placeOrderAction(values);
      if (result.ok) {
        router.push(
          withToastQuery(`/order/${result.data.orderNumber}`, {
            title: "Order placed",
            description: "Your COD order has been received."
          })
        );
      } else {
        toast({ title: "Checkout failed", description: result.error, variant: "destructive" });
      }
    });
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <input type="hidden" {...form.register("idempotency_key")} />
      <div>
        <h2 className="font-serif text-3xl font-semibold">Billing details</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.full_name?.message} className="sm:col-span-2">
            <Input {...form.register("full_name")} autoComplete="name" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...form.register("email")} type="email" autoComplete="email" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...form.register("phone")} autoComplete="tel" />
          </Field>
          <Field label="Country" error={errors.country?.message} className="sm:col-span-2">
            <Input {...form.register("country")} autoComplete="country-name" />
          </Field>
          <Field label="Address line 1" error={errors.address_line_1?.message} className="sm:col-span-2">
            <Input {...form.register("address_line_1")} autoComplete="address-line1" />
          </Field>
          <Field label="Address line 2" error={errors.address_line_2?.message} className="sm:col-span-2">
            <Input {...form.register("address_line_2")} autoComplete="address-line2" />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...form.register("city")} autoComplete="address-level2" />
          </Field>
          <Field label="State / Province" error={errors.state?.message}>
            <Input {...form.register("state")} autoComplete="address-level1" />
          </Field>
          <Field label="Postal code" error={errors.postal_code?.message}>
            <Input {...form.register("postal_code")} autoComplete="postal-code" />
          </Field>
          <Field label="Delivery notes" error={errors.delivery_notes?.message} className="sm:col-span-2">
            <Textarea {...form.register("delivery_notes")} placeholder="Notes for delivery, preferred timing, landmarks..." />
          </Field>
        </div>
      </div>
      <aside className="h-fit rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-semibold">Your order</h2>
        <div className="mt-6 divide-y divide-border">
          {cart.lines.map((line) => (
            <div key={line.id} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {line.product.name} <span className="text-muted-foreground">x {line.quantity}</span>
              </span>
              <span>{formatMoney(line.line_total, settings)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(cart.subtotal, settings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatMoney(cart.shipping, settings)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatMoney(cart.total, settings)}</span>
          </div>
        </div>
        <div className="mt-6 rounded-md bg-muted p-4">
          <p className="font-semibold">Cash on delivery</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{settings.cod_instructions}</p>
        </div>
        <Button className="mt-6 w-full" disabled={isPending || cart.lines.length === 0}>
          {isPending ? "Placing order..." : "Place COD order"}
        </Button>
      </aside>
    </form>
  );
}

function Field({
  label,
  error,
  className,
  children
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
