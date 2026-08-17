import { createClient } from "@/lib/supabase/server";

export async function getCurrentSessionId(): Promise<string | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("academic_sessions")
    .select("id")
    .eq("is_current", true)
    .maybeSingle();

  return data?.id ?? null;
}
