"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { updateSettingsAction } from "@/actions/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { SiteSettings } from "@/lib/db/types";
import { settingsSchema, type SettingsInput } from "@/lib/validators/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [admins, setAdmins] = React.useState(settings.admin_notification_emails.join(", "));
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema) as unknown as Resolver<SettingsInput>,
    defaultValues: {
      store_name: settings.store_name,
      support_email: settings.support_email,
      contact_phone: settings.contact_phone ?? "",
      currency_code: settings.currency_code,
      currency_symbol: settings.currency_symbol,
      flat_shipping_charge: settings.flat_shipping_charge,
      free_shipping_threshold: settings.free_shipping_threshold,
      cod_instructions: settings.cod_instructions,
      admin_notification_emails: settings.admin_notification_emails,
      default_seo_title: settings.default_seo_title,
      default_seo_description: settings.default_seo_description,
      cart_alert_customer_enabled: settings.cart_alert_customer_enabled,
      cart_alert_admin_enabled: settings.cart_alert_admin_enabled,
      homepage_heading: settings.homepage_heading,
      homepage_subheading: settings.homepage_subheading
    }
  });

  function onSubmit(values: SettingsInput) {
    startTransition(async () => {
      const result = await updateSettingsAction({
        ...values,
        admin_notification_emails: admins.split(",").map((email) => email.trim()).filter(Boolean)
      });
      toast({
        title: result.ok ? "Settings saved" : "Settings failed",
        description: result.ok ? result.message : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-md border border-border bg-card p-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Store name">
          <Input {...form.register("store_name")} />
        </Field>
        <Field label="Support email">
          <Input {...form.register("support_email")} type="email" />
        </Field>
        <Field label="Contact phone">
          <Input {...form.register("contact_phone")} />
        </Field>
        <Field label="Admin notification emails">
          <Input value={admins} onChange={(event) => setAdmins(event.target.value)} placeholder="ops@example.com, owner@example.com" />
        </Field>
        <Field label="Currency code">
          <Input {...form.register("currency_code")} />
        </Field>
        <Field label="Currency symbol">
          <Input {...form.register("currency_symbol")} />
        </Field>
        <Field label="Flat shipping charge">
          <Input type="number" step="0.01" min="0" {...form.register("flat_shipping_charge")} />
        </Field>
        <Field label="Free shipping threshold">
          <Input type="number" step="0.01" min="0" {...form.register("free_shipping_threshold")} />
        </Field>
        <Field label="Homepage heading">
          <Input {...form.register("homepage_heading")} />
        </Field>
        <Field label="Homepage subheading">
          <Input {...form.register("homepage_subheading")} />
        </Field>
        <Field label="Default SEO title">
          <Input {...form.register("default_seo_title")} />
        </Field>
        <Field label="Default SEO description">
          <Input {...form.register("default_seo_description")} />
        </Field>
        <Field label="COD instructions" className="lg:col-span-2">
          <Textarea {...form.register("cod_instructions")} />
        </Field>
        <div className="flex flex-wrap gap-5 lg:col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("cart_alert_customer_enabled")} />
            Email customers on cart add
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("cart_alert_admin_enabled")} />
            Email admins on cart add
          </label>
        </div>
      </div>
      <Button className="mt-6" disabled={isPending}>
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
