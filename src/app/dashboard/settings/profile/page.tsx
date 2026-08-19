import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import ProfileForm from "@/components/ProfileForm";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { UserIcon, LockIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Profile | Al-Emaan Model School",
  description: "View and update your profile information and password.",
};

export default async function PrincipalProfilePage() {
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
      <Sidebar active="Settings" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={UserIcon}
            title="My Profile"
            subtitle="View and update your profile information and password"
            breadcrumb={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Settings", href: "/dashboard/settings" },
              { label: "My Profile" },
            ]}
          />

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
              <UserIcon className="h-4 w-4" />
              Profile Information
            </h2>
            <ProfileForm
              initialFullName={profile?.full_name ?? ""}
              initialUsername={profile?.username ?? ""}
              initialEmail={user?.email ?? ""}
            />
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
