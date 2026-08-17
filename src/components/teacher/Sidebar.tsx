import Sidebar, { type SidebarNavItem } from "@/components/dashboard/Sidebar";
import {
  HomeIcon,
  GraduationCapIcon,
  CheckSquareIcon,
  CalendarIcon,
  ClipboardListIcon,
  BarChartIcon,
  BellIcon,
  AwardIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getUnreadNoticeCountForTeacher } from "@/lib/notice-reads";

const teacherNavItems: SidebarNavItem[] = [
  { label: "Dashboard", icon: HomeIcon, href: "/teacher" },
  { label: "My Timetable", icon: CalendarIcon, href: "/teacher/timetable" },
  { label: "Mark Attendance", icon: CheckSquareIcon, href: "/teacher/attendance" },
  { label: "My Classes", icon: GraduationCapIcon, href: "/teacher/students" },
  { label: "Homework", icon: ClipboardListIcon, href: "/teacher/homework" },
  { label: "Tests", icon: AwardIcon, href: "/teacher/tests" },
  { label: "Results", icon: BarChartIcon, href: "/teacher/results" },
  { label: "Notices", icon: BellIcon, href: "/teacher/notices" },
];

export default async function TeacherSidebar({ active = "Dashboard" }: { active?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const unreadNotices = user ? await getUnreadNoticeCountForTeacher(user.id) : 0;
  const items = teacherNavItems.map((item) => (item.label === "Notices" ? { ...item, badge: unreadNotices } : item));

  return <Sidebar active={active} items={items} />;
}
