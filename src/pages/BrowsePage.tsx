import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, TrendingUp, Flame } from "lucide-react";
import { useTopAnime, useSeasonalAnime, useAnimeSearch, JikanAnime } from "../hooks/useJikan";
import AnimeCard from "../components/AnimeCard";

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className="w-5 h-5 text-red-400" />
      <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
        {title}
      </h2>
    </div>
  );
}

function AnimeGrid({ items, loading, isJikan = true }: { items: JikanAnime[]; loading: boolean; isJikan?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] bg-gray-800 rounded-xl animate-pulse mb-2" />
            <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4 mb-1" />
            <div className="h-2.5 bg-gray-800 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="text-5xl mb-3">🔍</div>
        <p>No results found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((a) => (
        <AnimeCard key={a.mal_id} anime={a} isJikan={isJikan} size="md" />
      ))}
    </div>
  );
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [inputVal, setInputVal] = useState(initialQ);

  const { data: topAnime, loading: topLoading } = useTopAnime(20);
  const { data: seasonal, loading: seasonalLoading } = useSeasonalAnime();
  const { data: searchResults, loading: searchLoading } = useAnimeSearch(query);

  // Keep URL in sync
  useEffect(() => {
    if (initialQ) setQuery(initialQ);
  }, [initialQ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setQuery(inputVal.trim());
      navigate(`/browse?q=${encodeURIComponent(inputVal.trim())}`, { replace: true });
    }
  };

  const isSearching = !!query;

  return (
    <div className="bg-black min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-4xl sm:text-5xl font-black text-white mb-2"
            style={{ fontFamily: "Rajdhani, sans-serif" }}
          >
            <span className="text-red-500">Browse</span> Anime
          </h1>
          <p className="text-gray-500">Discover anime from MyAnimeList's vast database</p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-10">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search any anime on MyAnimeList..."
              className="w-full h-12 pl-12 pr-28 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
          </div>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setInputVal("");
                navigate("/browse", { replace: true });
              }}
              className="mt-2 text-gray-500 text-sm hover:text-gray-400 transition-colors"
            >
              ✕ Clear search
            </button>
          )}
        </form>

        {isSearching ? (
          <div>
            <SectionHeader icon={Search} title={`Results for "${query}"`} />
            <AnimeGrid items={searchResults} loading={searchLoading} />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Seasonal */}
            <section>
              <SectionHeader icon={Flame} title="Airing This Season" />
              <AnimeGrid items={seasonal} loading={seasonalLoading} />
            </section>

            {/* Top */}
            <section>
              <SectionHeader icon={TrendingUp} title="Most Popular on MAL" />
              <AnimeGrid items={topAnime} loading={topLoading} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
