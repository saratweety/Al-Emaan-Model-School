import Sidebar, { type SidebarNavItem } from "@/components/dashboard/Sidebar";
import {
  HomeIcon,
  GraduationCapIcon,
  CheckSquareIcon,
  WalletIcon,
  BarChartIcon,
  CalendarIcon,
  BellIcon,
  ClipboardListIcon,
  SettingsIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNoticeCountForParent } from "@/lib/notice-reads";

const parentNavItems: SidebarNavItem[] = [
  { label: "Dashboard", icon: HomeIcon, href: "/parent" },
  { label: "My Children", icon: GraduationCapIcon, href: "/parent/children" },
  { label: "Attendance", icon: CheckSquareIcon, href: "/parent/attendance" },
  { label: "Fees", icon: WalletIcon, href: "/parent/fees" },
  { label: "Results", icon: BarChartIcon, href: "/parent/results" },
  { label: "Timetable", icon: CalendarIcon, href: "/parent/timetable" },
  { label: "Notices", icon: BellIcon, href: "/parent/notices" },
  { label: "Homework / Diary", icon: ClipboardListIcon, href: "/parent/homework" },
  { label: "Settings", icon: SettingsIcon, href: "/parent/settings" },
];

export default async function ParentSidebar({ active = "Dashboard" }: { active?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unreadNotices = user ? await getUnreadNoticeCountForParent(user.id) : 0;
  const items = parentNavItems.map((item) => (item.label === "Notices" ? { ...item, badge: unreadNotices } : item));

  return <Sidebar active={active} items={items} />;
}
