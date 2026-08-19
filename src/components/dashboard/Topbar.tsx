"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuIcon, UserIcon, ChevronDownIcon, LockIcon, DoorExitIcon } from "@/components/icons";
import { formatLongDate, getToday } from "@/lib/school-calendar";
import { createClient } from "@/lib/supabase/client";
import ChangePasswordModal from "./ChangePasswordModal";

function getGreeting(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function Topbar({
  roleName = "Principal",
  roleLabel = "Administrator",
  profileHref = "/dashboard/settings/profile",
}: {
  roleName?: string;
  roleLabel?: string;
  profileHref?: string;
}) {
  const router = useRouter();
  const today = getToday();
  const formattedDate = formatLongDate(today);
  const greeting = getGreeting(today.getHours());

  const [menuOpen, setMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

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
          {greeting}, {roleName}! 👋
        </h1>
        <p className="text-xs text-gray-500 sm:text-sm">{formattedDate}</p>
      </div>

      <div ref={menuRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-gray-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#13714C] text-white">
            <UserIcon className="h-5 w-5" />
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-sm font-semibold text-gray-800">{roleName}</span>
            <span className="block text-xs text-gray-500">{roleLabel}</span>
          </span>
          <ChevronDownIcon
            className={`hidden h-4 w-4 text-gray-400 transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
            <div className="flex items-center gap-3 border-b border-gray-100 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#13714C] text-white">
                <UserIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-bold text-gray-800">{roleName}</span>
                <span className="block truncate text-xs text-gray-500">{roleLabel}</span>
              </span>
            </div>

            <div className="border-b border-gray-100 py-1.5">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (profileHref) router.push(profileHref);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <UserIcon className="h-4 w-4 text-gray-400" />
                My Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setChangePasswordOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <LockIcon className="h-4 w-4 text-gray-400" />
                Change Password
              </button>
            </div>

            <div className="py-1.5">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <DoorExitIcon className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </header>
  );
}
