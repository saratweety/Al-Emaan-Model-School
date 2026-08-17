import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddTeacherForm from "@/components/teachers/AddTeacherForm";
import { ArrowLeftIcon } from "@/components/icons";
import { getSubjects } from "@/lib/subjects-data";

export const metadata: Metadata = {
  title: "Add Teacher | Al-Emaan Model School",
  description: "Register a new teacher and create their login.",
};

export default async function AddTeacherPage() {
  const { subjects } = await getSubjects();

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/teachers"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Teachers
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Teacher</h1>
            <p className="text-sm text-gray-500">Enter teacher details to register them into the Al-Emaan institution ledger.</p>
          </div>

          <AddTeacherForm subjects={subjects} />
        </main>
      </div>
    </div>
  );
}
