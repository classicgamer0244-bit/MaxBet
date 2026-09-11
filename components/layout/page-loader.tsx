"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export function PageLoader() {
  const { authLoading } = useAuth();

  if (!authLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <Image
        src="/logo-name.png"
        alt="MaxBet"
        width={120}
        height={120}
        className="animate-pulse object-contain"
        priority
      />
    </div>
  );
}
