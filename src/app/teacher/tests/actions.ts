"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/teacher-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createTest(formData: FormData): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const classId = String(formData.get("class_id") ?? "");
  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const maxMarks = Number(formData.get("max_marks"));
  const examDateRaw = String(formData.get("exam_date") ?? "").trim();

  if (!classId || !name || !maxMarks || maxMarks <= 0) {
    return { success: false, error: "Class, test name and total marks are required." };
  }

  const { error: insertError } = await supabase.from("exams").insert({
    class_id: classId,
    teacher_id: userId,
    subject_id: subjectId || null,
    name,
    max_marks: maxMarks,
    exam_date: examDateRaw || null,
  });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/teacher/tests");
  revalidatePath("/teacher/results");
  return { success: true };
}

export async function deleteTest(id: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: deleteError } = await supabase.from("exams").delete().eq("id", id).eq("teacher_id", userId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/teacher/tests");
  revalidatePath("/teacher/results");
  return { success: true };
}
