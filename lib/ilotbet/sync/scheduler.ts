import { runIfDue, isHardStale } from "@/lib/sync/lock";
import { SYNC_JOBS, HARD_TTL_MS } from "./jobs";
import { syncDailyMatches } from "./daily-matches";
import { syncLiveMatches } from "./live-matches";
import { tickAdminFixturesIfDue } from "@/lib/simulation/tick";
import { nowMs } from "@/lib/id";

/**
 * ilotbet is now the primary real-fixture source — both jobs matter to every
 * caller (listings need dailyMatches+liveMatches, settlement needs
 * liveMatches's terminal diff), so unlike the old api-football scheduler
 * there's no per-scope job subset; every call just runs both jobs if due.
 */
async function anyHardStale(): Promise<boolean> {
  const keys: Array<keyof typeof HARD_TTL_MS> = ["dailyMatches", "liveMatches"];
  const results = await Promise.all(keys.map((k) => isHardStale(SYNC_JOBS[k].key, HARD_TTL_MS[k])));
  return results.some(Boolean);
}

/** Not ilotbet-related, but every caller of this already wants fresh admin
 * fixture state too — see lib/api-football/sync/scheduler.ts's old doc
 * comment for the same reasoning (this is the "primary" scheduler now, so
 * it's the natural home). lib/fixtures.ts also ticks independently on every
 * read — harmless, lock-guarded no-ops the vast majority of the time. */
async function runJobs(): Promise<void> {
  await tickAdminFixturesIfDue(nowMs());
  await runIfDue(SYNC_JOBS.dailyMatches, async () => void (await syncDailyMatches()));
  await runIfDue(SYNC_JOBS.liveMatches, async () => void (await syncLiveMatches()));
}

/**
 * Non-blocking — serves whatever IlotbetFixtureCache already holds and lets
 * the refresh land for the next reader. Blocks only past a job's HARD ttl
 * (cold start, or a long idle period), the one case where serving the cache
 * would be actively misleading rather than merely a few seconds behind.
 */
export async function ensureIlotbetFresh(): Promise<void> {
  if (await anyHardStale()) {
    await runJobs();
    return;
  }
  void runJobs().catch((err) => console.error("ilotbet background sync failed:", err));
}

/** Always-awaited form — for the SSE poll loops and the cron routes. */
export async function pumpIlotbetSyncs(): Promise<void> {
  await runJobs();
}
