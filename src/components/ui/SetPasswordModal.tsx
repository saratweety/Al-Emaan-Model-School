"use client";

import { useState, type FormEvent } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { EyeIcon } from "@/components/icons";

export default function SetPasswordModal({
  open,
  onClose,
  onSubmit,
  title = "Set New Password",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  title?: string;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleClose() {
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const result = await onSubmit(password);
    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">
          Use this when they&apos;ve come to the office in person to reset a forgotten password.
        </p>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-4 pr-11 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon className="h-4 w-4" off={showPassword} />
          </button>
        </div>
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={6}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/40"
        />
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">{error}</p>
        )}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            Set Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
