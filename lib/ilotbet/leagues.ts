import { ensureIlotbetFresh } from "./sync/scheduler";
import { getCachedLeagueCounts } from "./cache/read";
import type { League } from "@/types";

/**
 * No curated league allowlist — the sidebar simply lists whichever
 * tournaments currently have live or upcoming fixtures, straight from the
 * cache via a groupBy. No ilotbet calls here at all.
 */
export async function getRealLeagues(): Promise<League[]> {
  await ensureIlotbetFresh();
  const groups = await getCachedLeagueCounts();
  return groups.map((g) => ({
    id: g.tournamentId,
    sportSlug: "football",
    name: g.tournamentName,
    fixtureCount: g.count,
    logoUrl: g.tournamentIcon ?? undefined,
  }));
}
