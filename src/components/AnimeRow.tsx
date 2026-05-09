import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AnimeCard from "./AnimeCard";
import { AnimeEntry } from "../data/animeData";
import { JikanAnime } from "../hooks/useJikan";
import { WatchProgress } from "../data/animeData";

interface AnimeRowProps {
  title: string;
  subtitle?: string;
  items: (AnimeEntry | JikanAnime)[];
  isJikan?: boolean;
  loading?: boolean;
  progressMap?: Record<number, WatchProgress>;
  size?: "sm" | "md" | "lg";
}

function SkeletonCard() {
  return (
    <div className="w-36 sm:w-44 flex-shrink-0">
      <div className="h-56 sm:h-64 rounded-xl bg-gray-800 animate-pulse mb-2" />
      <div className="h-3 bg-gray-800 rounded animate-pulse mb-1.5 w-3/4" />
      <div className="h-2.5 bg-gray-800 rounded animate-pulse w-1/2" />
    </div>
  );
}

function getMalId(anime: AnimeEntry | JikanAnime): number {
  return (anime as JikanAnime).mal_id ?? (anime as AnimeEntry).malId;
}

export default function AnimeRow({
  title,
  subtitle,
  items,
  isJikan = false,
  loading = false,
  progressMap,
  size = "md",
}: AnimeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!rowRef.current) return;
    const amount = 400;
    rowRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 px-4 sm:px-6">
        <div>
          <h2
            className="text-xl sm:text-2xl font-bold text-white"
            style={{ fontFamily: "Rajdhani, sans-serif" }}
          >
            {title}
          </h2>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {/* Scroll arrows (desktop) */}
        <div className="hidden sm:flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Row */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((anime) => {
              const malId = getMalId(anime);
              return (
                <AnimeCard
                  key={malId}
                  anime={anime}
                  isJikan={isJikan}
                  size={size}
                  showProgress={!!progressMap}
                  progress={progressMap?.[malId]
                    ? {
                        season: progressMap[malId].season,
                        episode: progressMap[malId].episode,
                        percent: progressMap[malId].percent,
                      }
                    : undefined}
                />
              );
            })}
      </div>
    </section>
  );
}
