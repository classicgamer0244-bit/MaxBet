import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";

const LINKS = [
  { label: "Today's Football", href: "/sports?tab=today", hot: true },
  { label: "Upcoming Football", href: "/sports?tab=upcoming", hot: false },
  { label: "Brasileiro Serie A", href: "/sports?league=brasileiro-serie-a", hot: false },
  { label: "CONMEBOL Sudamericana", href: "/sports?league=conmebol-sudamericana", hot: false },
  { label: "MLS", href: "/sports?league=mls", hot: false },
  { label: "USL Championship", href: "/sports?league=usl-championship", hot: false },
  { label: "UEFA Champions League", href: "/sports?league=ucl", hot: true },
  { label: "Premier League", href: "/sports?league=premier-league", hot: false },
];

export function PopularLinksPanel() {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-lg bg-black">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <Flame className="size-4 text-[#CB2957]" />
        <span className="text-sm font-bold text-white">Popular</span>
      </div>

      {/* Links — grow to fill remaining height */}
      <ul className="flex flex-1 flex-col divide-y divide-white/5">
        {LINKS.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-[#DDDDDD] transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="flex items-center gap-2 truncate">
                {link.hot && (
                  <span className="shrink-0 rounded-sm bg-[#CB2957] px-1 py-px text-[9px] font-bold tracking-wide text-white uppercase">
                    HOT
                  </span>
                )}
                <span className="truncate">{link.label}</span>
              </span>
              <ChevronRight className="size-3.5 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" />
            </Link>
          </li>
        ))}
      </ul>

      {/* Footer CTA */}
      <div className="border-t border-white/10 px-4 py-3">
        <Link
          href="/sports"
          className="block w-full rounded-md bg-white/10 py-2 text-center text-xs font-semibold text-[#DDDDDD] transition-colors hover:bg-white/15 hover:text-white"
        >
          View All Sports
        </Link>
      </div>
    </div>
  );
}
