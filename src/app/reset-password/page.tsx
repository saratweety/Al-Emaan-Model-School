import type { Metadata } from "next";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Al-Emaan Model School",
  description: "Set a new password for your account.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F6F5] p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-[#0f4d34]">Reset Password</h1>
        <p className="mt-1 text-sm text-gray-500">Enter a new password for your account.</p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
            This reset link is invalid or has expired. Request a new one from the login page.
          </p>
        )}

        <div className="mt-5">
          <ResetPasswordForm disabled={Boolean(error)} />
        </div>
      </div>
    </div>
  );
}
