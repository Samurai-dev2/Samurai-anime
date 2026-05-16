// src/hooks/useStreamUrl.ts
import { useEffect, useState } from "react";

interface StreamData {
  streamUrl:  string | null;
  subtitles:  { lang: string; label: string; url: string }[];
  loading:    boolean;
  error:      string | null;
}

export function useStreamUrl(
  tmdbId:  number | null,
  type:    "movie" | "tv",
  season?: number,
  episode?: number,
): StreamData {
  const [streamUrl,  setStreamUrl]  = useState<string | null>(null);
  const [subtitles,  setSubtitles]  = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!tmdbId) {
      setError("No TMDB ID available");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setStreamUrl(null);
    setSubtitles([]);

    async function fetchStream() {
      try {
        // build query string
        const params = new URLSearchParams({
          tmdbId: String(tmdbId),
          type,
          ...(type === "tv" && {
            season:  String(season  ?? 1),
            episode: String(episode ?? 1),
          }),
        });

        console.log("Fetching stream:", `/api/stream?${params}`);

        const res  = await fetch(`/api/stream?${params}`);
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.stream) {
          throw new Error(data?.error || "No stream found");
        }

        console.log("Got stream URL:", data.stream);
        setStreamUrl(data.stream);

        // subtitles aren't returned by this scraper
        // but keep the array in case we add them later
        setSubtitles([]);

      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Failed to load stream");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStream();
    return () => { cancelled = true; };

  }, [tmdbId, type, season, episode]);

  return { streamUrl, subtitles, loading, error };
}
