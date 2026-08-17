import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddTeacherForm, { type ExistingTeacherFiles } from "@/components/teachers/AddTeacherForm";
import { ArrowLeftIcon, InfoIcon } from "@/components/icons";
import { getSubjects } from "@/lib/subjects-data";
import { getTeacherDetail } from "@/lib/teachers-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Teacher | Al-Emaan Model School",
  description: "Update a teacher's details.",
};

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ subjects }, { teacher, error }] = await Promise.all([getSubjects(), getTeacherDetail(id)]);

  const existingFileUrls: ExistingTeacherFiles = {};
  if (teacher) {
    const supabase = await createClient();
    const paths = [teacher.photoUrl, teacher.cnicDocumentUrl, teacher.certificateUrl, teacher.otherDocumentUrl].filter(
      (p): p is string => Boolean(p)
    );
    if (paths.length > 0) {
      const { data: signed } = await supabase.storage.from("teacher-files").createSignedUrls(paths, 3600);
      const urlByPath = new Map((signed ?? []).filter((s) => s.signedUrl && !s.error).map((s) => [s.path ?? "", s.signedUrl]));
      existingFileUrls.photo = teacher.photoUrl ? urlByPath.get(teacher.photoUrl) : null;
      existingFileUrls.cnicDocument = teacher.cnicDocumentUrl ? urlByPath.get(teacher.cnicDocumentUrl) : null;
      existingFileUrls.certificate = teacher.certificateUrl ? urlByPath.get(teacher.certificateUrl) : null;
      existingFileUrls.otherDoc = teacher.otherDocumentUrl ? urlByPath.get(teacher.otherDocumentUrl) : null;
    }
  }

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Teachers" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href={teacher ? `/dashboard/teachers/${teacher.id}` : "/dashboard/teachers"}
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Teacher
          </Link>

          {error || !teacher ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This teacher could not be found."}
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit Teacher</h1>
                <p className="text-sm text-gray-500">Update {teacher.fullName}&apos;s details below.</p>
              </div>

              <AddTeacherForm
                subjects={subjects}
                existingFileUrls={existingFileUrls}
                teacher={{
                  id: teacher.id,
                  fullName: teacher.fullName,
                  username: teacher.username,
                  email: teacher.email,
                  phone: teacher.phone,
                  cnic: teacher.cnic,
                  qualification: teacher.qualification,
                  deviceUserId: teacher.deviceUserId,
                  specializationSubjectId: teacher.specializationSubjectId,
                  experienceYears: teacher.experienceYears,
                  photoUrl: teacher.photoUrl,
                  cnicDocumentUrl: teacher.cnicDocumentUrl,
                  certificateUrl: teacher.certificateUrl,
                  otherDocumentUrl: teacher.otherDocumentUrl,
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
