import { createClient } from "@/lib/supabase/server";
import { getCurrentSessionId } from "@/lib/academic-sessions";

export type LinkedChild = {
  id: string;
  name: string;
  className: string;
  admissionId: string;
};

export type ParentAccount = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  accountCreated: string;
  children: LinkedChild[];
};

export type LinkableStudent = {
  id: string;
  name: string;
  className: string;
  admissionId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export async function getAllParents(): Promise<ParentAccount[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: parentRows } = await supabase
    .from("parents")
    .select("id, created_at, profiles(full_name, phone, username, is_active)")
    .returns<
      { id: string; created_at: string; profiles: { full_name: string; phone: string | null; username: string | null; is_active: boolean } | null }[]
    >();

  const parentIds = (parentRows ?? []).map((p) => p.id);
  const childrenByParent = new Map<string, LinkedChild[]>();

  if (parentIds.length > 0) {
    const { data: linkRows } = await supabase
      .from("student_parents")
      .select("parent_id, students(id, full_name, admission_no)")
      .in("parent_id", parentIds)
      .returns<{ parent_id: string; students: { id: string; full_name: string; admission_no: string } | null }[]>();

    const studentIds = (linkRows ?? []).map((r) => r.students?.id).filter((id): id is string => Boolean(id));
    const classByStudent = new Map<string, string>();

    if (studentIds.length > 0 && sessionId) {
      const { data: enrollRows } = await supabase
        .from("student_enrollments")
        .select("student_id, classes(name)")
        .eq("session_id", sessionId)
        .in("student_id", studentIds)
        .returns<{ student_id: string; classes: { name: string } | null }[]>();

      for (const e of enrollRows ?? []) {
        if (e.classes) classByStudent.set(e.student_id, e.classes.name);
      }
    }

    for (const link of linkRows ?? []) {
      if (!link.students) continue;
      const list = childrenByParent.get(link.parent_id) ?? [];
      list.push({
        id: link.students.id,
        name: link.students.full_name,
        className: classByStudent.get(link.students.id) ?? "Unassigned",
        admissionId: link.students.admission_no,
      });
      childrenByParent.set(link.parent_id, list);
    }
  }

  return (parentRows ?? []).map((p) => ({
    id: p.id,
    name: p.profiles?.full_name ?? "Unknown",
    phone: p.profiles?.phone ?? "—",
    email: p.profiles?.username ?? "—",
    status: p.profiles?.is_active === false ? "Inactive" : "Active",
    accountCreated: formatDate(p.created_at),
    children: childrenByParent.get(p.id) ?? [],
  }));
}

export async function getLinkableStudents(): Promise<LinkableStudent[]> {
  const supabase = await createClient();
  const sessionId = await getCurrentSessionId();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, admission_no")
    .order("full_name", { ascending: true })
    .returns<{ id: string; full_name: string; admission_no: string }[]>();

  const classByStudent = new Map<string, string>();

  if (sessionId && students && students.length > 0) {
    const { data: enrollRows } = await supabase
      .from("student_enrollments")
      .select("student_id, classes(name)")
      .eq("session_id", sessionId)
      .in(
        "student_id",
        students.map((s) => s.id)
      )
      .returns<{ student_id: string; classes: { name: string } | null }[]>();

    for (const e of enrollRows ?? []) {
      if (e.classes) classByStudent.set(e.student_id, e.classes.name);
    }
  }

  return (students ?? []).map((s) => ({
    id: s.id,
    name: s.full_name,
    className: classByStudent.get(s.id) ?? "Unassigned",
    admissionId: s.admission_no,
  }));
}
