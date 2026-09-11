"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BetslipMobileFab } from "@/components/betslip/betslip-mobile-fab";
import { BetslipMobileDrawer } from "@/components/betslip/betslip-mobile-drawer";
import { AccountStatusGate } from "@/components/common/account-status-gate";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { isOperatorPath } from "@/lib/layout/operator-path";

/**
 * The betting-site chrome (header/footer/bottom-nav/betslip). Suppressed on
 * operator paths (/admin, /superadmin), which bring their own dark dashboard
 * shell. The root layout can only ADD chrome, so this pathname check is the
 * one lever for stripping it.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isOperatorPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollToTop />
      <Header />
      <div className="flex-1 pb-14 lg:pb-0">
        <AccountStatusGate>{children}</AccountStatusGate>
      </div>
      <Footer />
      <MobileBottomNav />
      <BetslipMobileFab />
      <BetslipMobileDrawer />
    </>
  );
}
