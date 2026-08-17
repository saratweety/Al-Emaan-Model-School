"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/lib/toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { PencilIcon, TrashIcon } from "@/components/icons";

export type ClassStudent = {
  id: string;
  full_name: string;
  father_name: string;
  contact_number: string | null;
};

const AVATAR_COLORS = ["bg-teal-500", "bg-blue-500", "bg-[#e8608a]", "bg-purple-500", "bg-orange-500"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ClassStudentsTable({ students }: { students: ClassStudent[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<ClassStudent | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);

    const supabase = createClient();
    const { error } = await supabase.from("students").delete().eq("id", pendingDelete.id);

    setDeleting(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    showToast(`${pendingDelete.full_name} was removed.`, "success");
    setPendingDelete(null);
    router.refresh();
  }

  if (students.length === 0) {
    return (
      <p className="rounded-xl bg-[#F4F6F5] p-4 text-center text-sm font-semibold text-gray-500">
        No students enrolled in this class yet.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="rounded-xl bg-[#A2E494]/15 text-xs font-bold uppercase tracking-wide text-[#0f4d34]/70">
              <th className="rounded-l-xl px-3 py-3">#</th>
              <th className="px-3 py-3">Student Name</th>
              <th className="px-3 py-3">Father Name</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Attendance (Today)</th>
              <th className="rounded-r-xl px-3 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b border-gray-50 last:border-0 ${pendingDelete?.id === s.id ? "opacity-50" : ""}`}
              >
                <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        AVATAR_COLORS[i % AVATAR_COLORS.length]
                      }`}
                    >
                      {initials(s.full_name)}
                    </span>
                    <span className="font-semibold text-gray-800">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-600">{s.father_name}</td>
                <td className="px-3 py-3 text-gray-600">{s.contact_number ?? "—"}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                    Not tracked yet
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Edit"
                      title="Editing students isn't wired up yet"
                      className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => setPendingDelete(s)}
                      className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Remove student"
        message={
          pendingDelete
            ? `Remove ${pendingDelete.full_name} from this class? This deletes their student record.`
            : ""
        }
        confirmLabel="Remove"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
