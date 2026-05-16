// api/stream.ts
// @ts-nocheck

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { url, referer } = req.query;
  if (!url) return res.status(400).json({ error: "url is required" });

  const targetUrl = decodeURIComponent(url);
  const ref       = referer ? decodeURIComponent(referer) : "https://hianime.to";

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: ref,
        Origin: new URL(ref).origin,
        ...(req.headers.range ? { Range: req.headers.range } : {}),
      },
    });

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).json({
        error: `Upstream returned ${upstream.status}`,
      });
    }

    const contentType = upstream.headers.get("content-type") || "";

    // ── If this is an m3u8 playlist, rewrite inner URLs to go through us too
    if (
      contentType.includes("mpegurl") ||
      targetUrl.includes(".m3u8")
    ) {
      const text = await upstream.text();
      const base = new URL(targetUrl);

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) {
            // Some directives carry URIs (EXT-X-KEY, EXT-X-MEDIA). Handle URI="...".
            return line.replace(
              /URI="([^"]+)"/g,
              (_m, u) => {
                const abs = new URL(u, base).toString();
                return `URI="/api/stream?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(ref)}"`;
              }
            );
          }
          // It's a URI line (segment or sub-playlist)
          const abs = new URL(trimmed, base).toString();
          return `/api/stream?url=${encodeURIComponent(abs)}&referer=${encodeURIComponent(ref)}`;
        })
        .join("\n");

      res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).send(rewritten);
    }

    // ── Otherwise it's a binary segment (.ts, .m4s, key, etc.) — pipe through
    res.setHeader("Content-Type", contentType || "application/octet-stream");
    const len = upstream.headers.get("content-length");
    if (len) res.setHeader("Content-Length", len);
    const range = upstream.headers.get("content-range");
    if (range) res.setHeader("Content-Range", range);

    const buf = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(buf);
  } catch (e) {
    console.error("Proxy error:", e);
    return res.status(500).json({ error: e.message });
  }
}
