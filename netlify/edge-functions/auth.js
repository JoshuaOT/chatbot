// netlify/edge-functions/auth.js
import "dotenv/config";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();  // automatically reads UPSTASH_REDIS_REST_URL & _TOKEN

export default async (request, context) => {
  const key = request.headers.get("x-api-key");
  if (!key) {
    return new Response("Unauthorized", { status: 401 });
  }

  // fetch from your Redis hash of allowed API keys
  const allowed = await redis.hget("api_keys", key);
  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  // rate‐limit logic…
  const counterKey = `ratelimit:${key}`;
  const count = await redis.incr(counterKey);
  if (count === 1) await redis.expire(counterKey, 60);
  if (count > 60) {
    return new Response("Too Many Requests", { status: 429 });
  }

  return context.next();
};
