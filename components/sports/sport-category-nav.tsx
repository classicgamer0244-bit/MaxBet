"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSports } from "@/data/selectors";
import { cn } from "@/lib/utils";

const MORE_SPORTS = ["Rugby", "Volleyball", "Table Tennis", "MMA", "Golf", "Darts", "Snooker", "Boxing"];
const FILTERABLE_PATHS = ["/sports", "/live-betting"];

export function SportCategoryNav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sports = getSports();

  const isFilterable = FILTERABLE_PATHS.includes(pathname);
  const activeSport = searchParams.get("sport") ?? "football";

  function handleSportClick(slug: string) {
    if (isFilterable) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sport", slug);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    } else {
      router.push(`/sports?sport=${slug}`);
    }
  }

  return (
    <>
      <div className={cn("flex flex-col lg:hidden", pathname === "/sports" && "hidden")}>
        <div className="flex items-center gap-4 overflow-x-auto py-2">
          <Link href="/" className="text-sm font-extrabold text-foreground">
            Featured
          </Link>
          <span className="text-sm text-border">|</span>
          <Link href="/sports" className="text-sm font-bold text-primary">
            Matches
          </Link>
          <Link href="/games" className="text-sm font-bold text-primary">
            Games
          </Link>
          <Link href="/codes" className="text-sm font-bold text-primary">
            Codes
          </Link>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {sports.map((sport) => {
            const isActive = isFilterable && activeSport === sport.slug;
            return (
              <button
                key={sport.slug}
                onClick={() => handleSportClick(sport.slug)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap",
                  isActive ? "text-[#CB2957] font-bold bg-[#CB2957]/10" : "text-foreground/80 hover:bg-[#DDDDDD] hover:text-foreground"
                )}
              >
                {sport.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="hidden items-center gap-1 overflow-x-auto py-1 lg:flex">
        <Link
          href="/"
          className={cn(
            "shrink-0 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap",
            pathname === "/" ? "text-[#CB2957] font-bold" : "text-foreground/80 hover:bg-[#DDDDDD] hover:text-foreground"
          )}
        >
          Home
        </Link>
        {sports.map((sport) => {
          const isActive = isFilterable && activeSport === sport.slug;
          return (
            <button
              key={sport.slug}
              onClick={() => handleSportClick(sport.slug)}
              className={cn(
                "shrink-0 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap",
                isActive ? "text-[#CB2957] font-bold" : "text-foreground/80 hover:bg-[#DDDDDD] hover:text-foreground"
              )}
            >
              {sport.name}
            </button>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex shrink-0 items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap text-foreground/80 hover:bg-[#DDDDDD] hover:text-foreground">
            More Sports
            <ChevronDown className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {MORE_SPORTS.map((label) => (
              <DropdownMenuItem key={label} disabled>
                {label}
                <span className="ml-auto text-[10px] text-muted-foreground">Soon</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
