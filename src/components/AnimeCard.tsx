import { useNavigate } from "react-router-dom";
import { Play, Star, Clock } from "lucide-react";
import { AnimeEntry } from "../data/animeData";
import { JikanAnime } from "../hooks/useJikan";

interface AnimeCardProps {
  anime: AnimeEntry | JikanAnime;
  isJikan?: boolean;
  showProgress?: boolean;
  progress?: { season: number; episode: number; percent: number };
  size?: "sm" | "md" | "lg";
}

function getTitle(anime: AnimeEntry | JikanAnime, isJikan: boolean): string {
  if (isJikan) {
    const j = anime as JikanAnime;
    return j.title_english || j.title;
  }
  return (anime as AnimeEntry).englishTitle;
}

function getCover(anime: AnimeEntry | JikanAnime, isJikan: boolean): string {
  if (isJikan) {
    const j = anime as JikanAnime;
    return j.images?.jpg?.large_image_url || j.images?.jpg?.image_url || "";
  }
  return (anime as AnimeEntry).coverImage;
}

function getRating(anime: AnimeEntry | JikanAnime, isJikan: boolean): number | null {
  if (isJikan) return (anime as JikanAnime).score;
  return (anime as AnimeEntry).rating;
}

function getMalId(anime: AnimeEntry | JikanAnime): number {
  return (anime as JikanAnime).mal_id ?? (anime as AnimeEntry).malId;
}

function getYear(anime: AnimeEntry | JikanAnime, isJikan: boolean): number | null {
  if (isJikan) return (anime as JikanAnime).year;
  return (anime as AnimeEntry).year;
}

function getEpisodes(anime: AnimeEntry | JikanAnime, isJikan: boolean): number | null {
  if (isJikan) return (anime as JikanAnime).episodes;
  return (anime as AnimeEntry).episodes;
}

export default function AnimeCard({
  anime,
  isJikan = false,
  showProgress = false,
  progress,
  size = "md",
}: AnimeCardProps) {
  const navigate = useNavigate();
  const malId = getMalId(anime);
  const title = getTitle(anime, isJikan);
  const cover = getCover(anime, isJikan);
  const rating = getRating(anime, isJikan);
  const year = getYear(anime, isJikan);
  const episodes = getEpisodes(anime, isJikan);

  const sizeClasses = {
    sm: "w-32 sm:w-36",
    md: "w-36 sm:w-44",
    lg: "w-40 sm:w-52",
  };

  const imgHeightClasses = {
    sm: "h-48",
    md: "h-56 sm:h-64",
    lg: "h-60 sm:h-72",
  };

  return (
    <div
      className={`${sizeClasses[size]} flex-shrink-0 cursor-pointer group`}
      onClick={() => navigate(`/anime/${malId}`)}
    >
      <div className={`relative ${imgHeightClasses[size]} rounded-xl overflow-hidden mb-2 bg-gray-800 ring-1 ring-white/5`}>
        {/* Poster */}
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <span className="text-gray-500 text-xs text-center px-2">{title}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/watch/${malId}`);
              }}
              className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            >
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            </button>
          </div>
        </div>

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-xs font-semibold">
            <Star className="w-3 h-3 fill-current" />
            {rating.toFixed(1)}
          </div>
        )}

        {/* Continue watching progress */}
        {showProgress && progress && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="px-2 pb-1.5 bg-gradient-to-t from-black/80 to-transparent pt-4">
              <div className="flex items-center gap-1 text-gray-300 text-xs mb-1">
                <Clock className="w-3 h-3" />
                <span>S{progress.season} E{progress.episode}</span>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
          {title}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {year || "??"}
          {episodes ? ` • ${episodes} ep` : ""}
        </p>
      </div>
    </div>
  );
}
