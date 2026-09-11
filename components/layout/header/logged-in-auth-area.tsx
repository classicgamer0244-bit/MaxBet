"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AccountDropdownMenu } from "./account-dropdown-menu";

export function LoggedInAuthArea() {
  const { player, balanceVisible, toggleBalanceVisible, refreshBalance } = useAuth();
  const [spinning, setSpinning] = useState(false);

  if (!player) return null;

  function handleRefresh() {
    setSpinning(true);
    refreshBalance();
    setTimeout(() => setSpinning(false), 500);
  }

  const balanceLabel = balanceVisible ? `${player.currency} ${player.balance.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "••••••";

  return (
    <div className="flex items-center gap-2 text-white">
      {/* Mobile: compact balance pill + Deposit button */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex items-center gap-1.5 rounded-full bg-white/15 py-1 pr-2 pl-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
            <UserRound className="size-3.5" />
          </span>
          <span className="text-xs font-bold tabular-nums">{balanceLabel}</span>
          <button onClick={toggleBalanceVisible} aria-label="Toggle balance visibility" className="text-white/80 hover:text-white">
            {balanceVisible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
          </button>
        </div>
        <Button asChild size="sm" className="bg-white text-primary-700 hover:bg-white/90">
          <Link href="/account/deposit">Deposit</Link>
        </Button>
      </div>

      {/* Desktop: full balance controls + shortcuts + account dropdown */}
      <div className="hidden items-center gap-3 lg:flex">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tabular-nums">{balanceLabel}</span>
          <button onClick={toggleBalanceVisible} aria-label="Toggle balance visibility" className="text-white/80 hover:text-white">
            {balanceVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button onClick={handleRefresh} aria-label="Refresh balance" className="text-white/80 hover:text-white">
            <RefreshCw className={cn("size-4", spinning && "animate-spin")} />
          </button>
        </div>

        <div className="h-5 w-px bg-white/25" />

        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/15 hover:text-white">
          <Link href="/account/deposit">Deposit</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/15 hover:text-white">
          <Link href="/account/bet-history">Bet History</Link>
        </Button>
        <AccountDropdownMenu />
      </div>
    </div>
  );
}
