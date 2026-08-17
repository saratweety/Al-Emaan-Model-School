import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import AddNoticeForm from "@/components/dashboard/AddNoticeForm";
import { ArrowLeftIcon, InfoIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getNoticeById } from "@/lib/notices-data";
import type { NoticeAudience, NoticeType } from "@/app/dashboard/notices/actions";

export const metadata: Metadata = {
  title: "Edit Notice | Al-Emaan Model School",
  description: "Edit an announcement for students, teachers or parents.",
};

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ classes }, { notice, error }] = await Promise.all([getClasses(), getNoticeById(id)]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href={notice ? `/dashboard/notices/${notice.id}` : "/dashboard/notices"}
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Notice
          </Link>

          {error || !notice ? (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This notice could not be found."}
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit Notice</h1>
                <p className="text-sm text-gray-500">Update this announcement for students, teachers or parents.</p>
              </div>

              <AddNoticeForm
                classes={classes}
                notice={{
                  id: notice.id,
                  title: notice.title,
                  description: notice.description,
                  noticeType: notice.noticeType as NoticeType,
                  audience: notice.audience as NoticeAudience,
                  classId: notice.classId,
                  publishDate: notice.publishDate,
                  expiryDate: notice.expiryDate,
                }}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
