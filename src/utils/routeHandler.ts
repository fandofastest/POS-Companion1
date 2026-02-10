import { ZodError, type ZodSchema } from "zod";
import type { NextRequest } from "next/server";

import { fail } from "@/utils/apiResponse";
import { HttpError } from "@/utils/httpError";

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
      if (err instanceof HttpError) {
        return fail(err.message, err.status, err.details);
      }

      if (err instanceof ZodError) {
        return fail("Validation error", 422, err.flatten());
      }

      return fail("Internal server error", 500);
    }
  };
}
