import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import PersonFilesButton from "@/components/dashboard/PersonFilesButton";
import { ArrowLeftIcon, FileTextIcon, InfoIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teacher Documents | Al-Emaan Model School",
  description: "View uploaded CNIC copies, certificates and other documents for every teacher.",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type TeacherDocRow = {
  id: string;
  teacher_code: string;
  cnic_document_url: string | null;
  certificate_url: string | null;
  other_document_url: string | null;
  profiles: { full_name: string } | null;
};

export default async function TeacherDocumentsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("teachers")
    .select("id, teacher_code, cnic_document_url, certificate_url, other_document_url, profiles(full_name)")
    .order("teacher_code", { ascending: true })
    .returns<TeacherDocRow[]>();

  const teachers = data ?? [];

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

          <PageHeader
            icon={FileTextIcon}
            title="Teacher Documents"
            subtitle="View uploaded certificates and files for every teacher"
            breadcrumb={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Teachers", href: "/dashboard/teachers" },
              { label: "Documents" },
            ]}
          />

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            {error ? (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Couldn&apos;t load teachers: {error.message}
              </div>
            ) : teachers.length === 0 ? (
              <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
                No teachers yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                      <th className="rounded-l-xl px-3 py-3">Teacher</th>
                      <th className="px-3 py-3">CNIC Copy</th>
                      <th className="px-3 py-3">Certificate</th>
                      <th className="px-3 py-3">Other Document</th>
                      <th className="rounded-r-xl px-3 py-3">Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.map((t) => {
                      const name = t.profiles?.full_name ?? "—";
                      const files = [
                        { label: "CNIC Copy", path: t.cnic_document_url },
                        { label: "Educational Certificate", path: t.certificate_url },
                        { label: "Other Document", path: t.other_document_url },
                      ].filter((f): f is { label: string; path: string } => Boolean(f.path));

                      return (
                        <tr key={t.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-xs font-bold text-white">
                                {initials(name)}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-800">{name}</p>
                                <p className="text-xs text-gray-400">{t.teacher_code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                t.cnic_document_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {t.cnic_document_url ? "Uploaded" : "Missing"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                t.certificate_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {t.certificate_url ? "Uploaded" : "Missing"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                t.other_document_url ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                              }`}
                            >
                              {t.other_document_url ? "Uploaded" : "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <PersonFilesButton bucket="teacher-files" personName={name} files={files} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
