import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import ResultsOverview from "@/components/dashboard/ResultsOverview";
import { ClipboardListIcon } from "@/components/icons";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getAllExams, getResultsOverview } from "@/lib/exams-data";

export const metadata: Metadata = {
  title: "Results | Al-Emaan Model School",
  description: "View and publish exam results by class and term.",
};

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ examId?: string }>;
}) {
  const { examId } = await searchParams;
  const sessionId = await getCurrentSessionId();
  const exams = await getAllExams(sessionId);
  const overview = await getResultsOverview(exams);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Results" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ClipboardListIcon}
            title="Results"
            subtitle="View and publish exam results by class and term"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Results" }]}
          />

          <ResultsOverview exams={exams} overview={overview} initialExamId={examId} />
        </main>
      </div>
    </div>
  );
}
