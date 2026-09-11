"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MobileFeaturedMatchCard } from "@/components/home/mobile-featured-match-card";
import { HighlightsTable } from "@/components/fixtures/highlights-table";
import { useUpcomingFixtures } from "@/hooks/use-fixtures";
import { isRealFixtureId } from "@/lib/fixture-id";
import type { Fixture } from "@/types";

const SIMULATED_LEAGUE_PATTERN = /simulated|\bsrl\b/i;

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return h >>> 0;
}

export function FeaturedFixtures() {
  const { fixtures: upcoming, hydrated } = useUpcomingFixtures();
  const [logoMap, setLogoMap] = useState<Record<string, { home?: string; away?: string }>>({});
  const fetchedIds = useRef(new Set<string>());

  const featured = useMemo(() => {
    return upcoming
      .filter((f) => isRealFixtureId(f.id) && f.status === "upcoming" && !SIMULATED_LEAGUE_PATTERN.test(f.leagueName))
      .slice(0, 4)
      .map((f) => ({ ...f, isHighlight: hashString(f.id) % 10 < 3 }));
  }, [upcoming]);

  useEffect(() => {
    if (!hydrated) return;
    const toFetch = featured.filter((f) => !fetchedIds.current.has(f.id));
    if (toFetch.length === 0) return;
    toFetch.forEach((f) => fetchedIds.current.add(f.id));
    Promise.all(
      toFetch.map((f) =>
        fetch(`/api/fixtures/${f.id}`, { cache: "no-store" })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => data?.fixture ? { id: f.id, home: data.fixture.homeTeam.logoUrl, away: data.fixture.awayTeam.logoUrl } : null)
          .catch(() => null)
      )
    ).then((results) => {
      const updates: Record<string, { home?: string; away?: string }> = {};
      for (const r of results) {
        if (r) updates[r.id] = { home: r.home, away: r.away };
      }
      if (Object.keys(updates).length > 0) setLogoMap((prev) => ({ ...prev, ...updates }));
    });
  }, [hydrated, featured]);

  const featuredWithLogos = useMemo(() => {
    return featured.map((f) => {
      const logos = logoMap[f.id];
      if (!logos) return f;
      return {
        ...f,
        homeTeam: { ...f.homeTeam, logoUrl: logos.home ?? f.homeTeam.logoUrl },
        awayTeam: { ...f.awayTeam, logoUrl: logos.away ?? f.awayTeam.logoUrl },
      };
    });
  }, [featured, logoMap]);

  return (
    <div className="flex gap-3 overflow-x-auto -mx-2 px-2 lg:hidden pb-2 snap-x">
      {!hydrated
        ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-[320px] shrink-0 snap-center rounded-lg border border-border bg-card p-3">
              {/* badges + league */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-10 rounded-sm" />
                  <Skeleton className="h-5 w-16 rounded-sm" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              {/* logos + VS + team names */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex shrink-0 flex-col items-center gap-1">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-3 w-6" />
                </div>
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <Skeleton className="size-11 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              {/* odds buttons */}
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
              </div>
            </div>
          ))
        : featuredWithLogos.map((fixture, i) => (
            <div key={fixture.id} className={`w-[320px] shrink-0 snap-center${i === featured.length - 1 ? " mr-3" : ""}`}>
              <MobileFeaturedMatchCard fixture={fixture} />
            </div>
          ))}
    </div>
  );
}

export function HighlightsSection() {
  const { fixtures: upcoming, hydrated } = useUpcomingFixtures();

  const allFixtures = useMemo<Fixture[]>(() => {
    const realHighlights = upcoming
      .filter((f) => isRealFixtureId(f.id) && !SIMULATED_LEAGUE_PATTERN.test(f.leagueName))
      .slice(0, 30);
    const adminUpcoming = upcoming.filter((f) => !isRealFixtureId(f.id));
    const highlightIds = new Set(realHighlights.map((f) => f.id));
    const adminOnly = adminUpcoming.filter((f) => !highlightIds.has(f.id));
    return [...realHighlights, ...adminOnly].sort(
      (a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()
    );
  }, [upcoming]);

  return <HighlightsTable initialFixtures={allFixtures} hydrated={hydrated} />;
}
