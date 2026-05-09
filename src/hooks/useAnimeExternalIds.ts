// src/hooks/useAnimeExternalIds.ts
import { useState, useEffect } from "react";

interface ExternalLink {
  name: string;
  url: string;
}

interface AnimeExternalIds {
  imdbId: string | null;
  loading: boolean;
  error: string | null;
}

function extractImdbId(url: string): string | null {
  const match = url.match(/imdb\.com\/title\/(tt\d+)/i);
  return match ? match[1] : null;
}

const imdbCache = new Map<number, string | null>();

export function useAnimeExternalIds(malId: number | null): AnimeExternalIds {
  const [imdbId, setImdbId] = useState<string | null>(() =>
    malId ? (imdbCache.get(malId) ?? null) : null
  );
  const [loading, setLoading] = useState(
    malId ? !imdbCache.has(malId) : false
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!malId) return;

    if (imdbCache.has(malId)) {
      setImdbId(imdbCache.get(malId) ?? null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`https://api.jikan.moe/v4/anime/${malId}/external`)
      .then((res) => {
        if (!res.ok) throw new Error(`Jikan responded with ${res.status}`);
        return res.json();
      })
      .then((json: { data: ExternalLink[] }) => {
        if (cancelled) return;

        const imdbLink = json.data.find((link) =>
          link.url.includes("imdb.com/title/")
        );

        const extracted = imdbLink ? extractImdbId(imdbLink.url) : null;
        imdbCache.set(malId, extracted);
        setImdbId(extracted);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [malId]);

  return { imdbId, loading, error };
}