"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type ActionResult = { success: true } | { success: false; error: string };

export type TeacherAttendanceStatus = "present" | "absent" | "leave" | "late";

export async function saveTeacherAttendance(
  date: string,
  records: { teacher_id: string; status: TeacherAttendanceStatus }[]
): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!date || records.length === 0) {
    return { success: false, error: "Nothing to save." };
  }

  const sessionId = await getCurrentSessionId();

  const rows = records.map((r) => ({
    teacher_id: r.teacher_id,
    session_id: sessionId,
    date,
    status: r.status,
    marked_by: userId,
    updated_at: new Date().toISOString(),
  }));

  const { error: upsertError } = await supabase.from("teacher_attendance").upsert(rows, { onConflict: "teacher_id,date" });
  if (upsertError) return { success: false, error: upsertError.message };

  revalidatePath("/dashboard/teachers/attendance");
  revalidatePath("/dashboard/teachers");
  return { success: true };
}

export async function getTeacherAttendanceForDate(
  teacherIds: string[],
  date: string
): Promise<{
  statuses: Record<string, TeacherAttendanceStatus>;
  checkInTimes: Record<string, string | null>;
  error: string | null;
}> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { statuses: {}, checkInTimes: {}, error: error ?? "Not authorized." };

  if (teacherIds.length === 0) return { statuses: {}, checkInTimes: {}, error: null };

  const { data, error: fetchError } = await supabase
    .from("teacher_attendance")
    .select("teacher_id, status, check_in_time")
    .eq("date", date)
    .in("teacher_id", teacherIds)
    .returns<{ teacher_id: string; status: TeacherAttendanceStatus; check_in_time: string | null }[]>();

  if (fetchError) return { statuses: {}, checkInTimes: {}, error: fetchError.message };

  const statuses: Record<string, TeacherAttendanceStatus> = {};
  const checkInTimes: Record<string, string | null> = {};
  for (const row of data ?? []) {
    statuses[row.teacher_id] = row.status;
    checkInTimes[row.teacher_id] = row.check_in_time;
  }

  return { statuses, checkInTimes, error: null };
}
