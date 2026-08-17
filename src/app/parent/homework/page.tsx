import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import HomeworkView from "@/components/parent/HomeworkView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildHomework, getChildPublishedResults } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Homework & Tests | Al-Emaan Model School",
  description: "View homework, daily diary, tests and test marks for your children.",
};

export default async function ParentHomeworkPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const firstChild = children[0];

  const [homework, results] = await Promise.all([
    firstChild?.classId ? getChildHomework(firstChild.classId) : Promise.resolve([]),
    firstChild ? getChildPublishedResults(firstChild.id) : Promise.resolve([]),
  ]);

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Homework / Diary" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <HomeworkView
            students={children}
            initialChildId={firstChild?.id ?? ""}
            initialHomework={homework}
            initialResults={results}
          />
        </main>
      </div>
    </div>
  );
}
