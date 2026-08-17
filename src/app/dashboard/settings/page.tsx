import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import GeneralSettingsForm from "@/components/dashboard/GeneralSettingsForm";
import { SettingsIcon } from "@/components/icons";
import { getCurrentSessionLabel } from "@/lib/school-calendar";
import { getSchoolSettings } from "@/lib/school-settings-data";
import { getClasses } from "@/lib/classes-data";
import { getSubjects } from "@/lib/subjects-data";

export const metadata: Metadata = {
  title: "Settings | Al-Emaan Model School",
  description: "Configure school information, academic and fee settings.",
};

export default async function SettingsPage() {
  const [settings, { classes }, { subjects }] = await Promise.all([getSchoolSettings(), getClasses(), getSubjects()]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Settings" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={SettingsIcon}
            title="Settings"
            subtitle="Configure school information, academic, fee and result settings"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
          />

          <GeneralSettingsForm
            settings={settings}
            classNames={classes.map((c) => c.name)}
            subjectNames={subjects.map((s) => s.name)}
            currentSessionLabel={getCurrentSessionLabel()}
          />
        </main>
      </div>
    </div>
  );
}
