import { createClient } from "@/lib/supabase/server";

export async function requirePrincipal() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, userId: null as string | null, error: "You must be signed in." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "principal") {
    return { supabase, userId: null as string | null, error: "Only the principal can perform this action." };
  }

  return { supabase, userId: user.id, error: null as string | null };
}
