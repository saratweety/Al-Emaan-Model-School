import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type StudentDetail = {
  id: string;
  admissionNo: string;
  fullName: string;
  fatherName: string;
  dateOfBirth: string | null;
  gender: string | null;
  contactNumber: string | null;
  admissionDate: string;
  monthlyFee: number;
  admissionFee: number;
  otherCharges: number;
  photoUrl: string | null;
  bFormUrl: string | null;
  certificateUrl: string | null;
  otherDocumentUrl: string | null;
  classId: string | null;
  className: string;
  attendancePct: string;
  feeStatus: string;
  pendingMonths: number;
  latestResult: string;
};

export async function getStudentDetail(id: string): Promise<{ student: StudentDetail | null; error: string | null }> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: student, error } = await supabase
    .from("students")
    .select(
      "id, admission_no, full_name, father_name, date_of_birth, gender, contact_number, admission_date, monthly_fee, admission_fee, other_charges, photo_url, b_form_url, certificate_url, other_document_url"
    )
    .eq("id", id)
    .maybeSingle<{
      id: string;
      admission_no: string;
      full_name: string;
      father_name: string;
      date_of_birth: string | null;
      gender: string | null;
      contact_number: string | null;
      admission_date: string;
      monthly_fee: number;
      admission_fee: number;
      other_charges: number;
      photo_url: string | null;
      b_form_url: string | null;
      certificate_url: string | null;
      other_document_url: string | null;
    }>();

  if (error) return { student: null, error: error.message };
  if (!student) return { student: null, error: null };

  const [{ data: enrollment }, { data: attendanceRows }, { data: feeRows }, { data: markRow }] = await Promise.all([
    sessionId
      ? supabase
          .from("student_enrollments")
          .select("class_id, classes(name)")
          .eq("student_id", id)
          .eq("session_id", sessionId)
          .eq("status", "active")
          .maybeSingle<{ class_id: string; classes: { name: string } | null }>()
      : Promise.resolve({ data: null }),
    sessionId
      ? supabase.from("attendance").select("status").eq("student_id", id).eq("session_id", sessionId).returns<{ status: string }[]>()
      : Promise.resolve({ data: [] }),
    sessionId
      ? supabase
          .from("student_fee_records")
          .select("status")
          .eq("student_id", id)
          .eq("session_id", sessionId)
          .returns<{ status: string }[]>()
      : Promise.resolve({ data: [] }),
    supabase
      .from("exam_marks")
      .select("marks, exams!inner(name, max_marks, is_published, subjects(name))")
      .eq("student_id", id)
      .eq("exams.is_published", true)
      .order("updated_at", { ascending: false })
      .limit(1)
      .returns<{ marks: number; exams: { name: string; max_marks: number; subjects: { name: string } | null } }[]>(),
  ]);

  const marked = attendanceRows ?? [];
  const presentCount = marked.filter((r) => r.status === "present" || r.status === "late").length;
  const attendancePct = marked.length > 0 ? `${Math.round((presentCount / marked.length) * 100)}%` : "—";

  const fees = feeRows ?? [];
  const pendingMonths = fees.filter((f) => f.status !== "paid").length;
  const feeStatus = fees.length === 0 ? "—" : pendingMonths > 0 ? "Pending" : "Paid";

  const latest = markRow?.[0];
  const latestResult = latest ? `${latest.exams.subjects?.name ?? latest.exams.name}: ${latest.marks}/${latest.exams.max_marks}` : "—";

  return {
    student: {
      id: student.id,
      admissionNo: student.admission_no,
      fullName: student.full_name,
      fatherName: student.father_name,
      dateOfBirth: student.date_of_birth,
      gender: student.gender,
      contactNumber: student.contact_number,
      admissionDate: student.admission_date,
      monthlyFee: Number(student.monthly_fee),
      admissionFee: Number(student.admission_fee),
      otherCharges: Number(student.other_charges),
      photoUrl: student.photo_url,
      bFormUrl: student.b_form_url,
      certificateUrl: student.certificate_url,
      otherDocumentUrl: student.other_document_url,
      classId: enrollment?.class_id ?? null,
      className: enrollment?.classes?.name ?? "Unassigned",
      attendancePct,
      feeStatus,
      pendingMonths,
      latestResult,
    },
    error: null,
  };
}
