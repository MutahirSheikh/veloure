"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { placeOrderAction } from "@/actions/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingOverlay } from "@/components/ui/brand-loader";
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-10 xl:grid-cols-[1fr_420px]">
      <LoadingOverlay show={isPending} label="Placing order" />
      <input type="hidden" {...form.register("idempotency_key")} />

      <div className="rounded-[30px] border border-black/8 bg-white p-6 shadow-[0_18px_40px_rgba(31,24,18,0.05)] md:p-8">
        <h2 className="text-4xl font-black tracking-tight text-[#141414]">Billing details</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" error={errors.full_name?.message} className="sm:col-span-2">
            <Input {...form.register("full_name")} autoComplete="name" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...form.register("email")} type="email" autoComplete="email" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...form.register("phone")} autoComplete="tel" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Country" error={errors.country?.message} className="sm:col-span-2">
            <Input {...form.register("country")} autoComplete="country-name" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Address line 1" error={errors.address_line_1?.message} className="sm:col-span-2">
            <Input {...form.register("address_line_1")} autoComplete="address-line1" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Address line 2" error={errors.address_line_2?.message} className="sm:col-span-2">
            <Input {...form.register("address_line_2")} autoComplete="address-line2" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="City" error={errors.city?.message}>
            <Input {...form.register("city")} autoComplete="address-level2" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="State / Province" error={errors.state?.message}>
            <Input {...form.register("state")} autoComplete="address-level1" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Postal code" error={errors.postal_code?.message}>
            <Input {...form.register("postal_code")} autoComplete="postal-code" className="h-12 rounded-2xl border-black/12 bg-white" />
          </Field>
          <Field label="Delivery notes" error={errors.delivery_notes?.message} className="sm:col-span-2">
            <Textarea
              {...form.register("delivery_notes")}
              placeholder="Notes for delivery, preferred timing, landmarks..."
              className="min-h-[140px] rounded-[24px] border-black/12 bg-white"
            />
          </Field>
        </div>
      </div>

      <aside className="h-fit rounded-[30px] border border-black/12 bg-white p-6 shadow-[0_18px_40px_rgba(31,24,18,0.05)]">
        <h2 className="text-3xl font-black tracking-tight text-[#141414]">Your order</h2>

        <div className="mt-6 divide-y divide-black/8 rounded-[22px] border border-black/10 bg-white px-5">
          {cart.lines.map((line) => (
            <div key={line.id} className="flex justify-between gap-4 py-4 text-sm">
              <span className="pr-4 text-black/65">
                {line.product.name} <span className="font-semibold text-[#141414]">× {line.quantity}</span>
              </span>
              <span className="font-semibold text-[#141414]">{formatMoney(line.line_total, settings)}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3 rounded-[22px] border border-black/10 bg-white p-5 text-sm">
          <div className="flex justify-between">
            <span className="text-black/55">Cart subtotal</span>
            <span className="font-semibold text-[#141414]">{formatMoney(cart.subtotal, settings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/55">Shipping</span>
            <span className="font-semibold text-[#141414]">{formatMoney(cart.shipping, settings)}</span>
          </div>
          <div className="flex justify-between border-t border-black/8 pt-3 text-2xl font-black tracking-tight text-[#141414]">
            <span>Total</span>
            <span>{formatMoney(cart.total, settings)}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-black/10 bg-white p-5">
          <p className="text-lg font-black tracking-tight text-[#141414]">Cash on delivery</p>
          <p className="mt-3 text-sm leading-7 text-black/55">{settings.cod_instructions}</p>
        </div>

        <Button className="mt-6 h-12 w-full rounded-full bg-black text-white hover:bg-black/90" disabled={isPending || cart.lines.length === 0}>
          {isPending ? "Placing order..." : "Place order"}
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
      <Label className="text-sm font-semibold text-[#141414]">{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
