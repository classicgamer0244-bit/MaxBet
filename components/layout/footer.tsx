import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { BRAND_NAME } from "@/lib/constants";

const QUICK_LINKS = [
  { label: "Sports", href: "/sports" },
  { label: "Live Betting", href: "/live-betting" },
  { label: "Deposit", href: "/account/deposit" },
  { label: "Withdraw", href: "/account/withdraw" },
  { label: "Bet History", href: "/account/bet-history" },
];

const LEGAL_LINKS = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "#" },
  { label: "Responsible Gaming", href: "#" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-black text-white">
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#CB2957] to-transparent" />

      <div className="mx-auto max-w-350 px-4 py-8 lg:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-1 text-xl font-extrabold tracking-tight">
              {BRAND_NAME}<span className="text-[#CB2957]">.</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-white/50">
              Ghana&apos;s trusted sports betting platform. Fast payouts, live odds, best markets.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[#CB2957] text-xs font-extrabold text-[#CB2957]">18+</div>
              <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">
                <ShieldCheck className="size-3.5 text-[#CB2957]" />
                <span className="text-xs font-bold text-white/70">GGL Licensed</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">Legal</h4>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-white">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 text-[11px] font-bold tracking-widest text-white/30 uppercase">Payment Methods</p>
          <div className="flex items-center gap-4">
            <img src="/mtn-momo.png" alt="MTN MoMo" style={{ width: 48, height: 32, objectFit: "fill" }} />
            <img src="/teleccash.png" alt="Telecel Cash" style={{ width: 48, height: 32, objectFit: "fill" }} />
            <img src="/atmomo.jpg" alt="AirtelTigo Money" style={{ width: 48, height: 32, objectFit: "fill" }} />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="mb-3 text-xs leading-relaxed text-white/30">
            {BRAND_NAME} is licensed and regulated by the Gaming Commission of Ghana (GCG). Gambling is only permitted for persons aged 18 and above. Please gamble responsibly.
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/25">© {new Date().getFullYear()} {BRAND_NAME} Ghana Ltd. All rights reserved.</p>
            <div className="flex gap-3">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.label} href={l.href} className="text-xs text-white/25 hover:text-white/50">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
