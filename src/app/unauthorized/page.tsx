import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheckIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Unauthorized | Al-Emaan Model School",
  description: "You don't have access to this page.",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F4F6F5] p-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
        <ShieldCheckIcon className="h-8 w-8" />
      </span>
      <div>
        <h1 className="text-xl font-extrabold text-[#0f4d34]">You don&apos;t have access to this page</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account isn&apos;t permitted to view this section of the portal.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110"
      >
        Back to Login
      </Link>
    </div>
  );
}
