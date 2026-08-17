import { createClient } from "@/lib/supabase/server";

export async function requireParent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null, error: "You must be signed in." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "parent") {
    return { supabase, userId: null as string | null, error: "Only parents can perform this action." };
  }

  return { supabase, userId: user.id, error: null as string | null };
}
