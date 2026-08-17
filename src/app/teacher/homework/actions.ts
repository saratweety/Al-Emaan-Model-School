"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/teacher-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type ActionResult = { success: true } | { success: false; error: string };

function readHomeworkForm(formData: FormData) {
  const classId = String(formData.get("class_id") ?? "");
  const subjectId = String(formData.get("subject_id") ?? "").trim();
  const entryType = String(formData.get("entry_type") ?? "homework").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDateRaw = String(formData.get("due_date") ?? "").trim();

  return {
    classId,
    subjectId,
    entryType: entryType === "vacation_diary" ? "vacation_diary" : "homework",
    title,
    description,
    dueDate: dueDateRaw || null,
  };
}

async function verifyAssignment(
  supabase: Awaited<ReturnType<typeof requireTeacher>>["supabase"],
  teacherId: string,
  classId: string,
  subjectId: string | null,
  entryType: string
): Promise<string | null> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return "No current academic session is configured.";

  if (entryType === "vacation_diary") {
    const { data } = await supabase
      .from("teacher_assignments")
      .select("id")
      .eq("teacher_id", teacherId)
      .eq("class_id", classId)
      .eq("session_id", sessionId)
      .eq("is_class_teacher", true)
      .maybeSingle();
    if (!data) return "Only the class teacher for this class can post the class/vacation diary.";
    return null;
  }

  const { data } = await supabase
    .from("teacher_assignments")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("class_id", classId)
    .eq("subject_id", subjectId ?? "")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (!data) return "You can only post homework for a subject you teach in this class.";
  return null;
}

export async function createHomework(formData: FormData): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { classId, subjectId, entryType, title, description, dueDate } = readHomeworkForm(formData);

  if (!classId || !title || (entryType === "homework" && (!subjectId || !description))) {
    return { success: false, error: "Class, subject, title and description are required." };
  }

  const assignmentError = await verifyAssignment(supabase, userId, classId, entryType === "homework" ? subjectId : null, entryType);
  if (assignmentError) return { success: false, error: assignmentError };

  const { error: insertError } = await supabase.from("homework").insert({
    class_id: classId,
    teacher_id: userId,
    subject_id: entryType === "homework" ? subjectId : null,
    entry_type: entryType,
    title,
    description,
    due_date: dueDate,
  });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/teacher/homework");
  revalidatePath("/parent/homework");
  revalidatePath("/dashboard/homework");
  return { success: true };
}

export async function updateHomework(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { classId, subjectId, entryType, title, description, dueDate } = readHomeworkForm(formData);

  if (!classId || !title || (entryType === "homework" && (!subjectId || !description))) {
    return { success: false, error: "Class, subject, title and description are required." };
  }

  const assignmentError = await verifyAssignment(supabase, userId, classId, entryType === "homework" ? subjectId : null, entryType);
  if (assignmentError) return { success: false, error: assignmentError };

  const { error: updateError } = await supabase
    .from("homework")
    .update({
      class_id: classId,
      subject_id: entryType === "homework" ? subjectId : null,
      title,
      description,
      due_date: dueDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("teacher_id", userId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/teacher/homework");
  revalidatePath("/parent/homework");
  revalidatePath("/dashboard/homework");
  return { success: true };
}

export async function deleteHomework(id: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requireTeacher();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: deleteError } = await supabase.from("homework").delete().eq("id", id).eq("teacher_id", userId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/teacher/homework");
  revalidatePath("/parent/homework");
  revalidatePath("/dashboard/homework");
  return { success: true };
}
