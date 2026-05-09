// ============================================================
// SAMURAI ANIME — API Configuration
// ============================================================
//
// TMDB API KEY:
//   1. Go to https://www.themoviedb.org/settings/api
//   2. Create a free account and request an API key
//   3. Paste your key below (replace the placeholder string)
//
// JIKAN (MAL):
//   No API key required — it's completely free!
//   Docs: https://docs.api.jikan.moe/
//
// VIDSRC:
//   No API key required — just construct the embed URL
//   Format: https://vidsrc.to/embed/tv/{imdb_id}/{season}/{episode}
//
// ============================================================

export const TMDB_API_KEY = "453c6ffecf881ea95b9aff309a10178a";
// You can also use a Bearer Token instead:
export const TMDB_BEARER_TOKEN = "YOUR_TMDB_BEARER_TOKEN_HERE";

export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Image base URLs
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";
export const TMDB_POSTER_SIZE = "w500";
export const TMDB_BACKDROP_SIZE = "original";

// VidSrc embed base URLs
export const VIDSRC_EMBED_BASE = "https://vidsrc.to/embed";
export const VIDSRC_ALT_BASE = "https://vidsrc.cc/v2/embed";

// Fribb anime-lists mapping (MAL → IMDB/TMDB)
// This index file lets you look up a MAL ID to get the position in the full list
export const FRIBB_MAL_INDEX =
  "https://raw.githubusercontent.com/Fribb/anime-lists/master/indices/mal_index.json";
export const FRIBB_FULL_LIST =
  "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json";
