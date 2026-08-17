import type { Metadata } from "next";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  BuildingIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  CalendarIcon,
  GraduationCapIcon,
  UsersIcon,
  UserIcon,
  InfoIcon,
} from "@/components/icons";
import { getCurrentSessionLabel } from "@/lib/school-calendar";
import { getClasses } from "@/lib/classes-data";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Classes | Al-Emaan Model School",
  description: "Browse classes, sections and assigned class teachers.",
};

export default async function ClassesPage() {
  const supabase = await createClient();
  const { classes, error: classesError } = await getClasses();
  const currentSessionId = await getCurrentSessionId();

  const countsByClass: Record<string, number> = {};
  let enrollmentsError: string | null = null;

  if (currentSessionId) {
    const { data: enrollments, error } = await supabase
      .from("student_enrollments")
      .select("class_id")
      .eq("session_id", currentSessionId)
      .eq("status", "active");

    if (error) {
      enrollmentsError = error.message;
    } else {
      for (const e of enrollments ?? []) {
        countsByClass[e.class_id] = (countsByClass[e.class_id] ?? 0) + 1;
      }
    }
  }

  const classTeacherByClass: Record<string, string> = {};

  if (currentSessionId) {
    const { data: classTeachers } = await supabase
      .from("teacher_assignments")
      .select("class_id, profiles(full_name)")
      .eq("session_id", currentSessionId)
      .eq("is_class_teacher", true)
      .returns<{ class_id: string; profiles: { full_name: string } | null }[]>();

    for (const row of classTeachers ?? []) {
      if (row.profiles) classTeacherByClass[row.class_id] = row.profiles.full_name;
    }
  }

  const error = classesError ?? enrollmentsError;

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Classes" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
                <BuildingIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Link href="/dashboard" className="hover:text-[#13714C] hover:underline">
                    Dashboard
                  </Link>
                  <ChevronRightIcon className="h-3 w-3" />
                  <span className="font-semibold text-[#13714C]">Classes</span>
                </div>
                <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Classes</h1>
                <p className="text-sm text-gray-500">Browse all classes, sections and their assigned class teachers.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border border-[#13714C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#13714C] hover:bg-[#A2E494]/10"
              >
                <CalendarIcon className="h-4 w-4" />
                Session: {getCurrentSessionLabel()}
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
              Couldn&apos;t load classes: {error}
            </div>
          )}

          {!error && classes.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#A2E494]/15 p-4 text-sm font-semibold text-[#0f4d34]">
              <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
              No classes have been set up yet.
            </div>
          ) : (
            /* Class cards */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {classes.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/classes/${c.id}`}
                  className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#3AB67D]/40 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A2E494]/25 text-[#13714C]">
                    <GraduationCapIcon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-[#0f4d34]">{c.name}</h3>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-500">
                      <UsersIcon className="h-4 w-4 text-[#3AB67D]" />
                      Students
                    </span>
                    <span className="font-bold text-gray-800">{countsByClass[c.id] ?? 0}</span>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm">
                    <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#8b6fd6]" />
                    <span className="min-w-0">
                      <span className="block text-gray-500">Class Teacher</span>
                      <span
                        className={`block truncate font-semibold ${
                          classTeacherByClass[c.id] ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {classTeacherByClass[c.id] ?? "Not assigned yet"}
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
