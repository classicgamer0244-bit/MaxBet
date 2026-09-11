"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { useUI } from "@/hooks/use-ui";

export function LoggedOutAuthArea() {
  const { login, isBusy, error } = useAuth();
  const { openLogin, openRegister, openForgotPassword } = useUI();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  async function handleQuickLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim() || !password) return;
    const ok = await login(phone, password);
    if (ok) {
      setPhone("");
      setPassword("");
    }
  }

  return (
    <>
      {/* Desktop: inline quick-login */}
      <form onSubmit={handleQuickLogin} className="hidden items-center gap-2 lg:flex">
        <div className="flex items-center overflow-hidden rounded-md bg-white/15">
          <span className="border-r border-white/20 px-2 py-1.5 text-sm font-medium text-white">+233</span>
          <input
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
              setPhone(digits);
            }}
            placeholder="Mobile Number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className="w-32 bg-transparent px-2 py-1.5 text-sm text-white placeholder:text-white/70 outline-none"
          />
        </div>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-28 rounded-md bg-white/15 px-2 py-1.5 pr-8 text-sm text-white placeholder:text-white/70 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-white/70 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          </button>
        </div>
        {error && <span className="max-w-40 text-xs font-medium text-red-100">{error}</span>}
        <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-white/90">
          <Checkbox
            checked={keepSignedIn}
            onCheckedChange={(v) => setKeepSignedIn(v === true)}
            className="border-white/50 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-[#CB2957]"
          />
          Keep me signed in
        </label>
        <button
          type="button"
          onClick={openForgotPassword}
          className="whitespace-nowrap text-xs font-medium text-white/90 hover:text-white hover:underline"
        >
          Forgot Password?
        </button>
        <Button type="submit" variant="ghost" size="sm" disabled={isBusy} className="text-white hover:bg-white/15 hover:text-white">
          {isBusy ? <Loader2 className="size-4 animate-spin" /> : "Login"}
        </Button>
        <Button type="button" onClick={openRegister} size="sm" className="bg-[#CB2957] text-white hover:bg-[#b02249]">
          Register
        </Button>
      </form>

      {/* Mobile: compact buttons that open the full modal */}
      <div className="flex items-center gap-2 lg:hidden">
        <Button type="button" onClick={openLogin} variant="ghost" size="sm" className="text-white hover:bg-white/15 hover:text-white">
          Login
        </Button>
        <Button type="button" onClick={openRegister} size="sm" className="bg-[#CB2957] text-white hover:bg-[#b02249]">
          Register
        </Button>
      </div>
    </>
  );
}
