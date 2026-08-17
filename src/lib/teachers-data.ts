import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type TeacherAttendanceTodayCounts = { present: number; absent: number; late: number; leave: number; marked: number };

export async function getTeacherAttendanceTodayCounts(): Promise<TeacherAttendanceTodayCounts> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase.from("teacher_attendance").select("status").eq("date", today).returns<{ status: string }[]>();

  const rows = data ?? [];
  return {
    present: rows.filter((r) => r.status === "present").length,
    absent: rows.filter((r) => r.status === "absent").length,
    late: rows.filter((r) => r.status === "late").length,
    leave: rows.filter((r) => r.status === "leave").length,
    marked: rows.length,
  };
}

export type TeacherAssignmentRow = {
  className: string;
  subjectName: string;
  isClassTeacher: boolean;
};

export type TeacherDetail = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string | null;
  teacherCode: string;
  cnic: string | null;
  qualification: string | null;
  deviceUserId: string | null;
  specializationSubjectId: string | null;
  specializationSubjectName: string | null;
  experienceYears: number | null;
  joiningDate: string;
  photoUrl: string | null;
  cnicDocumentUrl: string | null;
  certificateUrl: string | null;
  otherDocumentUrl: string | null;
  isActive: boolean;
  assignments: TeacherAssignmentRow[];
};

export async function getTeacherDetail(id: string): Promise<{ teacher: TeacherDetail | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select(
      "id, teacher_code, cnic, qualification, device_user_id, specialization_subject_id, experience_years, joining_date, photo_url, cnic_document_url, certificate_url, other_document_url, subjects(name), profiles(full_name, username, phone, is_active)"
    )
    .eq("id", id)
    .maybeSingle<{
      id: string;
      teacher_code: string;
      cnic: string | null;
      qualification: string | null;
      device_user_id: string | null;
      specialization_subject_id: string | null;
      experience_years: number | null;
      joining_date: string;
      photo_url: string | null;
      cnic_document_url: string | null;
      certificate_url: string | null;
      other_document_url: string | null;
      subjects: { name: string } | null;
      profiles: { full_name: string; username: string | null; phone: string | null; is_active: boolean } | null;
    }>();

  if (error) return { teacher: null, error: error.message };
  if (!data) return { teacher: null, error: null };

  const sessionId = await getCurrentSessionId();
  const { data: assignmentRows } = sessionId
    ? await supabase
        .from("teacher_assignments")
        .select("is_class_teacher, classes(name), subjects(name)")
        .eq("teacher_id", id)
        .eq("session_id", sessionId)
        .returns<{ is_class_teacher: boolean; classes: { name: string } | null; subjects: { name: string } | null }[]>()
    : { data: [] };

  const assignments: TeacherAssignmentRow[] = (assignmentRows ?? []).map((a) => ({
    className: a.classes?.name ?? "Unknown Class",
    subjectName: a.subjects?.name ?? "—",
    isClassTeacher: a.is_class_teacher,
  }));

  return {
    teacher: {
      id: data.id,
      fullName: data.profiles?.full_name ?? "Unknown",
      username: data.profiles?.username ?? "",
      email: data.profiles?.username ?? "",
      phone: data.profiles?.phone ?? null,
      teacherCode: data.teacher_code,
      cnic: data.cnic,
      qualification: data.qualification,
      deviceUserId: data.device_user_id,
      specializationSubjectId: data.specialization_subject_id,
      specializationSubjectName: data.subjects?.name ?? null,
      experienceYears: data.experience_years,
      joiningDate: data.joining_date,
      photoUrl: data.photo_url,
      cnicDocumentUrl: data.cnic_document_url,
      certificateUrl: data.certificate_url,
      otherDocumentUrl: data.other_document_url,
      isActive: data.profiles?.is_active ?? true,
      assignments,
    },
    error: null,
  };
}
