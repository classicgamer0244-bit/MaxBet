import { isTerminalStatus } from "./status";
import { rawIlotbetMatchToFixture } from "./browser-map";
import type { IlotbetLiveMatchesResponse, IlotbetDailyMatchesResponse, IlotbetMatchDetailResponse, IlotbetMatchRaw } from "./types";
import type { Fixture, SportSlug } from "@/types";

/**
 * Direct-from-the-browser ilotbet fetches — no MaxBet backend involved at
 * all. ilotbet's endpoints are public, unauthenticated, CORS-open
 * (access-control-allow-origin: *, confirmed directly) and already cache on
 * their own side, so this deliberately skips the pacing/backoff machinery
 * lib/ilotbet/client.ts uses for the backend sync jobs — those jobs still
 * exist and still run (needed for settlement and for the very first
 * server-rendered paint), this is a separate, simpler path purely for
 * keeping what's ALREADY on screen fresh without a manual reload.
 */

const ILOTBET_BASE_URL = "https://www.ilotbet.com";
const SPORT_ID = "sr:sport:1";
const CLIENT_PARAMS = { platform: "3", platformModel: "1.0" } as const;

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(`${ILOTBET_BASE_URL}${path}`);
  const all = { ...CLIENT_PARAMS, ...params, timestamp: Date.now() };
  for (const [key, value] of Object.entries(all)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function dedupeByMatchId(raw: IlotbetMatchRaw[]): IlotbetMatchRaw[] {
  const seen = new Set<string>();
  const out: IlotbetMatchRaw[] = [];
  for (const m of raw) {
    if (seen.has(m.matchId)) continue;
    seen.add(m.matchId);
    out.push(m);
  }
  return out;
}

function isFootball(sportSlug?: SportSlug): boolean {
  return !sportSlug || sportSlug === "football";
}

export async function fetchIlotbetLiveFixtures(sportSlug?: SportSlug): Promise<Fixture[]> {
  if (!isFootball(sportSlug)) return [];

  const res = await fetch(buildUrl("/api/sbu/un/m/live/matches", { sportId: SPORT_ID }), { cache: "no-store" });
  if (!res.ok) throw new Error(`ilotbet live fetch failed: ${res.status}`);
  const body = (await res.json()) as IlotbetLiveMatchesResponse;
  if (body.code !== 0) throw new Error(`ilotbet live fetch error: code ${body.code} (${body.msg})`);

  // ilotbet's /live/matches occasionally still lists a match for one more
  // response after it's actually ended (eventStatus already flipped
  // terminal) before dropping it entirely — the date-range /pre/matches
  // fetch below already guards the equivalent case, this closes the same
  // gap here.
  const raw = dedupeByMatchId(body.data?.matchList ?? []).filter((m) => !isTerminalStatus(m.eventStatus));
  return raw.map(rawIlotbetMatchToFixture);
}

function formatBoundary(date: Date): string {
  // ilotbet expects "+00:00", not the "Z" Date#toISOString() produces.
  return date.toISOString().replace(/\.\d{3}Z$/, "+00:00");
}

const DAYS_AHEAD = 1;
const PAGE_SIZE = 100;
const MAX_PAGES = 2;

export async function fetchIlotbetUpcomingFixtures(sportSlug?: SportSlug): Promise<Fixture[]> {
  if (!isFootball(sportSlug)) return [];

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCDate(end.getUTCDate() + DAYS_AHEAD);
  end.setUTCHours(23, 59, 59, 0);
  const st = formatBoundary(today);
  const et = formatBoundary(end);

  const all: IlotbetMatchRaw[] = [];
  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
    const res = await fetch(
      buildUrl("/api/sbu/un/m/pre/matches", { sportId: SPORT_ID, st, et, pageNum, pageSize: PAGE_SIZE }),
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`ilotbet upcoming fetch failed: ${res.status}`);
    const body = (await res.json()) as IlotbetDailyMatchesResponse;
    if (body.code !== 0) throw new Error(`ilotbet upcoming fetch error: code ${body.code} (${body.msg})`);

    const matches = body.data?.list?.[0]?.matchList ?? [];
    all.push(...matches);
    if (matches.length < PAGE_SIZE) break;
  }

  const now = Date.now();
  const raw = dedupeByMatchId(all).filter(
    (m) => m.eventStatus === "not_started" && new Date(m.scheduledTime).getTime() > now
  );

  return raw.map(rawIlotbetMatchToFixture);
}

export async function fetchIlotbetMatchDetail(matchId: string): Promise<Fixture | undefined> {
  const res = await fetch(buildUrl("/api/sbu/un/m/match", { id: matchId, easy: "false" }), { cache: "no-store" });
  if (!res.ok) throw new Error(`ilotbet detail fetch failed: ${res.status}`);
  const body = (await res.json()) as IlotbetMatchDetailResponse;
  if (body.code !== 0) throw new Error(`ilotbet detail fetch error: code ${body.code} (${body.msg})`);
  if (!body.data) return undefined;
  return rawIlotbetMatchToFixture(body.data);
}
