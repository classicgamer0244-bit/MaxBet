import { HeroCarousel } from "@/components/home/hero-carousel";
import { PopularLinksPanel } from "@/components/home/popular-links-panel";
import { VirtualWorldBanner, JackpotBanner } from "@/components/home/promo-banners";
import { MobileLeagueChips } from "@/components/home/mobile-league-chips";
import { LiveBettingWidget } from "@/components/home/live-betting-widget";
import { FeaturedFixtures, HighlightsSection } from "@/components/home/home-page-client";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-4 pb-4">
      <MobileLeagueChips />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr] lg:items-stretch">
        <div className="order-2 hidden lg:order-1 lg:flex">
          <PopularLinksPanel />
        </div>
        <div className="order-1 hidden lg:order-2 lg:block">
          <HeroCarousel />
        </div>
      </div>

      <FeaturedFixtures />

      <div className="hidden lg:block">
        <VirtualWorldBanner />
      </div>

      <LiveBettingWidget />

      <HighlightsSection />

      <div className="hidden lg:block">
        <JackpotBanner />
      </div>
    </div>
  );
}
