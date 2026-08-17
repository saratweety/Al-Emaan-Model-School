import { createClient } from "@/lib/supabase/server";

export type DayType = "weekday" | "friday";

export type TimetablePeriod = {
  id: string;
  period_index: number;
  label: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  subject_id: string | null;
  subject_name: string | null;
  teacher_id: string | null;
  teacher_name: string | null;
};

export type ClassSchedule = {
  weekday: TimetablePeriod[];
  friday: TimetablePeriod[];
};

export type SchoolDayPeriod = {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
};

export type SchoolDayCell = {
  subject: string | null;
  teacher: string | null;
};

export type SchoolDayClassRow = {
  classId: string;
  className: string;
  cellsByPeriod: Record<string, SchoolDayCell>;
};

export type SchoolDaySchedule = {
  periods: SchoolDayPeriod[];
  classRows: SchoolDayClassRow[];
};

export async function getSchoolDaySchedule(sessionId: string, dayType: DayType): Promise<SchoolDaySchedule> {
  const supabase = await createClient();

  const [{ data: periods }, { data: classes }, { data: entries }, { data: assignments }] = await Promise.all([
    supabase
      .from("timetable_periods")
      .select("id, label, start_time, end_time, is_break")
      .eq("session_id", sessionId)
      .eq("day_type", dayType)
      .order("period_index", { ascending: true }),
    supabase.from("classes").select("id, name").order("display_order", { ascending: true }),
    supabase
      .from("timetable_entries")
      .select("class_id, period_id, subject_id, subjects(name)")
      .eq("session_id", sessionId)
      .eq("day_type", dayType),
    supabase.from("teacher_assignments").select("class_id, subject_id, profiles(full_name)").eq("session_id", sessionId),
  ]);

  const teacherByClassSubject = new Map<string, string>();
  for (const a of assignments ?? []) {
    if (!a.subject_id) continue;
    const profile = a.profiles as unknown as { full_name: string } | null;
    if (profile) teacherByClassSubject.set(`${a.class_id}:${a.subject_id}`, profile.full_name);
  }

  const cellByClassAndPeriod = new Map<string, SchoolDayCell>();
  for (const entry of entries ?? []) {
    const subject = entry.subjects as unknown as { name: string } | null;
    const teacher = entry.subject_id ? (teacherByClassSubject.get(`${entry.class_id}:${entry.subject_id}`) ?? null) : null;
    cellByClassAndPeriod.set(`${entry.class_id}:${entry.period_id}`, { subject: subject?.name ?? null, teacher });
  }

  const classRows: SchoolDayClassRow[] = (classes ?? []).map((c) => {
    const cellsByPeriod: Record<string, SchoolDayCell> = {};
    for (const p of periods ?? []) {
      cellsByPeriod[p.id] = cellByClassAndPeriod.get(`${c.id}:${p.id}`) ?? { subject: null, teacher: null };
    }
    return { classId: c.id, className: c.name, cellsByPeriod };
  });

  return { periods: periods ?? [], classRows };
}

export async function getClassSchedule(sessionId: string, classId: string): Promise<ClassSchedule> {
  const supabase = await createClient();

  const [{ data: periods }, { data: entries }, { data: assignments }] = await Promise.all([
    supabase
      .from("timetable_periods")
      .select("id, day_type, period_index, label, start_time, end_time, is_break")
      .eq("session_id", sessionId)
      .order("period_index", { ascending: true }),
    supabase
      .from("timetable_entries")
      .select("period_id, day_type, subject_id, subjects(name)")
      .eq("session_id", sessionId)
      .eq("class_id", classId),
    supabase
      .from("teacher_assignments")
      .select("subject_id, teacher_id, profiles(full_name)")
      .eq("session_id", sessionId)
      .eq("class_id", classId),
  ]);

  const teacherBySubject = new Map<string, { id: string; name: string }>();
  for (const a of assignments ?? []) {
    if (!a.subject_id) continue;
    const profile = a.profiles as unknown as { full_name: string } | null;
    if (profile) teacherBySubject.set(a.subject_id, { id: a.teacher_id, name: profile.full_name });
  }

  const entryByPeriod = new Map<
    string,
    { subject_id: string | null; subject_name: string | null; teacher_id: string | null; teacher_name: string | null }
  >();
  for (const entry of entries ?? []) {
    const subject = entry.subjects as unknown as { name: string } | null;
    const teacher = entry.subject_id ? teacherBySubject.get(entry.subject_id) : null;
    entryByPeriod.set(entry.period_id as string, {
      subject_id: entry.subject_id as string | null,
      subject_name: subject?.name ?? null,
      teacher_id: teacher?.id ?? null,
      teacher_name: teacher?.name ?? null,
    });
  }

  const weekday: TimetablePeriod[] = [];
  const friday: TimetablePeriod[] = [];

  for (const p of periods ?? []) {
    const entry = entryByPeriod.get(p.id);
    const row: TimetablePeriod = {
      id: p.id,
      period_index: p.period_index,
      label: p.label,
      start_time: p.start_time,
      end_time: p.end_time,
      is_break: p.is_break,
      subject_id: entry?.subject_id ?? null,
      subject_name: entry?.subject_name ?? null,
      teacher_id: entry?.teacher_id ?? null,
      teacher_name: entry?.teacher_name ?? null,
    };
    if (p.day_type === "friday") friday.push(row);
    else weekday.push(row);
  }

  return { weekday, friday };
}

export type TeacherPeriodEntry = {
  id: string;
  period_index: number;
  label: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
  classId: string | null;
  className: string | null;
  subjectId: string | null;
  subjectName: string | null;
};

export type TeacherSchedule = {
  weekday: TeacherPeriodEntry[];
  friday: TeacherPeriodEntry[];
};

export async function getTeacherSchedule(sessionId: string, teacherId: string): Promise<TeacherSchedule> {
  const supabase = await createClient();

  const [{ data: periods }, { data: assignments }] = await Promise.all([
    supabase
      .from("timetable_periods")
      .select("id, day_type, period_index, label, start_time, end_time, is_break")
      .eq("session_id", sessionId)
      .order("period_index", { ascending: true }),
    supabase
      .from("teacher_assignments")
      .select("class_id, subject_id")
      .eq("session_id", sessionId)
      .eq("teacher_id", teacherId),
  ]);

  const taughtPairs = new Set(
    (assignments ?? []).filter((a) => a.subject_id).map((a) => `${a.class_id}:${a.subject_id}`)
  );
  const classIds = [...new Set((assignments ?? []).filter((a) => a.subject_id).map((a) => a.class_id))];

  const weekday: TeacherPeriodEntry[] = [];
  const friday: TeacherPeriodEntry[] = [];

  if (!periods || classIds.length === 0) {
    return { weekday, friday };
  }

  const { data: entries } = await supabase
    .from("timetable_entries")
    .select("period_id, day_type, class_id, subject_id, classes(name), subjects(name)")
    .eq("session_id", sessionId)
    .in("class_id", classIds);

  const entryByPeriodDay = new Map<
    string,
    { classId: string; className: string | null; subjectId: string; subjectName: string | null }
  >();
  for (const entry of entries ?? []) {
    if (!entry.subject_id || !taughtPairs.has(`${entry.class_id}:${entry.subject_id}`)) continue;
    const cls = entry.classes as unknown as { name: string } | null;
    const subj = entry.subjects as unknown as { name: string } | null;
    entryByPeriodDay.set(`${entry.day_type}:${entry.period_id}`, {
      classId: entry.class_id as string,
      className: cls?.name ?? null,
      subjectId: entry.subject_id as string,
      subjectName: subj?.name ?? null,
    });
  }

  for (const p of periods) {
    const match = entryByPeriodDay.get(`${p.day_type}:${p.id}`);
    const row: TeacherPeriodEntry = {
      id: p.id,
      period_index: p.period_index,
      label: p.label,
      start_time: p.start_time,
      end_time: p.end_time,
      is_break: p.is_break,
      classId: match?.classId ?? null,
      className: match?.className ?? null,
      subjectId: match?.subjectId ?? null,
      subjectName: match?.subjectName ?? null,
    };
    if (p.day_type === "friday") friday.push(row);
    else weekday.push(row);
  }

  return { weekday, friday };
}
