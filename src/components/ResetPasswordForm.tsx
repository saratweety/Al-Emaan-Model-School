"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";

type LinkStatus = "checking" | "ready" | "invalid";

// Recovery emails can land here with tokens in the URL hash (implicit flow),
// a `?code=` (PKCE flow), or an already-verified session (/auth/confirm).
async function establishRecoverySession(): Promise<boolean> {
  const supabase = createClient();
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));

  if (hash.get("error") || hash.get("error_description")) {
    return false;
  }

  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  const code = url.searchParams.get("code");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    window.history.replaceState(null, "", url.pathname + url.search);
    if (error) return false;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    url.searchParams.delete("code");
    window.history.replaceState(null, "", url.pathname + url.search);
    if (error) return false;
  }

  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

export default function ResetPasswordForm({ disabled = false }: { disabled?: boolean }) {
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(disabled ? "invalid" : "checking");

  useEffect(() => {
    if (disabled) return;
    let cancelled = false;
    establishRecoverySession().then((ok) => {
      if (!cancelled) setLinkStatus(ok ? "ready" : "invalid");
    });
    return () => {
      cancelled = true;
    };
  }, [disabled]);

  const formDisabled = linkStatus !== "ready";

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
      {linkStatus === "invalid" && !disabled && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          This reset link is invalid or has expired. Request a new one from the login page.
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">New Password</label>
        <input
          type="password"
          required
          minLength={6}
          disabled={formDisabled}
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
          disabled={formDisabled}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30 disabled:bg-gray-50"
        />
      </div>
      <button
        type="submit"
        disabled={formDisabled || saving}
        className="w-full rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {linkStatus === "checking" ? "Verifying link..." : saving ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
