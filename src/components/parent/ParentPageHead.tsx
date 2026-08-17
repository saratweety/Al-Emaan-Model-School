import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";

type Crumb = { label: string; href?: string };

export default function ParentPageHead({
  icon: Icon,
  title,
  subtitle,
  breadcrumb,
  right,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  breadcrumb: Crumb[];
  right?: ReactNode;
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

      {right && <div className="flex flex-wrap items-center gap-3">{right}</div>}
    </div>
  );
}
