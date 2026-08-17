import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import HomeworkDiaryBoard from "@/components/dashboard/HomeworkDiaryBoard";
import { ClipboardListIcon } from "@/components/icons";
import { getAllDiaryEntries } from "@/lib/homework-data";
import { getClasses } from "@/lib/classes-data";
import { getSubjects } from "@/lib/subjects-data";

export const metadata: Metadata = {
  title: "Homework | Al-Emaan Model School",
  description: "Daily homework and holiday diary of each subject for all classes.",
};

export default async function HomeworkPage() {
  const [{ entries, error }, { classes }, { subjects }] = await Promise.all([getAllDiaryEntries(), getClasses(), getSubjects()]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Homework" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ClipboardListIcon}
            title="Homework Diary"
            subtitle="Daily homework and holiday diary of each subject for all classes."
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Homework" }]}
          />

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
              Couldn&apos;t load the homework diary: {error}
            </div>
          ) : (
            <HomeworkDiaryBoard entries={entries} classes={classes} subjectCount={subjects.length} />
          )}
        </main>
      </div>
    </div>
  );
}
