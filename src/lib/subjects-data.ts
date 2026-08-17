import { createClient } from "@/lib/supabase/server";

export type Subject = {
  id: string;
  name: string;
};

export async function getSubjects(): Promise<{ subjects: Subject[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name")
    .order("name", { ascending: true })
    .returns<Subject[]>();

  return { subjects: data ?? [], error: error?.message ?? null };
}

export type SubjectWithClasses = {
  id: string;
  name: string;
  classIds: string[];
};

export async function getSubjectsWithClasses(): Promise<{ subjects: SubjectWithClasses[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, class_subjects(class_id)")
    .order("name", { ascending: true })
    .returns<{ id: string; name: string; class_subjects: { class_id: string }[] }[]>();

  if (error) return { subjects: [], error: error.message };

  const subjects: SubjectWithClasses[] = (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    classIds: s.class_subjects.map((cs) => cs.class_id),
  }));

  return { subjects, error: null };
}
