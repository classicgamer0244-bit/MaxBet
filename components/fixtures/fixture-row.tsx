"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Fixture } from "@/types";
import { OddsButton } from "@/components/odds/odds-button";
import { LiveBadge } from "./live-badge";
import { formatKickoffTime } from "@/lib/format-date";
import { GoalsLineSelect, type GoalsLine } from "./goals-line-select";

export function FixtureRow({
  fixture,
  showGoalsColumn = false,
  dark = false,
}: {
  fixture: Fixture;
  showGoalsColumn?: boolean;
  dark?: boolean;
}) {
  const [goalsLine, setGoalsLine] = useState<GoalsLine>("2.5");

  const fixtureLabel = `${fixture.homeTeam.name} vs ${fixture.awayTeam.name}`;
  const oneXTwo = fixture.markets.find((m) => m.name === "1X2");
  const goalsMarket = fixture.markets.find((m) => m.name === `Total ${goalsLine}`);
  const isLive = fixture.status === "live" || fixture.status === "halftime";
  const otherMarketsCount = fixture.markets.length - (oneXTwo ? 1 : 0) - (showGoalsColumn && goalsMarket ? 1 : 0);

  const rowBorder = dark ? "border-white/10" : "border-border";
  const teamText = dark ? "text-white group-hover:text-[#CB2957]" : "text-foreground group-hover:text-[#CB2957]";
  const mutedText = dark ? "text-white/40" : "text-muted-foreground";
  const moreLink = dark ? "text-white/40 hover:text-[#CB2957]" : "text-muted-foreground hover:text-[#CB2957]";

  return (
    <div className={`flex min-w-[720px] items-center gap-3 border-b ${rowBorder} px-4 py-3 last:border-b-0`}>
      {/* Time / minute */}
      <div className="w-16 shrink-0 text-xs">
        {isLive ? (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-live tabular-nums">{fixture.minute}</span>
            <span className={mutedText}>{fixture.period}</span>
            <LiveBadge />
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            <span className={`font-medium tabular-nums ${dark ? "text-white" : "text-foreground"}`}>
              {formatKickoffTime(fixture.kickoffAt)}
            </span>
            <span className={mutedText}>ID:</span>
            <span className={`tabular-nums ${mutedText}`}>{fixture.gameId}</span>
          </div>
        )}
      </div>

      {/* Teams */}
      <Link href={`/sports/${fixture.id}`} className="min-w-[9rem] flex-1 group">
        <div className={`flex flex-col gap-1 text-sm font-medium transition-colors ${teamText}`}>
          <span className="truncate">{fixture.homeTeam.name}</span>
          <span className="truncate">{fixture.awayTeam.name}</span>
        </div>
      </Link>

      {/* Score */}
      {isLive && fixture.score && (
        <div className={`flex w-6 shrink-0 flex-col gap-1 text-xs font-bold tabular-nums ${dark ? "text-white" : "text-foreground"}`}>
          <span>{fixture.score.home}</span>
          <span>{fixture.score.away}</span>
        </div>
      )}

      {/* 1X2 odds */}
      {oneXTwo && (
        <div className="flex w-52 shrink-0 gap-1.5">
          {oneXTwo.selections.map((s) => (
            <OddsButton
              key={s.id}
              variant="compact"
              fixtureId={fixture.id}
              fixtureLabel={fixtureLabel}
              marketId={oneXTwo.id}
              marketName={oneXTwo.name}
              selection={s}
              dark={dark}
            />
          ))}
        </div>
      )}

      {/* Goals market — each row picks its own line independently */}
      {showGoalsColumn && (
        <div className="flex w-56 shrink-0 items-center gap-1.5">
          <GoalsLineSelect value={goalsLine} onChange={setGoalsLine} dark={dark} />
          {goalsMarket?.selections.map((s) => (
            <OddsButton
              key={s.id}
              variant="compact"
              fixtureId={fixture.id}
              fixtureLabel={fixtureLabel}
              marketId={goalsMarket.id}
              marketName={goalsMarket.name}
              selection={s}
              dark={dark}
            />
          ))}
        </div>
      )}

      {/* More markets */}
      <Link href={`/sports/${fixture.id}`} className={`flex shrink-0 items-center gap-0.5 text-xs font-semibold transition-colors ${moreLink}`}>
        +{otherMarketsCount}
        <ChevronRight className="size-3.5" />
      </Link>
    </div>
  );
}
