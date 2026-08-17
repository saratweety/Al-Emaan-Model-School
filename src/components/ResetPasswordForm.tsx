"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

export default function ResetPasswordForm({ disabled = false }: { disabled?: boolean }) {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 6) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setSaving(false);
      showToast(error.message, "error");
      return;
    }

    await supabase.auth.signOut();
    setSaving(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="space-y-3 text-sm">
        <p className="rounded-xl bg-[#A2E494]/15 px-4 py-2.5 font-semibold text-[#0f4d34]">
          Your password has been updated.
        </p>
        <Link href="/" className="font-bold text-[#13714C] hover:underline">
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">New Password</label>
        <input
          type="password"
          required
          minLength={6}
          disabled={disabled}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30 disabled:bg-gray-50"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Confirm Password</label>
        <input
          type="password"
          required
          minLength={6}
          disabled={disabled}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30 disabled:bg-gray-50"
        />
      </div>
      <button
        type="submit"
        disabled={disabled || saving}
        className="w-full rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
