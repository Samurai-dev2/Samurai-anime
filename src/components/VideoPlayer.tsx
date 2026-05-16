// src/components/VideoPlayer.tsx
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Subtitle {
  lang:  string;
  label: string;
  url:   string;
}

interface VideoPlayerProps {
  streamUrl:  string;
  subtitles?: Subtitle[];
  poster?:    string;
  title?:     string;
}

export default function VideoPlayer({
  streamUrl,
  subtitles = [],
  poster,
  title,
}: VideoPlayerProps) {
  const videoRef          = useRef<HTMLVideoElement>(null);
  const hlsRef            = useRef<any>(null);
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setError(null);
    setLoading(true);

    // destroy any old HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    async function setupPlayer() {
      try {
        if (streamUrl.includes(".m3u8")) {
          // dynamically import hls.js so it doesnt break SSR / Vercel build
          const Hls = (await import("hls.js")).default;

          if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video!);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setLoading(false);
              video!.play().catch(() => {});
            });

            hls.on(Hls.Events.ERROR, (_: any, data: any) => {
              if (data.fatal) {
                setError("Stream failed to load. Try switching sources.");
                setLoading(false);
              }
            });

          } else if (video!.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari handles HLS natively
            video!.src = streamUrl;
            video!.addEventListener("loadedmetadata", () => {
              setLoading(false);
              video!.play().catch(() => {});
            });

          } else {
            setError("Your browser doesn't support HLS streams.");
            setLoading(false);
          }

        } else {
          // plain MP4 or other direct format
          video!.src = streamUrl;
          video!.addEventListener("loadeddata", () => setLoading(false));
          video!.play().catch(() => {});
        }

      } catch (e: any) {
        setError(e?.message || "Failed to load player");
        setLoading(false);
      }
    }

    setupPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  if (error) {
    return (
      <div className="aspect-video w-full bg-zinc-900 rounded-2xl ring-1 ring-white/10 flex items-center justify-center">
        <div className="text-center px-6">
          <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">Stream Error</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">

      {/* loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            <p className="text-gray-400 text-sm">Loading stream...</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        poster={poster}
        title={title}
        crossOrigin="anonymous"
        playsInline
      >
        {subtitles.map((sub) => (
          <track
            key={sub.lang}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.label}
            default={sub.lang === "en" || sub.lang === "English"}
          />
        ))}
      </video>
    </div>
  );
}
