import { createClient } from "@/lib/supabase/server";
import { getParentChildren } from "@/lib/parent-data";

const EPOCH = new Date(0).toISOString();

async function getLastSeenAt(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from("notice_reads").select("last_seen_at").eq("user_id", userId).maybeSingle();
  return data?.last_seen_at ?? EPOCH;
}

export async function markNoticesSeen(userId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notice_reads").upsert({ user_id: userId, last_seen_at: new Date().toISOString() });
}

export async function getUnreadNoticeCountForParent(userId: string): Promise<number> {
  const supabase = await createClient();
  const lastSeenAt = await getLastSeenAt(userId);

  const children = await getParentChildren(userId);
  const classIds = [...new Set(children.map((c) => c.classId).filter((id): id is string => Boolean(id)))];

  let query = supabase.from("notices").select("id", { count: "exact", head: true }).gt("created_at", lastSeenAt);
  query =
    classIds.length > 0
      ? query.or(`audience.in.(everyone,parents),and(audience.eq.class,class_id.in.(${classIds.join(",")}))`)
      : query.in("audience", ["everyone", "parents"]);

  const { count } = await query;
  return count ?? 0;
}

export async function getUnreadNoticeCountForTeacher(userId: string): Promise<number> {
  const supabase = await createClient();
  const lastSeenAt = await getLastSeenAt(userId);

  const { count } = await supabase
    .from("notices")
    .select("id", { count: "exact", head: true })
    .in("audience", ["everyone", "teachers"])
    .gt("created_at", lastSeenAt);

  return count ?? 0;
}
