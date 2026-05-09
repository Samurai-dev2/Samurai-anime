// src/pages/HomePage.tsx
import { useMemo } from "react";
import HeroSlider from "../components/HeroSlider";
import AnimeRow from "../components/AnimeRow";
import NewReleaseBanner from "../components/NewReleaseBanner";
import {
  FEATURED_ANIME,
  LIBRARY_ANIME,
  getContinueWatching,
  getRecommendations,
  getWatchHistory,
} from "../data/animeData";
import { useTopAnime, useSeasonalAnime } from "../hooks/useJikan";
import { hasStream } from "../hooks/useFribbMapper";

export default function HomePage() {
  const { data: topAnime, loading: topLoading }         = useTopAnime(20);
  const { data: seasonal, loading: seasonalLoading }    = useSeasonalAnime();

  const continueWatching = getContinueWatching();
  const watchHistory     = getWatchHistory();
  const watchedIds       = watchHistory.map((h) => h.malId);
  const recommendations  = useMemo(() => getRecommendations(watchedIds), []);

  // Progress map keyed by malId
  const progressMap = useMemo(() => {
    const map: Record<number, (typeof continueWatching)[0]> = {};
    continueWatching.forEach((p) => { map[p.malId] = p; });
    return map;
  }, [continueWatching]);

  // Continue watching items (must be in library)
  const continueItems = continueWatching
    .map((p) => LIBRARY_ANIME.find((a) => a.malId === p.malId))
    .filter(Boolean) as typeof LIBRARY_ANIME;

  // Filter top anime to only show ones that have a stream available
  const streamableTopAnime = useMemo(
    () => (topAnime ?? []).filter((a) => hasStream(a.mal_id)),
    [topAnime]
  );

  // Filter seasonal to only show ones that have a stream available
  const streamableSeasonal = useMemo(
    () => (seasonal ?? []).filter((a) => hasStream(a.mal_id)),
    [seasonal]
  );

  return (
    <div className="bg-black min-h-screen">
      {/* Hero */}
      <HeroSlider />

      {/* Content */}
      <div className="space-y-10 py-8 -mt-2">
        {/* Continue Watching */}
        {continueItems.length > 0 && (
          <AnimeRow
            title="Continue Watching"
            subtitle="Pick up where you left off"
            items={continueItems}
            progressMap={progressMap}
          />
        )}

        {/* New Season Banner */}
        <NewReleaseBanner />

        {/* Featured */}
        <AnimeRow
          title="Featured Picks"
          subtitle="Hand-picked classics and essentials"
          items={FEATURED_ANIME}
        />

        {/* Seasonal — only streamable */}
        <AnimeRow
          title="New Releases"
          subtitle="Airing this season — confirmed stream sources"
          items={streamableSeasonal}
          isJikan
          loading={seasonalLoading}
        />

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <AnimeRow
            title="Recommended For You"
            subtitle="Based on your watch history"
            items={recommendations}
          />
        )}

        {/* Top Anime — only streamable */}
        <AnimeRow
          title="Top Anime"
          subtitle="Most popular on MyAnimeList — with stream sources"
          items={streamableTopAnime}
          isJikan
          loading={topLoading}
          size="md"
        />

        {/* Full Library */}
        <AnimeRow
          title="Samurai Library"
          subtitle="Browse our full collection"
          items={LIBRARY_ANIME}
          size="md"
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-gray-600 text-sm">
            © 2025 Samurai Anime. For educational purposes only.
          </div>
          <div className="text-gray-700 text-xs text-center">
            Powered by{" "}
            <a
              href="https://jikan.moe"
              className="text-gray-500 hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Jikan API
            </a>
            {" · "}
            <a
              href="https://vidsrc.to"
              className="text-gray-500 hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              VidSrc
            </a>
            {" · "}
            <a
              href="https://github.com/Fribb/anime-lists"
              className="text-gray-500 hover:text-gray-400"
              target="_blank"
              rel="noreferrer"
            >
              Fribb Mapper
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}