import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { ArrowLeftIcon, CalendarIcon, UsersIcon, InfoIcon, PencilIcon } from "@/components/icons";
import { getNoticeById } from "@/lib/notices-data";
import { noticeTypeMeta, noticeStatusStyles, noticeAudienceLabels } from "@/lib/notice-meta";

export const metadata: Metadata = {
  title: "Notice Details | Al-Emaan Model School",
  description: "View notice details.",
};

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { notice, error } = await getNoticeById(id);

  if (error || !notice) {
    return (
      <div className="flex h-screen bg-[#F4F6F5]">
        <Sidebar active="Notices" />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <Topbar />
          <main className="flex-1 space-y-4 p-4 sm:p-6">
            <Link
              href="/dashboard/notices"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Notices
            </Link>
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error ?? "This notice could not be found."}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const meta = noticeTypeMeta[notice.noticeType] ?? noticeTypeMeta.general;
  const publishDateLabel = new Date(notice.publishDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const expiryDateLabel = notice.expiryDate
    ? new Date(notice.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : null;
  const forLabel = notice.audience === "class" ? (notice.className ?? "Unknown Class") : (noticeAudienceLabels[notice.audience] ?? notice.audience);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Notices" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard/notices"
              className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Notices
            </Link>
            <Link
              href={`/dashboard/notices/${notice.id}/edit`}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Notice
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}>
                  <meta.icon className="h-6 w-6" />
                </span>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${noticeStatusStyles[notice.status]}`}>
                      {notice.status}
                    </span>
                  </div>
                  <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">{notice.title}</h1>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UsersIcon className="h-4 w-4 text-[#13714C]" />
                <div>
                  <p className="text-xs font-semibold text-gray-400">For</p>
                  <p className="font-semibold text-gray-800">{forLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                <div>
                  <p className="text-xs font-semibold text-gray-400">Published On</p>
                  <p className="font-semibold text-gray-800">
                    {publishDateLabel} <span className="font-normal text-gray-400">by {notice.publishedBy}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 text-[#13714C]" />
                <div>
                  <p className="text-xs font-semibold text-gray-400">Valid Until</p>
                  <p className="font-semibold text-gray-800">{expiryDateLabel ?? "No expiry"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="mb-1.5 text-xs font-semibold text-gray-400">Description</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{notice.description}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
