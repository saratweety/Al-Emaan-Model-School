"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { closeMobileSidebar, useMobileSidebarOpen } from "@/lib/mobile-sidebar";

export default function MobileSidebarShell({ children }: { children: React.ReactNode }) {
  const open = useMobileSidebarOpen();
  const pathname = usePathname();

  useEffect(() => {
    closeMobileSidebar();
  }, [pathname]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar-scroll fixed inset-y-0 left-0 z-50 flex h-screen w-[230px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#13714C] via-[#3AB67D] to-[#A2E494] transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </aside>
    </>
  );
}
