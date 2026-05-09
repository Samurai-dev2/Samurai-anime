import { useState, useEffect, useCallback } from "react";
import { JIKAN_BASE_URL } from "../config";

export interface JikanAnime {
  mal_id: number;
  title: string;
  title_english: string | null;
  synopsis: string;
  score: number | null;
  episodes: number | null;
  status: string;
  images: {
    jpg: { image_url: string; large_image_url: string };
    webp: { image_url: string; large_image_url: string };
  };
  genres: { mal_id: number; name: string }[];
  studios: { mal_id: number; name: string }[];
  year: number | null;
  season: string | null;
  type: string;
  trailer?: { url: string; embed_url: string };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const cache = new Map<string, unknown>();

async function fetchJikan<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;
  await delay(400); // Respect Jikan rate limit (3 req/sec)
  const res = await fetch(`${JIKAN_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Jikan error ${res.status}: ${path}`);
  const data = await res.json();
  cache.set(path, data);
  return data as T;
}

export function useTopAnime(limit = 24) {
  const [data, setData] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJikan<{ data: JikanAnime[] }>(`/top/anime?limit=${limit}&filter=bypopularity&type=tv&sfw=true`)
      .then((res) => {
        if (!cancelled) {
          // Filter out any NSFW / adult content
          const safe = res.data.filter((a) => !isNsfw(a));
          setData(safe);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading, error };
}

export function useSeasonalAnime() {
  const [data, setData] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchJikan<{ data: JikanAnime[] }>(`/seasons/now?limit=20&sfw=true`)
      .then((res) => {
        if (!cancelled) {
          const safe = res.data.filter((a) => !isNsfw(a));
          setData(safe);
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

export function useAnimeSearch(query: string) {
  const [data, setData] = useState<JikanAnime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setData([]); return; }
    setLoading(true);
    try {
      const res = await fetchJikan<{ data: JikanAnime[] }>(
        `/anime?q=${encodeURIComponent(q)}&sfw=true&limit=20&type=tv`
      );
      setData(res.data.filter((a) => !isNsfw(a)));
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 600);
    return () => clearTimeout(t);
  }, [query, search]);

  return { data, loading, error };
}

export function useAnimeById(malId: number | null) {
  const [data, setData] = useState<JikanAnime | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!malId) return;
    setLoading(true);
    fetchJikan<{ data: JikanAnime }>(`/anime/${malId}`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [malId]);

  return { data, loading };
}

// ─── NSFW filter ──────────────────────────────────────────────
const NSFW_KEYWORDS = [
  "hentai", "ecchi", "nudity", "highschool dxd", "dxd",
  "monster musume", "to love", "prison school", "ikkitousen",
  "queens blade", "sekirei", "interspecies reviewers",
  "testament", "shinmai maou", "masou gakuen", "hybrid x heart",
];

export function isNsfw(anime: JikanAnime): boolean {
  const title = (anime.title + " " + (anime.title_english || "")).toLowerCase();
  const genreNames = anime.genres.map((g) => g.name.toLowerCase());
  if (genreNames.includes("hentai")) return true;
  if (genreNames.includes("ecchi") && genreNames.includes("nudity")) return true;
  return NSFW_KEYWORDS.some((kw) => title.includes(kw));
}
