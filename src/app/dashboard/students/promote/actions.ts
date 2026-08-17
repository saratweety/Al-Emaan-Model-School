"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getPromotableRoster, type PromotableStudent } from "@/lib/promotion-data";

export type FetchRosterResult = { roster: PromotableStudent[]; error: string | null };

export async function fetchPromotableRoster(classId: string): Promise<FetchRosterResult> {
  const { userId, error } = await requirePrincipal();
  if (error || !userId) return { roster: [], error: error ?? "Not authorized." };

  return { roster: await getPromotableRoster(classId), error: null };
}

export type PromotionDecision = { studentId: string; promote: boolean };

export type PromoteResult =
  | { success: true; promoted: number; repeated: number }
  | { success: false; error: string };

export async function promoteStudents(
  fromClassId: string,
  toClassId: string | null,
  decisions: PromotionDecision[]
): Promise<PromoteResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!fromClassId || decisions.length === 0) {
    return { success: false, error: "No students to promote." };
  }

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { success: false, error: "No active academic session." };

  const { data: currentSession, error: sessionError } = await supabase
    .from("academic_sessions")
    .select("start_date")
    .eq("id", sessionId)
    .single();

  if (sessionError || !currentSession) {
    return { success: false, error: sessionError?.message ?? "Current session not found." };
  }

  const nextStartYear = new Date(currentSession.start_date).getFullYear() + 1;
  const nextLabel = `${nextStartYear}–${nextStartYear + 1}`;
  const nextStart = `${nextStartYear}-02-01`;
  const nextEnd = `${nextStartYear + 1}-01-31`;

  const { data, error: rpcError } = await supabase.rpc("promote_students", {
    p_from_class_id: fromClassId,
    p_to_class_id: toClassId,
    p_next_session_label: nextLabel,
    p_next_session_start: nextStart,
    p_next_session_end: nextEnd,
    p_decisions: decisions.map((d) => ({ student_id: d.studentId, promote: d.promote })),
  });

  if (rpcError) return { success: false, error: rpcError.message };

  const result = data as { promoted: number; repeated: number };

  revalidatePath("/dashboard/students/promote");
  revalidatePath("/dashboard/students");
  revalidatePath("/parent");
  revalidatePath("/parent/children");
  revalidatePath("/parent/attendance");
  revalidatePath("/parent/fees");
  revalidatePath("/parent/results");

  return { success: true, promoted: result.promoted, repeated: result.repeated };
}
