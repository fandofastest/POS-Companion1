import { HttpError } from "@/utils/httpError";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

type RateLimitOpts = {
  key: string;
  limit: number;
  windowMs: number;
};

export function rateLimit({ key, limit, windowMs }: RateLimitOpts) {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (b.count >= limit) {
    const retryAfterSeconds = Math.ceil((b.resetAt - now) / 1000);
    throw new HttpError(429, "Too many requests", { retryAfterSeconds });
  }

  b.count += 1;
}
