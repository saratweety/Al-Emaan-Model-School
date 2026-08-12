"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import {
  ArrowLeftIcon,
  GraduationCapIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UsersIcon,
  CheckSquareIcon,
  InfoIcon,
} from "@/components/icons";
import { getCurrentSessionLabel, getSessionStartYear } from "@/lib/school-calendar";

const classOptions = ["Play Group", "Nursery", "Prep", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8"];

function nextClassOf(cls: string) {
  const idx = classOptions.indexOf(cls);
  return idx >= 0 && idx < classOptions.length - 1 ? classOptions[idx + 1] : cls;
}

const rosterByClass: Record<string, { name: string; admission: string; roll: string; gender: "b" | "g" }[]> = {
  "Grade 5": [
    { name: "Ali Raza", admission: "AEMS-0012", roll: "12", gender: "b" },
    { name: "Ayesha Fatima", admission: "AEMS-0013", roll: "13", gender: "g" },
    { name: "Ahmed Hassan", admission: "AEMS-0014", roll: "14", gender: "b" },
    { name: "Zara Noor", admission: "AEMS-0015", roll: "15", gender: "g" },
    { name: "Bilal Sarwar", admission: "AEMS-0022", roll: "22", gender: "b" },
    { name: "Mahnoor Iqbal", admission: "AEMS-0023", roll: "23", gender: "g" },
    { name: "Fahad Yousaf", admission: "AEMS-0024", roll: "24", gender: "b" },
    { name: "Khadija Aslam", admission: "AEMS-0025", roll: "25", gender: "g" },
  ],
  "Grade 6": [
    { name: "Hassan Ali", admission: "AEMS-0016", roll: "16", gender: "b" },
    { name: "Maryam Khan", admission: "AEMS-0017", roll: "17", gender: "g" },
    { name: "Usman Khalid", admission: "AEMS-0018", roll: "18", gender: "b" },
    { name: "Laiba Tariq", admission: "AEMS-0019", roll: "19", gender: "g" },
  ],
};

// Students who fall short of the promotion criteria default to repeating the class.
const defaultRepeats = new Set(["AEMS-0024", "AEMS-0025"]);

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PromoteStudentsPage() {
  const [fromClass, setFromClass] = useState("Grade 5");
  const [section, setSection] = useState("A");
  const toClass = nextClassOf(fromClass);

  const currentSession = getCurrentSessionLabel();
  const nextSessionStartYear = getSessionStartYear() + 1;
  const nextSession = `${nextSessionStartYear}–${nextSessionStartYear + 1}`;

  const roster = rosterByClass[fromClass] ?? [];
  const [promote, setPromote] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(roster.map((s) => [s.admission, !defaultRepeats.has(s.admission)]))
  );
  const [confirmed, setConfirmed] = useState(false);

  const promotedCount = useMemo(() => Object.values(promote).filter(Boolean).length, [promote]);
  const repeatingCount = roster.length - promotedCount;

  function toggle(admission: string) {
    setConfirmed(false);
    setPromote((prev) => ({ ...prev, [admission]: !prev[admission] }));
  }

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <Sidebar active="Students" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <Link
            href="/dashboard/students"
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#13714C]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Students
          </Link>

          <div>
            <h1 className="text-xl font-extrabold text-[#0f4d34] sm:text-2xl">Promote Students</h1>
            <p className="text-sm text-gray-500">
              Move students to the next class at the end of the academic session. Historical records for the
              current session are kept — nothing is overwritten.
            </p>
          </div>

          {/* Session transition banner */}
          <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#A2E494]/40 bg-[#A2E494]/10 p-4 text-center">
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0f4d34] shadow-sm">
              Session {currentSession}
            </span>
            <ChevronRightIcon className="h-5 w-5 text-[#13714C]" />
            <span className="rounded-xl bg-[#13714C] px-4 py-2 text-sm font-bold text-white shadow-sm">
              Session {nextSession}
            </span>
          </div>

          {/* Class selectors */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Current</span>
              <div className="relative">
                <select
                  value={fromClass}
                  onChange={(e) => {
                    setFromClass(e.target.value);
                    setConfirmed(false);
                  }}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-bold text-[#0f4d34] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                >
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="relative">
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-bold text-[#0f4d34] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
                >
                  {["A", "B"].map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <ChevronRightIcon className="h-5 w-5 shrink-0 text-gray-300" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-500">Promotes to</span>
              <span className="rounded-xl bg-[#F4F6F5] px-4 py-2.5 text-sm font-bold text-[#13714C]">
                {toClass} - {section}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-[#13714C]">
                <CheckSquareIcon className="h-4 w-4" />
                {promotedCount} Promoting
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-amber-600">
                <UsersIcon className="h-4 w-4" />
                {repeatingCount} Repeating
              </span>
            </div>
          </div>

          {/* Roster */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                    <th className="rounded-l-xl px-3 py-3">#</th>
                    <th className="px-3 py-3">Student Name</th>
                    <th className="px-3 py-3">Admission No.</th>
                    <th className="px-3 py-3">Roll No.</th>
                    <th className="px-3 py-3">Outcome</th>
                    <th className="rounded-r-xl px-3 py-3">Promote?</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((s, i) => {
                    const willPromote = promote[s.admission];
                    return (
                      <tr key={s.admission} className="border-b border-gray-50 last:border-0">
                        <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                                s.gender === "b" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                              }`}
                            >
                              {initials(s.name)}
                            </span>
                            <span className="font-semibold text-gray-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-gray-600">{s.admission}</td>
                        <td className="px-3 py-3 text-gray-600">{s.roll}</td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              willPromote ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {willPromote ? `Promote to ${toClass}-${section}` : `Repeat ${fromClass}-${section}`}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={willPromote}
                            onClick={() => toggle(s.admission)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                              willPromote ? "bg-[#13714C]" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                willPromote ? "translate-x-[22px]" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {roster.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No students found for {fromClass}.</p>
            )}
          </div>

          {/* Note + action */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="flex items-center gap-2 text-xs text-gray-500">
              <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
              Promoted students get a new enrollment record for {nextSession} in {toClass}. Students marked to
              repeat stay enrolled in {fromClass}-{section} for {nextSession}. Fee and attendance history from{" "}
              {currentSession} is preserved either way.
            </p>
            <button
              type="button"
              disabled={roster.length === 0}
              onClick={() => setConfirmed(true)}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GraduationCapIcon className="h-4 w-4" />
              Promote Selected Students
            </button>
          </div>

          {confirmed && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {promotedCount} student{promotedCount === 1 ? "" : "s"} promoted from {fromClass}-{section} to{" "}
              {toClass}-{section} for {nextSession}
              {repeatingCount > 0 && (
                <> · {repeatingCount} student{repeatingCount === 1 ? "" : "s"} held back to repeat {fromClass}-{section}</>
              )}
              .
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
