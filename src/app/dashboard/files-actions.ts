"use server";

import { requirePrincipal } from "@/lib/principal-auth";

export type SignedFile = { label: string; url: string };

export async function getSignedFileUrls(
  bucket: "student-files" | "teacher-files",
  files: { label: string; path: string }[]
): Promise<{ files: SignedFile[]; error: string | null }> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { files: [], error: error ?? "Not authorized." };
  if (files.length === 0) return { files: [], error: null };

  const results: SignedFile[] = [];
  for (const f of files) {
    const { data } = await supabase.storage.from(bucket).createSignedUrl(f.path, 300);
    if (data) results.push({ label: f.label, url: data.signedUrl });
  }

  return { files: results, error: null };
}
