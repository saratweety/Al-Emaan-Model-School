"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export type UpdateTimingInput = {
  openingTime: string;
  closingTime: string;
  teacherReportingTime: string;
  breakStart: string;
  breakEnd: string;
};

export async function updateSchoolTiming(input: UpdateTimingInput): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const { openingTime, closingTime, teacherReportingTime, breakStart, breakEnd } = input;
  if (!openingTime || !closingTime || !teacherReportingTime || !breakStart || !breakEnd) {
    return { success: false, error: "All timing fields are required." };
  }

  const { error: updateError } = await supabase
    .from("school_settings")
    .update({
      opening_time: openingTime,
      closing_time: closingTime,
      teacher_reporting_time: teacherReportingTime,
      break_start: breakStart,
      break_end: breakEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/dashboard/settings/timing");
  revalidatePath("/dashboard");
  return { success: true };
}

export type UpdateGeneralSettingsInput = {
  schoolName: string;
  principalName: string;
  phone: string;
  email: string;
  address: string;
  feeDueDay: number;
  lateFinePerDay: number;
  passingPercentage: number;
};

export async function updateGeneralSettings(input: UpdateGeneralSettingsInput): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  if (!input.schoolName.trim()) {
    return { success: false, error: "School name is required." };
  }
  if (input.feeDueDay < 1 || input.feeDueDay > 28) {
    return { success: false, error: "Fee due date must be between 1 and 28." };
  }
  if (input.passingPercentage < 0 || input.passingPercentage > 100) {
    return { success: false, error: "Passing percentage must be between 0 and 100." };
  }

  const { error: updateError } = await supabase
    .from("school_settings")
    .update({
      school_name: input.schoolName.trim(),
      principal_name: input.principalName.trim() || null,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      address: input.address.trim() || null,
      fee_due_day: input.feeDueDay,
      late_fine_per_day: input.lateFinePerDay,
      passing_percentage: input.passingPercentage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
