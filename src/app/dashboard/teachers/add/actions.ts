"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type CreateTeacherResult = { success: true } | { success: false; error: string };

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

export async function createTeacherAccount(formData: FormData): Promise<CreateTeacherResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "principal") {
    return { success: false, error: "Only the principal can add teachers." };
  }

  const fullName = String(formData.get("full_name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!fullName || !username || !email || !password) {
    return { success: false, error: "Full name, username, email and password are required." };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
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

  const photoFile = formData.get("photo");
  const cnicDocFile = formData.get("cnic_document");
  const certificateFile = formData.get("certificate_document");
  const otherDocFile = formData.get("other_document");

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
    role: "teacher",
    username,
    phone: phone || null,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: profileError.message };
  }

  let photoPath: string | null = null;
  let cnicDocPath: string | null = null;
  let certificatePath: string | null = null;
  let otherDocPath: string | null = null;

  try {
    [photoPath, cnicDocPath, certificatePath, otherDocPath] = await Promise.all([
      uploadTeacherFile(admin, created.user.id, "photo", photoFile),
      uploadTeacherFile(admin, created.user.id, "cnic-document", cnicDocFile),
      uploadTeacherFile(admin, created.user.id, "certificate", certificateFile),
      uploadTeacherFile(admin, created.user.id, "other-document", otherDocFile),
    ]);
  } catch (err) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { success: false, error: err instanceof Error ? err.message : "Couldn't upload the attached files." };
  }

  const { error: teacherError } = await admin.from("teachers").insert({
    id: created.user.id,
    cnic: cnic || null,
    qualification: qualification || null,
    specialization_subject_id: specializationSubjectId || null,
    experience_years: experienceYears,
    device_user_id: deviceUserId || null,
    photo_url: photoPath,
    cnic_document_url: cnicDocPath,
    certificate_url: certificatePath,
    other_document_url: otherDocPath,
  });

  if (teacherError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return {
      success: false,
      error: teacherError.code === "23505" ? "That Fingerprint Device ID is already assigned to another teacher." : teacherError.message,
    };
  }

  revalidatePath("/dashboard/teachers");
  return { success: true };
}
