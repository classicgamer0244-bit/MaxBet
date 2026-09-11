import { Suspense } from "react";
import { SportCategoryNav } from "@/components/sports/sport-category-nav";
import { RightRail } from "@/components/layout/right-rail";

export default function RailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-350 px-2 lg:px-6">
      <div className="border-b border-[#DDDDDD] bg-[#EEEEEE]">
        <Suspense fallback={<div className="h-11" />}>
          <SportCategoryNav />
        </Suspense>
      </div>
      <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">{children}</div>
        <aside className="w-full shrink-0 lg:w-80">
          <RightRail />
        </aside>
      </div>
    </div>
  );
}
