"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, Home, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NavPrimary } from "@/components/layout/nav-primary";
import { LoggedInAuthArea } from "./logged-in-auth-area";
import { LoggedOutAuthArea } from "./logged-out-auth-area";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/use-ui";
import { useCurrentAdmin } from "@/hooks/use-current-admin";
import { DEFAULT_COUNTRY_FLAG, PRIMARY_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

function AuthAreaSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="h-7 w-24 rounded-full bg-white/20" />
        <div className="h-7 w-16 rounded-md bg-white/20" />
      </div>
      <div className="hidden items-center gap-2 lg:flex">
        <div className="h-7 w-32 rounded-md bg-white/20" />
        <div className="h-7 w-24 rounded-md bg-white/20" />
        <div className="h-7 w-20 rounded-md bg-white/20" />
        <div className="h-7 w-8 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

export function Header() {
  const { isLoggedIn, authLoading } = useAuth();
  const { mobileMenuOpen, setMobileMenuOpen, openSearch } = useUI();
  const { currentAdmin } = useCurrentAdmin();
  const pathname = usePathname();
  const isSports = pathname.startsWith("/sports");
  const isBetHistory = pathname === "/account/bet-history";
  const isTicketDetails = pathname.startsWith("/account/bet-history/");
  const isAccountPage = pathname.startsWith("/account");
  const isAccountMe = pathname === "/account";

  if (isTicketDetails) return null;

  const brandHref =
    currentAdmin?.role === "superadmin" ? "/superadmin" : currentAdmin?.role === "admin" ? "/admin" : "/";

  return (
    <>
      <header className={cn("sticky top-0 z-40 shadow-sm", isAccountPage && !isAccountMe && "hidden lg:block")}>
        {/* Dark mobile bar — sports page (with title) and account me page (no title) */}
        {(isSports || isAccountMe) && (
          <div className="flex items-center justify-between bg-[#161A1F] px-4 py-3 lg:hidden">
            <Link href="/" aria-label="Go back" className="text-white">
              <ArrowLeft className="size-5" />
            </Link>
            {isSports && (
              <button
                onClick={() => toast.info("Sport selection coming soon")}
                className="flex items-center gap-1.5 text-base font-bold text-white"
              >
                Football
              </button>
            )}
            <div className="flex items-center gap-4 text-white">
              <Link href="/" aria-label="Home">
                <Home className="size-5" />
              </Link>
            </div>
          </div>
        )}

        {/* Main black header — hidden on mobile for sports/bet-history/account-me */}
        <div className={cn("bg-black", (isSports || isBetHistory || isAccountMe) ? "hidden lg:block" : "")}>
          <div className="mx-auto flex max-w-350 items-center justify-between gap-3 px-3 py-4 lg:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <Link href={brandHref} className="shrink-0 flex items-center">
                <span className="text-sm font-extrabold tracking-widest text-white uppercase">
                  <span className="text-[#CB2957]"><span className="text-lg">M</span>ax</span><span className="text-lg">B</span>et
                </span>
              </Link>
              <div className="hidden items-center gap-1 whitespace-nowrap text-xs font-medium text-white/90 md:flex">
                <span>{DEFAULT_COUNTRY_FLAG}</span>
                <span>Ghana</span>
                <ChevronDown className="size-3" />
              </div>
            </div>
            <div className="flex min-w-0 items-center justify-end gap-1">
              <button
                type="button"
                onClick={openSearch}
                aria-label="Search"
                className="rounded-full p-1.5 text-white/90 hover:bg-white/15 hover:text-white lg:hidden"
              >
                <Search className="size-4" />
              </button>
              {authLoading ? <AuthAreaSkeleton /> : isLoggedIn ? <LoggedInAuthArea /> : <LoggedOutAuthArea />}
            </div>
          </div>
        </div>

        <div className="hidden border-b border-[#DDDDDD] bg-[#EEEEEE] lg:block">
          <div className="mx-auto max-w-350 px-6">
            <NavPrimary />
          </div>
        </div>
      </header>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-primary">AZ Menu</SheetTitle>
              <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="text-muted-foreground">
                <X className="size-5" />
              </button>
            </div>
          </SheetHeader>
          <nav className="flex flex-col gap-0.5 p-3">
            {PRIMARY_NAV.map((item) => {
              const isActive = item.enabled && (pathname === item.href || pathname.startsWith(`${item.href}/`));
              return (
                <Link
                  key={item.label}
                  href={item.enabled ? item.href : "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive ? "bg-[#CB2957]/10 text-[#CB2957]" : "text-foreground hover:bg-[#DDDDDD]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
