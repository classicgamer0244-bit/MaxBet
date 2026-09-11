import { ilotbetGet } from "../client";
import { mapIlotbetMarketsToOverrides } from "../mapper";
import { upsertFixtureFacts, upsertDetailMarkets } from "../cache/write";
import { buildMarketsForFixture, overrideMarkets } from "@/data/mock/market-builder";
import { toFacts } from "./raw-to-facts";
import type { IlotbetMatchDetailResponse } from "../types";

/**
 * On-demand, per-fixture — called only when lib/ilotbet/fixtures.ts's
 * getRealFixtureById() decides a fixture's detail markets are stale (see
 * DETAIL_MARKETS_TTL_MS/_LIVE_MS in ../constants), i.e. proportional to how
 * often a fixture is actually opened, not a fixed poll. Refreshes both facts
 * AND the far richer ~80-market set in one call — the single-match endpoint
 * carries both, unlike api-football's split facts/odds endpoints.
 */
export async function syncMatchDetail(matchId: string): Promise<{ found: boolean }> {
  const res = await ilotbetGet<IlotbetMatchDetailResponse>("/api/sbu/un/m/match", { id: matchId, easy: "false" });
  const raw = res.data;
  if (!raw || raw.matchId !== matchId) return { found: false };

  await upsertFixtureFacts([toFacts(raw)], "detail");

  if (raw.markets.length > 0) {
    const markets = overrideMarkets(matchId, buildMarketsForFixture(matchId), mapIlotbetMarketsToOverrides(raw.markets));
    await upsertDetailMarkets(matchId, markets);
  }

  return { found: true };
}
