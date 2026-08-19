"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { SaveIcon } from "@/components/icons";
import { updateOwnProfile } from "@/lib/profile-actions";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  initialFullName,
  initialUsername,
  initialEmail,
}: {
  initialFullName: string;
  initialUsername: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(initialFullName);
  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const result = await updateOwnProfile({ fullName, username });
    if (!result.success) {
      setSaving(false);
      showToast(result.error, "error");
      return;
    }

    const trimmedEmail = email.trim();
    const emailChanged = trimmedEmail && trimmedEmail !== initialEmail;

    if (emailChanged) {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser(
        { email: trimmedEmail },
        { emailRedirectTo: window.location.href }
      );
      setSaving(false);

      if (error) {
        showToast(error.message, "error");
        return;
      }

      showToast("Profile updated. Check your new email inbox to confirm the change.", "success");
      return;
    }

    setSaving(false);
    showToast("Profile updated successfully.", "success");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            Changing your email requires confirming a link sent to the new address.
          </p>
        </div>
      </div>
      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <SaveIcon className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
