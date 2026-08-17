"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type ActionResult = { success: true } | { success: false; error: string };

export async function assignTeacher(
  classId: string,
  subjectId: string,
  teacherId: string,
  isClassTeacher: boolean
): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  if (!subjectId || !teacherId) {
    return { success: false, error: "Select a subject and a teacher." };
  }

  const sessionId = await getCurrentSessionId();
  if (!sessionId) {
    return { success: false, error: "No current academic session is configured." };
  }

  const { error: insertError } = await supabase.from("teacher_assignments").insert({
    class_id: classId,
    subject_id: subjectId,
    teacher_id: teacherId,
    session_id: sessionId,
    is_class_teacher: isClassTeacher,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      if (insertError.message.includes("one_class_teacher_per_class_session")) {
        return { success: false, error: "This class already has a class teacher for the current session." };
      }
      return { success: false, error: "This subject is already assigned to a teacher for this class." };
    }
    return { success: false, error: insertError.message };
  }

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: true };
}

export async function removeAssignment(assignmentId: string, classId: string): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const { error: deleteError } = await supabase.from("teacher_assignments").delete().eq("id", assignmentId);
  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  revalidatePath(`/dashboard/classes/${classId}`);
  revalidatePath("/dashboard/classes");
  return { success: true };
}
