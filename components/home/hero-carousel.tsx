"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Slide {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  accent: string;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Live Now · In-Play",
    title: "Every Second Counts",
    subtitle: "Follow live scores and cash out before full time.",
    cta: "Explore Live Betting",
    href: "/live-betting",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
    accent: "from-black/85 via-black/55 to-transparent",
  },
  {
    eyebrow: "Weekend Special · Big Odds",
    title: "Champions League Nights",
    subtitle: "Europe's elite clash, pick your winner and win big.",
    cta: "View Markets",
    href: "/sports",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
    accent: "from-black/80 via-black/50 to-transparent",
  },
  {
    eyebrow: "Top Picks · Today's Best",
    title: "Your Winning Bet Awaits",
    subtitle: "Browse today's top markets and place your bet before kick-off.",
    cta: "Bet Now",
    href: "/sports",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&q=80",
    accent: "from-black/80 via-black/50 to-transparent",
  },
];

export function HeroCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  const autoplay = Autoplay({ delay: 5000, stopOnInteraction: true });

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api]);

  const scrollTo = useCallback((i: number) => api?.scrollTo(i), [api]);
  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <div className="relative h-full min-h-[320px] overflow-hidden rounded-lg">
      <Carousel setApi={setApi} plugins={[autoplay]} opts={{ loop: true }} className="h-full">
        <CarouselContent className="h-full">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.title} className="h-full">
              <div className="relative h-full min-h-[320px]">
                {/* Background image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 1024px) 100vw, calc(100vw - 280px)"
                />
                {/* Gradient overlay */}
                <div className={cn("absolute inset-0 bg-gradient-to-r", slide.accent)} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 pl-14 sm:justify-center sm:p-8 sm:pl-16">
                  <span className="mb-2 w-fit rounded-full border border-[#CB2957] bg-[#CB2957]/20 px-3 py-0.5 text-[11px] font-bold tracking-widest text-[#CB2957] uppercase backdrop-blur-sm">
                    {slide.eyebrow}
                  </span>
                  <h2 className="max-w-sm text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl lg:text-4xl">
                    {slide.title}
                  </h2>
                  <p className="mt-2 max-w-xs text-sm text-white/80 drop-shadow-sm">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.href}
                    className="mt-4 w-fit rounded-md bg-[#CB2957] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#b02249]"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Prev / Next arrows */}
      <button
        onClick={scrollPrev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={scrollNext}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
      >
        <ChevronRight className="size-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            onClick={() => scrollTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === selected ? "w-6 bg-[#CB2957]" : "w-1.5 bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
