"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { FileTextIcon, XIcon, SaveIcon } from "@/components/icons";
import { getToday } from "@/lib/school-calendar";
import { createNotice, updateNotice, type NoticeAudience, type NoticeType } from "@/app/dashboard/notices/actions";
import type { SchoolClass } from "@/lib/classes-data";

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type EditableNotice = {
  id: string;
  title: string;
  description: string;
  noticeType: NoticeType;
  audience: NoticeAudience;
  classId: string | null;
  publishDate: string;
  expiryDate: string | null;
};

export default function AddNoticeForm({ classes, notice }: { classes: SchoolClass[]; notice?: EditableNotice }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEditing = Boolean(notice);
  const [title, setTitle] = useState(notice?.title ?? "");
  const [noticeType, setNoticeType] = useState<NoticeType>(notice?.noticeType ?? "general");
  const [audience, setAudience] = useState<NoticeAudience>(notice?.audience ?? "everyone");
  const [classId, setClassId] = useState(notice?.classId ?? classes[0]?.id ?? "");
  const [publishDate, setPublishDate] = useState(notice?.publishDate ?? toInputDate(getToday()));
  const [expiryDate, setExpiryDate] = useState(notice?.expiryDate ?? "");
  const [description, setDescription] = useState(notice?.description ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    const input = {
      title,
      description,
      noticeType,
      audience,
      classId: audience === "class" ? classId : null,
      publishDate,
      expiryDate: expiryDate || null,
    };
    const result = isEditing ? await updateNotice(notice!.id, input) : await createNotice(input);
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast(isEditing ? "Notice updated." : "Notice published.", "success");
    router.push(isEditing ? `/dashboard/notices/${notice!.id}` : "/dashboard/notices");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Notice Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <FileTextIcon className="h-4 w-4" />
          Notice Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notice title"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Notice Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value as NoticeType)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="event">Event</option>
              <option value="holiday">Holiday</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Notice For <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={audience}
              onChange={(e) => setAudience(e.target.value as NoticeAudience)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              <option value="everyone">Everyone</option>
              <option value="teachers">Teachers</option>
              <option value="parents">Parents</option>
              <option value="class">Particular Class</option>
            </select>
          </div>
          {audience === "class" && (
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Publish Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Expiry Date (Optional)</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Notice Description <span className="text-red-500">*</span>
            </label>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <textarea
                required
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write notice details here..."
                className="w-full px-4 py-3 text-sm text-gray-700 outline-none"
              />
              <div className="flex justify-end border-t border-gray-100 px-4 py-1.5 text-xs text-gray-400">
                {description.length} characters
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <Link
            href={isEditing ? `/dashboard/notices/${notice!.id}` : "/dashboard/notices"}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            <XIcon className="h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Publish Notice"}
          </button>
        </div>
      </section>
    </form>
  );
}
