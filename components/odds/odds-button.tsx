"use client";

import { ChevronDown, ChevronUp, Lock } from "lucide-react";
import type { Selection } from "@/types";
import { useBetslip } from "@/hooks/use-betslip";
import { cn } from "@/lib/utils";
import { displaySelectionLabel } from "@/lib/betslip-labels";

export interface OddsButtonProps {
  fixtureId: string;
  fixtureLabel: string;
  marketId: string;
  marketName: string;
  selection: Selection;
  variant?: "compact" | "detailed";
  dark?: boolean;
  /** Cosmetic "best odds / featured pick" tint — independent of betslip selection. */
  highlight?: boolean;
  className?: string;
}

export function OddsButton({
  fixtureId,
  fixtureLabel,
  marketId,
  marketName,
  selection,
  variant = "detailed",
  dark = false,
  highlight = false,
  className,
}: OddsButtonProps) {
  const { isSelected, toggleSelection } = useBetslip();
  const selected = isSelected(fixtureId, marketId, selection.id);

  if (selection.suspended) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center border",
          !className?.includes("rounded") && "rounded-md",
          !className?.includes("h-") && "min-h-11",
          dark
            ? "border-white/10 bg-white/5 text-white/30"
            : "border-border bg-muted text-muted-foreground",
          className
        )}
        aria-label={`${selection.label} suspended`}
      >
        <Lock className="size-4" />
      </div>
    );
  }

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleSelection({
      fixtureId,
      fixtureLabel,
      marketId,
      marketName,
      selectionId: selection.id,
      selectionLabel: selection.label,
      odds: selection.odds,
    });
  }

  const idleClass = dark
    ? "border-white/15 bg-white/10 text-white hover:border-[#CB2957]/60 hover:bg-[#CB2957]/15"
    : "border-[#CB2957]/30 bg-[#CB2957]/10 text-foreground shadow-sm hover:border-[#CB2957]/60 hover:bg-[#CB2957]/20";
  const highlightClass = dark
    ? "border-primary-500/60 bg-primary-500/20 text-white"
    : "border-primary-300 bg-primary-50 text-primary-800";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      className={cn(
        "flex items-center justify-center gap-1 border text-xs font-semibold transition-colors px-1.5 py-1",
        !className?.includes("rounded") && "rounded-md",
        !className?.includes("h-") && "min-h-8",
        selected ? "border-[#CB2957] bg-[#CB2957] text-white" : highlight ? highlightClass : idleClass,
        className
      )}
    >
      {(variant === "detailed") && (
        <span className={cn("text-[11px] font-medium", selected ? "text-white/85" : dark ? "text-white/50" : "text-muted-foreground")}>
          {displaySelectionLabel(marketName, selection.label)}
        </span>
      )}
      <span className="flex items-center justify-center gap-0.5 tabular-nums">
        <span>{selection.odds.toFixed(2)}</span>
        {selection.trend === "up" && <ChevronUp className={cn("size-3 shrink-0", selected ? "text-white" : "text-green-500")} />}
        {selection.trend === "down" && <ChevronDown className={cn("size-3 shrink-0", selected ? "text-white" : "text-red-500")} />}
      </span>
    </button>
  );
}
