"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { success: true } | { success: false; error: string };

async function uploadTeacherFile(
  admin: ReturnType<typeof createAdminClient>,
  teacherId: string,
  fileName: string,
  value: FormDataEntryValue | null
): Promise<string | null> {
  if (!(value instanceof File) || value.size === 0) return null;
  const ext = value.name.split(".").pop() || "bin";
  const path = `${teacherId}/${fileName}.${ext}`;
  const { error } = await admin.storage.from("teacher-files").upload(path, value, { upsert: true });
  if (error) throw new Error(`${fileName} upload failed: ${error.message}`);
  return path;
}

export async function updateTeacher(teacherId: string, formData: FormData): Promise<ActionResult> {
  const { error } = await requirePrincipal();
  if (error) return { success: false, error };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName || !username || !email) {
    return { success: false, error: "Full name, username and email are required." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Admin client is not configured." };
  }

  const cnic = String(formData.get("cnic") ?? "").trim();
  const qualification = String(formData.get("qualification") ?? "").trim();
  const specializationSubjectId = String(formData.get("specialization_subject_id") ?? "").trim();
  const experienceRaw = String(formData.get("experience_years") ?? "").trim();
  const experienceYears = experienceRaw ? Number(experienceRaw) : null;
  const deviceUserId = String(formData.get("device_user_id") ?? "").trim();

  const { data: currentProfile } = await admin.from("profiles").select("username").eq("id", teacherId).maybeSingle();

  if (currentProfile?.username !== email) {
    const { error: authError } = await admin.auth.admin.updateUserById(teacherId, { email });
    if (authError) return { success: false, error: authError.message };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ full_name: fullName, username, phone: phone || null })
    .eq("id", teacherId);

  if (profileError) return { success: false, error: profileError.message };

  let cnicDocPath: string | null = null;
  let certificatePath: string | null = null;
  let otherDocPath: string | null = null;
  let photoPath: string | null = null;

  try {
    [photoPath, cnicDocPath, certificatePath, otherDocPath] = await Promise.all([
      uploadTeacherFile(admin, teacherId, "photo", formData.get("photo")),
      uploadTeacherFile(admin, teacherId, "cnic-document", formData.get("cnic_document")),
      uploadTeacherFile(admin, teacherId, "certificate", formData.get("certificate_document")),
      uploadTeacherFile(admin, teacherId, "other-document", formData.get("other_document")),
    ]);
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Couldn't upload the attached files." };
  }

  const teacherUpdate: Record<string, unknown> = {
    cnic: cnic || null,
    qualification: qualification || null,
    specialization_subject_id: specializationSubjectId || null,
    experience_years: experienceYears,
    device_user_id: deviceUserId || null,
    updated_at: new Date().toISOString(),
  };
  if (photoPath) teacherUpdate.photo_url = photoPath;
  if (cnicDocPath) teacherUpdate.cnic_document_url = cnicDocPath;
  if (certificatePath) teacherUpdate.certificate_url = certificatePath;
  if (otherDocPath) teacherUpdate.other_document_url = otherDocPath;

  const { error: teacherError } = await admin.from("teachers").update(teacherUpdate).eq("id", teacherId);
  if (teacherError) {
    return {
      success: false,
      error: teacherError.code === "23505" ? "That Fingerprint Device ID is already assigned to another teacher." : teacherError.message,
    };
  }

  revalidatePath("/dashboard/teachers");
  revalidatePath(`/dashboard/teachers/${teacherId}`);
  return { success: true };
}

export async function deleteTeacher(teacherId: string): Promise<ActionResult> {
  const { error } = await requirePrincipal();
  if (error) return { success: false, error };

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Admin client is not configured." };
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(teacherId);
  if (deleteError) return { success: false, error: deleteError.message };

  revalidatePath("/dashboard/teachers");
  return { success: true };
}
