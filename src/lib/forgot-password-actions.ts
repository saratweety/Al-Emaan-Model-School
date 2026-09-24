"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type ForgotPasswordResult =
  | { status: "sent" }
  | { status: "contact_admin" }
  | { status: "error"; message: string };

export async function requestPasswordReset(
  email: string,
  redirectTo: string
): Promise<ForgotPasswordResult> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { status: "error", message: "Enter your email address." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Server is not configured." };
  }

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const matchedUser = listData.users.find(
    (u) => u.email?.toLowerCase() === trimmedEmail.toLowerCase()
  );

  if (!matchedUser) {
    // Don't reveal whether the email is registered.
    return { status: "sent" };
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", matchedUser.id)
    .single();

  if (profile?.role === "teacher" || profile?.role === "parent") {
    return { status: "contact_admin" };
  }

  const { error: resetError } = await admin.auth.resetPasswordForEmail(trimmedEmail, {
    redirectTo,
  });

  if (resetError) {
    return { status: "error", message: resetError.message };
  }

  return { status: "sent" };
}
