"use client";
import React, { useRef, useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import Image from "next/image";

interface Idea {
  id: number;
  title: string;
  description: string;
  coverImage: string;
}

const trendingIdeasOnly: Idea[] = [
  {
    id: 1,
    title: "AI-Powered Finance Assistant",
    description: "An AI agent that automates budgeting and expense tracking.",
    coverImage:
      "https://images.unsplash.com/photo-1519445239716-9e1f385160a0?auto=format&fit=crop&q=80&w=1470",
  },
  {
    id: 2,
    title: "Sustainable Urban Farming Network",
    description: "Connect rooftop farms through a shared logistics platform.",
    coverImage:
      "https://images.unsplash.com/photo-1622048982661-af7d1bdff6c3?auto=format&fit=crop&q=80&w=1469",
  },
  {
    id: 3,
    title: "Virtual Reality Therapy",
    description: "Immersive exposure therapy using affordable VR tech.",
    coverImage:
      "https://images.unsplash.com/photo-1675763519004-d145463f1e1b?auto=format&fit=crop&q=80&w=1487",
  },
  {
    id: 4,
    title: "Skill-Swap Platform",
    description: "Trade skills locally without money using time credits.",
    coverImage:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1470",
  },
];

const TrendingCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // ——— Auto-scroll ———
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let animationId: number;
    let speed = 1.1; 

    const step = () => {
      el.scrollLeft += speed;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0; 
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    const stop = () => cancelAnimationFrame(animationId);
    el.addEventListener("mouseenter", stop);
    el.addEventListener("mouseleave", () => (animationId = requestAnimationFrame(step)));
    return () => cancelAnimationFrame(animationId);
  }, []);

  // ——— Mouse drag ———
  const onMouseDown = (e: React.MouseEvent) => {
    const el = carouselRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    const el = carouselRef.current;
    if (!isDragging || !el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.2;
    el.scrollLeft = scrollLeft - walk;
  };

  const onMouseUpOrLeave = () => setIsDragging(false);

  // ——— Touch drag (mobile) ———
  let touchStartX = 0;
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const el = carouselRef.current;
    if (!el) return;
    const diff = touchStartX - e.touches[0].clientX;
    el.scrollLeft += diff;
  };
  const onTouchEnd = () => (touchStartX = 0);

  return (
    <section className="bg-gradient-to-b from-bg via-surface/50 to-bg-dark rounded-2xl  shadow-inner mb-12">
      <h2 className="text-2xl font-semibold text-text-primary flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-btn-primary" />
        Trending Ideas
      </h2>

      <div
        ref={carouselRef}
        className={`overflow-hidden relative ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex space-x-4 select-none">
          {[...trendingIdeasOnly, ...trendingIdeasOnly].map((idea, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[85%] sm:w-1/2 lg:w-1/3 transition-all duration-500 hover:scale-[1.02]"
            >
              <div className="relative bg-surface rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
                <div className="relative w-full h-48">
                  <Image
                    src={idea.coverImage}
                    alt={idea.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-4 flex flex-col justify-end">
                  <span className="bg-btn-primary text-white text-xs font-semibold px-2 py-1 rounded w-fit mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                  <h3 className="text-lg font-semibold text-white line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {idea.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div className="my-16 h-[1px] w-full bg-gradient-to-r from-brand-red/20 via-brand-red/80 to-brand-red/20 rounded-full shadow-[0_0_10px(var(--brand-red))]" />
        </div>
      </div>
    </section>
  );
};

export default TrendingCarousel;
