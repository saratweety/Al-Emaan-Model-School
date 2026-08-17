"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getAllExams, getExamResultDetail, type ExamRow, type ExamResultDetail } from "@/lib/exams-data";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createExam(formData: FormData): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const classId = String(formData.get("class_id") ?? "").trim();
  const teacherId = String(formData.get("teacher_id") ?? "").trim();
  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const maxMarks = Number(formData.get("max_marks"));
  const examDateRaw = String(formData.get("exam_date") ?? "").trim();

  if (!classId || !teacherId || !name || !maxMarks || maxMarks <= 0) {
    return { success: false, error: "Class, teacher, exam name and total marks are required." };
  }

  const { error: insertError } = await supabase.from("exams").insert({
    class_id: classId,
    teacher_id: teacherId,
    subject_id: subjectId || null,
    name,
    max_marks: maxMarks,
    exam_date: examDateRaw || null,
  });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/dashboard/exams");
  revalidatePath("/dashboard/results");
  return { success: true };
}

export async function deleteExam(examId: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: deleteError } = await supabase.from("exams").delete().eq("id", examId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/exams");
  revalidatePath("/dashboard/results");
  return { success: true };
}

export async function setExamPublished(examId: string, published: boolean): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: updateError } = await supabase.from("exams").update({ is_published: published }).eq("id", examId);
  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/dashboard/exams");
  revalidatePath("/dashboard/results");
  return { success: true };
}

export async function fetchExamResult(examId: string): Promise<{ detail: ExamResultDetail | null; error: string | null }> {
  const { userId, error } = await requirePrincipal();
  if (error || !userId) return { detail: null, error: error ?? "Not authorized." };

  const sessionId = await getCurrentSessionId();
  const exams: ExamRow[] = await getAllExams(sessionId);
  const exam = exams.find((e) => e.id === examId);
  if (!exam) return { detail: null, error: "Exam not found." };

  const detail = await getExamResultDetail(sessionId, exam);
  return { detail, error: null };
}
