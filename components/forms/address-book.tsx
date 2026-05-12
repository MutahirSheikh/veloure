"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Check, Pencil, Star, Trash2 } from "lucide-react";

import { deleteAddressAction, setDefaultAddressAction, upsertAddressAction } from "@/actions/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import type { Address } from "@/lib/db/types";
import { addressSchema, type AddressInput } from "@/lib/validators/profile";

const blankAddress: AddressInput = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "United States",
  is_default: false
};

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const { toast } = useToast();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema) as unknown as Resolver<AddressInput>,
    defaultValues: blankAddress
  });

  function edit(address: Address) {
    setEditingId(address.id);
    form.reset({
      id: address.id,
      full_name: address.full_name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
  }

  function reset() {
    setEditingId(null);
    form.reset(blankAddress);
  }

  function onSubmit(values: AddressInput) {
    startTransition(async () => {
      const result = await upsertAddressAction(values);
      toast({
        title: result.ok ? "Address saved" : "Address failed",
        description: result.ok ? "Your address book was updated." : result.error,
        variant: result.ok ? "default" : "destructive"
      });
      if (result.ok) reset();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteAddressAction(id);
      toast({
        title: result.ok ? "Address removed" : "Remove failed",
        description: result.ok ? "The address was deleted." : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  function makeDefault(id: string) {
    startTransition(async () => {
      const result = await setDefaultAddressAction(id);
      toast({
        title: result.ok ? "Default updated" : "Update failed",
        description: result.ok ? "Your default address was changed." : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-md border border-border bg-card p-6">
        <h2 className="font-serif text-2xl font-semibold">{editingId ? "Edit address" : "Add address"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input {...form.register("full_name")} />
          </Field>
          <Field label="Phone">
            <Input {...form.register("phone")} />
          </Field>
          <Field label="Address line 1" className="sm:col-span-2">
            <Input {...form.register("address_line_1")} />
          </Field>
          <Field label="Address line 2" className="sm:col-span-2">
            <Input {...form.register("address_line_2")} />
          </Field>
          <Field label="City">
            <Input {...form.register("city")} />
          </Field>
          <Field label="State">
            <Input {...form.register("state")} />
          </Field>
          <Field label="Postal code">
            <Input {...form.register("postal_code")} />
          </Field>
          <Field label="Country">
            <Input {...form.register("country")} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" {...form.register("is_default")} />
            Use as default shipping address
          </label>
        </div>
        <div className="mt-6 flex gap-3">
          <Button disabled={isPending}>{editingId ? "Save address" : "Add address"}</Button>
          {editingId ? (
            <Button type="button" variant="outline" onClick={reset}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-8 text-center text-muted-foreground">
            No saved addresses yet.
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="rounded-md border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{address.full_name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {address.address_line_1}
                    {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                    <br />
                    {address.city}, {address.state} {address.postal_code}
                    <br />
                    {address.country} / {address.phone}
                  </p>
                </div>
                {address.is_default ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                    <Check className="h-3 w-3" />
                    Default
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(address)}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                {!address.is_default ? (
                  <Button size="sm" variant="outline" onClick={() => makeDefault(address.id)}>
                    <Star className="h-4 w-4" />
                    Default
                  </Button>
                ) : null}
                <Button size="sm" variant="destructive" onClick={() => remove(address.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
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
