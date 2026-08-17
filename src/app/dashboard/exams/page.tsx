import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ExamsBoard from "@/components/dashboard/ExamsBoard";
import { AwardIcon, ClockIcon, CheckSquareIcon, ClipboardListIcon } from "@/components/icons";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { getAllExams } from "@/lib/exams-data";

export const metadata: Metadata = {
  title: "Exams | Al-Emaan Model School",
  description: "Create and manage exams for each class.",
};

export default async function ExamsPage() {
  const sessionId = await getCurrentSessionId();
  const exams = await getAllExams(sessionId);

  const awaitingMarks = exams.filter((e) => e.enteredCount < e.totalStudents).length;
  const readyToPublish = exams.filter((e) => e.totalStudents > 0 && e.enteredCount === e.totalStudents && !e.isPublished).length;
  const published = exams.filter((e) => e.isPublished).length;

  const statCards = [
    { icon: AwardIcon, iconBg: "bg-[#13714C]", label: "TOTAL EXAMS", value: String(exams.length), sub: "This Session" },
    { icon: ClockIcon, iconBg: "bg-amber-500", label: "AWAITING MARKS", value: String(awaitingMarks), sub: "Not Fully Entered" },
    { icon: CheckSquareIcon, iconBg: "bg-blue-500", label: "READY TO PUBLISH", value: String(readyToPublish), sub: "Marks Complete" },
    { icon: ClipboardListIcon, iconBg: "bg-[#3AB67D]", label: "PUBLISHED", value: String(published), sub: "Visible to Parents" },
  ];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Exams" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={AwardIcon}
            title="Exams"
            subtitle="Create and manage exams for each class"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Exams" }]}
            actionLabel="Add Exam"
            actionHref="/dashboard/exams/add"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>

          <ExamsBoard exams={exams} />
        </main>
      </div>
    </div>
  );
}
