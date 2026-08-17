import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  ReportIcon,
  UsersIcon,
  CheckSquareIcon,
  WalletIcon,
  HourglassIcon,
  ClipboardListIcon,
  UserIcon,
  PieChartIcon,
  FileTextIcon,
  InfoIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Reports | Al-Emaan Model School",
  description: "Generate, view and print various school reports.",
};

const reports = [
  {
    icon: UsersIcon,
    title: "Student Report",
    desc: "View and print the list of students with their detailed information.",
    href: "/dashboard/reports/students",
  },
  {
    icon: CheckSquareIcon,
    title: "Student Attendance Report",
    desc: "View attendance records of students for a selected class and date range.",
    href: "/dashboard/reports/attendance",
  },
  {
    icon: WalletIcon,
    title: "Fee Report",
    desc: "View fee collection details including paid, pending and partial payments.",
    href: "/dashboard/reports/fees",
  },
  {
    icon: HourglassIcon,
    title: "Pending Fee Report",
    desc: "View students with pending fees, sorted by how many months are owed.",
    href: "/dashboard/reports/pending-fees",
  },
  {
    icon: ClipboardListIcon,
    title: "Result Report",
    desc: "View and print exam results for a selected exam and class.",
    href: "/dashboard/reports/results",
  },
  {
    icon: UserIcon,
    title: "Teacher Report",
    desc: "View list of teachers with their subjects and assigned classes.",
    href: "/dashboard/reports/teachers",
  },
  {
    icon: PieChartIcon,
    title: "Summary Report",
    desc: "Overall summary of students, teachers, classes and pending fees.",
    href: "/dashboard/reports/summary",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Reports" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={ReportIcon}
            title="Reports"
            subtitle="Generate, view and print various school reports."
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Reports" }]}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
              {reports.map((r) => (
                <div key={r.title} className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                    <r.icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-sm font-bold text-[#0f4d34]">{r.title}</h2>
                  <p className="mt-1 flex-1 text-xs text-gray-500">{r.desc}</p>
                  <Link
                    href={r.href}
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    Generate Report
                  </Link>
                </div>
              ))}
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4">
                <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                  <InfoIcon className="h-4 w-4" />
                  Note
                </h2>
                <p className="text-sm text-gray-600">
                  Reports are based on the information available in the system. Please ensure data is updated
                  regularly for accurate reports. Each report can be printed or exported to PDF using your
                  browser&apos;s print dialog.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
