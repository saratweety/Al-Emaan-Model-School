import { createClient } from "@/lib/supabase/server";
import { getClassRoster } from "@/lib/attendance-data";
import { gradeFor } from "@/lib/grading";

export type ExamRow = {
  id: string;
  name: string;
  classId: string;
  className: string;
  subjectId: string | null;
  subjectName: string | null;
  teacherId: string;
  teacherName: string;
  maxMarks: number;
  examDate: string | null;
  isPublished: boolean;
  totalStudents: number;
  enteredCount: number;
  passCount: number;
  passPct: string;
  classAverage: string;
};

type ExamJoinRow = {
  id: string;
  name: string;
  class_id: string;
  subject_id: string | null;
  teacher_id: string;
  max_marks: number;
  exam_date: string | null;
  is_published: boolean;
  classes: { name: string } | null;
  subjects: { name: string } | null;
  profiles: { full_name: string } | null;
};

export async function getAllExams(sessionId: string | null): Promise<ExamRow[]> {
  const supabase = await createClient();

  const [{ data: examRows, error }, { data: enrollments }] = await Promise.all([
    supabase
      .from("exams")
      .select("id, name, class_id, subject_id, teacher_id, max_marks, exam_date, is_published, classes(name), subjects(name), profiles(full_name)")
      .order("created_at", { ascending: false })
      .returns<ExamJoinRow[]>(),
    sessionId
      ? supabase.from("student_enrollments").select("class_id").eq("session_id", sessionId).eq("status", "active").returns<{ class_id: string }[]>()
      : Promise.resolve({ data: [] as { class_id: string }[] }),
  ]);

  if (error || !examRows) return [];

  const totalByClass = new Map<string, number>();
  for (const e of enrollments ?? []) totalByClass.set(e.class_id, (totalByClass.get(e.class_id) ?? 0) + 1);

  const examIds = examRows.map((e) => e.id);
  const marksByExam = new Map<string, number[]>();

  if (examIds.length > 0) {
    const { data: markRows } = await supabase
      .from("exam_marks")
      .select("exam_id, marks")
      .in("exam_id", examIds)
      .returns<{ exam_id: string; marks: number }[]>();

    for (const m of markRows ?? []) {
      const list = marksByExam.get(m.exam_id) ?? [];
      list.push(m.marks);
      marksByExam.set(m.exam_id, list);
    }
  }

  return examRows.map((e) => {
    const marks = marksByExam.get(e.id) ?? [];
    const percentages = marks.map((m) => (m / e.max_marks) * 100);
    const passCount = percentages.filter((p) => gradeFor(p).grade !== "F").length;
    const passPct = percentages.length > 0 ? ((passCount / percentages.length) * 100).toFixed(1) : "—";
    const classAverage =
      percentages.length > 0 ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1) : "—";

    return {
      id: e.id,
      name: e.name,
      classId: e.class_id,
      className: e.classes?.name ?? "Unknown Class",
      subjectId: e.subject_id,
      subjectName: e.subjects?.name ?? null,
      teacherId: e.teacher_id,
      teacherName: e.profiles?.full_name ?? "Unknown Teacher",
      maxMarks: e.max_marks,
      examDate: e.exam_date,
      isPublished: e.is_published,
      totalStudents: totalByClass.get(e.class_id) ?? 0,
      enteredCount: marks.length,
      passCount,
      passPct,
      classAverage,
    };
  });
}

export type ExamResultStudent = {
  studentId: string;
  fullName: string;
  rollNumber: string | null;
  marks: number | null;
  percentage: number | null;
  grade: string | null;
  remark: string | null;
};

export type ExamResultDetail = {
  exam: ExamRow;
  students: ExamResultStudent[];
};

export async function getExamResultDetail(sessionId: string | null, exam: ExamRow): Promise<ExamResultDetail> {
  if (!sessionId) return { exam, students: [] };

  const supabase = await createClient();
  const roster = await getClassRoster(sessionId, exam.classId);

  const { data: markRows } = await supabase
    .from("exam_marks")
    .select("student_id, marks")
    .eq("exam_id", exam.id)
    .returns<{ student_id: string; marks: number }[]>();

  const marksByStudent = new Map<string, number>();
  for (const m of markRows ?? []) marksByStudent.set(m.student_id, m.marks);

  const students: ExamResultStudent[] = roster.map((s) => {
    const marks = marksByStudent.get(s.id) ?? null;
    const percentage = marks !== null ? (marks / exam.maxMarks) * 100 : null;
    const band = percentage !== null ? gradeFor(percentage) : null;
    return {
      studentId: s.id,
      fullName: s.full_name,
      rollNumber: s.rollNumber,
      marks,
      percentage,
      grade: band?.grade ?? null,
      remark: band?.remark ?? null,
    };
  });

  return { exam, students };
}

export type TopPerformer = {
  studentId: string;
  fullName: string;
  className: string;
  averagePct: string;
};

export type ResultsOverview = {
  totalExams: number;
  publishedCount: number;
  overallPassPct: string;
  topPerformers: TopPerformer[];
};

export async function getResultsOverview(exams: ExamRow[]): Promise<ResultsOverview> {
  const published = exams.filter((e) => e.isPublished);

  const totalEntered = published.reduce((sum, e) => sum + e.enteredCount, 0);
  const totalPassed = published.reduce((sum, e) => sum + e.passCount, 0);
  const overallPassPct = totalEntered > 0 ? ((totalPassed / totalEntered) * 100).toFixed(1) : "0.0";

  const publishedIds = published.map((e) => e.id);
  let topPerformers: TopPerformer[] = [];

  if (publishedIds.length > 0) {
    const supabase = await createClient();
    const { data: markRows } = await supabase
      .from("exam_marks")
      .select("student_id, marks, exams!inner(id, max_marks, class_id, is_published, classes(name))")
      .in("exam_id", publishedIds)
      .returns<
        { student_id: string; marks: number; exams: { id: string; max_marks: number; class_id: string; is_published: boolean; classes: { name: string } | null } }[]
      >();

    const { data: studentRows } = await supabase.from("students").select("id, full_name").returns<{ id: string; full_name: string }[]>();
    const nameById = new Map((studentRows ?? []).map((s) => [s.id, s.full_name]));

    const byStudent = new Map<string, { sum: number; count: number; className: string }>();
    for (const m of markRows ?? []) {
      const pct = (m.marks / m.exams.max_marks) * 100;
      const entry = byStudent.get(m.student_id) ?? { sum: 0, count: 0, className: m.exams.classes?.name ?? "—" };
      entry.sum += pct;
      entry.count += 1;
      byStudent.set(m.student_id, entry);
    }

    topPerformers = [...byStudent.entries()]
      .map(([studentId, v]) => ({
        studentId,
        fullName: nameById.get(studentId) ?? "Unknown Student",
        className: v.className,
        averagePct: (v.sum / v.count).toFixed(1),
      }))
      .sort((a, b) => Number(b.averagePct) - Number(a.averagePct))
      .slice(0, 5);
  }

  return {
    totalExams: exams.length,
    publishedCount: published.length,
    overallPassPct,
    topPerformers,
  };
}
