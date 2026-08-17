"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/teacher-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function saveMarks(examId: string, marks: { student_id: string; marks: number }[]): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!examId || marks.length === 0) {
    return { success: false, error: "Enter at least one mark before saving." };
  }

  const rows = marks.map((m) => ({
    exam_id: examId,
    student_id: m.student_id,
    marks: m.marks,
    entered_by: userId,
  }));

  const { error: upsertError } = await supabase.from("exam_marks").upsert(rows, { onConflict: "exam_id,student_id" });
  if (upsertError) return { success: false, error: upsertError.message };

  revalidatePath("/teacher/results");
  return { success: true };
}
