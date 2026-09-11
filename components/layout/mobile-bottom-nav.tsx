"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Gamepad2, Ticket, User } from "lucide-react";
import { useUI } from "@/hooks/use-ui";
import { useAuth } from "@/hooks/use-auth";
import { useOpenBets } from "@/hooks/use-open-bets";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useUI();
  const { isLoggedIn } = useAuth();
  const { openBets } = useOpenBets();
  const openCount = isLoggedIn ? openBets.length : 0;

  const isTicketDetails = pathname.startsWith("/account/bet-history/");

  if (isTicketDetails) return null;

  const itemClass = (active: boolean) =>
    cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium", active ? "text-primary-600" : "text-zinc-500");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex items-center border-t border-[#DDDDDD] bg-white px-1 pb-[env(safe-area-inset-bottom)] lg:hidden"
      aria-label="Primary"
    >
      <Link href="/" aria-label="Home" className={itemClass(pathname === "/")}>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-full text-xs font-extrabold text-white",
            pathname === "/" ? "bg-primary-600" : "bg-zinc-800"
          )}
        >
          M
        </span>
        Home
      </Link>

      <Link href="/sports" className={itemClass(pathname.startsWith("/sports"))}>
        <Menu className="size-5" />
        AZ Menu
      </Link>

      <Link href="/games" className={itemClass(pathname.startsWith("/games"))}>
        <Gamepad2 className="size-5" />
        Games
      </Link>

      <Link href="/account/bet-history" className={itemClass(pathname === "/account/bet-history")}>
        <span className="relative inline-flex">
          <Ticket className="size-5" />
          {openCount > 0 && (
            <span className="absolute -top-2 -right-2 flex min-w-4 h-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
              {openCount}
            </span>
          )}
        </span>
        My Bets
      </Link>

      <Link href="/account" className={itemClass(pathname.startsWith("/account") && pathname !== "/account/bet-history")}>
        <span className="relative">
          <User className="size-5" />
          {isLoggedIn && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[#CB2957]" />}
        </span>
        Me
      </Link>
    </nav>
  );
}
