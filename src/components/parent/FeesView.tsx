"use client";

import { useMemo, useState, useTransition } from "react";
import { WalletIcon, FunnelIcon, InfoIcon } from "@/components/icons";
import { useToast } from "@/lib/toast";
import ParentPageHead from "./ParentPageHead";
import ChildDropdown from "./ChildDropdown";
import { fetchChildFees } from "@/app/parent/actions";
import type { ParentChild, FeeRow } from "@/lib/parent-data";

const statusOptions = ["All", "Paid", "Pending", "Partial"] as const;

export default function FeesView({
  students,
  initialChildId,
  initialRows,
}: {
  students: ParentChild[];
  initialChildId: string;
  initialRows: FeeRow[];
}) {
  const { showToast } = useToast();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [rows, setRows] = useState(initialRows);
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("All");
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function changeChild(id: string) {
    setSelectedChildId(id);
    startTransition(async () => {
      const { rows: fresh, error } = await fetchChildFees(id);
      if (error) showToast(error, "error");
      setRows(fresh);
    });
  }

  const filteredRows = useMemo(
    () => (statusFilter === "All" ? rows : rows.filter((r) => r.status === statusFilter)),
    [rows, statusFilter]
  );

  if (students.length === 0) {
    return (
      <ParentPageHead
        icon={WalletIcon}
        title="Fees"
        subtitle="View your child's fee details and payment history."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Fees" }]}
      />
    );
  }

  return (
    <>
      <ParentPageHead
        icon={WalletIcon}
        title="Fees"
        subtitle="View your child's fee details and payment history."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Fees" }]}
        right={<ChildDropdown students={students} selectedId={selectedChildId} onSelect={changeChild} />}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0f4d34]">Fee Payment History</h2>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              {statusFilter}
            </button>
            {statusMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-32 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setStatusFilter(s);
                      setStatusMenuOpen(false);
                    }}
                    className={`block w-full px-3.5 py-2 text-left text-sm font-semibold hover:bg-gray-50 ${
                      s === statusFilter ? "text-[#13714C]" : "text-gray-600"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : filteredRows.length === 0 ? (
          <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
            No fee records found for this child yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">Month</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="px-3 py-3">Amount (PKR)</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="rounded-r-xl px-3 py-3">Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.month} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 font-semibold text-gray-800">{r.month}</td>
                    <td className="px-3 py-3 text-gray-600">{r.dueDate}</td>
                    <td className="px-3 py-3 font-semibold text-gray-700">{r.amount.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.status === "Paid" ? "bg-gray-100 text-gray-600" : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{r.paymentDate ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#A2E494]/15 p-3.5 text-sm text-[#0f4d34]">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#13714C]" />
          <span>
            <span className="font-bold">Important Note:</span> Please pay your fees at the school office. Online payments are not available.
          </span>
        </div>
      </div>
    </>
  );
}
