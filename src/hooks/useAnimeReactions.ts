// src/hooks/useAnimeReactions.ts
import { useAuth } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";

type Reaction   = "like" | "dislike";
type MyReaction = Reaction | null;

interface ReactionsState {
  likes:      number;
  dislikes:   number;
  myReaction: MyReaction;
  loading:    boolean;
  mutating:   boolean;
  error:      string | null;
  react:      (action: Reaction) => Promise<void>;
}

export function useAnimeReactions(malId: number): ReactionsState {
  const { isSignedIn, getToken } = useAuth();

  const [likes,      setLikes]      = useState(0);
  const [dislikes,   setDislikes]   = useState(0);
  const [myReaction, setMyReaction] = useState<MyReaction>(null);
  const [loading,    setLoading]    = useState(true);
  const [mutating,   setMutating]   = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // ── Fetch current counts ────────────────────────────────
  const fetchState = useCallback(async () => {
    if (!malId) return;
    setLoading(true);
    setError(null);
    try {
      const token = isSignedIn ? await getToken() : null;
      const res   = await fetch(`/api/reactions?malId=${malId}`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load");

      setLikes(data.likes       ?? 0);
      setDislikes(data.dislikes ?? 0);
      setMyReaction(data.myReaction ?? null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load reactions");
    } finally {
      setLoading(false);
    }
  }, [malId, isSignedIn, getToken]);

  useEffect(() => { fetchState(); }, [fetchState]);

  // ── Send a reaction ─────────────────────────────────────
  const react = useCallback(async (action: Reaction) => {
    setError(null);
    setMutating(true);
    try {
      const token = await getToken();
      const res   = await fetch("/api/reactions", {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ malId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to react");

      setLikes(data.likes          ?? 0);
      setDislikes(data.dislikes    ?? 0);
      setMyReaction(data.myReaction ?? null);
    } catch (e: any) {
      setError(e.message ?? "Failed to react");
    } finally {
      setMutating(false);
    }
  }, [malId, getToken]);

  return { likes, dislikes, myReaction, loading, mutating, error, react };
}
