"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { normalizePhone } from "@/lib/phone";

export type LoginResult = { success: true; role: string } | { success: false; error: string };

const GENERIC_ERROR = "Invalid phone number or password.";

async function findLoginProfileByPhone(admin: ReturnType<typeof createAdminClient>, normalized: string) {
  const { data } = await admin
    .from("profiles")
    .select("id, role, is_active, phone")
    .in("role", ["teacher", "parent"])
    .not("phone", "is", null);

  const matches = (data ?? []).filter((p) => normalizePhone(p.phone as string) === normalized);

  if (matches.length > 1) {
    console.error(`Multiple profiles share the phone number ${normalized}; login by phone is ambiguous.`);
    return null;
  }

  return matches[0] ?? null;
}

export async function loginWithPhone({ phone, password }: { phone: string; password: string }): Promise<LoginResult> {
  const normalized = normalizePhone(phone);
  if (!normalized) return { success: false, error: "Enter a valid phone number." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }

  try {
    const profile = await findLoginProfileByPhone(admin, normalized);
    if (!profile) return { success: false, error: GENERIC_ERROR };

    if (profile.is_active === false) {
      return { success: false, error: "This account has been disabled. Contact the school office." };
    }

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(profile.id);
    if (userError || !userData.user?.email) return { success: false, error: GENERIC_ERROR };

    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password,
    });

    if (authError) return { success: false, error: GENERIC_ERROR };

    return { success: true, role: profile.role as string };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
