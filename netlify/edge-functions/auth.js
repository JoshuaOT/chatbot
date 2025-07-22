// netlify/edge-functions/auth.js
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async (request, context) => {
  const key = request.headers.get("x-api-key");
  if (!key) {
    return new Response("Unauthorized", { status: 401 });
  }

  // check key validity (you must seed redis “api_keys” hash separately)
  const allowed = await redis.hget("api_keys", key);
  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  // simple per-minute rate limit
  const counterKey = `ratelimit:${key}`;
  const count = await redis.incr(counterKey);
  if (count === 1) {
    await redis.expire(counterKey, 60);
  }
  if (count > 60) {
    return new Response("Too Many Requests", { status: 429 });
  }

  // proxy through to your function
  return context.next();
};
