import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type StudentReportRow = {
  admissionNo: string;
  fullName: string;
  fatherName: string;
  className: string;
  contactNumber: string | null;
  admissionDate: string;
};

export async function getStudentReport(): Promise<StudentReportRow[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: students } = await supabase
    .from("students")
    .select("id, admission_no, full_name, father_name, contact_number, admission_date")
    .order("full_name", { ascending: true })
    .returns<{ id: string; admission_no: string; full_name: string; father_name: string; contact_number: string | null; admission_date: string }[]>();

  const classByStudent = new Map<string, string>();
  if (sessionId && students && students.length > 0) {
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(name)")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .in("student_id", students.map((s) => s.id))
      .returns<{ student_id: string; classes: { name: string } | null }[]>();
    for (const e of enrollments ?? []) if (e.classes) classByStudent.set(e.student_id, e.classes.name);
  }

  return (students ?? []).map((s) => ({
    admissionNo: s.admission_no,
    fullName: s.full_name,
    fatherName: s.father_name,
    className: classByStudent.get(s.id) ?? "Unassigned",
    contactNumber: s.contact_number,
    admissionDate: s.admission_date,
  }));
}

export type AttendanceReportRow = {
  studentName: string;
  admissionNo: string;
  date: string;
  status: string;
};

export async function getAttendanceReport(classId: string | null, from: string, to: string): Promise<AttendanceReportRow[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return [];

  let query = supabase
    .from("attendance")
    .select("date, status, students(admission_no, full_name)")
    .eq("session_id", sessionId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });

  if (classId) query = query.eq("class_id", classId);

  const { data } = await query.returns<{ date: string; status: string; students: { admission_no: string; full_name: string } | null }[]>();

  return (data ?? []).map((r) => ({
    studentName: r.students?.full_name ?? "Unknown",
    admissionNo: r.students?.admission_no ?? "—",
    date: r.date,
    status: r.status,
  }));
}

export type FeeReportRow = {
  studentName: string;
  admissionNo: string;
  className: string;
  amountDue: number;
  amountPaid: number;
  status: string;
};

export async function getFeeReport(monthDate: string): Promise<FeeReportRow[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return [];

  const { data } = await supabase
    .from("student_fee_records")
    .select("amount_due, amount_paid, status, students(admission_no, full_name), student_id")
    .eq("session_id", sessionId)
    .eq("month_date", monthDate)
    .returns<{ amount_due: number; amount_paid: number; status: string; students: { admission_no: string; full_name: string } | null; student_id: string }[]>();

  const studentIds = (data ?? []).map((r) => r.student_id);
  const classByStudent = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(name)")
      .eq("session_id", sessionId)
      .in("student_id", studentIds)
      .returns<{ student_id: string; classes: { name: string } | null }[]>();
    for (const e of enrollments ?? []) if (e.classes) classByStudent.set(e.student_id, e.classes.name);
  }

  return (data ?? []).map((r) => ({
    studentName: r.students?.full_name ?? "Unknown",
    admissionNo: r.students?.admission_no ?? "—",
    className: classByStudent.get(r.student_id) ?? "Unassigned",
    amountDue: Number(r.amount_due),
    amountPaid: Number(r.amount_paid),
    status: r.status,
  }));
}

export type PendingFeeReportRow = {
  studentName: string;
  admissionNo: string;
  className: string;
  monthsPending: number;
  amountPending: number;
};

export async function getPendingFeeReport(): Promise<PendingFeeReportRow[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return [];

  const { data } = await supabase
    .from("student_fee_records")
    .select("amount_due, amount_paid, status, student_id, students(admission_no, full_name)")
    .eq("session_id", sessionId)
    .neq("status", "paid")
    .returns<{ amount_due: number; amount_paid: number; status: string; student_id: string; students: { admission_no: string; full_name: string } | null }[]>();

  const rows = data ?? [];
  const studentIds = [...new Set(rows.map((r) => r.student_id))];
  const classByStudent = new Map<string, string>();
  if (studentIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(name)")
      .eq("session_id", sessionId)
      .in("student_id", studentIds)
      .returns<{ student_id: string; classes: { name: string } | null }[]>();
    for (const e of enrollments ?? []) if (e.classes) classByStudent.set(e.student_id, e.classes.name);
  }

  const byStudent = new Map<string, PendingFeeReportRow>();
  for (const r of rows) {
    const existing = byStudent.get(r.student_id);
    const pending = Number(r.amount_due) - Number(r.amount_paid);
    if (existing) {
      existing.monthsPending += 1;
      existing.amountPending += pending;
    } else {
      byStudent.set(r.student_id, {
        studentName: r.students?.full_name ?? "Unknown",
        admissionNo: r.students?.admission_no ?? "—",
        className: classByStudent.get(r.student_id) ?? "Unassigned",
        monthsPending: 1,
        amountPending: pending,
      });
    }
  }

  return [...byStudent.values()].sort((a, b) => b.monthsPending - a.monthsPending);
}

export type ResultReportRow = {
  studentName: string;
  admissionNo: string;
  marks: number;
  maxMarks: number;
  percentage: number;
};

export async function getResultReport(examId: string): Promise<ResultReportRow[]> {
  const supabase = await createClient();

  const { data: exam } = await supabase.from("exams").select("max_marks").eq("id", examId).maybeSingle<{ max_marks: number }>();
  if (!exam) return [];

  const { data } = await supabase
    .from("exam_marks")
    .select("marks, students(admission_no, full_name)")
    .eq("exam_id", examId)
    .returns<{ marks: number; students: { admission_no: string; full_name: string } | null }[]>();

  return (data ?? [])
    .map((r) => ({
      studentName: r.students?.full_name ?? "Unknown",
      admissionNo: r.students?.admission_no ?? "—",
      marks: Number(r.marks),
      maxMarks: Number(exam.max_marks),
      percentage: exam.max_marks > 0 ? Math.round((Number(r.marks) / Number(exam.max_marks)) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

export type TeacherReportRow = {
  teacherCode: string;
  fullName: string;
  qualification: string | null;
  specializationSubject: string | null;
  assignments: string;
};

export async function getTeacherReport(): Promise<TeacherReportRow[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: teachers } = await supabase
    .from("teachers")
    .select("id, teacher_code, qualification, profiles(full_name), subjects(name)")
    .order("teacher_code", { ascending: true })
    .returns<{ id: string; teacher_code: string; qualification: string | null; profiles: { full_name: string } | null; subjects: { name: string } | null }[]>();

  const assignmentsByTeacher = new Map<string, string[]>();
  if (sessionId && teachers && teachers.length > 0) {
    const { data: assignments } = await supabase
      .from("teacher_assignments")
      .select("teacher_id, classes(name), subjects(name)")
      .eq("session_id", sessionId)
      .in("teacher_id", teachers.map((t) => t.id))
      .returns<{ teacher_id: string; classes: { name: string } | null; subjects: { name: string } | null }[]>();
    for (const a of assignments ?? []) {
      const label = `${a.classes?.name ?? "?"} (${a.subjects?.name ?? "?"})`;
      const list = assignmentsByTeacher.get(a.teacher_id) ?? [];
      list.push(label);
      assignmentsByTeacher.set(a.teacher_id, list);
    }
  }

  return (teachers ?? []).map((t) => ({
    teacherCode: t.teacher_code,
    fullName: t.profiles?.full_name ?? "Unknown",
    qualification: t.qualification,
    specializationSubject: t.subjects?.name ?? null,
    assignments: (assignmentsByTeacher.get(t.id) ?? []).join(", ") || "—",
  }));
}

export type SummaryReport = {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingFeeStudents: number;
  pendingFeeAmount: number;
};

export async function getSummaryReport(): Promise<SummaryReport> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const [{ count: totalStudents }, { count: totalTeachers }, { count: totalClasses }, pendingRows] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    sessionId
      ? supabase.from("student_fee_records").select("student_id, amount_due, amount_paid").eq("session_id", sessionId).neq("status", "paid")
      : Promise.resolve({ data: [] }),
  ]);

  const rows = (pendingRows.data ?? []) as { student_id: string; amount_due: number; amount_paid: number }[];
  const pendingFeeStudents = new Set(rows.map((r) => r.student_id)).size;
  const pendingFeeAmount = rows.reduce((sum, r) => sum + (Number(r.amount_due) - Number(r.amount_paid)), 0);

  return {
    totalStudents: totalStudents ?? 0,
    totalTeachers: totalTeachers ?? 0,
    totalClasses: totalClasses ?? 0,
    pendingFeeStudents,
    pendingFeeAmount,
  };
}
