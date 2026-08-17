"use client";

import { DownloadIcon } from "@/components/icons";

export default function ReportPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 print:hidden"
    >
      <DownloadIcon className="h-4 w-4" />
      Print / Export
    </button>
  );
}
