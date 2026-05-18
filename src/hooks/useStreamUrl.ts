// src/hooks/useStreamUrl.ts
// ─────────────────────────────────────────────────────────────
// Fetches an ad-free HLS stream via Consumet's Zoro (HiAnime) provider.
//
// FLOW:
//   1. Search Zoro by anime title       → results[]
//   2. Find best title match            → animeId
//   3. GET /anime/zoro/info?id=          → episodes[]
//   4. Find the target episode          → episodeId
//   5. GET /anime/zoro/watch?episodeId=  → sources[] + subtitles[]
//   6. Pick best quality source         → streamUrl
//   7. Wrap URL in /api/stream proxy    → browser-playable URL
//
// The proxy (api/stream.ts) adds the correct Referer/Origin headers
// that the HiAnime CDN requires.
// ─────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import { CONSUMET_API } from "../config";

// ── Types ─────────────────────────────────────────────────────
export interface Subtitle {
  lang:  string;
  label: string;
  url:   string;
}

export interface StreamData {
  streamUrl:  string | null;
  subtitles:  Subtitle[];
  loading:    boolean;
  error:      string | null;
  intro:      { start: number; end: number } | null;
  outro:      { start: number; end: number } | null;
}

export type Lang = "sub" | "dub";

// ── Helpers ───────────────────────────────────────────────────

/**
 * Normalise a title for comparison:
 * lowercase, strip punctuation, collapse whitespace.
 */
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Score a search result against our target title.
 * Higher = better match.
 */
function scoreResult(result: any, target: string): number {
  const t = normalise(target);
  const candidates = [
    result.title,
    result.japaneseTitle,
    result.englishTitle,
    ...(result.otherNames || []),
  ]
    .filter(Boolean)
    .map((s: string) => normalise(s));

  // Exact match wins outright
  if (candidates.some((c) => c === t)) return 1000;

  // Starts-with bonus
  const startsWithBonus = candidates.some((c) => c.startsWith(t)) ? 50 : 0;

  // Contains bonus
  const containsBonus = candidates.some((c) => c.includes(t)) ? 20 : 0;

  // Word overlap score
  const targetWords = new Set(t.split(" "));
  const overlapScore = Math.max(
    ...candidates.map((c) => {
      const words  = c.split(" ");
      const shared = words.filter((w) => targetWords.has(w)).length;
      return shared;
    }),
  );

  return overlapScore + startsWithBonus + containsBonus;
}

/**
 * Pick the best playable source from Consumet's sources array.
 * Priority: "auto" (adaptive HLS) > "default" > first entry
 */
function pickBestSource(sources: any[]): any | null {
  if (!sources?.length) return null;
  return (
    sources.find((s) => s.quality === "auto")    ||
    sources.find((s) => s.quality === "default") ||
    sources[0]
  );
}

/**
 * Wrap a raw CDN URL in our server-side proxy.
 * This is necessary because HiAnime CDN rejects requests
 * that don't carry the correct Referer header — which browsers
 * block us from setting on cross-origin requests.
 */
function proxyUrl(rawUrl: string, referer: string): string {
  return (
    `/api/stream` +
    `?url=${encodeURIComponent(rawUrl)}` +
    `&referer=${encodeURIComponent(referer)}`
  );
}

// ── Hook ──────────────────────────────────────────────────────
export function useStreamUrl(
  title:   string | null,
  episode: number = 1,
  lang:    Lang   = "sub",
): StreamData {
  const [streamUrl,  setStreamUrl]  = useState<string | null>(null);
  const [subtitles,  setSubtitles]  = useState<Subtitle[]>([]);
  const [intro,      setIntro]      = useState<{ start: number; end: number } | null>(null);
  const [outro,      setOutro]      = useState<{ start: number; end: number } | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setError("No anime title provided");
      return;
    }

    let cancelled = false;

    // Reset state on every new request
    setLoading(true);
    setError(null);
    setStreamUrl(null);
    setSubtitles([]);
    setIntro(null);
    setOutro(null);

    async function fetchStream() {
      try {
        // ── Step 1: Search Zoro by title ──────────────────
        const searchUrl = `${CONSUMET_API}/anime/zoro/${encodeURIComponent(title!)}`;
        console.log("[useStreamUrl] Searching:", searchUrl);

        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) {
          throw new Error(
            `Search failed: ${searchRes.status} ${searchRes.statusText}`
          );
        }

        const searchData = await searchRes.json();
        if (cancelled) return;

        const results: any[] = searchData?.results || [];
        if (!results.length) {
          throw new Error(`No results found for "${title}"`);
        }

        // ── Step 2: Pick best matching result ─────────────
        const scored = results
          .map((r) => ({ result: r, score: scoreResult(r, title!) }))
          .sort((a, b) => b.score - a.score);

        const bestMatch = scored[0].result;
        const animeId   = bestMatch.id;

        console.log(
          `[useStreamUrl] Best match: "${bestMatch.title}" (id: ${animeId}, score: ${scored[0].score})`
        );

        // ── Step 3: Fetch episode list ────────────────────
        const infoUrl = `${CONSUMET_API}/anime/zoro/info?id=${encodeURIComponent(animeId)}`;
        console.log("[useStreamUrl] Fetching info:", infoUrl);

        const infoRes = await fetch(infoUrl);
        if (!infoRes.ok) {
          throw new Error(
            `Info fetch failed: ${infoRes.status} ${infoRes.statusText}`
          );
        }

        const infoData = await infoRes.json();
        if (cancelled) return;

        const episodes: any[] = infoData?.episodes || [];
        if (!episodes.length) {
          throw new Error(`No episodes found for "${bestMatch.title}"`);
        }

        // ── Step 4: Find target episode ───────────────────
        // Try exact number match first, then fall back to array index
        const targetEpisode =
          episodes.find((e) => e.number === episode) ||
          episodes[episode - 1];

        if (!targetEpisode) {
          throw new Error(
            `Episode ${episode} not found (anime has ${episodes.length} episodes)`
          );
        }

        console.log(
          `[useStreamUrl] Episode found: id="${targetEpisode.id}" number=${targetEpisode.number}`
        );

        // ── Step 5: Fetch stream sources ──────────────────
        const watchUrl =
          `${CONSUMET_API}/anime/zoro/watch` +
          `?episodeId=${encodeURIComponent(targetEpisode.id)}` +
          `&category=${lang}`;

        console.log("[useStreamUrl] Fetching watch:", watchUrl);

        const watchRes = await fetch(watchUrl);
        if (!watchRes.ok) {
          throw new Error(
            `Watch fetch failed: ${watchRes.status} ${watchRes.statusText}`
          );
        }

        const watchData = await watchRes.json();
        if (cancelled) return;

        // ── Step 6: Pick best source ──────────────────────
        const sources: any[] = watchData?.sources || [];
        const best = pickBestSource(sources);

        if (!best?.url) {
          throw new Error(
            `No playable source found for episode ${episode} (${lang})`
          );
        }

        console.log(
          `[useStreamUrl] Source selected: quality="${best.quality}" url="${best.url.slice(0, 60)}…"`
        );

        // ── Step 7: Wrap in proxy ─────────────────────────
        const referer =
          watchData?.headers?.Referer ||
          watchData?.headers?.referer ||
          "https://hianime.to";

        const proxied = proxyUrl(best.url, referer);

        // ── Process subtitles ─────────────────────────────
        // Filter out Thumbnails VTT (used for video preview scrubbing, not captions)
        const subs: Subtitle[] = (watchData?.subtitles || [])
          .filter((s: any) => s?.url && s?.lang && s.lang !== "Thumbnails")
          .map((s: any) => ({
            lang:  s.lang,
            label: s.lang,
            url:   s.url,
          }));

        console.log(
          `[useStreamUrl] Done. ${subs.length} subtitle track(s). ` +
          `Intro: ${watchData?.intro ? "yes" : "no"} Outro: ${watchData?.outro ? "yes" : "no"}`
        );

        if (!cancelled) {
          setStreamUrl(proxied);
          setSubtitles(subs);
          setIntro(watchData?.intro  || null);
          setOutro(watchData?.outro  || null);
        }

      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.message || "Unknown error fetching stream";
          console.error("[useStreamUrl] Error:", msg);
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStream();

    // Cleanup: ignore stale responses if title/episode/lang changes
    return () => {
      cancelled = true;
    };
  }, [title, episode, lang]);

  return { streamUrl, subtitles, loading, error, intro, outro };
}
