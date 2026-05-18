// ============================================================
// SAMURAI ANIME — API Configuration
// ============================================================

export const CONSUMET_API =
  import.meta.env.VITE_CONSUMET_API || "https://consumet-api-suvs.onrender.com";

export const TMDB_API_KEY = "453c6ffecf881ea95b9aff309a10178a";
export const TMDB_BEARER_TOKEN = "YOUR_TMDB_BEARER_TOKEN_HERE";
export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const JIKAN_BASE_URL = "https://api.jikan.moe/v4";

// Image base URLs
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/";
export const TMDB_POSTER_SIZE = "w500";
export const TMDB_BACKDROP_SIZE = "original";

// VidSrc embed base URLs (kept as fallback)
export const VIDSRC_EMBED_BASE = "https://vidsrc.to/embed";
export const VIDSRC_ALT_BASE = "https://vidsrc.cc/v2/embed";

// Fribb anime-lists mapping (MAL → IMDB/TMDB)
export const FRIBB_MAL_INDEX =
  "https://raw.githubusercontent.com/Fribb/anime-lists/master/indices/mal_index.json";
export const FRIBB_FULL_LIST =
  "https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json";
