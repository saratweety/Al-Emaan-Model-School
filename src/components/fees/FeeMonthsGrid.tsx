"use client";

import { useState } from "react";
import CollectPaymentModal from "@/components/fees/CollectPaymentModal";

export type FeeMonthCell = {
  key: string;
  month: string;
  year: string;
  status: "paid" | "pending" | "partial" | "not_generated";
  amountDue: number;
  amountPaid: number;
  feeRecordId: string | null;
};

const statusMeta: Record<FeeMonthCell["status"], { dot: string; badge: string; label: string }> = {
  paid: { dot: "bg-[#13714C]", badge: "bg-green-100 text-green-700", label: "Paid" },
  pending: { dot: "bg-red-500", badge: "bg-red-100 text-red-700", label: "Pending" },
  partial: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700", label: "Partial" },
  not_generated: { dot: "bg-gray-400", badge: "bg-gray-100 text-gray-500", label: "Not Generated" },
};

const legend = [
  { color: "bg-[#13714C]", label: "Paid" },
  { color: "bg-red-500", label: "Pending" },
  { color: "bg-amber-500", label: "Partial" },
  { color: "bg-gray-400", label: "Not Generated" },
];

export default function FeeMonthsGrid({ months }: { months: FeeMonthCell[] }) {
  const [collecting, setCollecting] = useState<FeeMonthCell | null>(null);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold tracking-wide text-[#0f4d34]">MONTHLY FEE RECORD</h2>
        <div className="flex flex-wrap items-center gap-4">
          {legend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {months.map((m) => {
          const meta = statusMeta[m.status];
          const remaining = m.amountDue - m.amountPaid;
          return (
            <div key={m.key} className="rounded-xl border border-gray-100 bg-[#F4F6F5] p-3">
              <p className="text-sm font-bold text-gray-700">{m.month}</p>
              <p className="text-xs text-gray-400">{m.year}</p>
              <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              {m.status !== "not_generated" && <p className="mt-2 text-sm font-bold text-gray-700">Rs. {m.amountDue.toLocaleString("en-US")}</p>}
              {(m.status === "pending" || m.status === "partial") && m.feeRecordId && (
                <button
                  type="button"
                  onClick={() => setCollecting(m)}
                  className="mt-1.5 w-full rounded-lg bg-[#13714C] px-2 py-1 text-xs font-semibold text-white hover:brightness-110"
                >
                  Collect
                </button>
              )}
              {m.status === "not_generated" && <p className="mt-2 text-xs text-gray-300">—</p>}
              {m.status === "paid" && <p className="mt-1.5 text-xs text-green-600">Fully paid</p>}
              {collecting?.key === m.key && (
                <CollectPaymentModal
                  feeRecordId={m.feeRecordId!}
                  monthLabel={`${m.month} ${m.year}`}
                  remaining={remaining}
                  onClose={() => setCollecting(null)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
