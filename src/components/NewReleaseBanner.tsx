import { useNavigate } from "react-router-dom";
import { Flame, Play, Star } from "lucide-react";
import { useSeasonalAnime } from "../hooks/useJikan";

export default function NewReleaseBanner() {
  const { data: seasonal, loading } = useSeasonalAnime();
  const navigate = useNavigate();

  const featured = seasonal.slice(0, 3);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 mb-2">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-red-400" />
          <span className="text-white font-bold text-xl" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            New This Season
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (featured.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 mb-2">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-red-400 animate-pulse" />
        <span className="text-white font-bold text-xl" style={{ fontFamily: "Rajdhani, sans-serif" }}>
          New This Season
        </span>
        <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-xs rounded-full font-semibold animate-pulse">
          LIVE
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {featured.map((anime) => (
          <div
            key={anime.mal_id}
            onClick={() => navigate(`/anime/${anime.mal_id}`)}
            className="relative group cursor-pointer flex gap-4 p-4 bg-gray-900/60 hover:bg-gray-800/80 border border-white/5 hover:border-red-500/20 rounded-2xl transition-all duration-300"
          >
            <img
              src={anime.images.jpg.image_url}
              alt={anime.title}
              className="w-16 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-1">
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded font-medium">
                  Airing
                </span>
              </div>
              <p className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1">
                {anime.title_english || anime.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {anime.score && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    {anime.score.toFixed(1)}
                  </span>
                )}
                <span>{anime.type}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/anime/${anime.mal_id}`);
              }}
              className="absolute right-3 bottom-3 w-8 h-8 bg-red-600/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
