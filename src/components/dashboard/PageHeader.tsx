import Link from "next/link";
import type { ComponentType } from "react";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import SessionBadge from "./SessionBadge";

type Crumb = { label: string; href?: string };

export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  breadcrumb,
  actionLabel,
  actionHref,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  breadcrumb: Crumb[];
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#A2E494]/25 text-[#13714C]">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRightIcon className="h-3 w-3" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#13714C] hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[#13714C]">{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          <h1 className="mt-0.5 truncate text-xl font-extrabold text-[#0f4d34] sm:text-2xl">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SessionBadge />
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            <PlusIcon className="h-4 w-4" />
            {actionLabel}
          </Link>
        )}
        {actionLabel && !actionHref && (
          <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110">
            <PlusIcon className="h-4 w-4" />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
