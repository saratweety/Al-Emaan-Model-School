"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon, PhoneIcon, WalletIcon } from "@/components/icons";

export type FeeStatus = "paid" | "pending" | "partial" | "not generated";

const statusStyles: Record<FeeStatus, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-red-100 text-red-700",
  partial: "bg-amber-100 text-amber-700",
  "not generated": "bg-gray-100 text-gray-500",
};

const statusLabels: Record<FeeStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  partial: "Partial",
  "not generated": "Not Generated",
};

export type FeeRow = {
  studentId: string;
  name: string;
  admission: string;
  father: string;
  contact: string | null;
  cls: string;
  gender: string;
  status: FeeStatus;
  current: number;
  previousDue: number;
  monthsPending: number;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function money(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function FeesTable({
  rows,
  selectedMonthLabel,
  pendingOnly,
  emptyMessage,
}: {
  rows: FeeRow[];
  selectedMonthLabel: string;
  pendingOnly: boolean;
  emptyMessage: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.name} ${r.admission} ${r.father}`.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student by name, admission no. or father name..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        {rows.length === 0 ? (
          <p className="p-6 text-center text-sm font-semibold text-gray-500">{emptyMessage}</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-center text-sm font-semibold text-gray-500">No students match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">#</th>
                  <th className="px-3 py-3">Student Name</th>
                  <th className="px-3 py-3">Father Name</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Class</th>
                  <th className="px-3 py-3">Current Month ({selectedMonthLabel})</th>
                  <th className="px-3 py-3">Previous Due</th>
                  {pendingOnly && <th className="px-3 py-3">Months Pending</th>}
                  <th className="rounded-r-xl px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.studentId} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                            s.gender === "b" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                          }`}
                        >
                          {initials(s.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.admission}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{s.father}</td>
                    <td className="px-3 py-3">
                      {s.contact ? (
                        <a
                          href={`tel:${s.contact}`}
                          className="flex items-center gap-1.5 font-semibold text-[#13714C] hover:underline"
                        >
                          <PhoneIcon className="h-3.5 w-3.5" />
                          {s.contact}
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600">{s.cls}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[s.status]}`}>
                        {statusLabels[s.status]}
                      </span>
                      <p className="mt-1 text-xs text-gray-500">Rs. {money(s.current)}</p>
                    </td>
                    <td className={`px-3 py-3 font-semibold ${s.previousDue === 0 ? "text-green-600" : "text-red-600"}`}>
                      Rs. {money(s.previousDue)}
                    </td>
                    {pendingOnly && (
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            s.monthsPending >= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {s.monthsPending} Month{s.monthsPending === 1 ? "" : "s"}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-3">
                      <Link
                        href={`/dashboard/fees/${s.studentId}`}
                        className="flex w-fit items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:brightness-110"
                      >
                        <WalletIcon className="h-3.5 w-3.5" />
                        Collect Fee
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {rows.length} students
        </p>
      </div>
    </div>
  );
}
