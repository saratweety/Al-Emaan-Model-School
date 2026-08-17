"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export type NoticeType = "holiday" | "event" | "general" | "reminder" | "announcement";
export type NoticeAudience = "everyone" | "teachers" | "parents" | "class";

export type CreateNoticeInput = {
  title: string;
  description: string;
  noticeType: NoticeType;
  audience: NoticeAudience;
  classId: string | null;
  publishDate: string;
  expiryDate: string | null;
};

export async function createNotice(input: CreateNoticeInput): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!input.title.trim() || !input.description.trim() || !input.publishDate) {
    return { success: false, error: "Title, description and publish date are required." };
  }
  if (input.audience === "class" && !input.classId) {
    return { success: false, error: "Select a class for a class-specific notice." };
  }

  const { error: insertError } = await supabase.from("notices").insert({
    title: input.title.trim(),
    description: input.description.trim(),
    notice_type: input.noticeType,
    audience: input.audience,
    class_id: input.audience === "class" ? input.classId : null,
    publish_date: input.publishDate,
    expiry_date: input.expiryDate || null,
    created_by: userId,
  });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/dashboard/notices");
  return { success: true };
}

export async function updateNotice(id: string, input: CreateNoticeInput): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!input.title.trim() || !input.description.trim() || !input.publishDate) {
    return { success: false, error: "Title, description and publish date are required." };
  }
  if (input.audience === "class" && !input.classId) {
    return { success: false, error: "Select a class for a class-specific notice." };
  }

  const { error: updateError } = await supabase
    .from("notices")
    .update({
      title: input.title.trim(),
      description: input.description.trim(),
      notice_type: input.noticeType,
      audience: input.audience,
      class_id: input.audience === "class" ? input.classId : null,
      publish_date: input.publishDate,
      expiry_date: input.expiryDate || null,
    })
    .eq("id", id);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/dashboard/notices");
  revalidatePath(`/dashboard/notices/${id}`);
  return { success: true };
}

export async function deleteNotice(id: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: deleteError } = await supabase.from("notices").delete().eq("id", id);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/notices");
  return { success: true };
}
