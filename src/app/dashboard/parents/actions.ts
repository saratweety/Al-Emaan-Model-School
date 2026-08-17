"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requirePrincipal } from "@/lib/principal-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { success: true } | { success: false; error: string };

export async function createParentAccount(formData: FormData): Promise<ActionResult> {
  const { userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const fullName = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const studentIds = formData.getAll("student_ids").map(String).filter(Boolean);

  if (!fullName || !phone || !email || !password) {
    return { success: false, error: "Name, contact number, email and password are required." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  if (studentIds.length === 0) {
    return { success: false, error: "Link at least one child." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Admin client is not configured." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return { success: false, error: createError?.message ?? "Could not create the login." };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: fullName,
    role: "parent",
    username: email,
    phone,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: profileError.message };
  }

  const { error: parentError } = await admin.from("parents").insert({ id: created.user.id });

  if (parentError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: parentError.message };
  }

  const { error: linkError } = await admin
    .from("student_parents")
    .insert(studentIds.map((studentId) => ({ student_id: studentId, parent_id: created.user.id })));

  if (linkError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: linkError.message };
  }

  revalidatePath("/dashboard/parents");
  revalidatePath("/parent");
  revalidatePath("/parent/children");
  return { success: true };
}

export async function linkChildToParent(parentId: string, studentId: string, relationship: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!parentId || !studentId) return { success: false, error: "Select a child to link." };

  const { error: insertError } = await supabase
    .from("student_parents")
    .insert({ parent_id: parentId, student_id: studentId, relationship: relationship || "Guardian" });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/dashboard/parents");
  revalidatePath("/parent");
  revalidatePath("/parent/children");
  return { success: true };
}

export async function unlinkChildFromParent(parentId: string, studentId: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: deleteError } = await supabase
    .from("student_parents")
    .delete()
    .eq("parent_id", parentId)
    .eq("student_id", studentId);

  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/parents");
  revalidatePath("/parent");
  revalidatePath("/parent/children");
  return { success: true };
}

export async function updateParent(
  parentId: string,
  input: { fullName: string; phone: string; email: string }
): Promise<ActionResult> {
  const { error } = await requirePrincipal();
  if (error) return { success: false, error };

  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();

  if (!fullName || !phone || !email) {
    return { success: false, error: "Name, contact number and email are required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Admin client is not configured." };
  }

  const { data: currentProfile } = await admin.from("profiles").select("username").eq("id", parentId).maybeSingle();

  if (currentProfile?.username !== email) {
    const { error: authError } = await admin.auth.admin.updateUserById(parentId, { email });
    if (authError) return { success: false, error: authError.message };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, phone, username: email })
    .eq("id", parentId);

  if (profileError) return { success: false, error: profileError.message };

  revalidatePath("/dashboard/parents");
  revalidatePath("/parent");
  revalidatePath("/parent/settings");
  return { success: true };
}

export async function setParentActive(parentId: string, active: boolean): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { error: updateError } = await supabase.from("profiles").update({ is_active: active }).eq("id", parentId);
  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/dashboard/parents");
  return { success: true };
}

export async function sendParentPasswordReset(parentId: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const { data: profile } = await supabase.from("profiles").select("username").eq("id", parentId).maybeSingle();
  if (!profile?.username) return { success: false, error: "This parent has no email on file." };

  const headerList = await headers();
  const origin = headerList.get("origin") ?? `https://${headerList.get("host")}`;

  const { error: resetError } = await supabase.auth.resetPasswordForEmail(profile.username, {
    redirectTo: `${origin}/reset-password`,
  });

  if (resetError) return { success: false, error: resetError.message };
  return { success: true };
}
