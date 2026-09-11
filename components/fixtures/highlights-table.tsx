"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer, RefreshCw } from "lucide-react";
import type { Fixture } from "@/types";
import { groupFixturesByLeague, getSports } from "@/data/selectors";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CompetitionGroup } from "./competition-group";
import { MobileFixtureList } from "./mobile-fixture-list";

export function HighlightsTable({ initialFixtures, hydrated = true }: { initialFixtures: Fixture[]; hydrated?: boolean }) {
  const sports = getSports();
  const [activeSport, setActiveSport] = useState("football");

  const fixtures = useMemo(() => {
    const now = Date.now();
    return initialFixtures
      .filter((f) => f.status !== "finished" && f.status !== "cancelled" && new Date(f.kickoffAt).getTime() >= now)
      .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
  }, [initialFixtures]);

  const leagueNames = useMemo(() => Array.from(new Set(fixtures.map((f) => f.leagueName))), [fixtures]);
  const [activeLeague, setActiveLeague] = useState<string | null>(null);

  const filtered = activeLeague ? fixtures.filter((f) => f.leagueName === activeLeague) : fixtures;
  const groups = groupFixturesByLeague(filtered);

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      {/* Mobile Header + Tabs */}
      <div className="flex items-center gap-4 overflow-x-auto border-b border-border px-3 py-3 lg:hidden">
        <h2 className="text-xl font-extrabold text-foreground shrink-0">Sports</h2>
        <span className="text-xl text-border shrink-0">|</span>
        {sports.map((sport) => (
          <button
            key={sport.slug}
            onClick={() => setActiveSport(sport.slug)}
            className={cn(
              "shrink-0 text-base font-bold whitespace-nowrap",
              activeSport === sport.slug ? "text-primary" : "text-muted-foreground"
            )}
          >
            {sport.name}
          </button>
        ))}
      </div>

      <div className="flex gap-6 overflow-x-auto border-b border-border px-4 py-2 lg:hidden">
        <button className="shrink-0 border-b-2 border-primary px-1 pb-1 text-sm font-bold text-foreground">
          Highlights
        </button>
        <button className="shrink-0 border-b-2 border-transparent px-1 pb-1 text-sm font-semibold text-muted-foreground">
          Today
        </button>
        <button className="shrink-0 border-b-2 border-transparent px-1 pb-1 text-sm font-semibold text-muted-foreground">
          Countries
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden items-center justify-between border-b border-border px-4 py-3 lg:flex">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <span className="size-2 rounded-full bg-primary" />
          Highlights
        </h2>
        <div className="flex items-center gap-3 text-muted-foreground">
          <button aria-label="Print" className="hover:text-foreground">
            <Printer className="size-4" />
          </button>
          <button aria-label="Refresh" className="hover:text-foreground">
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="hidden gap-2 overflow-x-auto border-b border-border px-4 py-2.5 lg:flex">
        {leagueNames.map((name) => (
          <button
            key={name}
            onClick={() => setActiveLeague((prev) => (prev === name ? null : name))}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
              activeLeague === name
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40"
            )}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        {!hydrated
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
                <Skeleton className="h-4 w-10 shrink-0" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex w-52 shrink-0 gap-1.5">
                  <Skeleton className="h-8 flex-1 rounded" />
                  <Skeleton className="h-8 flex-1 rounded" />
                  <Skeleton className="h-8 flex-1 rounded" />
                </div>
                <Skeleton className="h-4 w-8 shrink-0" />
              </div>
            ))
          : groups.map((group) => (
              <CompetitionGroup
                key={group.leagueId}
                leagueName={group.leagueName}
                fixtures={group.fixtures}
                showGoalsColumn
                groupByDate
              />
            ))}
      </div>
      <div className="lg:hidden">
        {!hydrated
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 border-b border-border px-3 py-3 last:border-b-0">
                <Skeleton className="h-3 w-10 shrink-0" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Skeleton className="h-8 w-16 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              </div>
            ))
          : <MobileFixtureList fixtures={filtered} />}
      </div>

      <div className="border-t border-border px-4 py-3 text-center">
        <Link href="/sports" className="text-sm font-semibold text-primary hover:underline">
          View All
        </Link>
      </div>
    </section>
  );
}
