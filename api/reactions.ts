// api/reactions.ts
import { Redis } from "@upstash/redis";
import { verifyToken } from "@clerk/backend";

// ── Connect to Upstash (reads env vars automatically) ──────
const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── Types ──────────────────────────────────────────────────
type Reaction   = "like" | "dislike";
type MyReaction = Reaction | null;

// ── Key helpers ────────────────────────────────────────────
const keyCounts = (malId: number) => `anime:${malId}:reactions`;
const keyUser   = (userId: string) => `user:${userId}:reactions`;

// ── Pull user ID from Clerk JWT ────────────────────────────
async function getUserId(req: any): Promise<string | null> {
  try {
    const auth  = req.headers?.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) return null;

    // split the JWT into its 3 parts
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // decode the payload and tell TypeScript its shape
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    ) as { sub?: string; [key: string]: unknown };

    // optionally verify with clerk if secret key is present
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const { verifyToken } = await import("@clerk/backend");
        const verified = await verifyToken(token, {
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        return (verified.payload?.sub as string) ?? null;
      } catch {
        // verification failed, fall through to decoded payload
      }
    }

    return payload?.sub ?? null;

  } catch {
    return null;
  }
}

// ── Main handler ───────────────────────────────────────────
export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  // get malId
  const rawId = req.method === "GET" ? req.query?.malId : req.body?.malId;
  const malId = Number(rawId);
  if (!malId || isNaN(malId)) {
    return res.status(400).json({ error: "Missing or invalid malId" });
  }

  const countsKey = keyCounts(malId);

  // read current counts
  const likes    = Number((await redis.hget(countsKey, "likes"))    ?? 0);
  const dislikes = Number((await redis.hget(countsKey, "dislikes")) ?? 0);

  // ── GET ─────────────────────────────────────────────────
  if (req.method === "GET") {
    const userId = await getUserId(req);

    let myReaction: MyReaction = null;
    if (userId) {
      const r = await redis.hget(keyUser(userId), String(malId));
      myReaction = r === "like" || r === "dislike" ? r : null;
    }

    return res.status(200).json({ likes, dislikes, myReaction });
  }

  // ── POST ────────────────────────────────────────────────
  if (req.method === "POST") {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: "Sign in to react" });
    }

    const action = req.body?.action as Reaction;
    if (action !== "like" && action !== "dislike") {
      return res.status(400).json({ error: "action must be like or dislike" });
    }

    // what did this user vote before
    const prev         = await redis.hget(keyUser(userId), String(malId));
    const prevReaction: MyReaction =
      prev === "like" || prev === "dislike" ? prev : null;

    // clicking same reaction again = toggle off
    const nextReaction: MyReaction =
      prevReaction === action ? null : action;

    // undo old count
    if (prevReaction === "like")
      await redis.hincrby(countsKey, "likes", -1);
    if (prevReaction === "dislike")
      await redis.hincrby(countsKey, "dislikes", -1);

    // add new count
    if (nextReaction === "like")
      await redis.hincrby(countsKey, "likes", 1);
    if (nextReaction === "dislike")
      await redis.hincrby(countsKey, "dislikes", 1);

    // save or remove user vote
    if (nextReaction) {
      await redis.hset(keyUser(userId), { [String(malId)]: nextReaction });
    } else {
      await redis.hdel(keyUser(userId), String(malId));
    }

    // return fresh counts
    const newLikes    = Number((await redis.hget(countsKey, "likes"))    ?? 0);
    const newDislikes = Number((await redis.hget(countsKey, "dislikes")) ?? 0);

    return res.status(200).json({
      likes:      newLikes,
      dislikes:   newDislikes,
      myReaction: nextReaction,
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
