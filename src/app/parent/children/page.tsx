import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import MyChildrenView from "@/components/parent/MyChildrenView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildSummary } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "My Children | Al-Emaan Model School",
  description: "An overview of every child linked to your account.",
};

export default async function ParentChildrenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const rows = await Promise.all(children.map(async (child) => ({ child, summary: await getChildSummary(child) })));

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="My Children" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <MyChildrenView rows={rows} />
        </main>
      </div>
    </div>
  );
}
