"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import { updateProfileAction } from "@/actions/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import type { Profile } from "@/lib/db/types";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validators/profile";

export function ProfileForm({ profile }: { profile: Profile }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema) as unknown as Resolver<ProfileUpdateInput>,
    defaultValues: {
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? ""
    }
  });

  function onSubmit(values: ProfileUpdateInput) {
    startTransition(async () => {
      const result = await updateProfileAction(values);
      toast({
        title: result.ok ? "Profile saved" : "Profile update failed",
        description: result.ok ? "Your customer profile was updated." : result.error,
        variant: result.ok ? "default" : "destructive"
      });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-md border border-border bg-card p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Full name</Label>
          <Input className="mt-2" {...form.register("full_name")} />
          {form.formState.errors.full_name ? <p className="mt-1 text-sm text-destructive">{form.formState.errors.full_name.message}</p> : null}
        </div>
        <div>
          <Label>Email</Label>
          <Input className="mt-2" value={profile.email} disabled />
        </div>
        <div>
          <Label>Phone</Label>
          <Input className="mt-2" {...form.register("phone")} />
        </div>
      </div>
      <Button className="mt-6" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
