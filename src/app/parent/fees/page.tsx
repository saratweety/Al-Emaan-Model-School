import type { Metadata } from "next";
import ParentSidebar from "@/components/parent/Sidebar";
import ParentTopbar from "@/components/parent/Topbar";
import FeesView from "@/components/parent/FeesView";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildFeeRows } from "@/lib/parent-data";

export const metadata: Metadata = {
  title: "Fees | Al-Emaan Model School",
  description: "View your child's fee details and payment history.",
};

export default async function ParentFeesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const children = user ? await getParentChildren(user.id) : [];
  const rows = children[0] ? await getChildFeeRows(children[0].id) : [];

  return (
    <div className="flex h-screen bg-[#F4F6F5]">
      <ParentSidebar active="Fees" />

      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <ParentTopbar />

        <main className="flex-1 space-y-4 p-4 sm:p-6">
          <FeesView students={children} initialChildId={children[0]?.id ?? ""} initialRows={rows} />
        </main>
      </div>
    </div>
  );
}
