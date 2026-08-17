import { BellIcon, FlagIcon, PaperPlaneIcon, SparkleIcon, PalmTreeIcon, FileAlertIcon } from "@/components/icons";

export const noticeTypeMeta: Record<string, { label: string; icon: typeof BellIcon; iconBg: string; badge: string }> = {
  holiday: { label: "Holiday", icon: PalmTreeIcon, iconBg: "bg-teal-100 text-teal-600", badge: "bg-teal-100 text-teal-700" },
  event: { label: "Event", icon: SparkleIcon, iconBg: "bg-orange-100 text-orange-600", badge: "bg-blue-100 text-blue-700" },
  general: { label: "General", icon: PaperPlaneIcon, iconBg: "bg-purple-100 text-purple-600", badge: "bg-purple-100 text-purple-700" },
  reminder: { label: "Reminder", icon: FileAlertIcon, iconBg: "bg-pink-100 text-pink-600", badge: "bg-amber-100 text-amber-700" },
  announcement: { label: "Announcement", icon: FlagIcon, iconBg: "bg-green-100 text-green-600", badge: "bg-green-100 text-green-700" },
};

export const noticeStatusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  Scheduled: "bg-amber-100 text-amber-700",
  Expired: "bg-red-100 text-red-700",
};

export const noticeAudienceLabels: Record<string, string> = {
  everyone: "Everyone",
  teachers: "Teachers",
  parents: "Parents",
  class: "Particular Class",
};
