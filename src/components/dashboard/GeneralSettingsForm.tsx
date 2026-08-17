"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/lib/toast";
import { BuildingIcon, BookIcon, WalletIcon, AwardIcon, SaveIcon } from "@/components/icons";
import { updateGeneralSettings } from "@/app/dashboard/settings/actions";
import { BANDS } from "@/lib/grading";
import type { SchoolSettings } from "@/lib/school-settings-data";

export default function GeneralSettingsForm({
  settings,
  classNames,
  subjectNames,
  currentSessionLabel,
}: {
  settings: SchoolSettings;
  classNames: string[];
  subjectNames: string[];
  currentSessionLabel: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [principalName, setPrincipalName] = useState(settings.principalName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [feeDueDay, setFeeDueDay] = useState(String(settings.feeDueDay));
  const [lateFinePerDay, setLateFinePerDay] = useState(String(settings.lateFinePerDay));
  const [passingPercentage, setPassingPercentage] = useState(String(settings.passingPercentage));
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await updateGeneralSettings({
      schoolName,
      principalName,
      phone,
      email,
      address,
      feeDueDay: Number(feeDueDay) || 10,
      lateFinePerDay: Number(lateFinePerDay) || 0,
      passingPercentage: Number(passingPercentage) || 50,
    });
    setSaving(false);

    if (!result.success) {
      showToast(result.error, "error");
      return;
    }

    showToast("Settings saved.", "success");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* School Information */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
          <BuildingIcon className="h-4 w-4" />
          School Information
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              School Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Principal Name</label>
            <input
              type="text"
              value={principalName}
              onChange={(e) => setPrincipalName(e.target.value)}
              placeholder="Enter principal name"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 0000000"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@alemaan.edu.pk"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">School Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full school address"
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
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Current Session</label>
            <input
              type="text"
              readOnly
              value={currentSessionLabel}
              className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-semibold text-gray-600 outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Sessions run February to February and update automatically.</p>
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">Classes</label>
              <Link href="/dashboard/classes" className="text-xs font-semibold text-[#13714C] hover:underline">
                Manage Classes
              </Link>
            </div>
            {classNames.length === 0 ? (
              <p className="text-xs text-gray-400">No classes set up yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {classNames.map((c) => (
                  <span key={c} className="rounded-full bg-[#A2E494]/20 px-3 py-1.5 text-xs font-semibold text-[#0f4d34]">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-semibold text-gray-700">Subjects</label>
              <Link href="/dashboard/subjects" className="text-xs font-semibold text-[#13714C] hover:underline">
                Manage Subjects
              </Link>
            </div>
            {subjectNames.length === 0 ? (
              <p className="text-xs text-gray-400">No subjects set up yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjectNames.map((s) => (
                  <span key={s} className="rounded-full bg-[#A2E494]/20 px-3 py-1.5 text-xs font-semibold text-[#0f4d34]">
                    {s}
                  </span>
                ))}
              </div>
            )}
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
              value={feeDueDay}
              onChange={(e) => setFeeDueDay(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Late Fine (Rs. per day)</label>
            <input
              type="number"
              min="0"
              value={lateFinePerDay}
              onChange={(e) => setLateFinePerDay(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
          <div className="flex items-end">
            <Link
              href="/dashboard/fees"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#13714C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
            >
              Manage Fee Structure
            </Link>
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
              value={passingPercentage}
              onChange={(e) => setPassingPercentage(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            />
          </div>
        </div>
        <p className="mb-2 text-xs font-semibold text-gray-500">Grading Scale (fixed)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {BANDS.map((g) => (
            <div key={g.grade} className="rounded-xl border border-gray-100 bg-[#F4F6F5] p-3 text-center">
              <span className="inline-flex rounded-full bg-[#A2E494]/25 px-2.5 py-1 text-xs font-bold text-[#0f4d34]">{g.grade}</span>
              <p className="mt-2 text-xs font-semibold text-gray-600">{g.min}+</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <SaveIcon className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>
    </form>
  );
}
