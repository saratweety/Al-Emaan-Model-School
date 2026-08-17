import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import EditTimetableForm from "@/components/timetable/EditTimetableForm";
import { ChevronRightIcon } from "@/components/icons";
import { getClasses } from "@/lib/classes-data";
import { getSubjects } from "@/lib/subjects-data";
import { getClassSchedule } from "@/lib/timetable-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Edit Timetable | Al-Emaan Model School",
  description: "Update timetable details for the class.",
};

const breadcrumb = [
  { label: "Timetable", href: "/dashboard/timetable" },
  { label: "Edit Timetable", active: true },
];

export default async function EditTimetablePage() {
  const supabase = await createClient();
  const [{ classes }, { subjects }, { data: session }] = await Promise.all([
    getClasses(),
    getSubjects(),
    supabase.from("academic_sessions").select("id, label").eq("is_current", true).maybeSingle(),
  ]);

  const sessionId = session?.id ?? null;
  const initialClassId = classes[0]?.id ?? "";
  const initialSchedule = sessionId && initialClassId
    ? await getClassSchedule(sessionId, initialClassId)
    : { weekday: [], friday: [] };

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Timetable" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#13714C] hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#13714C]">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Edit Timetable</h1>
            <p className="text-sm text-gray-500">Update timetable details for the class.</p>
          </div>

          {!sessionId && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
              No current academic session is configured — set one before editing the timetable.
            </div>
          )}

          <EditTimetableForm
            classes={classes}
            subjects={subjects}
            sessionId={sessionId}
            sessionLabel={session?.label ?? "—"}
            initialClassId={initialClassId}
            initialWeekday={initialSchedule.weekday}
            initialFriday={initialSchedule.friday}
          />
        </main>
      </div>
    </div>
  );
}
