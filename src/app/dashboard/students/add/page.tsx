"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ArrowLeftIcon,
  UserIcon,
  CameraIcon,
  FileTextIcon,
  CloudUploadIcon,
  WalletIcon,
  XIcon,
  SaveIcon,
} from "@/components/icons";

function formatAmount(value: number) {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AddStudentPage() {
  const [monthlyFee, setMonthlyFee] = useState("");
  const [admissionFee, setAdmissionFee] = useState("");
  const [otherCharges, setOtherCharges] = useState("");

  const total = useMemo(() => {
    const sum = [monthlyFee, admissionFee, otherCharges].reduce(
      (acc, v) => acc + (parseFloat(v) || 0),
      0
    );
    return formatAmount(sum);
  }, [monthlyFee, admissionFee, otherCharges]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/students"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Students
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Add New Student (Admission Form)</h1>
            <p className="text-sm text-gray-500">Fill in the details below to add a new student to the school.</p>
          </div>

          <form className="space-y-4">
            {/* Student Information */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <UserIcon className="h-4 w-4" />
                Student Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="row-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Student Photo <span className="text-red-500">*</span>
                  </label>
                  <label className="flex h-[168px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                    <input type="file" accept="image/png,image/jpeg" className="hidden" />
                    <CameraIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Upload Photo</span>
                    <span className="text-xs text-gray-400">JPG, PNG (Max 2MB)</span>
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter student full name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Father Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter father name"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30">
                    <option value="">Select Class</option>
                    <option>Play Group</option>
                    <option>Nursery</option>
                    <option>Prep</option>
                    <option>Grade 1</option>
                    <option>Grade 2</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                    <option>Grade 5</option>
                    <option>Grade 6</option>
                    <option>Grade 7</option>
                    <option>Grade 8</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <FileTextIcon className="h-4 w-4" />
                Documents
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    B-Form Copy <span className="text-red-500">*</span>
                  </label>
                  <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                    <input type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" />
                    <CloudUploadIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Upload B-Form Copy</span>
                    <span className="text-xs text-gray-400">JPG, PNG or PDF (Max 2MB)</span>
                  </label>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Previous School Certificate <span className="text-red-500">*</span>
                  </label>
                  <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                    <input type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" />
                    <CloudUploadIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Upload Certificate</span>
                    <span className="text-xs text-gray-400">JPG, PNG or PDF (Max 2MB)</span>
                  </label>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Other Document (Optional)</label>
                  <label className="flex h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-[#F4F6F5] text-center hover:border-[#3AB67D]">
                    <input type="file" accept="image/png,image/jpeg,application/pdf" className="hidden" />
                    <CloudUploadIcon className="h-6 w-6 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600">Upload Document</span>
                    <span className="text-xs text-gray-400">JPG, PNG or PDF (Max 2MB)</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Fee Information */}
            <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0f4d34]">
                <WalletIcon className="h-4 w-4" />
                Fee Information
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Monthly Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Admission Fee <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={admissionFee}
                    onChange={(e) => setAdmissionFee(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Other Charges (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Total (Auto)</label>
                  <div className="w-full rounded-xl border border-gray-200 bg-[#F4F6F5] px-4 py-2.5 text-sm font-bold text-gray-500">
                    {total}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setMonthlyFee("");
                    setAdmissionFee("");
                    setOtherCharges("");
                  }}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <XIcon className="h-4 w-4" />
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
                >
                  <SaveIcon className="h-4 w-4" />
                  Save Student
                </button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
