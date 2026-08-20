import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { compareByRollNumber } from "@/lib/attendance-data";

export type TeacherRosterStudent = {
  id: string;
  full_name: string;
  father_name: string;
  rollNumber: string | null;
  classId: string;
  className: string;
};

export async function getTeacherRoster(): Promise<{ roster: TeacherRosterStudent[]; error: string | null }> {
  const supabase = await createClient();
  const currentSessionId = await getCurrentSessionId();

  if (!currentSessionId) {
    return { roster: [], error: null };
  }

  const { data, error } = await supabase
    .from("student_enrollments")
    .select("student_id, class_id, roll_number, students(id, full_name, father_name), classes(name)")
    .eq("session_id", currentSessionId)
    .eq("status", "active")
    .returns<
      {
        student_id: string;
        class_id: string;
        roll_number: string | null;
        students: { id: string; full_name: string; father_name: string } | null;
        classes: { name: string } | null;
      }[]
    >();

  if (error) {
    return { roster: [], error: error.message };
  }

  const roster = (data ?? [])
    .filter((row) => row.students && row.classes)
    .map((row) => ({
      id: row.students!.id,
      full_name: row.students!.full_name,
      father_name: row.students!.father_name,
      rollNumber: row.roll_number,
      classId: row.class_id,
      className: row.classes!.name,
    }))
    .sort((a, b) => a.className.localeCompare(b.className) || compareByRollNumber({ rollNumber: a.rollNumber }, { rollNumber: b.rollNumber }));

  return { roster, error: null };
}
