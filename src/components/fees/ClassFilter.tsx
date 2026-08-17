"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GraduationCapIcon, ChevronDownIcon } from "@/components/icons";

export default function ClassFilter({ classes, value }: { classes: string[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("class", e.target.value);
    } else {
      params.delete("class");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative">
      <GraduationCapIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#13714C]" />
      <select
        aria-label="Filter by class"
        value={value}
        onChange={handleChange}
        className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-9 text-sm font-semibold text-gray-600 outline-none hover:bg-gray-50 focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
      >
        <option value="">Class Wise</option>
        {classes.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
