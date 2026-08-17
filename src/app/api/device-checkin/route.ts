import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by the ESP32 + R307 fingerprint device on every successful scan.
// Auth is a shared secret header, not a user session — the device has no login.
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-device-secret");
  if (!secret || secret !== process.env.DEVICE_SHARED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const deviceUserId = String(body?.deviceUserId ?? "").trim();
  if (!deviceUserId) {
    return NextResponse.json({ error: "deviceUserId is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: teacher, error: teacherErr } = await admin
    .from("teachers")
    .select("id, profiles(full_name)")
    .eq("device_user_id", deviceUserId)
    .maybeSingle<{ id: string; profiles: { full_name: string } | null }>();

  if (teacherErr) return NextResponse.json({ error: teacherErr.message }, { status: 500 });
  if (!teacher) {
    return NextResponse.json({ error: `No teacher is mapped to fingerprint ID ${deviceUserId}.` }, { status: 404 });
  }

  const now = new Date();
  const date = now.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  const checkInTime = now.toTimeString().slice(0, 8); // HH:MM:SS in local time

  const { data: existing } = await admin
    .from("teacher_attendance")
    .select("marked_by")
    .eq("teacher_id", teacher.id)
    .eq("date", date)
    .maybeSingle<{ marked_by: string | null }>();

  if (existing?.marked_by) {
    // The principal already marked this teacher by hand today — don't override it.
    return NextResponse.json({ success: true, note: "Already marked manually today." });
  }

  const [{ data: sessionRow }, { data: settingsRow }] = await Promise.all([
    admin.from("academic_sessions").select("id").eq("is_current", true).maybeSingle<{ id: string }>(),
    admin.from("school_settings").select("teacher_reporting_time").eq("id", true).maybeSingle<{ teacher_reporting_time: string }>(),
  ]);

  const reportingTime = settingsRow?.teacher_reporting_time ?? "07:45:00";
  const status = checkInTime > reportingTime ? "late" : "present";

  const { error: upsertErr } = await admin.from("teacher_attendance").upsert(
    {
      teacher_id: teacher.id,
      session_id: sessionRow?.id ?? null,
      date,
      status,
      check_in_time: checkInTime,
      marked_by: null,
      updated_at: now.toISOString(),
    },
    { onConflict: "teacher_id,date" }
  );

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  return NextResponse.json({ success: true, teacher: teacher.profiles?.full_name ?? null, status, checkInTime });
}
