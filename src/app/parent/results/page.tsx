import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import ResultsView from "@/components/parent/ResultsView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildPublishedResults } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Results | Al-Emaan Model School",
  description: "View your child's published exam results.",
};

export default async function ParentResultsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const results = children[0] ? await getChildPublishedResults(children[0].id) : [];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Results" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <ResultsView students={children} initialChildId={children[0]?.id ?? ""} initialResults={results} />
        </main>
      </div>
    </div>
  );
}
