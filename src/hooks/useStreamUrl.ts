// src/hooks/useStreamUrl.ts
import { useEffect, useState } from "react";
import { CONSUMET_API } from "../config";

interface Subtitle { lang: string; label: string; url: string; }

interface StreamData {
  streamUrl:  string | null;
  subtitles:  Subtitle[];
  loading:    boolean;
  error:      string | null;
  intro?:     { start: number; end: number } | null;
  outro?:     { start: number; end: number } | null;
}

type Lang = "sub" | "dub";

/**
 * Fetch an ad-free HLS stream from Consumet's Zoro (HiAnime) provider.
 *
 * Flow:
 *   1. Search Zoro by title       → list of anime
 *   2. Pick best match            → animeId
 *   3. Fetch episode list         → episode object for episode #N
 *   4. Fetch sources for episode  → m3u8 + subtitles
 */
export function useStreamUrl(
  title: string | null,
  episode: number = 1,
  lang: Lang = "sub",
): StreamData {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [intro, setIntro]         = useState<any>(null);
  const [outro, setOutro]         = useState<any>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setError("No title available");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setStreamUrl(null);
    setSubtitles([]);
    setIntro(null);
    setOutro(null);

    async function run() {
      try {
        // 1. Search Zoro by title
        const searchRes  = await fetch(
          `${CONSUMET_API}/anime/zoro/${encodeURIComponent(title!)}`
        );
        const searchData = await searchRes.json();
        if (cancelled) return;

        if (!searchData?.results?.length) {
          throw new Error(`No anime found for "${title}"`);
        }

        // Pick the best match — first result is usually right.
        // You could improve this with a similarity check on title.
        const animeId = searchData.results[0].id;

        // 2. Fetch episode list
        const infoRes  = await fetch(`${CONSUMET_API}/anime/zoro/info?id=${animeId}`);
        const infoData = await infoRes.json();
        if (cancelled) return;

        const episodes = infoData?.episodes || [];
        if (!episodes.length) throw new Error("No episodes returned");

        const target =
          episodes.find((e: any) => e.number === episode) || episodes[episode - 1];
        if (!target) throw new Error(`Episode ${episode} not found`);

        // 3. Fetch sources for that episode
        // category=sub|dub, server defaults to vidstreaming
        const srcRes = await fetch(
          `${CONSUMET_API}/anime/zoro/watch?episodeId=${encodeURIComponent(target.id)}&category=${lang}`
        );
        const srcData = await srcRes.json();
        if (cancelled) return;

        // sources[] usually has an entry with quality "default" or "auto" (m3u8)
        const sources: any[] = srcData?.sources || [];
        const best =
          sources.find((s) => s.quality === "auto" || s.quality === "default") ||
          sources[0];

        if (!best?.url) throw new Error("No playable source returned");

        // Build a proxied URL so the browser can play it (CORS/Referer headers).
        const referer = srcData?.headers?.Referer || "https://hianime.to";
        const proxied = `/api/stream?url=${encodeURIComponent(best.url)}&referer=${encodeURIComponent(referer)}`;

        const subs: Subtitle[] = (srcData?.subtitles || [])
          .filter((s: any) => s.url && s.lang !== "Thumbnails")
          .map((s: any) => ({
            lang:  s.lang,
            label: s.lang,
            url:   s.url, // VTTs usually don't need proxying, but you can proxy if needed
          }));

        setStreamUrl(proxied);
        setSubtitles(subs);
        setIntro(srcData?.intro || null);
        setOutro(srcData?.outro || null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load stream");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [title, episode, lang]);

  return { streamUrl, subtitles, loading, error, intro, outro };
}
