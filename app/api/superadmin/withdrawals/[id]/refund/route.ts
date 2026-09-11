import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeTransaction } from "@/lib/transactions/serialize";
import { incrementBalance, registerWithdrawalRefund } from "@/lib/accounts/balance";
import { toArkeselNumber, sendSms } from "@/lib/arkesel";
import { fromMinor } from "@/lib/money";

/** Reverses a withdrawal that failed to pay out — credits the amount back to
 * the user's balance and marks the transaction failed (there's no separate
 * "refunded" status; failed is the terminal state a reversed withdrawal ends
 * up in, same as before this backend existed). Also resets the account's
 * deposits-since-reset counter to 0, and every 2nd refund in a row flags it
 * as needing an 8%-of-balance deposit before it can withdraw again — see
 * lib/accounts/balance.ts's registerWithdrawalRefund. */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin("SUPERADMIN");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const { count } = await db.transaction.updateMany({
    where: { id, type: "WITHDRAWAL", status: { not: "FAILED" } },
    data: { status: "FAILED" },
  });
  if (count === 0) {
    return NextResponse.json({ error: "That withdrawal can't be refunded." }, { status: 400 });
  }

  const txn = await db.transaction.findUniqueOrThrow({ where: { id } });
  const accountKind = txn.accountKind === "ADMIN" ? "admin" : "user";
  await incrementBalance(accountKind, txn.accountId, txn.amountMinor);
  await registerWithdrawalRefund(accountKind, txn.accountId);

  const account = txn.accountKind === "USER"
    ? await db.user.findUnique({ where: { id: txn.accountId }, select: { phone: true, countryCode: true } })
    : await db.adminAccount.findUnique({ where: { id: txn.accountId }, select: { phone: true } });

  // Audit-trail only — the balance credit above already landed, so a
  // failure here must never undo it or block the response.
  try {
    await db.transaction.create({
      data: {
        accountId: txn.accountId,
        accountKind: txn.accountKind,
        type: "REFUND",
        status: "SUCCESS",
        amountMinor: txn.amountMinor,
        method: "Withdrawal refund",
        phone: account?.phone ?? txn.phone,
        reference: `refund_${nanoid(16)}`,
        referringAdminId: txn.referringAdminId ?? undefined,
        performedByAdminId: admin.id,
        note: `Refund of failed withdrawal ${txn.id}`,
      },
    });
  } catch (err) {
    console.error(`failed to record REFUND transaction for withdrawal ${txn.id}:`, err);
  }

  // Send refund notification SMS
  try {
    if (account?.phone) {
      const intlPhone = toArkeselNumber(account.phone, (account as { countryCode?: string }).countryCode ?? "233");
      const amount = fromMinor(txn.amountMinor).toFixed(2);
      await sendSms(intlPhone, `MaxBet: Your withdrawal of GHS ${amount} has been refunded. The amount has been returned to your balance.`);
    }
  } catch { /* SMS failure must never break the refund flow */ }

  return NextResponse.json({ transaction: serializeTransaction(txn) });
}
