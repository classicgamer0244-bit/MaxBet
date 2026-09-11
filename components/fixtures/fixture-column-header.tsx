export function FixtureColumnHeader({
  date,
  showGoalsColumn = false,
}: {
  date: string;
  showGoalsColumn?: boolean;
}) {
  return (
    <div className="flex min-w-[720px] items-center gap-3 border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold text-muted-foreground">
      <div className="w-16 shrink-0 uppercase">{date}</div>
      <div className="min-w-[9rem] flex-1" />
      <div className="flex w-52 shrink-0 gap-1.5 uppercase">
        <span className="flex-1 text-center">1</span>
        <span className="flex-1 text-center">X</span>
        <span className="flex-1 text-center">2</span>
      </div>
      {showGoalsColumn && (
        <div className="flex w-56 shrink-0 items-center gap-1.5 uppercase">
          <span className="w-20 shrink-0 text-center">Goals</span>
          <span className="flex-1 text-center">Over</span>
          <span className="flex-1 text-center">Under</span>
        </div>
      )}
      <div className="w-12 shrink-0" />
    </div>
  );
}
