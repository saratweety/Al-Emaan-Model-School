import { GraduationCapIcon } from "@/components/icons";
import type { TeacherPeriodEntry } from "@/lib/timetable-data";

function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function ScheduleTable({ periods }: { periods: TeacherPeriodEntry[] }) {
  if (periods.length === 0) {
    return <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">Not set up yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] table-fixed text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
            <th className="w-[64px] pb-2">Period</th>
            <th className="w-[150px] pb-2">Time</th>
            <th className="pb-2">Class</th>
            <th className="pb-2">Subject</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) =>
            p.is_break ? (
              <tr key={p.id} className="bg-[#F4F6F5]/60">
                <td className="py-2.5 text-[#13714C]">{p.label}</td>
                <td className="py-2.5 font-semibold text-[#13714C]">
                  {formatTime(p.start_time)} - {formatTime(p.end_time)}
                </td>
                <td className="py-2.5 font-semibold text-[#13714C]" colSpan={2}>
                  Break
                </td>
              </tr>
            ) : (
              <tr key={p.id} className="border-t border-gray-50">
                <td className="py-2.5 font-semibold text-gray-600">{p.label}</td>
                <td className="py-2.5 text-gray-600">
                  {formatTime(p.start_time)} - {formatTime(p.end_time)}
                </td>
                <td className="py-2.5 text-gray-700">{p.className ?? "—"}</td>
                <td className="py-2.5 text-gray-700">{p.subjectName ?? (p.className ? "—" : "Free")}</td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function MyTimetableView({ weekday, friday }: { weekday: TeacherPeriodEntry[]; friday: TeacherPeriodEntry[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[#0f4d34]">
        <GraduationCapIcon className="h-4 w-4" />
        Your Weekly Teaching Schedule
      </h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Monday to Saturday (Same Schedule)</h3>
          <ScheduleTable periods={weekday} />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold text-[#0f4d34]">Friday (Early Closing)</h3>
          <ScheduleTable periods={friday} />
        </div>
      </div>
    </div>
  );
}
