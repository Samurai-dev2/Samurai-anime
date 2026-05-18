// api/stream.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import https from "https";
import http from "http";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ── CORS ──────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── Validate params ───────────────────────────────────────
  const { url, referer } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing `url` query parameter" });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(decodeURIComponent(url));
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  // ── Only allow http/https ─────────────────────────────────
  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return res.status(400).json({ error: "Only http/https URLs allowed" });
  }

  const refererHeader =
    typeof referer === "string"
      ? decodeURIComponent(referer)
      : "https://hianime.to";

  // ── Request headers that CDN expects ─────────────────────
  const requestHeaders: Record<string, string> = {
    Referer:                refererHeader,
    Origin:                 new URL(refererHeader).origin,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:                 "*/*",
    "Accept-Language":      "en-US,en;q=0.9",
    "Accept-Encoding":      "identity", // don't compress — we stream raw
    Connection:             "keep-alive",
  };

  // Forward Range header for video seeking
  if (req.headers.range) {
    requestHeaders["Range"] = req.headers.range as string;
  }

  // ── Proxy the request ─────────────────────────────────────
  return new Promise<void>((resolve) => {
    const transport = targetUrl.protocol === "https:" ? https : http;

    const proxyReq = transport.request(
      targetUrl.toString(),
      {
        method:  "GET",
        headers: requestHeaders,
        timeout: 15_000,
      },
      (proxyRes) => {
        // ── Response headers ──────────────────────────────
        const contentType =
          proxyRes.headers["content-type"] || "application/octet-stream";

        res.setHeader("Content-Type", contentType);
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "no-store");

        // Forward content-range and content-length for seeking
        if (proxyRes.headers["content-range"]) {
          res.setHeader("Content-Range", proxyRes.headers["content-range"]);
        }
        if (proxyRes.headers["content-length"]) {
          res.setHeader("Content-Length", proxyRes.headers["content-length"]);
        }

        // ── M3U8 rewriting ────────────────────────────────
        // Segment URLs inside .m3u8 playlists are relative to the CDN.
        // We rewrite them to go through this proxy so every segment
        // also has the correct Referer header.
        if (
          contentType.includes("mpegurl") ||
          contentType.includes("x-mpegURL") ||
          url.includes(".m3u8")
        ) {
          let body = "";
          proxyRes.setEncoding("utf8");

          proxyRes.on("data", (chunk: string) => { body += chunk; });

          proxyRes.on("end", () => {
            const baseUrl = targetUrl.toString().split("?")[0].replace(/\/[^/]*$/, "/");

            const rewritten = body
              .split("\n")
              .map((line) => {
                const trimmed = line.trim();
                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith("#")) return line;

                // Build absolute segment URL
                let absoluteSegmentUrl: string;
                try {
                  absoluteSegmentUrl = new URL(trimmed).toString();
                } catch {
                  // It's a relative URL — make it absolute
                  absoluteSegmentUrl = baseUrl + trimmed;
                }

                // Rewrite through our proxy
                return (
                  `/api/stream?url=${encodeURIComponent(absoluteSegmentUrl)}` +
                  `&referer=${encodeURIComponent(refererHeader)}`
                );
              })
              .join("\n");

            res.status(proxyRes.statusCode || 200).send(rewritten);
            resolve();
          });

        } else {
          // ── Binary stream (TS segments, MP4, etc.) ────────
          res.writeHead(proxyRes.statusCode || 200);
          proxyRes.pipe(res);
          proxyRes.on("end", resolve);
        }
      },
    );

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        res.status(504).json({ error: "Upstream request timed out" });
      }
      resolve();
    });

    proxyReq.on("error", (err) => {
      console.error("[stream proxy] error:", err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: "Proxy request failed", detail: err.message });
      }
      resolve();
    });

    proxyReq.end();
  });
}
