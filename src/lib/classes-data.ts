import { createClient } from "@/lib/supabase/server";

export type SchoolClass = {
  id: string;
  name: string;
  display_order: number;
};

export async function getClasses(): Promise<{ classes: SchoolClass[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("classes")
    .select("id, name, display_order")
    .order("display_order", { ascending: true })
    .returns<SchoolClass[]>();

  return { classes: data ?? [], error: error?.message ?? null };
}
