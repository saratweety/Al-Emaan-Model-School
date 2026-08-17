// Pulls fingerprint punches from a ZKTeco device (e.g. K40) on the school LAN
// and writes teacher arrival times into Supabase.
//
// Run once (for Task Scheduler / cron every 5 min):
//   npm run attendance:sync
//
// Run continuously, polling every 5 minutes on its own:
//   npm run attendance:sync -- --watch

import ZKLib from "node-zklib";
import { createClient } from "@supabase/supabase-js";

const DEVICE_IP = process.env.ZK_DEVICE_IP;
const DEVICE_PORT = Number(process.env.ZK_DEVICE_PORT ?? 4370);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WATCH = process.argv.includes("--watch");
const POLL_INTERVAL_MS = 5 * 60 * 1000;

if (!DEVICE_IP) {
  throw new Error("Set ZK_DEVICE_IP in .env.local to the K40's IP address on your school network (check the device's Menu > Comm > Ethernet screen).");
}
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local.");
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function syncOnce() {
  const zk = new ZKLib(DEVICE_IP, DEVICE_PORT, 10000, 4000);

  try {
    await zk.createSocket();
  } catch (err) {
    throw new Error(`Could not connect to the fingerprint device at ${DEVICE_IP}:${DEVICE_PORT} — is it powered on and on the same network? (${err.message})`);
  }

  let logs;
  try {
    const result = await zk.getAttendances();
    logs = result?.data ?? [];
  } finally {
    await zk.disconnect();
  }

  if (logs.length === 0) {
    console.log(`[${new Date().toLocaleTimeString()}] No punches on the device.`);
    return;
  }

  const { data: teachers, error: teacherErr } = await supabase
    .from("teachers")
    .select("id, device_user_id")
    .not("device_user_id", "is", null);
  if (teacherErr) throw teacherErr;

  const teacherByDeviceId = new Map((teachers ?? []).map((t) => [String(t.device_user_id), t.id]));
  if (teacherByDeviceId.size === 0) {
    console.log("No teachers have a Fingerprint Device ID set yet — nothing to sync. Set it on each teacher's Edit page.");
    return;
  }

  const { data: sessionRow } = await supabase.from("academic_sessions").select("id").eq("is_current", true).maybeSingle();
  const sessionId = sessionRow?.id ?? null;

  const { data: settingsRow } = await supabase.from("school_settings").select("teacher_reporting_time").eq("id", true).maybeSingle();
  const reportingTime = settingsRow?.teacher_reporting_time ?? "07:45:00";

  const todayStr = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

  // Keep only the earliest punch per teacher for today — that's the arrival time.
  const earliest = new Map();
  for (const log of logs) {
    const teacherId = teacherByDeviceId.get(String(log.userId ?? log.deviceUserId));
    if (!teacherId) continue;

    const ts = new Date(log.timestamp ?? log.recordTime);
    const dateStr = ts.toLocaleDateString("en-CA");
    if (dateStr !== todayStr) continue;

    const existing = earliest.get(teacherId);
    if (!existing || ts < existing) earliest.set(teacherId, ts);
  }

  if (earliest.size === 0) {
    console.log(`[${new Date().toLocaleTimeString()}] No punches for mapped teachers today.`);
    return;
  }

  // Don't clobber attendance the principal already marked by hand today.
  const { data: existingRows } = await supabase
    .from("teacher_attendance")
    .select("teacher_id, marked_by")
    .eq("date", todayStr)
    .in("teacher_id", [...earliest.keys()]);

  const manuallyMarked = new Set((existingRows ?? []).filter((r) => r.marked_by).map((r) => r.teacher_id));

  const rows = [...earliest.entries()]
    .filter(([teacherId]) => !manuallyMarked.has(teacherId))
    .map(([teacherId, ts]) => {
      const checkInTime = ts.toTimeString().slice(0, 8); // HH:MM:SS local
      const status = checkInTime > reportingTime ? "late" : "present";
      return {
        teacher_id: teacherId,
        session_id: sessionId,
        date: todayStr,
        status,
        check_in_time: checkInTime,
        marked_by: null,
        updated_at: new Date().toISOString(),
      };
    });

  if (rows.length === 0) {
    console.log(`[${new Date().toLocaleTimeString()}] All of today's device punches were already marked manually — nothing to update.`);
    return;
  }

  const { error: upsertErr } = await supabase.from("teacher_attendance").upsert(rows, { onConflict: "teacher_id,date" });
  if (upsertErr) throw upsertErr;

  console.log(`[${new Date().toLocaleTimeString()}] Synced ${rows.length} check-in(s) from the device.`);
}

async function main() {
  if (!WATCH) {
    await syncOnce();
    return;
  }

  console.log(`Watching ${DEVICE_IP}:${DEVICE_PORT}, syncing every 5 minutes. Ctrl+C to stop.`);
  while (true) {
    try {
      await syncOnce();
    } catch (err) {
      console.error(`[${new Date().toLocaleTimeString()}] Sync failed:`, err.message);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("Attendance sync failed:", err.message);
  process.exitCode = 1;
});
