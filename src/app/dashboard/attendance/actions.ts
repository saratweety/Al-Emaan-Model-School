"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import type { AttendanceStatus } from "@/lib/attendance-data";

export type ActionResult = { success: true } | { success: false; error: string };

export async function updateStudentAttendance(
  studentId: string,
  classId: string,
  records: { date: string; status: AttendanceStatus }[]
): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!studentId || !classId || records.length === 0) {
    return { success: false, error: "Nothing to save." };
  }

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { success: false, error: "No active academic session." };

  const rows = records.map((r) => ({
    student_id: studentId,
    class_id: classId,
    session_id: sessionId,
    date: r.date,
    status: r.status,
    marked_by: userId,
  }));

  const { error: upsertError } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
  if (upsertError) return { success: false, error: upsertError.message };

  revalidatePath("/dashboard/attendance");
  revalidatePath("/teacher/students");
  revalidatePath("/parent/attendance");
  return { success: true };
}
