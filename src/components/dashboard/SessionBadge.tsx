"use client";

import { CalendarIcon, ChevronDownIcon } from "@/components/icons";
import { getCurrentSessionLabel } from "@/lib/school-calendar";

export default function SessionBadge({ session = getCurrentSessionLabel() }: { session?: string }) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-full bg-[#A2E494]/25 px-4 py-2 text-sm text-[#0f4d34] hover:bg-[#A2E494]/35"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#13714C]">
        <CalendarIcon className="h-3.5 w-3.5" />
      </span>
      <span>
        Session: <span className="font-bold">{session}</span>
      </span>
      <ChevronDownIcon className="h-4 w-4 text-[#13714C]" />
    </button>
  );
}
