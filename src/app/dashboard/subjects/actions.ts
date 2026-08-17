"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createSubject(name: string, classIds: string[]): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Subject name is required." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("subjects")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (insertError || !inserted) {
    if (insertError?.code === "23505") {
      return { success: false, error: "This subject already exists." };
    }
    return { success: false, error: insertError?.message ?? "Couldn't add the subject." };
  }

  if (classIds.length > 0) {
    const { error: linkError } = await supabase
      .from("class_subjects")
      .insert(classIds.map((classId) => ({ class_id: classId, subject_id: inserted.id })));

    if (linkError) {
      await supabase.from("subjects").delete().eq("id", inserted.id);
      return { success: false, error: linkError.message };
    }
  }

  revalidatePath("/dashboard/subjects");
  return { success: true };
}

export async function updateSubjectClasses(subjectId: string, classIds: string[]): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const { error: deleteError } = await supabase.from("class_subjects").delete().eq("subject_id", subjectId);
  if (deleteError) return { success: false, error: deleteError.message };

  if (classIds.length > 0) {
    const { error: insertError } = await supabase
      .from("class_subjects")
      .insert(classIds.map((classId) => ({ class_id: classId, subject_id: subjectId })));
    if (insertError) return { success: false, error: insertError.message };
  }

  revalidatePath("/dashboard/subjects");
  return { success: true };
}

export async function deleteSubject(id: string): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const { error: deleteError } = await supabase.from("subjects").delete().eq("id", id);

  if (deleteError) {
    if (deleteError.code === "23503") {
      return { success: false, error: "This subject is used in a teacher assignment and can't be deleted." };
    }
    return { success: false, error: deleteError.message };
  }

  revalidatePath("/dashboard/subjects");
  return { success: true };
}
