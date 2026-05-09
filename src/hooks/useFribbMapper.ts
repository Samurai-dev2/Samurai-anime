// src/hooks/useFribbMapper.ts
import animeData from "../data/anime-seasons.json"; // ← change to your actual filename

interface AnimeEntry {
  type?: string;
  mal_id?: number;
  anidb_id?: number;
  anilist_id?: number;
  imdb_id?: string;
  themoviedb_id?: number;
  tvdb_id?: number;
  kitsu_id?: number;
  season?: {
    tvdb?: number;
    tmdb?: number;
  };
}

// ── Build lookup map once at startup ──────────────────────────
const data = animeData as AnimeEntry[];
const malIndex = new Map<number, AnimeEntry>();

data.forEach((entry) => {
  if (entry.mal_id) malIndex.set(entry.mal_id, entry);
});

console.log(`✅ Anime mapper loaded: ${malIndex.size} entries`);

// ── Types ─────────────────────────────────────────────────────
export interface AnimeMapping {
  tmdb: number | null;
  imdb: string | null;
  tvdb: number | null;
  anilist: number | null;
  season: number;       // ← TMDB season (what VidSrc needs)
  type: string;         // "TV", "Movie", "OVA", etc.
}

// ── Main mapping function ────────────────────────────────────
export function getAnimeMapping(malId: number): AnimeMapping | null {
  const entry = malIndex.get(malId);
  if (!entry) return null;
  return {
    tmdb:    entry.themoviedb_id ?? null,
    imdb:    entry.imdb_id       ?? null,
    tvdb:    entry.tvdb_id       ?? null,
    anilist: entry.anilist_id    ?? null,
    season:  entry.season?.tmdb ?? entry.season?.tvdb ?? 1,
    type:    entry.type          ?? "TV",
  };
}

// ── Backward-compat individual getters ───────────────────────
export function getImdbId(malId: number): string | null {
  return malIndex.get(malId)?.imdb_id ?? null;
}

export function getTmdbId(malId: number): number | null {
  return malIndex.get(malId)?.themoviedb_id ?? null;
}

export function getTvdbId(malId: number): number | null {
  return malIndex.get(malId)?.tvdb_id ?? null;
}

// ── Stream availability check (for HomePage filtering) ───────
export function hasStream(malId: number): boolean {
  const entry = malIndex.get(malId);
  if (!entry) return false;
  return Boolean(entry.themoviedb_id || entry.imdb_id);
}

// ── Helper to detect movies vs TV (handy for VidSrc URLs) ────
export function isMovie(malId: number): boolean {
  const type = malIndex.get(malId)?.type?.toLowerCase();
  return type === "movie";
}