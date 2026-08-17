import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import SubjectsManager from "@/components/subjects/SubjectsManager";
import { BookIcon, InfoIcon } from "@/components/icons";
import { getSubjectsWithClasses } from "@/lib/subjects-data";
import { getClasses } from "@/lib/classes-data";

export const metadata: Metadata = {
  title: "Subjects | Al-Emaan Model School",
  description: "Manage the subjects taught across the school.",
};

export default async function SubjectsPage() {
  const [{ subjects, error }, { classes }] = await Promise.all([getSubjectsWithClasses(), getClasses()]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Subjects" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={BookIcon}
            title="Subjects"
            subtitle="Manage the subjects taught across the school"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subjects" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load subjects: {error}
            </div>
          ) : (
            <SubjectsManager subjects={subjects} classes={classes} />
          )}
        </main>
      </div>
    </div>
  );
}
