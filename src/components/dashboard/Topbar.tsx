"use client";

import { MenuIcon, UserIcon, ChevronDownIcon } from "@/components/icons";
import { formatLongDate, getToday } from "@/lib/school-calendar";

function getGreeting(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Topbar() {
  const today = getToday();
  const formattedDate = formatLongDate(today);
  const greeting = getGreeting(today.getHours());

  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
      <button
        type="button"
        aria-label="Toggle menu"
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-lg font-extrabold text-[#0f4d34] sm:text-xl">
          {greeting}, Principal! 👋
        </h1>
        <p className="text-xs text-gray-500 sm:text-sm">{formattedDate}</p>
      </div>

      <button type="button" className="ml-auto flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13714C] text-white">
          <UserIcon className="h-5 w-5" />
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-semibold text-gray-800">Principal</span>
          <span className="block text-xs text-gray-500">Administrator</span>
        </span>
        <ChevronDownIcon className="hidden h-4 w-4 text-gray-400 sm:block" />
      </button>
    </header>
  );
}
