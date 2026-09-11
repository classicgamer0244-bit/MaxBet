import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireFixtureController } from "@/lib/admin-fixtures/authorize";
import { serializeAdminFixtureFull } from "@/lib/admin-fixtures/serialize";
import { settleBetsForFixtures } from "@/lib/settlement/settle-bets-for-fixtures";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await requireFixtureController(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const updated = await db.adminFixture.update({
    where: { id },
    data: {
      status: "FINISHED",
      minute: "FT",
      scoreHome: result.fixture.scoreHome ?? 0,
      scoreAway: result.fixture.scoreAway ?? 0,
    },
  });
  await settleBetsForFixtures([id]);

  return NextResponse.json({ fixture: serializeAdminFixtureFull(updated) });
}
