"use client";

import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { BetslipProvider } from "@/context/betslip-context";
import { UIProvider } from "@/context/ui-context";
import { OpenBetsProvider } from "@/context/open-bets-context";
import { LiveFeedProvider } from "@/context/live-feed-context";
import { ReferralCapture } from "@/components/auth/referral-capture";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <OpenBetsProvider>
        <LiveFeedProvider>
          <BetslipProvider>
            <UIProvider>
              <Suspense fallback={null}>
                <ReferralCapture />
              </Suspense>
              {children}
            </UIProvider>
          </BetslipProvider>
        </LiveFeedProvider>
      </OpenBetsProvider>
    </AuthProvider>
  );
}
