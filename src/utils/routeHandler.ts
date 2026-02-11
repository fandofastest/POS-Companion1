import { ZodError, type ZodSchema } from "zod";
import type { NextRequest } from "next/server";

import { fail } from "@/utils/apiResponse";
import { HttpError } from "@/utils/httpError";

function redactSensitive(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = k.toLowerCase();
    if (key.includes("password") || key.includes("secret") || key.includes("token")) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
        out[k] = v;
      } else {
        out[k] = "[REDACTED]";
      }
      continue;
    }
    out[k] = redactSensitive(v);
  }
  return out;
}

async function safeParams(ctx: unknown) {
  try {
    const anyCtx = ctx as any;
    if (!anyCtx?.params) return undefined;
    const p = await anyCtx.params;
    return redactSensitive(p);
  } catch {
    return undefined;
  }
}

export async function parseBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  const json = await req.json().catch(() => {
    throw new HttpError(400, "Invalid JSON body");
  });

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    throw new HttpError(422, "Validation error", parsed.error.flatten());
  }

  return parsed.data;
}

export function withApiError(handler: (req: NextRequest, ctx?: unknown) => Promise<Response>) {
  return async (req: NextRequest, ctx?: unknown) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      const url = new URL(req.url);
      const params = await safeParams(ctx);

      if (err instanceof HttpError) {
        const details = redactSensitive(err.details);
        if (err.status === 422) {
          console.error(
            `[API] ${req.method} ${url.pathname} -> ${err.status} ${err.message}`,
            { params, details }
          );
        } else {
          console.error(
            `[API] ${req.method} ${url.pathname} -> ${err.status} ${err.message}`,
            params ? { params } : undefined
          );
        }
        return fail(err.message, err.status, err.details);
      }

      if (err instanceof ZodError) {
        console.error(`[API] ${req.method} ${url.pathname} -> 422 Validation error`, {
          params,
          details: redactSensitive(err.flatten()),
        });
        return fail("Validation error", 422, err.flatten());
      }

      console.error(`[API] ${req.method} ${url.pathname} -> 500 Internal server error`, {
        params,
      });
      return fail("Internal server error", 500);
    }
  };
}
