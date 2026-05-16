// api/stream.ts
// @ts-nocheck
import * as cheerio from "cheerio";
import { decrypt } from "../src/scrapers/helpers/decoder.js";

let BASEDOM = "https://whisperingauroras.com";

// ── copied scraper functions (Node compatible) ─────────────
async function serversLoad(html) {
  const $ = cheerio.load(html);
  const servers = [];
  const title = $("title").text() ?? "";
  const base = $("iframe").attr("src") ?? "";

  if (base) {
    BASEDOM =
      new URL(base.startsWith("//") ? "https:" + base : base).origin ?? BASEDOM;
  }

  $(".serversList .server").each((index, element) => {
    const server = $(element);
    servers.push({
      name: server.text().trim(),
      dataHash: server.attr("data-hash") ?? null,
    });
  });

  return { servers, title };
}

async function PRORCPhandler(prorcp) {
  const prorcpFetch = await fetch(`${BASEDOM}/prorcp/${prorcp}`);
  const prorcpResponse = await prorcpFetch.text();

  const scripts = prorcpResponse.match(
    /<script\s+src="\/([^"]*\.js)\?\_=([^"]*)"><\/script>/gm
  );

  const script = scripts?.[scripts.length - 1]?.includes("cpt.js")
    ? scripts?.[scripts.length - 2]?.replace(
        /.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2"
      )
    : scripts?.[scripts.length - 1]?.replace(
        /.*src="\/([^"]*\.js)\?\_=([^"]*)".*/, "$1?_=$2"
      );

  const jsFileReq = await fetch(`${BASEDOM}/${script}`, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      "sec-fetch-dest": "script",
      "sec-fetch-mode": "no-cors",
      "sec-fetch-site": "same-origin",
      Referer: `${BASEDOM}/`,
      "Referrer-Policy": "origin",
    },
    method: "GET",
  });

  const jsCode = await jsFileReq.text();
  const decryptRegex = /{}\}window\[([^"]+)\("([^"]+)"\)/;
  const decryptMatches = jsCode.match(decryptRegex);

  const $ = cheerio.load(prorcpResponse);
  if (!decryptMatches || decryptMatches.length < 3) return null;

  const id = decrypt(
    decryptMatches[2].toString().trim(),
    decryptMatches[1].toString().trim()
  );
  const data = $("#" + id);
  const result = await decrypt(
    await data.text(),
    decryptMatches[2].toString().trim()
  );
  return result;
}

async function rcpGrabber(html) {
  const regex = /src:\s*'([^']*)'/;
  const match = html.match(regex);
  if (!match) return null;
  return { metadata: { image: "" }, data: match[1] };
}

async function tmdbScrape(tmdbId, type, season, episode) {
  const url =
    type === "movie"
      ? `https://vidsrc.net/embed/movie?tmdb=${tmdbId}`
      : `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;

  const embed     = await fetch(url);
  const embedResp = await embed.text();

  const { servers, title } = await serversLoad(embedResp);

  const rcpResponses = await Promise.all(
    servers.map((s) => fetch(`${BASEDOM}/rcp/${s.dataHash}`))
  );

  const prosrcrcp = await Promise.all(
    rcpResponses.map(async (r) => rcpGrabber(await r.text()))
  );

  const apiResponse = [];

  for (const item of prosrcrcp) {
    if (!item) continue;
    if (item.data.substring(0, 8) === "/prorcp/") {
      const stream = await PRORCPhandler(
        item.data.replace("/prorcp/", "")
      );
      apiResponse.push({
        name:    title,
        mediaId: tmdbId,
        stream,
        referer: BASEDOM,
      });
    }
  }

  return apiResponse;
}

// ── Vercel handler ─────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { tmdbId, type, season, episode } = req.query;

  if (!tmdbId) {
    return res.status(400).json({ error: "tmdbId is required" });
  }

  try {
    console.log(`Scraping: tmdbId=${tmdbId} type=${type} s=${season} e=${episode}`);

    const results = await tmdbScrape(
      tmdbId,
      type || "tv",
      parseInt(season || "1"),
      parseInt(episode || "1")
    );

    // find the first result that has a stream url
    const stream = results?.find((r) => r?.stream)?.stream ?? null;

    if (!stream) {
      return res.status(404).json({
        error:   "No stream found",
        results: results,
      });
    }

    return res.status(200).json({
      stream,
      referer: BASEDOM,
    });

  } catch (err) {
    console.error("Stream error:", err);
    return res.status(500).json({ error: err.message });
  }
}
