"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Wand2 } from "lucide-react";

import { upsertCategoryAction } from "@/actions/admin/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { Category } from "@/lib/db/types";
import { ensureSlug } from "@/lib/slug";
import { categoryUpsertSchema, type CategoryUpsertInput } from "@/lib/validators/category";

export function CategoryForm({ categories, category }: { categories: Category[]; category?: Category | null }) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const form = useForm<CategoryUpsertInput>({
    resolver: zodResolver(categoryUpsertSchema) as unknown as Resolver<CategoryUpsertInput>,
    defaultValues: {
      id: category?.id,
      parent_id: category?.parent_id ?? null,
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      image_url: category?.image_url ?? "",
      sort_order: category?.sort_order ?? 0,
      is_active: category?.is_active ?? true,
      seo_title: category?.seo_title ?? "",
      seo_description: category?.seo_description ?? ""
    }
  });

  function onSubmit(values: CategoryUpsertInput) {
    startTransition(async () => {
      const result = await upsertCategoryAction(values);
      toast({
        title: result.ok ? "Category saved" : "Category failed",
        description: result.ok ? result.message : result.error,
        variant: result.ok ? "default" : "destructive"
      });
      if (result.ok && !category) form.reset({ ...values, id: result.data.id });
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="admin-card overflow-hidden">
      <div className="border-b border-[#e9edf2] px-6 py-5">
        <h2 className="text-lg font-bold text-[#142044]">{category ? "Edit Category" : "Create Category"}</h2>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-2">
        <Field label="Name" error={form.formState.errors.name?.message}>
          <Input className="admin-input" {...form.register("name")} />
        </Field>
        <Field label="Slug" error={form.formState.errors.slug?.message}>
          <div className="flex gap-2">
            <Input className="admin-input" {...form.register("slug")} />
            <Button type="button" variant="outline" onClick={() => form.setValue("slug", ensureSlug(form.getValues("name")), { shouldValidate: true })}>
              <Wand2 className="h-4 w-4" />
            </Button>
          </div>
        </Field>
        <Field label="Parent category">
          <select {...form.register("parent_id")} className="admin-input">
            <option value="">No parent</option>
            {categories
              .filter((item) => item.id !== category?.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Sort order">
          <Input className="admin-input" type="number" min="0" {...form.register("sort_order")} />
        </Field>
        <Field label="Image URL">
          <Input className="admin-input" {...form.register("image_url")} />
        </Field>
        <label className="mt-8 flex items-center gap-2 text-sm">
          <input type="checkbox" {...form.register("is_active")} />
          Active
        </label>
        <Field label="Description" className="sm:col-span-2">
          <Textarea className="rounded-md border-[#d9e0ea]" {...form.register("description")} />
        </Field>
        <Field label="SEO title">
          <Input className="admin-input" {...form.register("seo_title")} />
        </Field>
        <Field label="SEO description">
          <Input className="admin-input" {...form.register("seo_description")} />
        </Field>
      </div>
      <div className="border-t border-[#e9edf2] p-6">
      <Button className="bg-[#ff6c2f] hover:bg-[#ec5c20]" disabled={isPending}>
        {isPending ? "Saving..." : "Save category"}
      </Button>
      </div>
    </form>
  );
}

function Field({ label, error, className, children }: { label: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
