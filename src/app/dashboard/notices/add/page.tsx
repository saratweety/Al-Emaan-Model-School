"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ArrowLeftIcon,
  FileTextIcon,
  PaperclipIcon,
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  ListOrderedIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  LinkIcon,
  ImageIcon,
  CloudUploadIcon,
  XIcon,
  SaveIcon,
} from "@/components/icons";
import { getToday } from "@/lib/school-calendar";

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const toolbarButtons = [
  { icon: BoldIcon, label: "Bold" },
  { icon: ItalicIcon, label: "Italic" },
  { icon: ListBulletIcon, label: "Bullet list" },
  { icon: ListOrderedIcon, label: "Numbered list" },
  { icon: AlignLeftIcon, label: "Align left" },
  { icon: AlignCenterIcon, label: "Align center" },
  { icon: AlignRightIcon, label: "Align right" },
  { icon: LinkIcon, label: "Insert link" },
  { icon: ImageIcon, label: "Insert image" },
];

export default function AddNoticePage() {
  const [description, setDescription] = useState("");

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

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Notice</h1>
            <p className="text-sm text-gray-500">Create an announcement for students, teachers or parents.</p>
          </div>

          <form className="space-y-4">
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
                    placeholder="Enter notice title"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Notice For <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30">
                    <option value="">Select</option>
                    <option>Everyone</option>
                    <option>Teachers</option>
                    <option>Parents</option>
                    <option>Particular Class</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    defaultValue={toInputDate(getToday())}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Notice Description <span className="text-red-500">*</span>
                  </label>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-[#F4F6F5] px-2 py-1.5">
                      <select className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none">
                        <option>Paragraph</option>
                        <option>Heading</option>
                      </select>
                      <span className="mx-1 h-5 w-px bg-gray-200" />
                      {toolbarButtons.map((btn) => (
                        <button
                          key={btn.label}
                          type="button"
                          aria-label={btn.label}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-white"
                        >
                          <btn.icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                    <textarea
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

            {/* Attachment */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <PaperclipIcon className="h-4 w-4" />
                Attachment (Optional)
              </h2>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">Upload File</label>
                <label className="flex h-[140px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                  <input type="file" accept="application/pdf,image/jpeg,image/png" className="hidden" />
                  <CloudUploadIcon className="h-7 w-7 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700">
                    Drag and drop file here or <span className="text-[#13714C] underline">click to browse</span>
                  </span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG (Max 5MB)</span>
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <Link
                  href="/dashboard/notices"
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <XIcon className="h-4 w-4" />
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <SaveIcon className="h-4 w-4" />
                  Publish Notice
                </button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
