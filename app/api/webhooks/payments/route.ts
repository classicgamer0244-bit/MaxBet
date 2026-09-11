import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  verifyWebhookSignature,
  checkPaymentStatus,
  gatewayRefFrom,
  toTransactionStatus,
} from "@/lib/payments-service";
import { creditSuccessfulDeposit, markFailedDeposit } from "@/lib/deposits/credit";

/**
 * Direct Flutterwave webhook — Flutterwave calls this URL itself.
 *
 * Authenticated via the `verif-hash` header, which must match
 * FLUTTERWAVE_WEBHOOK_HASH set in the Flutterwave dashboard and this app's env.
 *
 * The body's `status` is read only to decide whether it is worth looking up.
 * The crediting decision always comes from an independent checkPaymentStatus()
 * call — the webhook is a hint to go and ask, never an instruction to pay.
 *
 * Idempotent with the status-poll route and the pending-deposit sweep via
 * creditSuccessfulDeposit()/markFailedDeposit()'s atomic PENDING-guarded
 * update — whichever path lands first wins and the others no-op.
 */
export async function POST(request: Request) {
  const providedHash = request.headers.get("verif-hash");
  if (!verifyWebhookSignature(providedHash)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  // Flutterwave sends `data.tx_ref` as our reference.
  const reference = body?.data?.tx_ref ?? body?.txRef ?? body?.tx_ref;
  if (typeof reference !== "string" || !reference) {
    return NextResponse.json({ error: "Missing reference." }, { status: 400 });
  }

  const txn = await db.transaction.findUnique({ where: { reference } });
  if (!txn || txn.type !== "DEPOSIT") {
    // 200, not 404: an unknown reference is not something retrying can fix.
    return NextResponse.json({ received: true });
  }

  try {
    const result = await checkPaymentStatus(reference, txn.amountMinor, gatewayRefFrom(txn));
    const mapped = toTransactionStatus(result.status);
    if (mapped === "SUCCESS") await creditSuccessfulDeposit(reference, result.raw);
    else if (mapped === "FAILED") await markFailedDeposit(reference, result.raw);

    if (result.transactionId && !txn.gatewayTransactionId) {
      await db.transaction.update({
        where: { reference },
        data: { gatewayTransactionId: String(result.transactionId) },
      });
    }
  } catch (err) {
    console.error("Flutterwave webhook status check failed:", err);
    // 502 so Flutterwave retries — the pending-deposit sweep is the backstop
    // if it never does.
    return NextResponse.json({ error: "Status check failed." }, { status: 502 });
  }

  return NextResponse.json({ received: true });
}
