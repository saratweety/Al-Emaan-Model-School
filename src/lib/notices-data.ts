import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/school-calendar";

export type NoticeStatus = "Active" | "Scheduled" | "Expired";

export type PrincipalNotice = {
  id: string;
  title: string;
  description: string;
  noticeType: string;
  audience: string;
  forClass: string;
  publishDate: string;
  publishedBy: string;
  validUntil: string | null;
  status: NoticeStatus;
};

const audienceLabels: Record<string, string> = {
  everyone: "All Classes",
  teachers: "Teachers",
  parents: "Parents",
};

export async function getNoticesForPrincipal(): Promise<{ notices: PrincipalNotice[]; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select("id, title, description, notice_type, audience, publish_date, expiry_date, classes(name), profiles(full_name)")
    .order("publish_date", { ascending: false })
    .returns<
      {
        id: string;
        title: string;
        description: string;
        notice_type: string;
        audience: string;
        publish_date: string;
        expiry_date: string | null;
        classes: { name: string } | null;
        profiles: { full_name: string } | null;
      }[]
    >();

  if (error) return { notices: [], error: error.message };

  const today = getToday();
  const todayStr = today.toISOString().slice(0, 10);

  const notices: PrincipalNotice[] = (data ?? []).map((n) => {
    let status: NoticeStatus = "Active";
    if (n.publish_date > todayStr) status = "Scheduled";
    else if (n.expiry_date && n.expiry_date < todayStr) status = "Expired";

    return {
      id: n.id,
      title: n.title,
      description: n.description,
      noticeType: n.notice_type,
      audience: n.audience,
      forClass: n.audience === "class" ? (n.classes?.name ?? "Unknown Class") : (audienceLabels[n.audience] ?? n.audience),
      publishDate: new Date(n.publish_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      publishedBy: n.profiles?.full_name ?? "Unknown",
      validUntil: n.expiry_date ? new Date(n.expiry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null,
      status,
    };
  });

  return { notices, error: null };
}

export type NoticeDetail = {
  id: string;
  title: string;
  description: string;
  noticeType: string;
  audience: string;
  classId: string | null;
  className: string | null;
  publishDate: string;
  expiryDate: string | null;
  publishedBy: string;
  status: NoticeStatus;
};

export async function getNoticeById(id: string): Promise<{ notice: NoticeDetail | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notices")
    .select("id, title, description, notice_type, audience, class_id, publish_date, expiry_date, classes(name), profiles(full_name)")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      title: string;
      description: string;
      notice_type: string;
      audience: string;
      class_id: string | null;
      publish_date: string;
      expiry_date: string | null;
      classes: { name: string } | null;
      profiles: { full_name: string } | null;
    }>();

  if (error) return { notice: null, error: error.message };
  if (!data) return { notice: null, error: null };

  const todayStr = getToday().toISOString().slice(0, 10);
  let status: NoticeStatus = "Active";
  if (data.publish_date > todayStr) status = "Scheduled";
  else if (data.expiry_date && data.expiry_date < todayStr) status = "Expired";

  return {
    notice: {
      id: data.id,
      title: data.title,
      description: data.description,
      noticeType: data.notice_type,
      audience: data.audience,
      classId: data.class_id,
      className: data.classes?.name ?? null,
      publishDate: data.publish_date,
      expiryDate: data.expiry_date,
      publishedBy: data.profiles?.full_name ?? "Unknown",
      status,
    },
    error: null,
  };
}
