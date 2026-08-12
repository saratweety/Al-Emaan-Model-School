import type { ComponentType } from "react";
import Link from "next/link";

const NEUTRAL_VALUE_COLOR = "text-[#0f4d34]";
const ACCENT_COLOR = "text-[#13714C]";

export default function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sub,
  subColor,
  valueColor = NEUTRAL_VALUE_COLOR,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  iconBg: string;
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  valueColor?: string;
  href?: string;
}) {
  const resolvedSubColor = subColor ?? (valueColor !== NEUTRAL_VALUE_COLOR ? valueColor : ACCENT_COLOR);

  const content = (
    <div
      className={`flex min-h-[124px] items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 ${
        href ? "transition hover:border-[#3AB67D]/40 hover:shadow-md" : ""
      }`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className="h-5 w-5 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight tracking-wide text-gray-500">{label}</p>
        <p className={`mt-1 break-words text-lg font-extrabold leading-tight sm:text-xl ${valueColor}`}>{value}</p>
        {sub && <p className={`mt-0.5 truncate text-xs font-semibold ${resolvedSubColor}`}>{sub}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
