"use client";

import React, { useEffect, useRef } from "react";
import { Lightbulb, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Idea {
  id: number;
  title: string;
  category: string;
  summary: string;
  author: string;
  time: string;
  views: string;
  likes: string;
  comments: string;
  rating: string;
  trending: boolean;
  imageUrl: string;
}

interface Props {
  ideas: Idea[];
}

const TrendingCarousel: React.FC<Props> = ({ ideas }) => {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll effect
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let scrollAmount = 0;
    const scrollStep = 1.5; // slightly faster
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;

    const autoScroll = setInterval(() => {
      if (scrollAmount >= maxScroll) {
        scrollAmount = 0;
        carousel.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollAmount += scrollStep;
        carousel.scrollBy({ left: scrollStep, behavior: "smooth" });
      }
    }, 20);

    return () => clearInterval(autoScroll);
  }, []);

  return (
    <section className="bg-gradient-to-b mx-[4vw] md:mx-[10vw] from-bg via-surface/50 py-3 px-1.5 to-bg rounded shadow-inner ">
      <div className="text-text-primary flex items-center justify-start gap-1">
          <Lightbulb size={25} className="text-btn-primary" />
          <h1 className="text-lg md:text-2xl font-semibold">Discover Ideas</h1>
        </div>
        <p className="text-xs  text-text-secondary md:text-sm my-4 md:my-8">
          Discover the most innovative and popular ideas from our community
        </p>
      <h2 className="text-2xl mt-8 font-semibold text-foreground flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-btn-primary" />
        Trending Ideas
      </h2>

      <div ref={carouselRef} className="overflow-hidden relative cursor-grab">
        <div className="flex space-x-4 select-none">
          {ideas.map((idea) => (
            <Link
              href={`/idea/${idea.id}`}
              key={idea.id}
              className="flex-shrink-0 w-[85%] sm:w-1/2 lg:w-1/3 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="overflow-hidden rounded-xl h-48 w-full shadow-md bg-surface relative">
                {idea.imageUrl ? (
                  <Image
                    src={idea.imageUrl}
                    fill
                    className="object-cover"
                    alt="cover-img"
                  />
                ) : (
                  <Image
                    src="./placeholder.svg"
                    fill
                    className="object-cover"
                    alt="cover-img"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 flex flex-col justify-end">
                  <span className="mb-2 bg-btn-primary/80 text-white text-xs px-2 py-1 w-fit rounded-md flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {idea.summary}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="my-16 h-[1px] w-full bg-gradient-to-r from-brand-red/20 via-brand-red/80 to-brand-red/20 rounded-full shadow-[0_0_10px_hsl(var(--brand-red))]" />
    </section>
  );
};

export default TrendingCarousel;
