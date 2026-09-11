import Link from "next/link";
import { Dice5, Disc3, Layers, Sparkles } from "lucide-react";
import { getGames } from "@/data/selectors";
import { cn } from "@/lib/utils";

const ICONS = [Dice5, Disc3, Layers, Sparkles];

export function MiniGamesTeaser() {
  const games = getGames().slice(0, 4);

  return (
    <div className="rounded-lg bg-black p-4 text-white">
      <h3 className="mb-3 text-sm font-bold">Mini Games</h3>
      <div className="grid grid-cols-2 gap-2">
        {games.map((game, i) => {
          const Icon = ICONS[i % ICONS.length];
          return (
            <Link
              key={game.id}
              href="/games"
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-md bg-white/10 px-2 py-4 text-center text-xs font-semibold text-[#EEEEEE] hover:bg-white/15",
                game.comingSoon && "opacity-60"
              )}
            >
              <Icon className="size-5" />
              {game.name}
            </Link>
          );
        })}
      </div>
      <Link
        href="/games"
        className="mt-3 block w-full rounded-md bg-[#CB2957] py-2 text-center text-sm font-bold text-white hover:bg-[#b02249] transition-colors"
      >
        Discover more games
      </Link>
    </div>
  );
}
