// src/hooks/useStreamUrl.ts
import { useEffect, useState } from "react";
import { CONSUMET_API } from "../config";

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

function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

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

  if (candidates.some((c) => c === t)) return 1000;

  const startsWithBonus = candidates.some((c) => c.startsWith(t)) ? 50 : 0;
  const containsBonus   = candidates.some((c) => c.includes(t))   ? 20 : 0;

  const targetWords = new Set(t.split(" "));
  const overlapScore = Math.max(
    0,
    ...candidates.map((c) => {
      const shared = c.split(" ").filter((w) => targetWords.has(w)).length;
      return shared;
    }),
  );

  return overlapScore + startsWithBonus + containsBonus;
}

function pickBestSource(sources: any[]): any | null {
  if (!sources?.length) return null;
  return (
    sources.find((s) => s.quality === "auto")    ||
    sources.find((s) => s.quality === "default") ||
    sources.find((s) => s.quality === "1080p")   ||
    sources.find((s) => s.quality === "720p")    ||
    sources[0]
  );
}

function buildProxiedUrl(rawUrl: string, referer: string): string {
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
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [intro,     setIntro]     = useState<{ start: number; end: number } | null>(null);
  const [outro,     setOutro]     = useState<{ start: number; end: number } | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setError("No anime title provided");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    setStreamUrl(null);
    setSubtitles([]);
    setIntro(null);
    setOutro(null);

    async function fetchStream() {
      try {
        // ── Step 1: Search Anikai ─────────────────────────
        // Anikai uses ?anime= query param (not path param)
        const searchUrl =
          `${CONSUMET_API}/anime/anikai/search` +
          `?anime=${encodeURIComponent(title!)}`;

        console.log("[useStreamUrl] Searching Anikai:", searchUrl);

        const searchRes = await fetch(searchUrl);

        if (!searchRes.ok) {
          throw new Error(
            `Search failed: ${searchRes.status} ${searchRes.statusText}`
          );
        }

        const searchData = await searchRes.json();
        if (cancelled) return;

        console.log("[useStreamUrl] Search response:", searchData);

        const results: any[] = searchData?.results || [];
        if (!results.length) {
          throw new Error(`No results found for "${title}"`);
        }

        // ── Step 2: Pick best match ───────────────────────
        const scored = results
          .map((r) => ({ r, score: scoreResult(r, title!) }))
          .sort((a, b) => b.score - a.score);

        const best = scored[0].r;

        console.log(
          `[useStreamUrl] Best match: "${best.title}" ` +
          `id="${best.id}" score=${scored[0].score}`
        );

        // ── Step 3: Fetch anime info + episodes ───────────
        const infoUrl =
          `${CONSUMET_API}/anime/anikai/info` +
          `?id=${encodeURIComponent(best.id)}`;

        console.log("[useStreamUrl] Fetching info:", infoUrl);

        const infoRes = await fetch(infoUrl);

        if (!infoRes.ok) {
          throw new Error(
            `Info fetch failed: ${infoRes.status} ${infoRes.statusText}`
          );
        }

        const infoData = await infoRes.json();
        if (cancelled) return;

        console.log("[useStreamUrl] Info response:", infoData);

        const episodes: any[] = infoData?.episodes || [];
        if (!episodes.length) {
          throw new Error(`No episodes found for "${best.title}"`);
        }

        // ── Step 4: Find target episode ───────────────────
        const targetEp =
          episodes.find((e: any) => e.number === episode) ||
          episodes[episode - 1];

        if (!targetEp) {
          throw new Error(
            `Episode ${episode} not found ` +
            `(anime has ${episodes.length} episodes)`
          );
        }

        console.log(
          `[useStreamUrl] Episode: id="${targetEp.id}" number=${targetEp.number}`
        );

        // ── Step 5: Fetch watch sources ───────────────────
        // Anikai supports sub/dub via ?dubbing=true
        const isDub = lang === "dub";

        const watchUrl =
          `${CONSUMET_API}/anime/anikai/watch` +
          `?episodeId=${encodeURIComponent(targetEp.id)}` +
          (isDub ? `&dubbing=true` : "");

        console.log("[useStreamUrl] Fetching watch:", watchUrl);

        const watchRes = await fetch(watchUrl);

        if (!watchRes.ok) {
          throw new Error(
            `Watch fetch failed: ${watchRes.status} ${watchRes.statusText}`
          );
        }

        const watchData = await watchRes.json();
        if (cancelled) return;

        console.log("[useStreamUrl] Watch response:", watchData);

        // ── Step 6: Pick best source ──────────────────────
        const sources: any[] = watchData?.sources || [];
        const source = pickBestSource(sources);

        if (!source?.url) {
          throw new Error(
            `No playable source for episode ${episode} (${lang})`
          );
        }

        console.log(
          `[useStreamUrl] Source: quality="${source.quality}" ` +
          `url="${source.url.slice(0, 60)}…"`
        );

        // ── Step 7: Proxy the URL ─────────────────────────
        const referer =
          watchData?.headers?.Referer ||
          watchData?.headers?.referer ||
          "https://anikai.to";

        const proxied = buildProxiedUrl(source.url, referer);

        // ── Step 8: Process subtitles ─────────────────────
        const subs: Subtitle[] = (watchData?.subtitles || [])
          .filter((s: any) => s?.url && s?.lang && s.lang !== "Thumbnails")
          .map((s: any) => ({
            lang:  s.lang,
            label: s.lang,
            url:   s.url,
          }));

        console.log(
          `[useStreamUrl] Done — ${subs.length} subtitle(s) found`
        );

        if (!cancelled) {
          setStreamUrl(proxied);
          setSubtitles(subs);
          setIntro(watchData?.intro || null);
          setOutro(watchData?.outro || null);
        }

      } catch (err: any) {
        if (!cancelled) {
          console.error("[useStreamUrl] Failed:", err?.message);
          setError(err?.message || "Unknown error fetching stream");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStream();
    return () => { cancelled = true; };

  }, [title, episode, lang]);

  return { streamUrl, subtitles, loading, error, intro, outro };
}
