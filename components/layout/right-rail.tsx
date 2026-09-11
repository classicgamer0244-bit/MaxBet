"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/use-ui";
import { BetslipPanel } from "@/components/betslip/betslip-panel";
import { MiniGamesTeaser } from "@/components/home/mini-games-teaser";
import { GrandPrizeWinners } from "@/components/home/grand-prize-winners";

function InstantRegistrationCard() {
  const { openRegister } = useUI();
  const [phone, setPhone] = useState("");

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-bold text-foreground">Instant Registration</h3>
      <div className="mb-2 flex">
        <span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-2 text-sm font-semibold">
          +233
        </span>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Mobile Number"
          inputMode="numeric"
          className="rounded-l-none"
        />
      </div>
      <Button onClick={openRegister} className="w-full">
        Register
      </Button>
    </div>
  );
}

function InstantVirtualsPromo() {
  return (
    <button
      type="button"
      onClick={() => toast.info("Instant Virtuals is coming soon.")}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-lg bg-[#CB2957] px-4 py-10 text-center text-white transition-colors hover:bg-[#b02249]"
    >
      <Zap className="size-7" />
      <span className="text-lg font-extrabold">INSTANT VIRTUALS</span>
    </button>
  );
}

export function RightRail() {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex flex-col gap-4">
      {!isLoggedIn && (
        <div className="hidden lg:block">
          <InstantRegistrationCard />
        </div>
      )}
      <div className="hidden lg:block">
        <BetslipPanel />
      </div>
      {isHome && (
        <>
          <div className="hidden lg:block">
            <MiniGamesTeaser />
          </div>
          <GrandPrizeWinners />
          <div className="hidden lg:block">
            <InstantVirtualsPromo />
          </div>
        </>
      )}
    </div>
  );
}
