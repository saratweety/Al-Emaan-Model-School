"use server";

import { requireParent } from "@/lib/parent-auth";
import {
  getChildAttendanceMonth,
  getChildAttendanceSessionSummary,
  getChildFeeRows,
  getChildPublishedResults,
  getChildHomework,
  getChildTimetable,
  type AttendanceDay,
  type MonthlyAttendanceSummary,
  type FeeRow,
  type ChildResult,
  type HomeworkEntry,
} from "@/lib/parent-data";
import type { ClassSchedule } from "@/lib/timetable-data";

export async function fetchAttendanceMonth(
  studentId: string,
  year: number,
  month: number
): Promise<{ days: AttendanceDay[]; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { days: [], error: error ?? "Not authorized." };
  return { days: await getChildAttendanceMonth(studentId, year, month), error: null };
}

export async function fetchAttendanceSessionSummary(
  studentId: string
): Promise<{ months: MonthlyAttendanceSummary[]; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { months: [], error: error ?? "Not authorized." };
  return { months: await getChildAttendanceSessionSummary(studentId), error: null };
}

export async function fetchChildFees(studentId: string): Promise<{ rows: FeeRow[]; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { rows: [], error: error ?? "Not authorized." };
  return { rows: await getChildFeeRows(studentId), error: null };
}

export async function fetchChildResults(studentId: string): Promise<{ results: ChildResult[]; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { results: [], error: error ?? "Not authorized." };
  return { results: await getChildPublishedResults(studentId), error: null };
}

export async function fetchChildHomework(classId: string): Promise<{ homework: HomeworkEntry[]; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { homework: [], error: error ?? "Not authorized." };
  return { homework: await getChildHomework(classId), error: null };
}

export async function fetchChildTimetable(classId: string): Promise<{ schedule: ClassSchedule; error: string | null }> {
  const { userId, error } = await requireParent();
  if (error || !userId) return { schedule: { weekday: [], friday: [] }, error: error ?? "Not authorized." };
  return { schedule: await getChildTimetable(classId), error: null };
}
