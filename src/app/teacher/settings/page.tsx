import type { Metadata } from "next";
import TeacherSidebar from "@/components/teacher/Sidebar";
import TeacherTopbar from "@/components/teacher/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { SettingsIcon, UserIcon, LockIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings | Al-Emaan Model School",
  description: "View your profile and update your password.",
};

export default async function TeacherSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <TeacherSidebar active="Settings" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <TeacherTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={SettingsIcon}
            title="Settings"
            subtitle="View your profile information and update your password"
            breadcrumb={[{ label: "Dashboard", href: "/teacher" }, { label: "Settings" }]}
          />

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <UserIcon className="h-4 w-4" />
              Profile Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.full_name ?? "—"}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email ?? "—"}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  readOnly
                  value={profile?.username ?? "—"}
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Role</label>
                <input
                  type="text"
                  readOnly
                  value="Teacher"
                  className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                />
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Contact the principal to update your profile details.
            </p>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <LockIcon className="h-4 w-4" />
              Change Password
            </h2>
            <ChangePasswordForm />
          </section>
        </main>
      </div>
    </div>
  );
}
