// src/pages/AnimeDetailPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useAnimeReactions } from "../hooks/useAnimeReactions";
import {
  Play, Star, Calendar, Tv, Users,
  ArrowLeft, BookmarkPlus, Check, AlertTriangle,
} from "lucide-react";
import { useAnimeById } from "../hooks/useJikan";
import { getAnimeMapping } from "../hooks/useFribbMapper";
import { LIBRARY_ANIME, AnimeEntry } from "../data/animeData";

export default function AnimeDetailPage() {
  const { malId } = useParams<{ malId: string }>();
  const navigate  = useNavigate();
  const id        = parseInt(malId || "0");
const { isSignedIn } = useAuth();
const {
  likes, dislikes, myReaction,
  loading: reactionsLoading,
  mutating: reactionsMutating,
  error: reactionsError,
  react,
} = useAnimeReactions(id);
  const localAnime = LIBRARY_ANIME.find((a) => a.malId === id) as AnimeEntry | undefined;

  // Only fetch Jikan if not in local library
  const { data: jikanAnime, loading: jikanLoading } = useAnimeById(
    localAnime ? null : id
  );

  // ✅ Get mapping from anime-seasons database — instant!
  const mapping      = getAnimeMapping(id);
  const imdbId       = mapping?.imdb ?? "";
  const tmdbId       = mapping?.tmdb ?? null;
  const mappedSeason = mapping?.season ?? 1;
  const isMovie      = mapping?.type?.toLowerCase() === "movie";

  const [watchlisted,    setWatchlisted]    = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(mappedSeason);
  const [selectedEp,     setSelectedEp]     = useState(1);

  useEffect(() => {
    const wl: number[] = JSON.parse(localStorage.getItem("samurai_watchlist") || "[]");
    setWatchlisted(wl.includes(id));
  }, [id]);

  // Update season state if mapping resolves later
  useEffect(() => {
    setSelectedSeason(mappedSeason);
  }, [mappedSeason]);

  const toggleWatchlist = () => {
    const wl: number[] = JSON.parse(localStorage.getItem("samurai_watchlist") || "[]");
    const newWl = wl.includes(id) ? wl.filter((i) => i !== id) : [...wl, id];
    localStorage.setItem("samurai_watchlist", JSON.stringify(newWl));
    setWatchlisted(!watchlisted);
  };
{/* ── Like / Dislike ── */}
<div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">

  {/* like button */}
  <button
    disabled={!isSignedIn || reactionsMutating}
    onClick={() => react("like")}
    title={!isSignedIn ? "Sign in to like" : "Like"}
    className={`
      group flex items-center gap-2 px-4 py-2.5 rounded-xl
      border font-semibold text-sm transition-all duration-200
      ${myReaction === "like"
        ? "bg-green-500/15 border-green-500/50 text-green-300 shadow-lg shadow-green-900/20"
        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    <ThumbsUp className={`w-4 h-4 transition-transform group-hover:scale-110 ${myReaction === "like" ? "fill-green-400 text-green-400" : ""}`} />
    <span>{reactionsLoading ? "—" : likes.toLocaleString()}</span>
  </button>

  {/* dislike button */}
  <button
    disabled={!isSignedIn || reactionsMutating}
    onClick={() => react("dislike")}
    title={!isSignedIn ? "Sign in to dislike" : "Dislike"}
    className={`
      group flex items-center gap-2 px-4 py-2.5 rounded-xl
      border font-semibold text-sm transition-all duration-200
      ${myReaction === "dislike"
        ? "bg-red-500/15 border-red-500/50 text-red-300 shadow-lg shadow-red-900/20"
        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
      }
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    <ThumbsDown className={`w-4 h-4 transition-transform group-hover:scale-110 ${myReaction === "dislike" ? "fill-red-400 text-red-400" : ""}`} />
    <span>{reactionsLoading ? "—" : dislikes.toLocaleString()}</span>
  </button>

  {/* ratio bar */}
  {!reactionsLoading && (likes + dislikes) > 0 && (
    <div className="flex items-center gap-2 ml-1">
      <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.round((likes / (likes + dislikes)) * 100)}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500">
        {Math.round((likes / (likes + dislikes)) * 100)}%
      </span>
    </div>
  )}
</div>

{/* sign in nudge */}
{!isSignedIn && (
  <button
    onClick={() => navigate("/login")}
    className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors underline underline-offset-2"
  >
    Sign in to like or dislike
  </button>
)}

{/* error */}
{reactionsError && (
  <p className="mt-2 text-xs text-red-400">{reactionsError}</p>
)}
  // ── Loading ───────────────────────────────────────────────
  if (!localAnime && jikanLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex gap-2 justify-center mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-gray-600 text-xs">Loading anime…</p>
        </div>
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────
  if (!localAnime && !jikanAnime) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Anime not found</p>
          <p className="text-gray-500 text-sm mb-4">MAL ID {id} couldn't be loaded</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ── Merge data ────────────────────────────────────────────
  const title       = jikanAnime?.title_english || jikanAnime?.title || localAnime?.englishTitle || "Unknown";
  const description = jikanAnime?.synopsis      || localAnime?.description || "";
  const cover       = jikanAnime?.images?.jpg?.large_image_url || localAnime?.coverImage || "";
  const rating      = jikanAnime?.score  || localAnime?.rating   || 0;
  const year        = jikanAnime?.year   || localAnime?.year     || 0;
  const episodes    = jikanAnime?.episodes || localAnime?.episodes;
  const status      = jikanAnime?.status || localAnime?.status   || "";
  const studio      = jikanAnime?.studios?.[0]?.name || localAnime?.studio || "Unknown";
  const genres      = jikanAnime?.genres?.map((g) => g.name) || localAnime?.genre || [];
  const totalEpisodes = episodes || 24;
  const seasons       = localAnime?.season || 1;

  // Build watch URL — use mapped season for movies/TV correctly
  const watchUrl = isMovie
    ? `/watch/${id}`
    : `/watch/${id}?season=${selectedSeason}&episode=${selectedEp}`;

  return (
    <div className="bg-black min-h-screen">
     {/* ── Banner ── */}
<div className="relative h-72 sm:h-[30rem] overflow-hidden">
  {cover ? (
    <img
      src={cover}
      alt=""
      className="absolute inset-0 w-full h-full object-cover object-top opacity-40 blur-sm scale-105"
    />
  ) : (
    <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-black" />
  )}

  {/* top → black so navbar blends in */}
  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
  {/* left side dark so text is readable */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />

  <button
    onClick={() => navigate(-1)}
    className="absolute top-20 left-4 sm:left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
  >
    <ArrowLeft className="w-5 h-5" />
    <span className="text-sm">Back</span>
  </button>
</div>
      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-32 sm:-mt-48 relative z-10">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-48 h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10">
              {cover ? (
                <img src={cover} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-sm px-4 text-center">
                  {title}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 sm:pt-16 text-center sm:text-left">
            <h1
              className="text-3xl sm:text-5xl font-black text-white mb-2 leading-tight"
              style={{ fontFamily: "Rajdhani, sans-serif" }}
            >
              {title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start mb-4 text-sm">
              {rating > 0 && (
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-semibold text-white">{rating.toFixed(1)}</span>
                </div>
              )}
              {year > 0 && (
                <span className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {year}
                </span>
              )}
              <span className="text-gray-500 flex items-center gap-1">
                <Tv className="w-4 h-4" />
                {isMovie ? "Movie" : episodes ? `${episodes} eps` : "Ongoing"}
              </span>
              <span className="text-gray-500 flex items-center gap-1">
                <Users className="w-4 h-4" /> {studio}
              </span>
              {status && (
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${
                  status.includes("Airing")
                    ? "bg-green-500/20 text-green-400"
                    : status.includes("Finished")
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {status}
                </span>
              )}
              {imdbId && (
                <a
                  href={`https://www.imdb.com/title/${imdbId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500 hover:text-yellow-400 transition-colors"
                >
                  IMDb: {imdbId}
                </a>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5 justify-center sm:justify-start">
              {genres.slice(0, 6).map((g) => (
                <span key={g} className="px-3 py-1 text-xs bg-white/5 border border-white/10 text-gray-300 rounded-full">
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-2xl">{description}</p>

            {/* Episode picker — hidden for movies */}
            {tmdbId && !isMovie && (
              <div className="mb-5 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Season</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
                  >
                    {Array.from(
                      { length: Math.max(seasons, mappedSeason, 1) },
                      (_, i) => i + 1
                    ).map((s) => (
                      <option key={s} value={s}>S{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-400 text-sm">Episode</label>
                  <select
                    value={selectedEp}
                    onChange={(e) => setSelectedEp(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-500"
                  >
                    {Array.from({ length: Math.min(totalEpisodes, 999) }, (_, i) => i + 1).map((ep) => (
                      <option key={ep} value={ep}>E{ep}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              <button
                onClick={() => navigate(watchUrl)}
                className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-red-900/40 hover:scale-105"
              >
                <Play className="w-5 h-5 fill-current" />
                {tmdbId ? "Watch Now" : "Try Watch"}
              </button>
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${
                  watchlisted
                    ? "bg-red-600/20 border-red-500 text-red-400"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                {watchlisted ? <Check className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
                {watchlisted ? "Watchlisted" : "Watchlist"}
              </button>
            </div>
          </div>
        </div>

        {/* No stream notice */}
        {!tmdbId && (
          <div className="mt-10 p-5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm">
            <strong>Note:</strong> No TMDB ID found in our database for this anime.
            Playback may not be available. Check our{" "}
            <button className="underline hover:text-yellow-300" onClick={() => navigate("/library")}>
              curated Library
            </button>{" "}
            for guaranteed streams.
          </div>
        )}
      </div>
    </div>
  );
}
