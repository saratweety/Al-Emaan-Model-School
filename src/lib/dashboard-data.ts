import { createClient } from "@/lib/supabase/server";
import { getToday, getCurrentMonthValue, monthValueToISODate } from "@/lib/school-calendar";

export type AttendanceSnapshot = { present: number; total: number };

export async function getAttendanceSnapshotToday(sessionId: string | null): Promise<AttendanceSnapshot> {
  if (!sessionId) return { present: 0, total: 0 };

  const supabase = await createClient();
  const todayStr = getToday().toISOString().slice(0, 10);

  const [{ count: total }, { data: attendanceRows }] = await Promise.all([
    supabase
      .from("student_enrollments")
      .select("id", { count: "exact", head: true })
      .eq("session_id", sessionId)
      .eq("status", "active"),
    supabase
      .from("attendance")
      .select("status")
      .eq("session_id", sessionId)
      .eq("date", todayStr)
      .returns<{ status: string }[]>(),
  ]);

  const present = (attendanceRows ?? []).filter((r) => r.status === "present" || r.status === "late").length;
  return { present, total: total ?? 0 };
}

export type FeeTier = { label: string; note: string; studentCount: number; amount: number };

export type FeeOverview = {
  unpaidThisMonthCount: number;
  unpaidThisMonthAmount: number;
  tiers: FeeTier[];
};

export async function getFeeOverview(sessionId: string | null): Promise<FeeOverview> {
  const empty: FeeOverview = {
    unpaidThisMonthCount: 0,
    unpaidThisMonthAmount: 0,
    tiers: [
      { label: "2 Months Pending", note: "", studentCount: 0, amount: 0 },
      { label: "3 Months Pending", note: "", studentCount: 0, amount: 0 },
      { label: "More than 3 Months Pending", note: "", studentCount: 0, amount: 0 },
    ],
  };
  if (!sessionId) return empty;

  const supabase = await createClient();
  const currentMonthDate = monthValueToISODate(getCurrentMonthValue());

  const { data: records } = await supabase
    .from("student_fee_records")
    .select("student_id, month_date, amount_due, amount_paid, status")
    .eq("session_id", sessionId)
    .returns<{ student_id: string; month_date: string; amount_due: number; amount_paid: number; status: string }[]>();

  const rows = records ?? [];

  const thisMonthUnpaid = rows.filter((r) => r.month_date === currentMonthDate && r.status !== "paid");
  const unpaidThisMonthCount = thisMonthUnpaid.length;
  const unpaidThisMonthAmount = thisMonthUnpaid.reduce((sum, r) => sum + (Number(r.amount_due) - Number(r.amount_paid)), 0);

  const pendingCountByStudent = new Map<string, number>();
  const pendingAmountByStudent = new Map<string, number>();
  for (const r of rows) {
    if (r.status === "paid") continue;
    pendingCountByStudent.set(r.student_id, (pendingCountByStudent.get(r.student_id) ?? 0) + 1);
    pendingAmountByStudent.set(
      r.student_id,
      (pendingAmountByStudent.get(r.student_id) ?? 0) + (Number(r.amount_due) - Number(r.amount_paid))
    );
  }

  const twoMonths = { count: 0, amount: 0 };
  const threeMonths = { count: 0, amount: 0 };
  const moreThanThree = { count: 0, amount: 0 };

  for (const [studentId, count] of pendingCountByStudent) {
    const amount = pendingAmountByStudent.get(studentId) ?? 0;
    if (count === 2) {
      twoMonths.count++;
      twoMonths.amount += amount;
    } else if (count === 3) {
      threeMonths.count++;
      threeMonths.amount += amount;
    } else if (count > 3) {
      moreThanThree.count++;
      moreThanThree.amount += amount;
    }
  }

  return {
    unpaidThisMonthCount,
    unpaidThisMonthAmount,
    tiers: [
      { label: "2 Months Pending", note: "", studentCount: twoMonths.count, amount: twoMonths.amount },
      { label: "3 Months Pending", note: "", studentCount: threeMonths.count, amount: threeMonths.amount },
      { label: "More than 3 Months Pending", note: "", studentCount: moreThanThree.count, amount: moreThanThree.amount },
    ],
  };
}

export type TeacherRosterRow = { id: string; name: string };

export async function getTeacherRosterSnapshot(): Promise<{ teachers: TeacherRosterRow[]; total: number }> {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from("teachers")
    .select("id, profiles(full_name)", { count: "exact" })
    .returns<{ id: string; profiles: { full_name: string } | null }[]>();

  const teachers = (data ?? []).map((t) => ({ id: t.id, name: t.profiles?.full_name ?? "Unknown" }));
  return { teachers, total: count ?? teachers.length };
}
