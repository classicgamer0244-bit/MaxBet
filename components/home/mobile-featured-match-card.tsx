"use client";

import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import type { Fixture } from "@/types";
import { OddsButton } from "@/components/odds/odds-button";
import { TeamCrest } from "@/components/fixtures/team-crest";

export function MobileFeaturedMatchCard({ fixture }: { fixture: Fixture }) {
  const fixtureLabel = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  const oneXTwo = fixture.markets.find((m) => m.name === "1X2");
  const cheapestOdds = oneXTwo ? Math.min(...oneXTwo.selections.map((s) => s.odds)) : null;
  const time = new Date(fixture.kickoffAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  const isLive = fixture.status === "live" || fixture.status === "halftime";
  const score = fixture.score;

  return (
    <div className="w-[320px] rounded-lg border border-border bg-card p-3 text-foreground shadow-sm">
      <Link href={`/sports/${fixture.id}`} className="block">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="flex items-center gap-1 rounded-sm bg-success px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-success-foreground">
              <Flame className="size-3" />
              Hot
            </span>
            <span className="flex items-center gap-1 rounded-sm bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-black">
              <Zap className="size-3" />
              Best Odds
            </span>
          </div>
          <span className="max-w-[140px] truncate text-xs text-muted-foreground">
            Football · {fixture.leagueName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
            <TeamCrest team={fixture.homeTeam} containerClassName="size-11" imageSize={36} textClassName="text-xs" fallback="skeleton" />
            <span className="w-full truncate text-center text-xs font-semibold">{fixture.homeTeam.name}</span>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-0.5 text-center text-[11px] text-muted-foreground">
            {isLive && score ? (
              <>
                <span className="text-sm font-extrabold tabular-nums text-foreground">{score.home} - {score.away}</span>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#1B7C33] animate-pulse" />
                  <span className="font-semibold text-[#1B7C33]">Live</span>
                  {fixture.minute && <span className="text-[10px]">{fixture.minute}&apos;</span>}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-extrabold text-foreground tabular-nums">{time}</span>
                <span>Today</span>
              </>
            )}
            <span className="font-bold text-primary">1X2</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
            <TeamCrest team={fixture.awayTeam} containerClassName="size-11" imageSize={36} textClassName="text-xs" fallback="skeleton" />
            <span className="w-full truncate text-center text-xs font-semibold">{fixture.awayTeam.name}</span>
          </div>
        </div>
      </Link>

      {oneXTwo && (
        <div className="mt-3 flex gap-2">
          {oneXTwo.selections.map((s) => (
            <OddsButton
              key={s.id}
              variant="compact"
              fixtureId={fixture.id}
              fixtureLabel={fixtureLabel}
              marketId={oneXTwo.id}
              marketName={oneXTwo.name}
              selection={s}
              highlight={s.odds === cheapestOdds}
              className="flex-1 py-1.5"
            />
          ))}
        </div>
      )}
    </div>
  );
}
