"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import {
  getAttendanceOverview,
  getClassRoster,
  type AttendanceOverview,
  type AttendanceStatus,
  type ClassRosterStudent,
} from "@/lib/attendance-data";

export type ActionResult = { success: true } | { success: false; error: string };

export async function fetchAttendanceOverview(date: string): Promise<{ overview: AttendanceOverview | null; error: string | null }> {
  const { userId, error } = await requirePrincipal();
  if (error || !userId) return { overview: null, error: error ?? "Not authorized." };

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { overview: null, error: "No active academic session." };

  const overview = await getAttendanceOverview(sessionId, date);
  return { overview, error: null };
}

export async function fetchClassAttendance(
  classId: string,
  date: string
): Promise<{ roster: ClassRosterStudent[]; statuses: Record<string, AttendanceStatus>; error: string | null }> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { roster: [], statuses: {}, error: error ?? "Not authorized." };

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { roster: [], statuses: {}, error: "No active academic session." };

  const roster = await getClassRoster(sessionId, classId);

  if (roster.length === 0) return { roster, statuses: {}, error: null };

  const { data, error: fetchError } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("date", date)
    .in(
      "student_id",
      roster.map((s) => s.id)
    )
    .returns<{ student_id: string; status: AttendanceStatus }[]>();

  if (fetchError) return { roster, statuses: {}, error: fetchError.message };

  const statuses: Record<string, AttendanceStatus> = {};
  for (const row of data ?? []) statuses[row.student_id] = row.status;

  return { roster, statuses, error: null };
}

export async function correctAttendance(
  classId: string,
  date: string,
  records: { student_id: string; status: AttendanceStatus }[]
): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!classId || !date || records.length === 0) {
    return { success: false, error: "Nothing to save." };
  }

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { success: false, error: "No active academic session." };

  const rows = records.map((r) => ({
    student_id: r.student_id,
    class_id: classId,
    session_id: sessionId,
    date,
    status: r.status,
    marked_by: userId,
  }));

  const { error: upsertError } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
  if (upsertError) return { success: false, error: upsertError.message };

  revalidatePath("/dashboard/attendance");
  return { success: true };
}
