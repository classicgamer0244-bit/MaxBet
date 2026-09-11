"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBetslip } from "@/hooks/use-betslip";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/use-ui";
import { CURRENCY, MIN_BET_AMOUNT } from "@/lib/constants";
import { getMultiBonusPercent } from "@/lib/betslip-labels";
import { BetslipSelectionRow } from "./betslip-selection-row";
import { BookingCodeInput } from "./booking-code-input";
import { BookingSuccessModal, type BookingSuccessInfo } from "./booking-success-modal";
import { CashoutTab } from "./cashout-tab";

async function readJson(res: Response) {
  return res.json().catch(() => null);
}

export function BetslipPanel() {
  const { selectionList, count, stake, setStake, totalOdds, potentialWinnings, mode, clearAll } = useBetslip();
  const { player, refreshBalance } = useAuth();
  const { openLogin } = useUI();
  const [isBusy, setIsBusy] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<BookingSuccessInfo | null>(null);

  const fmt = (n: number) => n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bonusPercent = getMultiBonusPercent(count);
  const bonusAmount = (potentialWinnings * bonusPercent) / 100;
  const totalPotentialWin = potentialWinnings + bonusAmount;

  function selectionRefs() {
    return selectionList.map((s) => ({ fixtureId: s.fixtureId, marketId: s.marketId, selectionId: s.selectionId }));
  }

  async function handlePlaceBet() {
    if (!player) {
      toast.info("Log in to place this bet.");
      openLogin();
      return;
    }
    if (stake < MIN_BET_AMOUNT) {
      toast.error(`Minimum stake is ${CURRENCY} ${MIN_BET_AMOUNT.toLocaleString()}.`);
      return;
    }
    setIsBusy(true);
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: selectionRefs(), stake, mode }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't place that bet.");
        return;
      }
      toast.success(`${mode === "SIM" ? "Simulated bet" : "Bet"} placed: ${CURRENCY} ${stake.toFixed(2)} on ${count} selection${count === 1 ? "" : "s"}.`);
      clearAll();
      setStake(0);
      await refreshBalance();
      window.dispatchEvent(new Event("bets:placed"));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleBookBet() {
    if (count === 0) return;
    setIsBusy(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selections: selectionRefs() }),
      });
      const data = await readJson(res);
      if (!res.ok) {
        toast.error(data?.error ?? "Couldn't save that betslip.");
        return;
      }
      setBookingInfo({ code: data.code, count, totalOdds, expiresAt: data.expiresAt });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card/60 backdrop-blur-sm">
      <Tabs defaultValue="betslip">
        <TabsList variant="line" className="w-full justify-start gap-4 border-b border-border px-3 pt-1">
          <TabsTrigger value="betslip" className="gap-1.5 py-2.5 text-sm font-semibold">
            Betslip
            {count > 0 && <Badge className="h-4 min-w-4 rounded-full px-1 text-[10px]">{count}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="cashout" className="py-2.5 text-sm font-semibold">
            Cashout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="betslip" className="p-3">
          <div className="mb-3 flex items-center justify-between">
            {/* SIM is retired now the platform is live — every bet is real
                money. The control keeps its original REAL/SIM labels and
                layout, but SIM is permanently inactive: it can't be selected,
                and the server ignores whatever mode a client sends anyway
                (app/api/bets/route.ts). Leaving it selectable is what let
                players place simulated bets for days without realising, since
                the choice persisted in localStorage and no screen showed it. */}
            <div className="inline-flex rounded-md border border-border p-0.5 text-xs font-bold">
              <span className="rounded bg-[#CB2957] px-2.5 py-1 text-white">REAL</span>
              <span
                aria-disabled="true"
                title="SIM mode is no longer available — all bets are real money."
                className="cursor-not-allowed rounded px-2.5 py-1 text-muted-foreground/40"
              >
                SIM
              </span>
            </div>
            {selectionList.length > 0 && (
              <button onClick={clearAll} className="text-sm font-semibold text-[#CB2957] hover:underline">
                Remove All
              </button>
            )}
          </div>

          {selectionList.length === 0 ? (
            <BookingCodeInput />
          ) : (
            <div className="flex flex-col">
              <div className="max-h-72 overflow-y-auto">
                {selectionList.map((s) => (
                  <BetslipSelectionRow key={s.key} selection={s} />
                ))}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Type</span>
                <span className="text-xs font-semibold text-muted-foreground">No.</span>
                <span className="text-xs font-semibold text-muted-foreground">Stake ({CURRENCY})</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-2">
                <span className="text-sm font-bold text-foreground">{count > 1 ? "Multiple" : "Single"}</span>
                <span className="text-sm font-bold text-foreground">{count}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={stake || ""}
                  onChange={(e) => setStake(Number(e.target.value) || 0)}
                  className="text-base"
                  placeholder="0"
                />
              </div>


              <div className="mt-3 flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Odds</span>
                  <span className="font-bold text-foreground tabular-nums">{fmt(totalOdds)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Stake</span>
                  <span className="font-bold text-foreground tabular-nums">{fmt(stake)}</span>
                </div>
                {bonusPercent > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max bonus ({bonusPercent}%)</span>
                    <span className="font-bold text-success tabular-nums">{fmt(bonusAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Win</span>
                  <span className="font-bold text-foreground tabular-nums">{fmt(totalPotentialWin)}</span>
                </div>
              </div>

              <Button onClick={handlePlaceBet} disabled={isBusy || stake < MIN_BET_AMOUNT} className="mt-3 h-11 w-full text-base">
                {isBusy
                  ? <div className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : stake > 0 && stake < MIN_BET_AMOUNT ? `Min. stake is ${CURRENCY} ${MIN_BET_AMOUNT.toLocaleString()}` : "Place Bet"
                }
              </Button>

              <div className="mt-2 flex items-center text-sm font-semibold">
                <button onClick={handleBookBet} disabled={isBusy} className="text-success hover:underline disabled:opacity-50">
                  Book Bet
                </button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cashout">
          <CashoutTab />
        </TabsContent>
      </Tabs>

      <BookingSuccessModal info={bookingInfo} onOpenChange={(open) => !open && setBookingInfo(null)} />
    </div>
  );
}
