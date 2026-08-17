"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/toast";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { recordPayment } from "@/app/dashboard/fees/actions";

export default function CollectPaymentModal({
  feeRecordId,
  monthLabel,
  remaining,
  onClose,
}: {
  feeRecordId: string;
  monthLabel: string;
  remaining: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState(String(remaining));
  const [method, setMethod] = useState("cash");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    startTransition(async () => {
      const result = await recordPayment(feeRecordId, value, method);
      if (!result.success) {
        showToast(result.error, "error");
        return;
      }
      showToast("Payment recorded.", "success");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Collect Fee — ${monthLabel}`}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="collect-payment-form"
            disabled={isPending}
            className="rounded-xl bg-gradient-to-r from-[#3AB67D] to-[#13714C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "Saving..." : "Collect"}
          </button>
        </>
      }
    >
      <form id="collect-payment-form" onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm text-gray-500">Remaining balance: Rs. {remaining.toLocaleString("en-US")}</p>
        <Input
          label="Amount"
          type="number"
          min={1}
          max={remaining}
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <Select
          label="Payment Method"
          required
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          options={[
            { value: "cash", label: "Cash" },
            { value: "bank_transfer", label: "Bank Transfer" },
            { value: "cheque", label: "Cheque" },
            { value: "online", label: "Online" },
          ]}
        />
      </form>
    </Modal>
  );
}
