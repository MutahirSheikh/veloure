"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { categoryUpsertSchema } from "@/lib/validators/category";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function upsertCategoryAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminProfile();
    const parsed = categoryUpsertSchema.parse(input);
    const supabase = getSupabaseAdminClient();

    const { data: conflict, error: conflictError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", parsed.slug)
      .maybeSingle();

    if (conflictError) throw conflictError;
    if (conflict && conflict.id !== parsed.id) return fail("A category with this slug already exists.");

    const payload = {
      parent_id: parsed.parent_id,
      name: parsed.name,
      slug: parsed.slug,
      description: parsed.description,
      image_url: parsed.image_url,
      sort_order: parsed.sort_order,
      is_active: parsed.is_active,
      seo_title: parsed.seo_title,
      seo_description: parsed.seo_description
    };

    const query = parsed.id
      ? supabase.from("categories").update(payload).eq("id", parsed.id).select("id").single()
      : supabase.from("categories").insert(payload).select("id").single();

    const { data, error } = await query;
    if (error) throw error;

    await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: parsed.id ? "category.updated" : "category.created",
      entity_type: "category",
      entity_id: data.id
    });

    revalidateTag(CACHE_TAGS.categories);
    revalidateTag(CACHE_TAGS.catalog);
    return ok({ id: data.id as string }, parsed.id ? "Category updated." : "Category created.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function archiveCategoryAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireAdminProfile();
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false, archived_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: "category.archived",
      entity_type: "category",
      entity_id: id
    });
    revalidateTag(CACHE_TAGS.categories);
    revalidateTag(CACHE_TAGS.catalog);
    return ok({ id }, "Category archived.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
