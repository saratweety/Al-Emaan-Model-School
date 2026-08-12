import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  SettingsIcon,
  BuildingIcon,
  BookIcon,
  WalletIcon,
  AwardIcon,
  CameraIcon,
  SaveIcon,
} from "@/components/icons";
import { getCurrentSessionLabel } from "@/lib/school-calendar";

export const metadata: Metadata = {
  title: "Settings | Al-Emaan Model School",
  description: "Configure school information, academic and fee settings.",
};

const classChips = ["Play Group", "Nursery", "Prep", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];
const sectionChips = ["A", "B"];
const subjectChips = ["English", "Urdu", "Mathematics", "Science", "Computer", "Islamiyat", "Pakistan Studies"];

const grades = [
  { label: "A+", range: "90 – 100", color: "bg-green-100 text-green-700" },
  { label: "A", range: "80 – 89", color: "bg-green-100 text-green-700" },
  { label: "B", range: "70 – 79", color: "bg-blue-100 text-blue-700" },
  { label: "C", range: "60 – 69", color: "bg-amber-100 text-amber-700" },
  { label: "D", range: "50 – 59", color: "bg-orange-100 text-orange-700" },
  { label: "Fail", range: "Below 50", color: "bg-red-100 text-red-700" },
];

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Settings" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <PageHeader
            icon={SettingsIcon}
            title="Settings"
            subtitle="Configure school information, academic, fee and result settings"
            breadcrumb={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
          />

          <form className="space-y-4">
            {/* School Information */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <BuildingIcon className="h-4 w-4" />
                School Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="row-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">School Logo</label>
                  <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                    <input type="file" accept="image/png,image/jpeg" className="hidden" />
                    <CameraIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Upload Logo</span>
                    <span className="text-xs text-gray-400">JPG, PNG (Max 2MB)</span>
                  </label>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">School Name</label>
                  <input
                    type="text"
                    defaultValue="Al-Emaan Model School"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Principal Name</label>
                  <input
                    type="text"
                    placeholder="Enter principal name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+92 300 0000000"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    placeholder="info@alemaan.edu.pk"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">School Address</label>
                  <input
                    type="text"
                    placeholder="Full school address"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">School Opening Time</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
              </div>
            </section>

            {/* Academic Settings */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <BookIcon className="h-4 w-4" />
                Academic Settings
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Current Session</label>
                  <input
                    type="text"
                    readOnly
                    value={getCurrentSessionLabel()}
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-400">Sessions run February to February and update automatically.</p>
                </div>
                <div />
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Classes</label>
                  <div className="flex flex-wrap gap-2">
                    {classChips.map((c) => (
                      <span key={c} className="rounded-full bg-[#A2E494]/20 px-3 py-1.5 text-xs font-semibold text-[#0f4d34]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Sections</label>
                  <div className="flex flex-wrap gap-2">
                    {sectionChips.map((s) => (
                      <span key={s} className="rounded-full bg-[#A2E494]/20 px-3 py-1.5 text-xs font-semibold text-[#0f4d34]">
                        Section {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Subjects</label>
                  <div className="flex flex-wrap gap-2">
                    {subjectChips.map((s) => (
                      <span key={s} className="rounded-full bg-[#A2E494]/20 px-3 py-1.5 text-xs font-semibold text-[#0f4d34]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Fee Settings */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <WalletIcon className="h-4 w-4" />
                Fee Settings
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Fee Due Date (Day of Month)</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    defaultValue="10"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Late Fine (Rs. per day)</label>
                  <input
                    type="number"
                    min="0"
                    defaultValue="20"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div className="flex items-end">
                  <a
                    href="/dashboard/fees"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#13714C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
                  >
                    Manage Fee Structure
                  </a>
                </div>
              </div>
            </section>

            {/* Result Settings */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <AwardIcon className="h-4 w-4" />
                Result Settings
              </h2>
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Passing Percentage</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {grades.map((g) => (
                  <div key={g.label} className="rounded-xl border border-gray-100 bg-[#F4F6F5] p-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${g.color}`}>{g.label}</span>
                    <p className="mt-2 text-xs font-semibold text-gray-600">{g.range}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <SaveIcon className="h-4 w-4" />
                  Save Settings
                </button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
