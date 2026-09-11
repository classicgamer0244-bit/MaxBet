import type { Fixture } from "@/types";
import { FixtureRow } from "./fixture-row";
import { FixtureColumnHeader } from "./fixture-column-header";
import { dateKey, formatDateHeader } from "@/lib/format-date";

function groupFixturesByDate(fixtures: Fixture[]) {
  const order: string[] = [];
  const map = new Map<string, Fixture[]>();
  for (const f of fixtures) {
    const key = dateKey(f.kickoffAt);
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(f);
  }
  return order.map((key) => ({ key, label: formatDateHeader(map.get(key)![0].kickoffAt), fixtures: map.get(key)! }));
}

export function CompetitionGroup({
  leagueName,
  fixtures,
  showGoalsColumn = false,
  groupByDate = false,
  dark = false,
}: {
  leagueName: string;
  fixtures: Fixture[];
  showGoalsColumn?: boolean;
  groupByDate?: boolean;
  dark?: boolean;
}) {
  const dateGroups = groupByDate ? groupFixturesByDate(fixtures) : [{ key: "all", label: "", fixtures }];

  return (
    <div>
      <div
        className={
          dark
            ? "bg-white/5 px-4 py-2 text-[11px] font-bold tracking-widest text-white/40 uppercase"
            : "bg-muted/60 px-4 py-2 text-xs font-bold tracking-wide text-muted-foreground uppercase"
        }
      >
        {leagueName}
      </div>
      {dateGroups.map((group) => (
        <div key={group.key}>
          {groupByDate && <FixtureColumnHeader date={group.label} showGoalsColumn={showGoalsColumn} />}
          {group.fixtures.map((fixture) => (
            <FixtureRow key={fixture.id} fixture={fixture} showGoalsColumn={showGoalsColumn} dark={dark} />
          ))}
        </div>
      ))}
    </div>
  );
}
