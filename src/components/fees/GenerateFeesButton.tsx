"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import { generateMonthlyFees } from "@/app/dashboard/fees/actions";
import { WalletIcon } from "@/components/icons";

export default function GenerateFeesButton({ monthValue, monthLabel }: { monthValue: string; monthLabel: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await generateMonthlyFees(monthValue);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast(`Fees generated for ${monthLabel}.`, "success");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <WalletIcon className="h-4 w-4" />
      {isPending ? "Generating..." : `Generate ${monthLabel} Fees`}
    </button>
  );
}
