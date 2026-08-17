import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { SettingsIcon, UserIcon, LockIcon, PhoneIcon, MailIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Settings | Al-Emaan Model School",
  description: "Manage your account settings and security.",
};

export default async function ParentSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, phone")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Settings" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={SettingsIcon}
            title="Settings"
            subtitle="Manage your account settings and security."
            breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Settings" }]}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <UserIcon className="h-4 w-4" />
                Profile Information
              </h2>
              <p className="mb-4 text-xs text-gray-400">View and update your profile information.</p>

              <div className="space-y-4">
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
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <MailIcon className="h-3.5 w-3.5 text-gray-400" />
                    Username / Email
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={profile?.username ?? user?.email ?? "—"}
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                    Contact Number
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={profile?.phone ?? "—"}
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
                Contact the school office to update your email or phone number.
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <LockIcon className="h-4 w-4" />
                Change Password
              </h2>
              <p className="mb-4 text-xs text-gray-400">Update your password to keep your account secure.</p>

              <ChangePasswordForm />

              <div className="mt-4 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
                <p className="mb-1.5 font-bold">Password must:</p>
                <ul className="space-y-1 text-[#13714C]">
                  <li>✓ Be at least 6 characters long</li>
                  <li>✓ Include letters and numbers</li>
                  <li>✓ Be different from your previous passwords</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
