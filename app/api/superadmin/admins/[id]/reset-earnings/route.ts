import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { serializeAdmin } from "@/lib/auth/serialize";
import { toMinor } from "@/lib/money";

const bodySchema = z.object({
  /** Omitted: full settle (zeroes the ledger — the original one-click
   * "paid everything out" flow). Provided: partial settle — deducts exactly
   * this much instead, for a superadmin paying a merchant out in
   * installments rather than all at once. */
  amount: z.number().positive().optional(),
});

/** Settles (pays out) an admin's running commission ledger, in full or in
 * part. Lifetime gross deposits (GET /api/superadmin/admins/:id) are derived
 * from the permanent transaction log and are never affected by this either
 * way — this only ever touches the *unpaid* balance still owed. Records a
 * DEPOSIT transaction either way — same category as a direct balance credit
 * (see .../credit/route.ts), since from the account holder's own transaction
 * history this reads the same way: the superadmin paid them money. `method`
 * still distinguishes it as an earnings settlement rather than a balance
 * credit for anyone reading the underlying record. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const superadmin = await requireAdmin("SUPERADMIN");
  if (!superadmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(json ?? {});
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });

  const target = await db.adminAccount.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "Admin not found." }, { status: 404 });

  const isPartial = parsed.data.amount !== undefined;
  const settledMinor = isPartial ? toMinor(parsed.data.amount!) : target.earningsMinor;

  if (settledMinor === 0) return NextResponse.json({ error: "There's nothing unpaid to settle." }, { status: 400 });
  if (isPartial && settledMinor > target.earningsMinor) {
    return NextResponse.json({ error: "That's more than this admin's unpaid earnings." }, { status: 400 });
  }

  const updated = await db.adminAccount.update({
    where: { id },
    data: isPartial ? { earningsMinor: { decrement: settledMinor } } : { earningsMinor: 0 },
  });

  await db.transaction.create({
    data: {
      accountId: id,
      accountKind: "ADMIN",
      type: "DEPOSIT",
      status: "SUCCESS",
      amountMinor: settledMinor,
      method: "Superadmin earnings settlement",
      phone: target.phone,
      reference: `settle_${nanoid(16)}`,
      performedByAdminId: superadmin.id,
      note: isPartial ? "Partial earnings settlement" : "Full earnings settlement",
    },
  });

  return NextResponse.json({ admin: serializeAdmin(updated) });
}
