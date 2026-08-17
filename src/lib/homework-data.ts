import { createClient } from "@/lib/supabase/server";

export type PrincipalDiaryEntry = {
  id: string;
  classId: string;
  className: string;
  subjectId: string | null;
  subjectName: string | null;
  entryType: "homework" | "vacation_diary";
  title: string;
  description: string;
  teacherName: string;
  postedDate: string;
  postedLabel: string;
};

export async function getAllDiaryEntries(): Promise<{ entries: PrincipalDiaryEntry[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("homework")
    .select("id, class_id, subject_id, entry_type, title, description, created_at, classes(name), subjects(name), profiles(full_name)")
    .order("created_at", { ascending: false })
    .returns<
      {
        id: string;
        class_id: string;
        subject_id: string | null;
        entry_type: string;
        title: string;
        description: string;
        created_at: string;
        classes: { name: string } | null;
        subjects: { name: string } | null;
        profiles: { full_name: string } | null;
      }[]
    >();

  if (error) return { entries: [], error: error.message };

  const entries: PrincipalDiaryEntry[] = (data ?? []).map((r) => ({
    id: r.id,
    classId: r.class_id,
    className: r.classes?.name ?? "Unknown Class",
    subjectId: r.subject_id,
    subjectName: r.subjects?.name ?? null,
    entryType: r.entry_type === "vacation_diary" ? "vacation_diary" : "homework",
    title: r.title,
    description: r.description,
    teacherName: r.profiles?.full_name ?? "Unknown",
    postedDate: r.created_at.slice(0, 10),
    postedLabel: new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  }));

  return { entries, error: null };
}
