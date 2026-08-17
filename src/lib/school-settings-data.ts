import { createClient } from "@/lib/supabase/server";

export type SchoolSettings = {
  openingTime: string;
  closingTime: string;
  teacherReportingTime: string;
  breakStart: string;
  breakEnd: string;
  schoolName: string;
  principalName: string;
  phone: string;
  email: string;
  address: string;
  feeDueDay: number;
  lateFinePerDay: number;
  passingPercentage: number;
};

const DEFAULT_SETTINGS: SchoolSettings = {
  openingTime: "08:00",
  closingTime: "14:00",
  teacherReportingTime: "07:45",
  breakStart: "11:00",
  breakEnd: "11:30",
  schoolName: "Al-Emaan Model School",
  principalName: "",
  phone: "",
  email: "",
  address: "",
  feeDueDay: 10,
  lateFinePerDay: 0,
  passingPercentage: 50,
};

type SchoolSettingsRow = {
  opening_time: string;
  closing_time: string;
  teacher_reporting_time: string;
  break_start: string;
  break_end: string;
  school_name: string;
  principal_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  fee_due_day: number;
  late_fine_per_day: number;
  passing_percentage: number;
};

export async function getSchoolSettings(): Promise<SchoolSettings> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("school_settings")
    .select(
      "opening_time, closing_time, teacher_reporting_time, break_start, break_end, school_name, principal_name, phone, email, address, fee_due_day, late_fine_per_day, passing_percentage"
    )
    .eq("id", true)
    .maybeSingle<SchoolSettingsRow>();

  if (!data) return DEFAULT_SETTINGS;

  return {
    openingTime: data.opening_time.slice(0, 5),
    closingTime: data.closing_time.slice(0, 5),
    teacherReportingTime: data.teacher_reporting_time.slice(0, 5),
    breakStart: data.break_start.slice(0, 5),
    breakEnd: data.break_end.slice(0, 5),
    schoolName: data.school_name,
    principalName: data.principal_name ?? "",
    phone: data.phone ?? "",
    email: data.email ?? "",
    address: data.address ?? "",
    feeDueDay: data.fee_due_day,
    lateFinePerDay: Number(data.late_fine_per_day),
    passingPercentage: Number(data.passing_percentage),
  };
}

export function formatTime12h(value: string) {
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
