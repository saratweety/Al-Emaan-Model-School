import { createClient } from "@/lib/supabase/server";
import { getClasses } from "@/lib/classes-data";

export type AttendanceStatus = "present" | "absent" | "leave" | "late";

export type ClassAttendanceRow = {
  classId: string;
  className: string;
  total: number;
  present: number;
  absent: number;
  leave: number;
  pct: string;
};

export type AttendanceOverview = {
  classRows: ClassAttendanceRow[];
  totals: { total: number; present: number; absent: number; leave: number };
  totalPct: string;
};

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
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export async function getAttendanceOverview(sessionId: string, date: string): Promise<AttendanceOverview> {
  const supabase = await createClient();

  const [{ classes }, { data: enrollments }, { data: attendance }] = await Promise.all([
    getClasses(),
    supabase
      .from("student_enrollments")
      .select("student_id, class_id")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .returns<{ student_id: string; class_id: string }[]>(),
    supabase
      .from("attendance")
      .select("student_id, class_id, status")
      .eq("session_id", sessionId)
      .eq("date", date)
      .returns<{ student_id: string; class_id: string; status: AttendanceStatus }[]>(),
  ]);

  const statusByStudent = new Map<string, AttendanceStatus>();
  for (const row of attendance ?? []) statusByStudent.set(row.student_id, row.status);

  const classRows: ClassAttendanceRow[] = classes.map((c) => {
    const studentsInClass = (enrollments ?? []).filter((e) => e.class_id === c.id);
    const total = studentsInClass.length;
    let present = 0;
    let absent = 0;
    let leave = 0;
    for (const e of studentsInClass) {
      const status = statusByStudent.get(e.student_id);
      if (status === "present" || status === "late") present += 1;
      else if (status === "absent") absent += 1;
      else if (status === "leave") leave += 1;
    }
    const pct = total > 0 ? `${((present / total) * 100).toFixed(1)}%` : "—";
    return { classId: c.id, className: c.name, total, present, absent, leave, pct };
  });

  const totals = classRows.reduce(
    (acc, row) => ({
      total: acc.total + row.total,
      present: acc.present + row.present,
      absent: acc.absent + row.absent,
      leave: acc.leave + row.leave,
    }),
    { total: 0, present: 0, absent: 0, leave: 0 }
  );

  const totalPct = totals.total > 0 ? ((totals.present / totals.total) * 100).toFixed(1) : "0.0";

  return { classRows, totals, totalPct };
}
