import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();               // uses UPSTASH_URL & UPSTASH_TOKEN

export default async (request, context) => {
  // 1.  grab the caller-supplied API key
  const key = request.headers.get("x-api-key");
  if (!key) return new Response("Unauthorized",  { status: 401 });

  // 2.  is it in the allow-list?
  const allowed = await redis.hget("api_keys", key);
  if (!allowed) return new Response("Forbidden", { status: 403 });

  // 3.  very basic rate-limit (60 req / min / key)
  const counterKey = `ratelimit:${key}`;
  const count      = await redis.incr(counterKey);
  if (count === 1) await redis.expire(counterKey, 60);   // set TTL once
  if (count > 60)  return new Response("Too Many", { status: 429 });

  return context.next();                    // let the request through
};
