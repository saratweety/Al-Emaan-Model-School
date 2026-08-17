import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import ParentsManager from "@/components/dashboard/ParentsManager";
import { getAllParents, getLinkableStudents } from "@/lib/parents-list-data";

export const metadata: Metadata = {
  title: "Parents | Al-Emaan Model School",
  description: "Manage parent accounts, logins and linked children.",
};

export default async function ParentsPage() {
  const [parents, linkableStudents] = await Promise.all([getAllParents(), getLinkableStudents()]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Parents" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <ParentsManager parents={parents} linkableStudents={linkableStudents} />
        </main>
      </div>
    </div>
  );
}
