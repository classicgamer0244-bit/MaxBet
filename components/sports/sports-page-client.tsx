"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { SportsFixtureList } from "@/components/sports/sports-fixture-list";
import { Skeleton } from "@/components/ui/skeleton";
import { START_TIME_HOURS } from "@/lib/constants";
import { isRealFixtureId } from "@/lib/fixture-id";
import type { Fixture } from "@/types";

function withinStartWindow(fixture: Fixture, step: string, now: number) {
  const hours = START_TIME_HOURS[step] ?? null;
  if (hours === null) return true;
  return (new Date(fixture.kickoffAt).getTime() - now) / 3_600_000 <= hours;
}

function dedupePreferringLive(fixtures: Fixture[]): Fixture[] {
  const byId = new Map<string, Fixture>();
  for (const f of fixtures) {
    const existing = byId.get(f.id);
    const fIsLive = f.status === "live" || f.status === "halftime";
    const existingIsLive = existing?.status === "live" || existing?.status === "halftime";
    if (!existing || (fIsLive && !existingIsLive)) byId.set(f.id, f);
  }
  return [...byId.values()];
}

export function SportsPageClient() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "today";
  const leagueParam = searchParams.get("league");
  const startStep = searchParams.get("start") ?? "All";

  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const load = useCallback(async () => {
    setHydrated(false);
    try {
      const url = leagueParam
        ? `/api/fixtures?league=${encodeURIComponent(leagueParam)}`
        : tab === "upcoming"
        ? "/api/fixtures?status=upcoming"
        : "/api/fixtures";
      const res = await fetch(url, { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      const raw: Fixture[] = data?.fixtures ?? [];

      const now = Date.now();
      let list =
        tab === "upcoming"
          ? raw.filter((f) => !isRealFixtureId(f.id) && f.status === "upcoming")
          : dedupePreferringLive(raw);

      list = list.filter(
        (f) => f.status === "live" || f.status === "halftime" || withinStartWindow(f, startStep, now)
      );

      setFixtures(list);
    } finally {
      setHydrated(true);
    }
  }, [tab, leagueParam, startStep]);

  useEffect(() => { void load(); }, [load]);

  const title = leagueParam
    ? (fixtures[0]?.leagueName ?? "League")
    : tab === "upcoming"
    ? "Upcoming Football"
    : "Today's Football";

  if (!hydrated) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return <SportsFixtureList fixtures={fixtures} title={title} />;
}
