"use server";

import { revalidatePath } from "next/cache";
import { requirePrincipal } from "@/lib/principal-auth";
import { getCurrentSessionId } from "@/lib/academic-sessions";
import { monthValueToISODate } from "@/lib/school-calendar";

export type ActionResult = { success: true } | { success: false; error: string };

export async function generateMonthlyFees(monthValue: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { success: false, error: "No current academic session is configured." };

  const monthDate = monthValueToISODate(monthValue);

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_enrollments")
    .select("student_id, students(monthly_fee)")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .returns<{ student_id: string; students: { monthly_fee: number } | null }[]>();

  if (enrollmentsError) return { success: false, error: enrollmentsError.message };
  if (!enrollments || enrollments.length === 0) {
    return { success: false, error: "No active enrollments found for the current session." };
  }

  const records = enrollments.map((e) => ({
    student_id: e.student_id,
    session_id: sessionId,
    month_date: monthDate,
    amount_due: e.students?.monthly_fee ?? 0,
  }));

  const { error: insertError } = await supabase
    .from("student_fee_records")
    .upsert(records, { onConflict: "student_id,month_date", ignoreDuplicates: true });

  if (insertError) return { success: false, error: insertError.message };

  revalidatePath("/dashboard/fees");
  return { success: true };
}

export async function recordPayment(feeRecordId: string, amount: number, method: string): Promise<ActionResult> {
  const { supabase, userId, error } = await requirePrincipal();
  if (error || !userId) return { success: false, error: error ?? "Not authorized." };

  if (!amount || amount <= 0) {
    return { success: false, error: "Enter a valid payment amount." };
  }

  const { data: record, error: recordError } = await supabase
    .from("student_fee_records")
    .select("amount_due, amount_paid, student_id")
    .eq("id", feeRecordId)
    .single();

  if (recordError || !record) return { success: false, error: recordError?.message ?? "Fee record not found." };

  const remaining = Number(record.amount_due) - Number(record.amount_paid);
  if (amount > remaining) {
    return { success: false, error: `Amount exceeds the remaining balance of Rs. ${remaining.toFixed(2)}.` };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("fee_payments")
    .insert({ fee_record_id: feeRecordId, amount, method, received_by: userId })
    .select("id")
    .single();

  if (paymentError || !payment) return { success: false, error: paymentError?.message ?? "Couldn't record the payment." };

  const newPaid = Number(record.amount_paid) + amount;
  const newStatus = newPaid >= Number(record.amount_due) ? "paid" : "partial";

  const { error: updateError } = await supabase
    .from("student_fee_records")
    .update({ amount_paid: newPaid, status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", feeRecordId);

  if (updateError) {
    await supabase.from("fee_payments").delete().eq("id", payment.id);
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard/fees");
  revalidatePath(`/dashboard/fees/${record.student_id}`);
  return { success: true };
}
