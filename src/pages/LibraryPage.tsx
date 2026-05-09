import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, X, Play, Star, BookmarkCheck } from "lucide-react";
import { LIBRARY_ANIME, AnimeEntry, GENRES } from "../data/animeData";

const STATUS_OPTIONS = ["All", "Airing", "Finished", "Upcoming"];
const SORT_OPTIONS = [
  { label: "Top Rated", value: "rating" },
  { label: "Newest", value: "year_desc" },
  { label: "Oldest", value: "year_asc" },
  { label: "Title A–Z", value: "title" },
  { label: "Episodes ↑", value: "episodes" },
];

function AnimeGridCard({ anime }: { anime: AnimeEntry }) {
  const navigate = useNavigate();
  const [watchlisted, setWatchlisted] = useState(() => {
    const wl: number[] = JSON.parse(localStorage.getItem("samurai_watchlist") || "[]");
    return wl.includes(anime.malId);
  });

  const toggleWL = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wl: number[] = JSON.parse(localStorage.getItem("samurai_watchlist") || "[]");
    const newWl = wl.includes(anime.malId)
      ? wl.filter((i) => i !== anime.malId)
      : [...wl, anime.malId];
    localStorage.setItem("samurai_watchlist", JSON.stringify(newWl));
    setWatchlisted(!watchlisted);
  };

  return (
    <div
      className="group relative bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-red-500/30 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-red-900/10 hover:-translate-y-1"
      onClick={() => navigate(`/anime/${anime.malId}`)}
    >
      {/* Poster */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={anime.coverImage}
          alt={anime.englishTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

        {/* Overlay buttons on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/watch/${anime.malId}`);
            }}
            className="w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110"
          >
            <Play className="w-6 h-6 text-white fill-current ml-1" />
          </button>
        </div>

        {/* Rating */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-yellow-400 text-xs font-semibold">
          <Star className="w-3 h-3 fill-current" />
          {anime.rating.toFixed(1)}
        </div>

        {/* Watchlist */}
        <button
          onClick={toggleWL}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
            watchlisted
              ? "bg-red-600 text-white"
              : "bg-black/60 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
        </button>

        {/* Status badge */}
        <div
          className={`absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium ${
            anime.status === "Airing"
              ? "bg-green-500/80 text-white"
              : anime.status === "Finished"
              ? "bg-blue-500/80 text-white"
              : "bg-yellow-500/80 text-black"
          }`}
        >
          {anime.status}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-semibold line-clamp-1 group-hover:text-red-400 transition-colors">
          {anime.englishTitle}
        </p>
        <p className="text-gray-500 text-xs mt-0.5">
          {anime.year} · {anime.episodes ? `${anime.episodes} ep` : "Ongoing"} · {anime.studio}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {anime.genre.slice(0, 2).map((g) => (
            <span key={g} className="px-1.5 py-0.5 text-xs bg-white/5 text-gray-500 rounded">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...LIBRARY_ANIME];

    // Query filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.englishTitle.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q) ||
          a.genre.some((g) => g.toLowerCase().includes(q)) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      list = list.filter((a) => selectedGenres.some((g) => a.genre.includes(g)));
    }

    // Status filter
    if (status !== "All") {
      list = list.filter((a) => a.status === status);
    }

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "year_desc":
          return b.year - a.year;
        case "year_asc":
          return a.year - b.year;
        case "title":
          return a.englishTitle.localeCompare(b.englishTitle);
        case "episodes":
          return (a.episodes || 9999) - (b.episodes || 9999);
        default:
          return 0;
      }
    });

    return list;
  }, [query, selectedGenres, status, sort]);

  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedGenres([]);
    setStatus("All");
    setSort("rating");
  };

  const hasFilters = query || selectedGenres.length > 0 || status !== "All" || sort !== "rating";

  return (
    <div className="bg-black min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-2"
            style={{ fontFamily: "Rajdhani, sans-serif" }}
          >
            <span className="text-red-500">Anime</span> Library
          </h1>
          <p className="text-gray-500">
            {filtered.length} title{filtered.length !== 1 ? "s" : ""} — 100% safe, no NSFW content
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, genre, tag..."
              className="w-full h-10 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 px-3 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm focus:outline-none focus:border-red-500/50"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 px-4 flex items-center gap-2 rounded-xl border text-sm transition-colors ${
              showFilters || selectedGenres.length > 0 || status !== "All"
                ? "border-red-500 bg-red-600/10 text-red-400"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters {selectedGenres.length > 0 && `(${selectedGenres.length})`}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="h-10 px-3 flex items-center gap-1 text-gray-500 hover:text-white text-sm transition-colors"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 p-5 bg-gray-900/60 border border-white/10 rounded-2xl space-y-4">
            {/* Status */}
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Status</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      status === s
                        ? "bg-red-600 text-white"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-2">Genres</p>
              <div className="flex gap-2 flex-wrap">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedGenres.includes(g)
                        ? "bg-red-600 text-white"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">⚔️</div>
            <p className="text-gray-500 text-lg">No anime found</p>
            <p className="text-gray-600 text-sm mt-2">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 rounded-lg text-sm hover:bg-red-600/30 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((anime) => (
              <AnimeGridCard key={anime.malId} anime={anime} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
