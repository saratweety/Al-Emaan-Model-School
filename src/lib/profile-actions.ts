"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { success: true } | { success: false; error: string };

export type UpdateProfileInput = {
  fullName: string;
  username: string;
};

export async function updateOwnProfile(input: UpdateProfileInput): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const fullName = input.fullName.trim();
  const username = input.username.trim();

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }
  if (!username) {
    return { success: false, error: "Username is required." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, username })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError) return { success: false, error: updateError.message };
  if (!updated) return { success: false, error: "Profile update was not permitted." };

  revalidatePath("/dashboard/settings/profile");
  revalidatePath("/teacher/settings");
  revalidatePath("/parent/settings");
  return { success: true };
}
