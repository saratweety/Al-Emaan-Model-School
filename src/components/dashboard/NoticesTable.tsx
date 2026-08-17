"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import { deleteNotice } from "@/app/dashboard/notices/actions";
import { EyeOutlineIcon, FunnelIcon, UsersIcon, MoreVerticalIcon, PencilIcon, TrashIcon, ChevronDownIcon } from "@/components/icons";
import { noticeTypeMeta, noticeStatusStyles } from "@/lib/notice-meta";
import type { PrincipalNotice } from "@/lib/notices-data";
import type { SchoolClass } from "@/lib/classes-data";

export default function NoticesTable({ notices, classes }: { notices: PrincipalNotice[]; classes: SchoolClass[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PrincipalNotice | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<"All Notices" | "Active" | "Expired">("All Notices");

  const filtered = useMemo(
    () =>
      notices.filter((n) => {
        if (typeFilter !== "all" && n.noticeType !== typeFilter) return false;
        if (classFilter !== "all" && n.forClass !== classFilter) return false;
        if (statusTab !== "All Notices" && n.status !== statusTab) return false;
        return true;
      }),
    [notices, typeFilter, classFilter, statusTab]
  );

  function handleDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      const result = await deleteNotice(pendingDelete.id);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Notice deleted.", "success");
      setPendingDelete(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 overflow-x-auto border-b border-gray-200">
        {(["All Notices", "Active", "Expired"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusTab(tab)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
              statusTab === tab
                ? "border-[#13714C] text-[#13714C]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <FunnelIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-gray-600 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option value="all">All Types</option>
            {Object.entries(noticeTypeMeta).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="relative">
          <UsersIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm font-semibold text-gray-600 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {notices.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500">No notices yet.</p>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-gray-500">No notices match the selected filters.</p>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">For</th>
                    <th className="px-3 py-3">Published On</th>
                    <th className="px-3 py-3">Valid Until</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="rounded-r-xl px-3 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((n, i) => {
                  const meta = noticeTypeMeta[n.noticeType] ?? noticeTypeMeta.general;
                  return (
                    <tr key={n.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.iconBg}`}>
                            <meta.icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800">{n.title}</p>
                            <p className="max-w-[220px] truncate text-xs text-gray-400">{n.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>{meta.label}</span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{n.forClass}</td>
                      <td className="px-3 py-3 text-gray-600">
                        <p>{n.publishDate}</p>
                        <p className="text-xs text-gray-400">by {n.publishedBy}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{n.validUntil ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${noticeStatusStyles[n.status]}`}>
                          {n.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/notices/${n.id}`}
                            aria-label="View"
                            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                          >
                            <EyeOutlineIcon className="h-4 w-4" />
                          </Link>
                          <div className="relative">
                            <button
                              type="button"
                              aria-label="More actions"
                              onClick={() => setMenuId(menuId === n.id ? null : n.id)}
                              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                            >
                              <MoreVerticalIcon className="h-4 w-4" />
                            </button>
                            {menuId === n.id && (
                              <>
                                <div role="presentation" className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                                <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                                  <Link
                                    href={`/dashboard/notices/${n.id}/edit`}
                                    onClick={() => setMenuId(null)}
                                    className="flex items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-gray-600 hover:bg-gray-50"
                                  >
                                    <PencilIcon className="h-3.5 w-3.5" />
                                    Edit
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenuId(null);
                                      setPendingDelete(n);
                                    }}
                                    className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50"
                                  >
                                    <TrashIcon className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Showing {filtered.length} of {notices.length} notices
            </p>
          </>
        )}
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Delete notice"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        {pendingDelete ? `Delete "${pendingDelete.title}"? This can't be undone.` : ""}
      </Modal>
    </div>
  );
}
