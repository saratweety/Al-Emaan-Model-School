import { createClient } from "@/lib/supabase/server";

export type AttendanceStatus = "present" | "absent" | "leave" | "late";

export async function getLatestAttendanceMonth(sessionId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("attendance")
    .select("date")
    .eq("session_id", sessionId)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle<{ date: string }>();

  if (!data) return null;
  const [year, month] = data.date.split("-");
  return `${year}-${month}-01`;
}

export function compareByRollNumber(a: { rollNumber: string | null }, b: { rollNumber: string | null }): number {
  const rollA = a.rollNumber !== null ? Number(a.rollNumber) : null;
  const rollB = b.rollNumber !== null ? Number(b.rollNumber) : null;
  if (rollA !== null && rollB !== null && !Number.isNaN(rollA) && !Number.isNaN(rollB)) return rollA - rollB;
  if (rollA !== null) return -1;
  if (rollB !== null) return 1;
  return 0;
}

export type ClassRosterStudent = {
  id: string;
  full_name: string;
  father_name: string;
  rollNumber: string | null;
};

export async function getClassRoster(sessionId: string, classId: string): Promise<ClassRosterStudent[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("student_enrollments")
    .select("roll_number, students(id, full_name, father_name)")
    .eq("session_id", sessionId)
    .eq("class_id", classId)
    .eq("status", "active")
    .returns<{ roll_number: string | null; students: { id: string; full_name: string; father_name: string } | null }[]>();

  return (data ?? [])
    .filter((row) => row.students)
    .map((row) => ({
      id: row.students!.id,
      full_name: row.students!.full_name,
      father_name: row.students!.father_name,
      rollNumber: row.roll_number,
    }))
    .sort(compareByRollNumber);
}

export type MonthlyAttendanceDay = { date: string; dayLabel: string; dow: string };

export type MonthlyAttendanceRow = {
  studentId: string;
  fullName: string;
  admissionNo: string;
  className: string;
  rollNumber: string | null;
  statusByDate: Record<string, AttendanceStatus>;
  presentPct: number;
  absentDays: number;
  continuousAbsent: boolean;
  statusLabel: "Excellent" | "Good" | "At Risk";
};

export type MonthlyAttendanceGrid = {
  days: MonthlyAttendanceDay[];
  rows: MonthlyAttendanceRow[];
  totals: {
    totalStudents: number;
    present: number;
    absent: number;
    late: number;
    presentPct: string;
    absentPct: string;
    latePct: string;
    continuousAbsentCount: number;
  };
};

export async function getMonthlyAttendanceGrid(
  sessionId: string,
  monthDate: string,
  classId: string | null
): Promise<MonthlyAttendanceGrid> {
  const supabase = await createClient();

  const [year, month] = monthDate.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const rangeStart = monthDate;
  const rangeEnd = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

  let enrollmentQuery = supabase
    .from("student_enrollments")
    .select("student_id, roll_number, class_id, classes(name), students(id, full_name, admission_no)")
    .eq("session_id", sessionId)
    .eq("status", "active");
  if (classId) enrollmentQuery = enrollmentQuery.eq("class_id", classId);

  const { data: enrollments } = await enrollmentQuery.returns<
    {
      student_id: string;
      roll_number: string | null;
      class_id: string;
      classes: { name: string } | null;
      students: { id: string; full_name: string; admission_no: string } | null;
    }[]
  >();

  const empty: MonthlyAttendanceGrid = {
    days: [],
    rows: [],
    totals: { totalStudents: 0, present: 0, absent: 0, late: 0, presentPct: "0.0", absentPct: "0.0", latePct: "0.0", continuousAbsentCount: 0 },
  };

  const validEnrollments = (enrollments ?? []).filter(
    (e): e is typeof e & { students: NonNullable<(typeof e)["students"]> } => e.students !== null
  );
  if (validEnrollments.length === 0) return empty;

  const studentIds = validEnrollments.map((e) => e.student_id);

  const { data: attendanceRows } = await supabase
    .from("attendance")
    .select("student_id, date, status")
    .in("student_id", studentIds)
    .gte("date", rangeStart)
    .lte("date", rangeEnd)
    .returns<{ student_id: string; date: string; status: AttendanceStatus }[]>();

  const marks = attendanceRows ?? [];
  const dateSet = new Set(marks.map((r) => r.date));
  const days: MonthlyAttendanceDay[] = Array.from(dateSet)
    .sort()
    .map((date) => {
      const d = new Date(`${date}T00:00:00`);
      return { date, dayLabel: String(d.getDate()), dow: d.toLocaleDateString("en-US", { weekday: "short" }) };
    });

  const statusByStudent = new Map<string, Map<string, AttendanceStatus>>();
  for (const r of marks) {
    if (!statusByStudent.has(r.student_id)) statusByStudent.set(r.student_id, new Map());
    statusByStudent.get(r.student_id)!.set(r.date, r.status);
  }

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalMarked = 0;
  let continuousAbsentCount = 0;

  const rows: MonthlyAttendanceRow[] = validEnrollments
    .map((e) => {
      const smap = statusByStudent.get(e.student_id) ?? new Map<string, AttendanceStatus>();
      let present = 0;
      let absent = 0;
      let late = 0;
      let marked = 0;
      let streak = 0;
      let maxStreak = 0;

      for (const day of days) {
        const status = smap.get(day.date);
        if (!status) {
          streak = 0;
          continue;
        }
        marked += 1;
        if (status === "present") present += 1;
        else if (status === "absent") {
          absent += 1;
          streak += 1;
          maxStreak = Math.max(maxStreak, streak);
        } else if (status === "late") late += 1;
        if (status !== "absent") streak = 0;
      }

      totalPresent += present;
      totalAbsent += absent;
      totalLate += late;
      totalMarked += marked;

      const presentPct = marked > 0 ? Math.round((present / marked) * 100) : 0;
      const continuousAbsent = maxStreak >= 2;
      if (continuousAbsent) continuousAbsentCount += 1;
      const statusLabel: MonthlyAttendanceRow["statusLabel"] =
        presentPct >= 95 ? "Excellent" : presentPct >= 80 ? "Good" : "At Risk";

      return {
        studentId: e.student_id,
        fullName: e.students.full_name,
        admissionNo: e.students.admission_no,
        className: e.classes?.name ?? "Unassigned",
        rollNumber: e.roll_number,
        statusByDate: Object.fromEntries(smap),
        presentPct,
        absentDays: absent,
        continuousAbsent,
        statusLabel,
      };
    })
    .sort((a, b) => a.className.localeCompare(b.className) || compareByRollNumber(a, b));

  const pct = (n: number) => (totalMarked > 0 ? ((n / totalMarked) * 100).toFixed(2) : "0.00");

  return {
    days,
    rows,
    totals: {
      totalStudents: rows.length,
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      presentPct: pct(totalPresent),
      absentPct: pct(totalAbsent),
      latePct: pct(totalLate),
      continuousAbsentCount,
    },
  };
}
