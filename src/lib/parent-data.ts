import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getClassSchedule, type ClassSchedule } from "@/lib/timetable-data";
import { gradeFor } from "@/lib/grading";

export type ParentChild = {
  id: string;
  name: string;
  fatherName: string;
  classId: string | null;
  className: string;
  admissionNo: string;
};

export async function getParentChildren(parentId: string): Promise<ParentChild[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: links } = await supabase
    .from("student_parents")
    .select("students(id, full_name, father_name, admission_no)")
    .eq("parent_id", parentId)
    .returns<{ students: { id: string; full_name: string; father_name: string; admission_no: string } | null }[]>();

  const students = (links ?? []).map((l) => l.students).filter((s): s is NonNullable<typeof s> => Boolean(s));

  const classByStudent = new Map<string, { id: string; name: string }>();

  if (sessionId && students.length > 0) {
    const { data: enrollRows } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(id, name)")
      .eq("session_id", sessionId)
      .eq("status", "active")
      .in(
        "student_id",
        students.map((s) => s.id)
      )
      .returns<{ student_id: string; classes: { id: string; name: string } | null }[]>();

    for (const e of enrollRows ?? []) {
      if (e.classes) classByStudent.set(e.student_id, e.classes);
    }
  }

  return students
    .map((s) => ({
      id: s.id,
      name: s.full_name,
      fatherName: s.father_name,
      classId: classByStudent.get(s.id)?.id ?? null,
      className: classByStudent.get(s.id)?.name ?? "Unassigned",
      admissionNo: s.admission_no,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type ChildSummary = {
  attendancePct: string;
  feeStatus: string;
  feePendingMonths: number;
  latestResult: string;
  classTeacher: string;
};

export async function getChildSummary(child: ParentChild): Promise<ChildSummary> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [{ data: attendanceRows }, { data: feeRows }, { data: markRow }, { data: teacherRow }] = await Promise.all([
    supabase
      .from("attendance")
      .select("status")
      .eq("student_id", child.id)
      .gte("date", monthStart)
      .lte("date", monthEnd),
    sessionId
      ? supabase.from("student_fee_records").select("status").eq("student_id", child.id).eq("session_id", sessionId)
      : Promise.resolve({ data: [] }),
    supabase
      .from("exam_marks")
      .select("marks, updated_at, exams!inner(name, max_marks, subject_id, is_published, subjects(name))")
      .eq("student_id", child.id)
      .eq("exams.is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .returns<{ marks: number; updated_at: string; exams: { name: string; max_marks: number; subjects: { name: string } | null } }[]>(),
    sessionId && child.classId
      ? supabase
          .from("teacher_assignments")
          .select("profiles(full_name)")
          .eq("session_id", sessionId)
          .eq("class_id", child.classId)
          .eq("is_class_teacher", true)
          .maybeSingle()
          .returns<{ profiles: { full_name: string } | null } | null>()
      : Promise.resolve({ data: null }),
  ]);

  const marked = (attendanceRows ?? []) as { status: string }[];
  const presentCount = marked.filter((r) => r.status === "present" || r.status === "late").length;
  const attendancePct = marked.length > 0 ? `${Math.round((presentCount / marked.length) * 100)}%` : "—";

  const fees = (feeRows ?? []) as { status: string }[];
  const feePendingMonths = fees.filter((f) => f.status !== "paid").length;
  const feeStatus = fees.length === 0 ? "—" : feePendingMonths === 0 ? "Paid" : "Pending";

  const latest = markRow?.[0];
  const latestResult = latest
    ? `${latest.exams.subjects?.name ?? latest.exams.name}: ${gradeFor((latest.marks / latest.exams.max_marks) * 100).grade}`
    : "—";

  const classTeacher = teacherRow?.profiles?.full_name ?? "—";

  return { attendancePct, feeStatus, feePendingMonths, latestResult, classTeacher };
}

export type AttendanceDay = { date: string; status: "present" | "absent" | "leave" | "late" };

export async function getChildAttendanceMonth(studentId: string, year: number, month: number): Promise<AttendanceDay[]> {
  const supabase = await createClient();

  const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const end = new Date(year, month + 1, 0);
  const endStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;

  const { data } = await supabase
    .from("attendance")
    .select("date, status")
    .eq("student_id", studentId)
    .gte("date", start)
    .lte("date", endStr)
    .returns<AttendanceDay[]>();

  return data ?? [];
}

export type MonthlyAttendanceSummary = {
  monthKey: string;
  monthLabel: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  totalMarked: number;
  pct: number;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export async function getChildAttendanceSessionSummary(studentId: string): Promise<MonthlyAttendanceSummary[]> {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("academic_sessions")
    .select("start_date, end_date")
    .eq("is_current", true)
    .maybeSingle();

  if (!session) return [];

  const todayStr = new Date().toISOString().slice(0, 10);
  const endDate = session.end_date < todayStr ? session.end_date : todayStr;

  const { data } = await supabase
    .from("attendance")
    .select("date, status")
    .eq("student_id", studentId)
    .gte("date", session.start_date)
    .lte("date", endDate)
    .returns<AttendanceDay[]>();

  const byMonth = new Map<string, AttendanceDay[]>();
  for (const row of data ?? []) {
    const key = row.date.slice(0, 7);
    const bucket = byMonth.get(key);
    if (bucket) bucket.push(row);
    else byMonth.set(key, [row]);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, entries]) => {
      const [y, m] = key.split("-").map(Number);
      const present = entries.filter((e) => e.status === "present").length;
      const late = entries.filter((e) => e.status === "late").length;
      const absent = entries.filter((e) => e.status === "absent").length;
      const leave = entries.filter((e) => e.status === "leave").length;
      const totalMarked = entries.length;
      const pct = totalMarked ? Math.round(((present + late) / totalMarked) * 100) : 0;
      return {
        monthKey: key,
        monthLabel: `${MONTH_NAMES[m - 1]} ${y}`,
        present,
        absent,
        late,
        leave,
        totalMarked,
        pct,
      };
    });
}

export type FeeRow = {
  month: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Pending" | "Partial";
  paymentDate: string | null;
};

export async function getChildFeeRows(studentId: string): Promise<FeeRow[]> {
  const supabase = await createClient();

  const { data: records } = await supabase
    .from("student_fee_records")
    .select("id, month_date, amount_due, status")
    .eq("student_id", studentId)
    .order("month_date", { ascending: false })
    .returns<{ id: string; month_date: string; amount_due: number; status: string }[]>();

  if (!records || records.length === 0) return [];

  const { data: payments } = await supabase
    .from("fee_payments")
    .select("fee_record_id, payment_date")
    .in(
      "fee_record_id",
      records.map((r) => r.id)
    )
    .order("payment_date", { ascending: false })
    .returns<{ fee_record_id: string; payment_date: string }[]>();

  const lastPaymentByRecord = new Map<string, string>();
  for (const p of payments ?? []) {
    if (!lastPaymentByRecord.has(p.fee_record_id)) lastPaymentByRecord.set(p.fee_record_id, p.payment_date);
  }

  const statusLabel: Record<string, FeeRow["status"]> = { paid: "Paid", pending: "Pending", partial: "Partial" };

  return records.map((r) => {
    const monthDate = new Date(r.month_date);
    return {
      month: monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      dueDate: monthDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      amount: r.amount_due,
      status: statusLabel[r.status] ?? "Pending",
      paymentDate: lastPaymentByRecord.has(r.id)
        ? new Date(lastPaymentByRecord.get(r.id)!).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : null,
    };
  });
}

export type ChildResult = {
  examId: string;
  examName: string;
  subjectName: string;
  className: string;
  maxMarks: number;
  marks: number;
  percentage: number;
  grade: string;
  remark: string;
  publishedDate: string;
};

export async function getChildPublishedResults(studentId: string): Promise<ChildResult[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("exam_marks")
    .select("marks, updated_at, exams!inner(id, name, max_marks, is_published, exam_date, classes(name), subjects(name))")
    .eq("student_id", studentId)
    .eq("exams.is_published", true)
    .returns<
      {
        marks: number;
        updated_at: string;
        exams: { id: string; name: string; max_marks: number; exam_date: string | null; classes: { name: string } | null; subjects: { name: string } | null };
      }[]
    >();

  return (data ?? [])
    .map((row) => {
      const pct = (row.marks / row.exams.max_marks) * 100;
      const band = gradeFor(pct);
      return {
        examId: row.exams.id,
        examName: row.exams.name,
        subjectName: row.exams.subjects?.name ?? "General",
        className: row.exams.classes?.name ?? "—",
        maxMarks: row.exams.max_marks,
        marks: row.marks,
        percentage: pct,
        grade: band.grade,
        remark: band.remark,
        publishedDate: new Date(row.exams.exam_date ?? row.updated_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    })
    .sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export type HomeworkEntry = {
  id: string;
  date: string;
  subject: string;
  topic: string;
  dueDate: string | null;
  teacher: string;
};

export async function getChildHomework(classId: string): Promise<HomeworkEntry[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("homework")
    .select("id, title, description, due_date, created_at, entry_type, subjects(name), profiles(full_name)")
    .eq("class_id", classId)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<
      {
        id: string;
        title: string;
        description: string;
        due_date: string | null;
        created_at: string;
        entry_type: string;
        subjects: { name: string } | null;
        profiles: { full_name: string } | null;
      }[]
    >();

  return (data ?? []).map((h) => ({
    id: h.id,
    date: new Date(h.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    subject: h.entry_type === "vacation_diary" ? "Class / Vacation Diary" : (h.subjects?.name ?? "General"),
    topic: h.title || h.description,
    dueDate: h.due_date ? new Date(h.due_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
    teacher: h.profiles?.full_name ?? "—",
  }));
}

export async function getChildTimetable(classId: string): Promise<ClassSchedule> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { weekday: [], friday: [] };
  return getClassSchedule(sessionId, classId);
}

export type NoticeRow = {
  id: string;
  title: string;
  description: string;
  noticeType: string;
  publishDate: string;
};

export async function getNoticesForParent(): Promise<NoticeRow[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const classIds = [...new Set(children.map((c) => c.classId).filter((id): id is string => Boolean(id)))];

  let query = supabase
    .from("notices")
    .select("id, title, description, notice_type, publish_date, audience, class_id")
    .order("publish_date", { ascending: false });

  query =
    classIds.length > 0
      ? query.or(`audience.in.(everyone,parents),and(audience.eq.class,class_id.in.(${classIds.join(",")}))`)
      : query.in("audience", ["everyone", "parents"]);

  const { data } = await query.returns<
    { id: string; title: string; description: string; notice_type: string; publish_date: string; audience: string; class_id: string | null }[]
  >();

  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    noticeType: n.notice_type,
    publishDate: new Date(n.publish_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));
}

export async function getHomeworkDueCount(children: ParentChild[]): Promise<number> {
  const supabase = await createClient();
  const classIds = [...new Set(children.map((c) => c.classId).filter((id): id is string => Boolean(id)))];
  if (classIds.length === 0) return 0;

  const today = new Date();
  const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { count } = await supabase
    .from("homework")
    .select("id", { count: "exact", head: true })
    .in("class_id", classIds)
    .gte("due_date", today.toISOString().slice(0, 10))
    .lte("due_date", weekAhead.toISOString().slice(0, 10));

  return count ?? 0;
}
