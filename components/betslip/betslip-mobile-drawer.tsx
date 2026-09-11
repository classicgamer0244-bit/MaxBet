"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useBetslip } from "@/hooks/use-betslip";
import { BetslipPanel } from "./betslip-panel";

export function BetslipMobileDrawer() {
  const { mobileOpen, setMobileOpen, count } = useBetslip();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  if (!mobileOpen) return null;

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={() => setMobileOpen(false)}
      />
      {/* Sheet — fixed height, not affected by keyboard */}
      <div
        className="fixed bottom-0 inset-x-0 z-50 flex flex-col rounded-t-xl bg-popover"
        style={{ height: count > 0 ? "75vh" : "auto", maxHeight: "75vh" }}
      >
        {/* Handle */}
        <div className="mx-auto mt-3 h-1 w-24 shrink-0 rounded-full bg-muted" />
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <span className="text-base font-medium text-foreground">Betslip</span>
          <button onClick={() => setMobileOpen(false)} aria-label="Close betslip">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <BetslipPanel />
        </div>
      </div>
    </div>
  );
}
