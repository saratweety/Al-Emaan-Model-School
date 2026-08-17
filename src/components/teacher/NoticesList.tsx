"use client";

import { useMemo, useState } from "react";
import { BellIcon, CalendarIcon, PalmTreeIcon, FlagIcon } from "@/components/icons";
import type { NoticeRow } from "@/lib/parent-data";

const typeStyle: Record<string, { icon: typeof BellIcon; bg: string; text: string }> = {
  general: { icon: BellIcon, bg: "bg-[#A2E494]/25", text: "text-[#13714C]" },
  announcement: { icon: FlagIcon, bg: "bg-green-100", text: "text-green-700" },
  event: { icon: CalendarIcon, bg: "bg-orange-100", text: "text-orange-600" },
  holiday: { icon: PalmTreeIcon, bg: "bg-purple-100", text: "text-purple-600" },
  reminder: { icon: FlagIcon, bg: "bg-amber-100", text: "text-amber-600" },
};

const tabs = ["All Notices", "General", "Announcement", "Event", "Holiday", "Reminder"] as const;

export default function NoticesList({ notices }: { notices: NoticeRow[] }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All Notices");

  const filtered = useMemo(() => {
    if (activeTab === "All Notices") return notices;
    return notices.filter((n) => n.noticeType === activeTab.toLowerCase());
  }, [notices, activeTab]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-5 border-b border-gray-100 pb-3">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              activeTab === t ? "border-[#13714C] text-[#13714C]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm font-semibold text-gray-500">No notices to show.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map((n) => {
            const style = typeStyle[n.noticeType] ?? typeStyle.general;
            return (
              <div key={n.id} className="flex w-full items-start gap-4 py-4 first:pt-0 last:pb-0">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.text}`}>
                  <style.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.text}`}>
                    {n.noticeType}
                  </span>
                  <h3 className="text-sm font-bold text-gray-800">{n.title}</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{n.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-gray-400">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {n.publishDate}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
