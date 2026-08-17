"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getClassSchedule, type ClassSchedule, type DayType } from "@/lib/timetable-data";

export type { ClassSchedule };

export async function fetchClassSchedule(sessionId: string, classId: string): Promise<ClassSchedule> {
  return getClassSchedule(sessionId, classId);
}

export type PeriodInput = {
  id: string | null;
  label: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  subject_id: string | null;
};

export type SaveTimetableInput = {
  sessionId: string;
  classId: string;
  weekday: PeriodInput[];
  friday: PeriodInput[];
};

export type SaveTimetableResult = { success: true } | { success: false; error: string };

async function savePeriodsForDayType(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  dayType: DayType,
  rows: PeriodInput[]
): Promise<{ ids: string[] } | { error: string }> {
  const { data: existing, error: existingError } = await supabase
    .from("timetable_periods")
    .select("id")
    .eq("session_id", sessionId)
    .eq("day_type", dayType);

  if (existingError) return { error: existingError.message };

  const existingIds = new Set((existing ?? []).map((p) => p.id as string));
  const keptIds = new Set<string>();
  const resultIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.id && existingIds.has(row.id)) {
      const { error } = await supabase
        .from("timetable_periods")
        .update({
          period_index: i,
          label: row.label,
          start_time: row.start_time,
          end_time: row.end_time,
          is_break: row.is_break,
        })
        .eq("id", row.id);
      if (error) return { error: error.message };
      keptIds.add(row.id);
      resultIds.push(row.id);
    } else {
      const { data: inserted, error } = await supabase
        .from("timetable_periods")
        .insert({
          session_id: sessionId,
          day_type: dayType,
          period_index: i,
          label: row.label,
          start_time: row.start_time,
          end_time: row.end_time,
          is_break: row.is_break,
        })
        .select("id")
        .single();
      if (error || !inserted) return { error: error?.message ?? "Couldn't save a period." };
      keptIds.add(inserted.id as string);
      resultIds.push(inserted.id as string);
    }
  }

  const removedIds = [...existingIds].filter((id) => !keptIds.has(id));
  if (removedIds.length > 0) {
    const { error } = await supabase.from("timetable_periods").delete().in("id", removedIds);
    if (error) return { error: error.message };
  }

  return { ids: resultIds };
}

export async function saveTimetable(input: SaveTimetableInput): Promise<SaveTimetableResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  if (!input.sessionId || !input.classId) {
    return { success: false, error: "Select an academic session and class first." };
  }

  for (const [dayType, rows] of [
    ["weekday", input.weekday],
    ["friday", input.friday],
  ] as [DayType, PeriodInput[]][]) {
    const saved = await savePeriodsForDayType(supabase, input.sessionId, dayType, rows);
    if ("error" in saved) {
      return { success: false, error: saved.error };
    }

    const { error: deleteError } = await supabase
      .from("timetable_entries")
      .delete()
      .eq("session_id", input.sessionId)
      .eq("class_id", input.classId)
      .eq("day_type", dayType);
    if (deleteError) return { success: false, error: deleteError.message };

    const entriesToInsert = rows
      .map((row, i) => ({ row, periodId: saved.ids[i] }))
      .filter(({ row }) => !row.is_break && row.subject_id)
      .map(({ row, periodId }) => ({
        session_id: input.sessionId,
        class_id: input.classId,
        day_type: dayType,
        period_id: periodId,
        subject_id: row.subject_id,
      }));

    if (entriesToInsert.length > 0) {
      const { error: insertError } = await supabase.from("timetable_entries").insert(entriesToInsert);
      if (insertError) return { success: false, error: insertError.message };
    }
  }

  revalidatePath("/dashboard/timetable");
  return { success: true };
}
