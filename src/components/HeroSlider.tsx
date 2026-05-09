// src/components/HeroSlider.tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { FEATURED_ANIME, AnimeEntry } from "../data/animeData";
import { getImdbId } from "../hooks/useFribbMapper";

const HERO_GRADIENTS = [
  "from-orange-900/80 via-black/60",
  "from-gray-900/90 via-black/50",
  "from-blue-900/80 via-black/60",
  "from-purple-900/80 via-black/60",
];

const BG_GRADIENTS = [
  "bg-gradient-to-r from-orange-900 via-red-900 to-black",
  "bg-gradient-to-r from-gray-900 via-slate-800 to-black",
  "bg-gradient-to-r from-blue-900 via-indigo-900 to-black",
  "bg-gradient-to-r from-purple-900 via-violet-900 to-black",
];

interface HeroSlideProps {
  anime: AnimeEntry;
  index: number;
  active: boolean;
}

function HeroSlide({ anime, index, active }: HeroSlideProps) {
  const navigate = useNavigate();
  const gradient = HERO_GRADIENTS[index % HERO_GRADIENTS.length];

  // ✅ Instant IMDb lookup from fribb — no loading spinner needed
  const imdbId = getImdbId(anime.malId);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Background */}
      <div className={`absolute inset-0 ${BG_GRADIENTS[index % BG_GRADIENTS.length]}`} />
      <img
        src="/images/samurai-hero-bg.jpg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      {anime.bannerImage && (
        <img
          src={anime.bannerImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}

      {/* Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} to-transparent`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="flex gap-8 items-center w-full">
          {/* Poster */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="relative w-48 h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
              <img
                src={anime.coverImage}
                alt={anime.englishTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 max-w-2xl">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-bold rounded uppercase tracking-wider">
                Featured
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 text-gray-300 text-xs rounded uppercase tracking-wider">
                {anime.type}
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold text-white">{anime.rating}</span>
              </div>
              {/* Stream available badge */}
              {imdbId ? (
                <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded uppercase tracking-wider border border-green-500/20">
                  ✓ Stream Available
                </span>
              ) : (
                <span className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded uppercase tracking-wider border border-yellow-500/20">
                  No Stream
                </span>
              )}
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-3 leading-tight"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              {anime.englishTitle}
            </h1>

            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              <span>{anime.year}</span>
              <span>•</span>
              <span>{anime.episodes ? `${anime.episodes} Episodes` : "Ongoing"}</span>
              <span>•</span>
              <span className={`font-medium ${
                anime.status === "Airing"
                  ? "text-green-400"
                  : anime.status === "Finished"
                  ? "text-blue-400"
                  : "text-yellow-400"
              }`}>
                {anime.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genre.slice(0, 4).map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 bg-white/10 text-gray-300 text-xs rounded-full border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 max-w-xl">
              {anime.description}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/watch/${anime.malId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-900/40 hover:shadow-red-900/60 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </button>
              <button
                onClick={() => navigate(`/anime/${anime.malId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/10"
              >
                <Info className="w-5 h-5" />
                Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % FEATURED_ANIME.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + FEATURED_ANIME.length) % FEATURED_ANIME.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div
      className="relative h-[85vh] min-h-[560px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {FEATURED_ANIME.map((anime, i) => (
        <HeroSlide key={anime.malId} anime={anime} index={i} active={i === current} />
      ))}

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 border border-white/10 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/70 border border-white/10 rounded-full flex items-center justify-center text-white transition-all backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {FEATURED_ANIME.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? "w-8 h-2 bg-red-500"
                : "w-2 h-2 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}