import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { compareByRollNumber } from "@/lib/attendance-data";

export type PromotableStudent = {
  id: string;
  fullName: string;
  admissionNo: string;
  rollNumber: string | null;
  gender: string | null;
};

export async function getPromotableRoster(classId: string): Promise<PromotableStudent[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();
  if (!sessionId || !classId) return [];

  const { data } = await supabase
    .from("student_enrollments")
    .select("roll_number, students(id, full_name, admission_no, gender)")
    .eq("session_id", sessionId)
    .eq("class_id", classId)
    .eq("status", "active")
    .returns<{ roll_number: string | null; students: { id: string; full_name: string; admission_no: string; gender: string | null } | null }[]>();

  return (data ?? [])
    .filter((row) => row.students)
    .map((row) => ({
      id: row.students!.id,
      fullName: row.students!.full_name,
      admissionNo: row.students!.admission_no,
      rollNumber: row.roll_number,
      gender: row.students!.gender,
    }))
    .sort(compareByRollNumber);
}
