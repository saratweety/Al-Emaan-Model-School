"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";

export type ActionResult = { success: true } | { success: false; error: string };

export async function deleteStudent(id: string): Promise<ActionResult> {
  const { supabase, error } = await requirePrincipal();
  if (error) return { success: false, error };

  const { error: deleteError } = await supabase.from("students").delete().eq("id", id);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/students");
  revalidatePath("/parent");
  revalidatePath("/parent/children");
  return { success: true };
}
