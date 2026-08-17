import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  GraduationCapIcon,
  UsersIcon,
  FamilyIcon,
  BuildingIcon,
  BookIcon,
  CalendarIcon,
  CheckSquareIcon,
  WalletIcon,
  AwardIcon,
  BarChartIcon,
  ClipboardListIcon,
  BellIcon,
  ReportIcon,
  SettingsIcon,
} from "@/components/icons";

export type SidebarNavItem = { label: string; icon: typeof HomeIcon; href: string; badge?: number };

const navItems: SidebarNavItem[] = [
  { label: "Dashboard", icon: HomeIcon, href: "/dashboard" },
  { label: "Students", icon: GraduationCapIcon, href: "/dashboard/students" },
  { label: "Parents", icon: FamilyIcon, href: "/dashboard/parents" },
  { label: "Teachers", icon: UsersIcon, href: "/dashboard/teachers" },
  { label: "Classes", icon: BuildingIcon, href: "/dashboard/classes" },
  { label: "Subjects", icon: BookIcon, href: "/dashboard/subjects" },
  { label: "Timetable", icon: CalendarIcon, href: "/dashboard/timetable" },
  { label: "Attendance", icon: CheckSquareIcon, href: "/dashboard/attendance" },
  { label: "Fees", icon: WalletIcon, href: "/dashboard/fees" },
  { label: "Exams", icon: AwardIcon, href: "/dashboard/exams" },
  { label: "Results", icon: BarChartIcon, href: "/dashboard/results" },
  { label: "Homework", icon: ClipboardListIcon, href: "/dashboard/homework" },
  { label: "Notices", icon: BellIcon, href: "/dashboard/notices" },
  { label: "Reports", icon: ReportIcon, href: "/dashboard/reports" },
  { label: "Settings", icon: SettingsIcon, href: "/dashboard/settings" },
];

export default function Sidebar({
  active = "Dashboard",
  items = navItems,
}: {
  active?: string;
  items?: SidebarNavItem[];
}) {
  return (
    <aside className="sidebar-scroll relative hidden h-screen w-[230px] shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#13714C] via-[#3AB67D] to-[#A2E494] md:flex">
      {/* Brand */}
      <div className="flex shrink-0 flex-col items-center px-[18px] pb-5 pt-[26px] text-center">
        <div className="mb-[10px] flex h-[66px] w-[66px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.25)]">
          <Image
            src="/logo.jpeg"
            alt="Al-Emaan Model School logo"
            width={80}
            height={80}
            priority
            className="h-full w-full object-cover"
          />
        </div>
        <p className="text-[16px] font-extrabold leading-[1.25] tracking-[0.02em] text-white">
          AL-EMAAN
          <br />
          MODEL SCHOOL
        </p>
        <p className="mt-[5px] text-[9px] font-bold uppercase tracking-[0.06em] text-[#eafff2]">
          Your Child Is Our Priority
        </p>
      </div>

      {/* Nav */}
      <nav className="flex shrink-0 flex-col gap-[10px] px-[14px] pb-[18px] pt-1.5">
        {items.map(({ label, icon: Icon, href, badge }) => {
          const isActive = label === active;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-[10px] px-[14px] py-[11px] text-[13.5px] font-semibold transition-colors ${
                isActive
                  ? "bg-[#E9EBED] text-[#13714C] shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  : "text-[#eafff2] hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex w-[18px] shrink-0 items-center justify-center">
                <Icon className="h-[17px] w-[17px]" />
              </span>
              <span className="flex-1 truncate">{label}</span>
              {!!badge && (
                <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Photo — last item in the scroll flow, curved top edge */}
      <div className="relative h-[150px] shrink-0 overflow-hidden rounded-tl-[60%_40px] rounded-tr-[60%_40px]">
        <Image
          src="/sidebar.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_30%]"
          sizes="230px"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c3d2b]/0 from-55% to-[#0c3d2b]/55" />
      </div>
    </aside>
  );
}
