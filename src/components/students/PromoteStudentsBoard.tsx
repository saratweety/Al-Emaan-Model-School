"use client";

import { useMemo, useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/lib/toast";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  UsersIcon,
  CheckSquareIcon,
  GraduationCapIcon,
  InfoIcon,
} from "@/components/icons";
import { getCurrentSessionLabel, getSessionStartYear } from "@/lib/school-calendar";
import { fetchPromotableRoster, promoteStudents } from "@/app/dashboard/students/promote/actions";
import type { PromotableStudent } from "@/lib/promotion-data";
import type { SchoolClass } from "@/lib/classes-data";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PromoteStudentsBoard({
  classes,
  initialClassId,
  initialRoster,
}: {
  classes: SchoolClass[];
  initialClassId: string;
  initialRoster: PromotableStudent[];
}) {
  const { showToast } = useToast();
  const [fromClassId, setFromClassId] = useState(initialClassId);
  const [roster, setRoster] = useState(initialRoster);
  const [promote, setPromote] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialRoster.map((s) => [s.id, true]))
  );
  const [loadingRoster, startRosterTransition] = useTransition();
  const [saving, startSaveTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [result, setResult] = useState<{ promoted: number; repeated: number; fromName: string; toName: string } | null>(null);

  const fromClass = classes.find((c) => c.id === fromClassId);
  const toClass = fromClass ? classes.find((c) => c.display_order === fromClass.display_order + 1) ?? null : null;

  const currentSession = getCurrentSessionLabel();
  const nextSessionStartYear = getSessionStartYear() + 1;
  const nextSession = `${nextSessionStartYear}–${nextSessionStartYear + 1}`;

  function loadRoster(classId: string) {
    startRosterTransition(async () => {
      const { roster: fresh, error } = await fetchPromotableRoster(classId);
      if (error) showToast(error, "error");
      setRoster(fresh);
      setPromote(Object.fromEntries(fresh.map((s) => [s.id, true])));
    });
  }

  function changeClass(classId: string) {
    setFromClassId(classId);
    setResult(null);
    loadRoster(classId);
  }

  function toggle(studentId: string) {
    setResult(null);
    setPromote((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  }

  const promotedCount = useMemo(() => Object.values(promote).filter(Boolean).length, [promote]);
  const repeatingCount = roster.length - promotedCount;

  function handleConfirmSubmit() {
    setConfirmOpen(false);
    const fromName = fromClass?.name ?? "";
    const toName = toClass?.name ?? "Graduated";

    startSaveTransition(async () => {
      const decisions = roster.map((s) => ({ studentId: s.id, promote: promote[s.id] ?? true }));
      const res = await promoteStudents(fromClassId, toClass?.id ?? null, decisions);
      if (!res.success) {
        showToast(res.error, "error");
        return;
      }
      showToast("Students promoted.", "success");
      setResult({ promoted: res.promoted, repeated: res.repeated, fromName, toName });
      loadRoster(fromClassId);
    });
  }

  return (
    <>
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

      {/* Class selector */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-500">Current Class</span>
          <div className="relative">
            <select
              value={fromClassId}
              onChange={(e) => changeClass(e.target.value)}
              className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-9 text-sm font-bold text-[#0f4d34] outline-none focus:border-[#3AB67D] focus:ring-4 focus:ring-[#A2E494]/30"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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
            {toClass ? toClass.name : "Graduates"}
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
        {loadingRoster ? (
          <p className="py-6 text-center text-sm text-gray-400">Loading…</p>
        ) : (
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
                  const willPromote = promote[s.id] ?? true;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              s.gender === "male" ? "bg-[#3AB67D]" : "bg-[#e8608a]"
                            }`}
                          >
                            {initials(s.fullName)}
                          </span>
                          <span className="font-semibold text-gray-800">{s.fullName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{s.admissionNo}</td>
                      <td className="px-3 py-3 text-gray-600">{s.rollNumber ?? "—"}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            willPromote ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {willPromote
                            ? `Promote to ${toClass ? toClass.name : "Graduate"}`
                            : `Repeat ${fromClass?.name ?? ""}`}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={willPromote}
                          onClick={() => toggle(s.id)}
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
        )}

        {!loadingRoster && roster.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-400">
            No active students found for {fromClass?.name ?? "this class"} in the current session.
          </p>
        )}
      </div>

      {/* Note + action */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <InfoIcon className="h-4 w-4 shrink-0 text-[#13714C]" />
          Promoted students get a new enrollment record for {nextSession}
          {toClass ? ` in ${toClass.name}` : " and graduate"}. Students marked to repeat stay enrolled in{" "}
          {fromClass?.name} for {nextSession}. Fee, attendance and results history from {currentSession} is
          preserved either way.
        </p>
        <button
          type="button"
          disabled={roster.length === 0 || saving || loadingRoster}
          onClick={() => setConfirmOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GraduationCapIcon className="h-4 w-4" />
          {saving ? "Promoting..." : "Promote Selected Students"}
        </button>
      </div>

      {result && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
          {result.promoted} student{result.promoted === 1 ? "" : "s"} promoted from {result.fromName} to{" "}
          {result.toName} for {nextSession}
          {result.repeated > 0 && (
            <>
              {" "}
              · {result.repeated} student{result.repeated === 1 ? "" : "s"} held back to repeat {result.fromName}
            </>
          )}
          .
        </div>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm promotion"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              Confirm &amp; Promote
            </button>
          </>
        }
      >
        <p>
          <span className="font-bold text-gray-800">{promotedCount}</span> student{promotedCount === 1 ? "" : "s"}{" "}
          will be promoted from <span className="font-bold text-gray-800">{fromClass?.name}</span> to{" "}
          <span className="font-bold text-gray-800">{toClass ? toClass.name : "graduate"}</span>, and{" "}
          <span className="font-bold text-gray-800">{repeatingCount}</span> will repeat {fromClass?.name}. This
          creates new enrollment records for {nextSession} and cannot be easily undone. Continue?
        </p>
      </Modal>
    </>
  );
}
