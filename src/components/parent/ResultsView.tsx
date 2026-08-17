"use client";

import { useState, useTransition } from "react";
import { BarChartIcon, CalendarIcon, InfoIcon } from "@/components/icons";
import { useToast } from "@/lib/toast";
import ParentPageHead from "./ParentPageHead";
import ChildDropdown from "./ChildDropdown";
import { fetchChildResults } from "@/app/parent/actions";
import type { ParentChild, ChildResult } from "@/lib/parent-data";

export default function ResultsView({
  students,
  initialChildId,
  initialResults,
}: {
  students: ParentChild[];
  initialChildId: string;
  initialResults: ChildResult[];
}) {
  const { showToast } = useToast();
  const [selectedChildId, setSelectedChildId] = useState(initialChildId);
  const [results, setResults] = useState(initialResults);
  const [isPending, startTransition] = useTransition();

  const selectedChild = students.find((c) => c.id === selectedChildId);

  function changeChild(id: string) {
    setSelectedChildId(id);
    startTransition(async () => {
      const { results: fresh, error } = await fetchChildResults(id);
      if (error) showToast(error, "error");
      setResults(fresh);
    });
  }

  if (students.length === 0 || !selectedChild) {
    return (
      <ParentPageHead
        icon={BarChartIcon}
        title="Results"
        subtitle="View your child's published exam results."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Results" }]}
      />
    );
  }

  return (
    <>
      <ParentPageHead
        icon={BarChartIcon}
        title="Results"
        subtitle="View your child's published exam results."
        breadcrumb={[{ label: "Dashboard", href: "/parent" }, { label: "Results" }]}
        right={<ChildDropdown students={students} selectedId={selectedChildId} onSelect={changeChild} />}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-sm text-blue-800">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          Only published results are visible here. Unpublished results are not available yet.
        </div>

        {isPending ? (
          <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#F4F6F5] py-14 text-center">
            <BarChartIcon className="h-6 w-6 text-gray-300" />
            <p className="text-sm font-semibold text-gray-500">No published results for {selectedChild.name.split(" ")[0]} yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
                  <th className="rounded-l-xl px-3 py-3">Exam</th>
                  <th className="px-3 py-3">Subject</th>
                  <th className="px-3 py-3">Marks</th>
                  <th className="px-3 py-3">Percentage</th>
                  <th className="px-3 py-3">Grade</th>
                  <th className="rounded-r-xl px-3 py-3">
                    <span className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      Date
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.examId} className="border-t border-gray-50">
                    <td className="py-2.5 px-3 font-semibold text-gray-800">{r.examName}</td>
                    <td className="py-2.5 px-3 text-gray-600">{r.subjectName}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {r.marks}/{r.maxMarks}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{r.percentage.toFixed(0)}%</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-md bg-[#A2E494]/25 px-2 py-1 text-xs font-bold text-[#0f4d34]">{r.grade}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">{r.publishedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3.5 text-sm text-blue-800">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          Note: If you have any questions regarding {selectedChild.name.split(" ")[0]}&apos;s results, please contact the school office.
        </div>
      </div>
    </>
  );
}
