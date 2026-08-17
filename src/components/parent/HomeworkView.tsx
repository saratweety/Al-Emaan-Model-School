"use client";

import { useRef, useState, useTransition } from "react";
import { ClipboardListIcon } from "@/components/icons";
import { initials } from "@/lib/format";
import { useToast } from "@/lib/toast";
import ParentPageHead from "./ParentPageHead";
import ChildPicker from "./ChildPicker";
import { fetchChildHomework, fetchChildResults } from "@/app/parent/actions";
import type { ParentChild, HomeworkEntry, ChildResult } from "@/lib/parent-data";

const tabs = ["Homework / Daily Diary", "Tests & Marks"] as const;

export default function HomeworkView({
  students,
  initialChildId,
  initialHomework,
  initialResults,
}: {
  students: ParentChild[];
  initialChildId: string;
  initialHomework: HomeworkEntry[];
  initialResults: ChildResult[];
}) {
  const { showToast } = useToast();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Homework / Daily Diary");
  const [homework, setHomework] = useState(initialHomework);
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();
  const homeworkRef = useRef<HTMLDivElement>(null);
  const testsRef = useRef<HTMLDivElement>(null);

  const selectedChild = students.find((c) => c.id === selectedChildId);

  function changeChild(id: string) {
    setSelectedChildId(id);
    const child = students.find((c) => c.id === id);
    startTransition(async () => {
      const [hw, res] = await Promise.all([
        child?.classId ? fetchChildHomework(child.classId) : Promise.resolve({ homework: [], error: null }),
        fetchChildResults(id),
      ]);
      if (hw.error) showToast(hw.error, "error");
      if (res.error) showToast(res.error, "error");
      setHomework(hw.homework);
      setResults(res.results);
    });
  }

  function handleTabClick(tab: (typeof tabs)[number]) {
    setActiveTab(tab);
    const target = tab === "Homework / Daily Diary" ? homeworkRef : testsRef;
    target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (students.length === 0 || !selectedChild) {
    return (
      <ParentPageHead
        icon={ClipboardListIcon}
        title="Homework & Tests"
        subtitle="View homework, daily diary, tests and test marks for your students."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Homework & Tests" }]}
      />
    );
  }

  return (
    <>
      <ParentPageHead
        icon={ClipboardListIcon}
        title="Homework & Tests"
        subtitle="View homework, daily diary, tests and test marks for your students."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Homework & Tests" }]}
      />

      <ChildPicker students={students} selectedId={selectedChildId} onSelect={changeChild} />

      <div className="flex flex-wrap items-center gap-5 border-b border-gray-100 px-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabClick(t)}
            className={`border-b-2 pb-2.5 text-sm font-bold transition ${
              activeTab === t ? "border-[#13714C] text-[#13714C]" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div ref={homeworkRef} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-base font-bold text-[#0f4d34]">
          Homework / Daily Diary – {selectedChild.name} ({selectedChild.className})
        </h2>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : homework.length === 0 ? (
          <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">No homework posted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">Date</th>
                  <th className="px-3 py-3">Subject</th>
                  <th className="px-3 py-3">Homework / Topic</th>
                  <th className="px-3 py-3">Due Date</th>
                  <th className="rounded-r-xl px-3 py-3">Posted By</th>
                </tr>
              </thead>
              <tbody>
                {homework.map((h) => (
                  <tr key={h.id} className="border-b border-gray-50 last:border-0 align-top">
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{h.date}</td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{h.subject}</td>
                    <td className="max-w-xs px-3 py-3 text-gray-700">{h.topic}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{h.dueDate ?? "—"}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3AB67D] text-[11px] font-bold text-white">
                          {initials(h.teacher)}
                        </span>
                        <span className="font-semibold text-gray-800">{h.teacher}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div ref={testsRef} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-base font-bold text-[#0f4d34]">
          Tests &amp; Marks – {selectedChild.name} ({selectedChild.className})
        </h2>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : results.length === 0 ? (
          <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">No published test results yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">Test</th>
                  <th className="px-3 py-3">Subject</th>
                  <th className="px-3 py-3">Total Marks</th>
                  <th className="px-3 py-3">Obtained Marks</th>
                  <th className="px-3 py-3">Percentage</th>
                  <th className="rounded-r-xl px-3 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((t) => (
                  <tr key={t.examId} className="border-b border-gray-50 last:border-0">
                    <td className="px-3 py-3 text-gray-700">{t.examName}</td>
                    <td className="px-3 py-3 font-semibold text-gray-800">{t.subjectName}</td>
                    <td className="px-3 py-3 text-gray-600">{t.maxMarks}</td>
                    <td className="px-3 py-3 font-bold text-gray-800">{t.marks}</td>
                    <td className="px-3 py-3 font-semibold text-[#13714C]">{t.percentage.toFixed(0)}%</td>
                    <td className="px-3 py-3 text-gray-500">{t.publishedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
